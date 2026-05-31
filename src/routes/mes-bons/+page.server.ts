import { redirect } from '@sveltejs/kit';
import { listVouchersForOwner } from '$lib/server/vouchers';
import { getDisplayStatus } from '$lib/voucher';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(303, '/connexion');
	const vouchers = await listVouchersForOwner(locals.user.id);

	return {
		user: locals.user,
		vouchers: vouchers.map((voucher) => ({
			...voucher,
			displayStatus: getDisplayStatus(voucher),
			publicUrl: `${url.origin}/b/${voucher.publicSlug}`
		}))
	};
};
