import { error, redirect } from '@sveltejs/kit';
import { getAdminDashboard, isAdminUser } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/connexion');
	if (!(await isAdminUser(locals.user.id)))
		error(403, 'Cet espace est réservé aux administrateurs.');

	return {
		dashboard: await getAdminDashboard()
	};
};
