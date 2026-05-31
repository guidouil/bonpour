import { error } from '@sveltejs/kit';
import { getVoucherOgImageBySlug } from '$lib/server/vouchers';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const ogImage = await getVoucherOgImageBySlug(params.slug);
	if (!ogImage) error(404, 'Ce bon n’existe pas ou plus.');

	return new Response(new Uint8Array(ogImage), {
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, max-age=86400, immutable'
		}
	});
};
