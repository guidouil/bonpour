import { error, fail, redirect } from '@sveltejs/kit';
import { getDisplayStatus } from '$lib/voucher';
import { deleteOwnedVoucher, getVoucherForOwner, manageOwnedVoucher } from '$lib/server/vouchers';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.user) redirect(303, '/connexion');
	const voucher = await getVoucherForOwner(params.id, locals.user.id);
	if (!voucher) error(404, 'Ce bon n’est pas rattaché à ton compte.');

	return {
		voucher,
		displayStatus: getDisplayStatus(voucher),
		publicUrl: `${url.origin}/b/${voucher.publicSlug}`
	};
};

export const actions: Actions = {
	cancel: async ({ locals, params }) => {
		if (!locals.user) redirect(303, '/connexion');
		const voucher = await manageOwnedVoucher(params.id, locals.user.id, 'cancelled');
		if (!voucher) return fail(409, { message: 'Ce bon ne peut plus être annulé.' });
		return { success: true };
	},
	redeem: async ({ locals, params }) => {
		if (!locals.user) redirect(303, '/connexion');
		const voucher = await manageOwnedVoucher(params.id, locals.user.id, 'redeemed');
		if (!voucher) return fail(409, { message: 'Ce bon doit être accepté avant utilisation.' });
		return { success: true };
	},
	delete: async ({ locals, params }) => {
		if (!locals.user) redirect(303, '/connexion');
		const voucher = await deleteOwnedVoucher(params.id, locals.user.id);
		if (!voucher) return fail(409, { message: 'Seul un bon annulé ou refusé peut être supprimé.' });
		redirect(303, '/mes-bons');
	}
};
