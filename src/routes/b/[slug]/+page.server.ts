import { error, fail } from '@sveltejs/kit';
import { getDisplayStatus } from '$lib/voucher';
import { getVoucherBySlug, respondToVoucher } from '$lib/server/vouchers';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const voucher = await getVoucherBySlug(params.slug);
	if (!voucher) error(404, 'Ce bon n’existe pas ou plus.');

	return {
		voucher,
		displayStatus: getDisplayStatus(voucher),
		ogImageUrl: `${url.origin}/b/${params.slug}/og.png`
	};
};

export const actions: Actions = {
	respond: async ({ params, request }) => {
		const formData = await request.formData();
		const response = formData.get('response')?.toString();
		if (response !== 'accepted' && response !== 'declined') {
			return fail(400, { message: 'Cette réponse est invalide.' });
		}

		const voucher = await respondToVoucher(params.slug, response);
		if (!voucher) return fail(409, { message: 'Ce bon ne peut plus recevoir de réponse.' });
		return { success: true };
	}
};
