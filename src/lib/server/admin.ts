import { desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user, voucher, voucherEvent } from '$lib/server/db/schema';

const initialAdminEmail = 'guidouil@gmail.com';

export async function isAdminUser(userId: string) {
	const [account] = await db
		.select({ email: user.email, role: user.role })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	if (!account) return false;
	if (account.role === 'admin') return true;
	if (account.email.toLowerCase() !== initialAdminEmail) return false;

	await db.update(user).set({ role: 'admin' }).where(eq(user.id, userId));
	return true;
}

export async function getAdminDashboard() {
	const [kpis, activity, statuses, actions, recentActions] = await Promise.all([
		db.execute<{
			users: number;
			vouchers: number;
			events: number;
			views: number;
			accepted: number;
			redeemed: number;
			lastSevenDays: number;
		}>(sql`
			select
				(select count(*)::int from "user") as users,
				(select count(*)::int from "voucher") as vouchers,
				(select count(*)::int from "voucher_event") as events,
				(select count(*)::int from "voucher_event" where "type" = 'viewed') as views,
				(select count(*)::int from "voucher" where "status" = 'accepted') as accepted,
				(select count(*)::int from "voucher" where "status" = 'redeemed') as redeemed,
				(select count(*)::int from "voucher" where "created_at" >= now() - interval '7 days') as "lastSevenDays"
		`),
		db.execute<{ day: string; count: number }>(sql`
			select to_char(days.day, 'YYYY-MM-DD') as day, count("voucher_event"."id")::int as count
			from generate_series(current_date - interval '13 days', current_date, interval '1 day') as days(day)
			left join "voucher_event"
				on "voucher_event"."created_at" >= days.day
				and "voucher_event"."created_at" < days.day + interval '1 day'
			group by days.day
			order by days.day
		`),
		db
			.select({ status: voucher.status, count: sql<number>`count(*)::int` })
			.from(voucher)
			.groupBy(voucher.status)
			.orderBy(desc(sql`count(*)`)),
		db
			.select({ type: voucherEvent.type, count: sql<number>`count(*)::int` })
			.from(voucherEvent)
			.groupBy(voucherEvent.type)
			.orderBy(desc(sql`count(*)`)),
		db
			.select({
				id: voucherEvent.id,
				type: voucherEvent.type,
				source: voucherEvent.source,
				createdAt: voucherEvent.createdAt,
				subject: voucher.subject,
				recipientName: voucher.recipientName
			})
			.from(voucherEvent)
			.innerJoin(voucher, eq(voucherEvent.voucherId, voucher.id))
			.orderBy(desc(voucherEvent.createdAt))
			.limit(12)
	]);

	const totals = kpis[0];
	return {
		kpis: {
			...totals,
			acceptanceRate: totals.views
				? Math.round(((totals.accepted + totals.redeemed) / totals.views) * 100)
				: 0
		},
		activity,
		statuses,
		actions,
		recentActions
	};
}
