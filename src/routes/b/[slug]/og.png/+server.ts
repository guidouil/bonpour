import { error } from '@sveltejs/kit';
import { renderVoucherPng } from '$lib/server/voucher-og';
import { getVoucherBySlug } from '$lib/server/vouchers';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const voucher = await getVoucherBySlug(params.slug);
	if (!voucher) error(404, 'Ce bon n’existe pas ou plus.');

	return new Response(new Uint8Array(renderVoucherPng(voucher)), {
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, max-age=86400, immutable'
		}
	});
};
