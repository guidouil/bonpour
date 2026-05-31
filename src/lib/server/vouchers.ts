import { and, asc, desc, eq, isNull, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { voucher, voucherEvent, voucherOgImage } from '$lib/server/db/schema';
import { renderVoucherPng, voucherOgRendererVersion } from '$lib/server/voucher-og';
import { canTransition, getDisplayStatus, type VoucherStatus } from '$lib/voucher';
import type { VoucherInput } from './voucher-validation';
import { createManagementToken, createPublicSlug, hashManagementToken } from './voucher-secrets';

export type VoucherRecord = typeof voucher.$inferSelect;

export async function createVoucher(input: VoucherInput, ownerId?: string) {
	const publicSlug = createPublicSlug();
	const managementToken = createManagementToken();
	const managementTokenHash = hashManagementToken(managementToken);
	const ogImage = renderVoucherPng(input);

	const createdVoucher = await db.transaction(async (tx) => {
		const [record] = await tx
			.insert(voucher)
			.values({ ...input, publicSlug, managementTokenHash, ownerId })
			.returning();
		await tx
			.insert(voucherOgImage)
			.values({ voucherId: record.id, png: ogImage, rendererVersion: voucherOgRendererVersion });
		await tx.insert(voucherEvent).values({
			voucherId: record.id,
			type: 'created',
			source: 'sender'
		});
		return record;
	});

	return { voucher: createdVoucher, managementToken };
}

export async function getVoucherBySlug(publicSlug: string) {
	return db.query.voucher.findFirst({
		where: eq(voucher.publicSlug, publicSlug)
	});
}

export async function getVoucherOgImageBySlug(publicSlug: string) {
	const [storedImage] = await db
		.select({ png: voucherOgImage.png, rendererVersion: voucherOgImage.rendererVersion })
		.from(voucherOgImage)
		.innerJoin(voucher, eq(voucherOgImage.voucherId, voucher.id))
		.where(eq(voucher.publicSlug, publicSlug))
		.limit(1);
	if (storedImage?.rendererVersion === voucherOgRendererVersion) return storedImage.png;

	// Missing and stale PNGs are backfilled on first access.
	const existingVoucher = await getVoucherBySlug(publicSlug);
	if (!existingVoucher) return null;

	const png = renderVoucherPng(existingVoucher);
	await db
		.insert(voucherOgImage)
		.values({ voucherId: existingVoucher.id, png, rendererVersion: voucherOgRendererVersion })
		.onConflictDoUpdate({
			target: voucherOgImage.voucherId,
			set: { png, rendererVersion: voucherOgRendererVersion }
		});
	return png;
}

export async function getVoucherByManagementToken(token: string) {
	return db.query.voucher.findFirst({
		where: eq(voucher.managementTokenHash, hashManagementToken(token)),
		with: { events: { orderBy: [asc(voucherEvent.createdAt)] } }
	});
}

export async function listVouchersForOwner(ownerId: string) {
	return db.query.voucher.findMany({
		where: eq(voucher.ownerId, ownerId),
		orderBy: [desc(voucher.createdAt)]
	});
}

export async function getVoucherForOwner(id: string, ownerId: string) {
	return db.query.voucher.findFirst({
		where: and(eq(voucher.id, id), eq(voucher.ownerId, ownerId)),
		with: { events: { orderBy: [asc(voucherEvent.createdAt)] } }
	});
}

export async function markVoucherSent(token: string) {
	return transitionByManagementToken(token, 'sent', 'sender');
}

export async function markVoucherViewed(publicSlug: string) {
	return transitionBySlug(publicSlug, 'viewed', 'recipient');
}

export async function respondToVoucher(publicSlug: string, status: 'accepted' | 'declined') {
	return transitionBySlug(publicSlug, status, 'recipient');
}

export async function manageVoucher(token: string, status: 'cancelled' | 'redeemed') {
	return transitionByManagementToken(token, status, 'sender');
}

export async function deleteManagedVoucher(token: string) {
	const [deleted] = await db
		.delete(voucher)
		.where(
			and(
				eq(voucher.managementTokenHash, hashManagementToken(token)),
				or(eq(voucher.status, 'cancelled'), eq(voucher.status, 'declined'))
			)
		)
		.returning();

	return deleted;
}

export async function manageOwnedVoucher(
	id: string,
	ownerId: string,
	status: 'cancelled' | 'redeemed'
) {
	const record = await db.query.voucher.findFirst({
		where: and(eq(voucher.id, id), eq(voucher.ownerId, ownerId))
	});
	if (!record || !canTransition(getDisplayStatus(record), status)) return null;
	return updateStatus(record, status, 'sender');
}

export async function deleteOwnedVoucher(id: string, ownerId: string) {
	const [deleted] = await db
		.delete(voucher)
		.where(
			and(
				eq(voucher.id, id),
				eq(voucher.ownerId, ownerId),
				or(eq(voucher.status, 'cancelled'), eq(voucher.status, 'declined'))
			)
		)
		.returning();

	return deleted;
}

export async function attachVoucher(token: string, ownerId: string) {
	const [updated] = await db
		.update(voucher)
		.set({ ownerId, updatedAt: new Date() })
		.where(
			and(eq(voucher.managementTokenHash, hashManagementToken(token)), isNull(voucher.ownerId))
		)
		.returning();

	if (updated) {
		await db.insert(voucherEvent).values({
			voucherId: updated.id,
			type: 'attached',
			source: 'sender'
		});
	}
	return updated;
}

async function transitionBySlug(publicSlug: string, next: VoucherStatus, source: string) {
	const record = await getVoucherBySlug(publicSlug);
	if (!record || !canTransition(getDisplayStatus(record), next)) return null;
	return updateStatus(record, next, source);
}

async function transitionByManagementToken(token: string, next: VoucherStatus, source: string) {
	const record = await db.query.voucher.findFirst({
		where: eq(voucher.managementTokenHash, hashManagementToken(token))
	});
	if (!record || !canTransition(getDisplayStatus(record), next)) return null;
	return updateStatus(record, next, source);
}

async function updateStatus(record: VoucherRecord, next: VoucherStatus, source: string) {
	return db.transaction(async (tx) => {
		const [updated] = await tx
			.update(voucher)
			.set({ status: next, updatedAt: new Date() })
			.where(and(eq(voucher.id, record.id), eq(voucher.status, record.status)))
			.returning();

		if (!updated) return null;
		await tx.insert(voucherEvent).values({ voucherId: updated.id, type: next, source });
		return updated;
	});
}
