import { describe, expect, it } from 'vitest';
import { escapeXml, renderVoucherPng, renderVoucherSvg } from './voucher-og';

const voucher = {
	senderName: 'Camille',
	recipientName: 'Alex',
	subject: 'un brunch & une surprise',
	quantity: 2,
	themeMode: 'system' as const
};

describe('voucher Open Graph rendering', () => {
	it('escapes user content in SVG', () => {
		expect(escapeXml(`<script>"test" & 'ok'</script>`)).toBe(
			'&lt;script&gt;&quot;test&quot; &amp; &apos;ok&apos;&lt;/script&gt;'
		);
		expect(renderVoucherSvg(voucher)).toContain('un brunch &amp; une surprise');
	});

	it('renders a PNG image', () => {
		const png = renderVoucherPng(voucher);
		expect(Array.from(png.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
	});

	it('renders explicit dark vouchers with the dark palette', () => {
		const svg = renderVoucherSvg({ ...voucher, themeMode: 'dark' });
		expect(svg).toContain('#17231f');
		expect(svg).toContain('#fff6e7');
		expect(svg).not.toContain('#fffaf0');
	});
});
