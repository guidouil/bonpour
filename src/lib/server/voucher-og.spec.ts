import { describe, expect, it } from 'vitest';
import { escapeXml, renderVoucherPng, renderVoucherSvg } from './voucher-og';

const voucher = {
	senderName: 'Camille',
	recipientName: 'Alex',
	subject: 'un brunch & une surprise',
	quantity: 2,
	icon: null,
	theme: 'terracotta' as const,
	font: 'classic' as const,
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

	it('embeds emoji as local SVG images', () => {
		const svg = renderVoucherSvg({
			...voucher,
			senderName: 'Camille ❤️',
			recipientName: 'Alex 😱',
			subject: 'Déjà🍾🥂🤪 et aussi 🍌'
		});
		expect(svg.match(/<image/g)).toHaveLength(6);
		expect(svg.match(/href="data:image\/svg\+xml;base64,/g)).toHaveLength(6);
		expect(renderVoucherPng({ ...voucher, subject: 'Déjà🍾🥂🤪 et aussi 🍌' })).toBeInstanceOf(
			Uint8Array
		);
	});

	it('embeds recently added emoji as local SVG images', () => {
		const svg = renderVoucherSvg({ ...voucher, subject: 'un bon pour 🫩🫜🪾' });
		expect(svg.match(/<image/g)).toHaveLength(3);
	});

	it('renders explicit dark vouchers with the dark palette', () => {
		const svg = renderVoucherSvg({ ...voucher, themeMode: 'dark' });
		expect(svg).toContain('#17231f');
		expect(svg).toContain('#fff6e7');
		expect(svg).not.toContain('#fffaf0');
	});

	it('renders the selected color theme', () => {
		const svg = renderVoucherSvg({ ...voucher, theme: 'ocean' });
		expect(svg).toContain('#f2fbfa');
		expect(svg).toContain('#2f7f88');
		expect(svg).not.toContain('#cf684d');
	});

	it('renders a selected Material Symbol instead of the quantity', () => {
		const svg = renderVoucherSvg({ ...voucher, icon: 'local_cafe' });
		expect(svg).toContain('transform="translate(1008 144) scale(.067)"');
		expect(svg).not.toContain('× 2');
	});

	it('renders the selected font', () => {
		const svg = renderVoucherSvg({ ...voucher, font: 'modern' });
		expect(svg).toContain('font-family="Arial, sans-serif" font-size="62"');
	});

	it('renders the love theme with its dark palette', () => {
		const svg = renderVoucherSvg({ ...voucher, theme: 'love', themeMode: 'dark' });
		expect(svg).toContain('#431f2a');
		expect(svg).toContain('#ff8194');
	});
});
