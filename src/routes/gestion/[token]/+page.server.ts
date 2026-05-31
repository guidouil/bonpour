import { error, fail, redirect } from '@sveltejs/kit';
import { getDisplayStatus } from '$lib/voucher';
import {
	attachVoucher,
	deleteManagedVoucher,
	getVoucherByManagementToken,
	manageVoucher,
	markVoucherSent
} from '$lib/server/vouchers';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const voucher = await getVoucherByManagementToken(params.token);
	if (!voucher) error(404, 'Ce lien secret n’est pas valide.');

	return {
		voucher,
		displayStatus: getDisplayStatus(voucher),
		publicUrl: `${url.origin}/b/${voucher.publicSlug}`,
		managementUrl: url.toString().split('?')[0],
		justCreated: url.searchParams.get('cree') === '1',
		user: locals.user ?? null
	};
};

export const actions: Actions = {
	sent: async ({ params }) => {
		await markVoucherSent(params.token);
		return { success: true };
	},
	cancel: async ({ params }) => {
		const voucher = await manageVoucher(params.token, 'cancelled');
		if (!voucher) return fail(409, { message: 'Ce bon ne peut plus être annulé.' });
		return { success: true };
	},
	redeem: async ({ params }) => {
		const voucher = await manageVoucher(params.token, 'redeemed');
		if (!voucher) return fail(409, { message: 'Ce bon doit être accepté avant utilisation.' });
		return { success: true };
	},
	delete: async ({ params }) => {
		const voucher = await deleteManagedVoucher(params.token);
		if (!voucher) return fail(409, { message: 'Seul un bon annulé ou refusé peut être supprimé.' });
		redirect(303, '/');
	},
	attach: async ({ params, locals }) => {
		if (!locals.user) return fail(401, { message: 'Connecte-toi pour rattacher ce bon.' });
		const voucher = await attachVoucher(params.token, locals.user.id);
		if (!voucher) return fail(409, { message: 'Ce bon est déjà rattaché à un compte.' });
		return { success: true };
	}
};
