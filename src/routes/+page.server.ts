import { fail, redirect } from '@sveltejs/kit';
import { createVoucher } from '$lib/server/vouchers';
import { defaultExpirationDate, parseVoucherForm } from '$lib/server/voucher-validation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	defaultExpirationDate: defaultExpirationDate()
});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const result = parseVoucherForm(await request.formData());
		if (!result.input) return fail(400, result);

		const { managementToken } = await createVoucher(result.input, locals.user?.id);
		redirect(303, `/gestion/${managementToken}?cree=1`);
	}
};
