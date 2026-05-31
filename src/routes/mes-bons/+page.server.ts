import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { listVouchersForOwner } from '$lib/server/vouchers';
import { getDisplayStatus } from '$lib/voucher';
import type { Actions, PageServerLoad } from './$types';

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

export const actions: Actions = {
	updateName: async (event) => {
		if (!event.locals.user) redirect(303, '/connexion');

		const name = (await event.request.formData()).get('name')?.toString().trim() ?? '';
		if (name.length < 1 || name.length > 60) {
			return fail(400, {
				name,
				message: 'Indique un nom entre 1 et 60 caractères.'
			});
		}

		try {
			await auth.api.updateUser({
				headers: event.request.headers,
				body: { name }
			});
		} catch (error) {
			if (error instanceof APIError) return fail(400, { name, message: error.message });
			return fail(500, { name, message: 'Impossible de modifier ton nom pour le moment.' });
		}

		event.locals.user = { ...event.locals.user, name };
		return { success: true };
	}
};
