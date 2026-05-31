import { markVoucherViewed } from '$lib/server/vouchers';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
	await markVoucherViewed(params.slug);
	return new Response(null, { status: 204 });
};
