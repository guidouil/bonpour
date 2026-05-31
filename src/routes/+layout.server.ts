import { isAdminUser } from '$lib/server/admin';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => ({
	user: locals.user ?? null,
	isAdmin: locals.user ? await isAdminUser(locals.user.id) : false
});
