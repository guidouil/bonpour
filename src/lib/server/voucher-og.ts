import { Resvg } from '@resvg/resvg-js';
import type { VoucherTheme, VoucherThemeMode } from '$lib/voucher';

type OgVoucher = {
	senderName: string;
	recipientName: string;
	subject: string;
	quantity: number | null;
	theme: VoucherTheme;
	themeMode: VoucherThemeMode;
};

const voucherColors = {
	terracotta: {
		light: {
			page: '#e8dfce',
			card: '#fffaf0',
			border: '#26352d',
			dashed: '#d9cbb5',
			accent: '#cf684d',
			ink: '#26352d',
			muted: '#6c786f'
		},
		dark: {
			page: '#17231f',
			card: '#26352d',
			border: '#d7c6aa',
			dashed: '#6f806f',
			accent: '#e47c60',
			ink: '#fff6e7',
			muted: '#c9d2c8'
		}
	},
	ocean: {
		light: {
			page: '#dceceb',
			card: '#f2fbfa',
			border: '#21474d',
			dashed: '#b7d7d5',
			accent: '#2f7f88',
			ink: '#21474d',
			muted: '#5c7779'
		},
		dark: {
			page: '#10282d',
			card: '#173238',
			border: '#b9d9d8',
			dashed: '#507277',
			accent: '#69c5cc',
			ink: '#eefcfb',
			muted: '#b7d0d0'
		}
	},
	lavender: {
		light: {
			page: '#eee7f5',
			card: '#fbf8ff',
			border: '#433653',
			dashed: '#d9cce8',
			accent: '#8b6bb3',
			ink: '#433653',
			muted: '#756a7f'
		},
		dark: {
			page: '#241b2d',
			card: '#30263b',
			border: '#e0d1f3',
			dashed: '#68577b',
			accent: '#c2a0ee',
			ink: '#fff8ff',
			muted: '#d5c6de'
		}
	},
	love: {
		light: {
			page: '#f4e1e5',
			card: '#fff5f7',
			border: '#692d3a',
			dashed: '#efc7d0',
			accent: '#c23b5a',
			ink: '#692d3a',
			muted: '#8a6170'
		},
		dark: {
			page: '#321720',
			card: '#431f2a',
			border: '#f4c5d0',
			dashed: '#895364',
			accent: '#ff8194',
			ink: '#fff5f7',
			muted: '#e7c3cb'
		}
	}
} satisfies Record<VoucherTheme, Record<'light' | 'dark', Record<string, string>>>;

export function escapeXml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function wrapText(value: string, maxCharacters = 27) {
	const words = value.split(/\s+/);
	const lines: string[] = [];
	let current = '';

	for (const word of words) {
		if (!current || `${current} ${word}`.length <= maxCharacters) {
			current = current ? `${current} ${word}` : word;
		} else {
			lines.push(current);
			current = word;
		}
	}
	if (current) lines.push(current);

	return lines.slice(0, 3);
}

export function renderVoucherSvg(voucher: OgVoucher) {
	const dark = voucher.themeMode === 'dark';
	const colors = voucherColors[voucher.theme][dark ? 'dark' : 'light'];
	const subjectLines = wrapText(voucher.subject);
	const subject = subjectLines
		.map(
			(line, index) =>
				`<text x="600" y="${286 + index * 76}" text-anchor="middle" font-family="Georgia, serif" font-size="62" font-weight="700" fill="${colors.ink}">${escapeXml(line)}</text>`
		)
		.join('');
	const quantity = voucher.quantity
		? `<text x="1040" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="${colors.card}">× ${voucher.quantity}</text>`
		: '';

	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
	<rect width="1200" height="630" fill="${colors.page}"/>
	<rect x="38" y="34" width="1124" height="562" rx="22" fill="${colors.card}" stroke="${colors.border}" stroke-width="3"/>
	<rect x="60" y="56" width="1080" height="518" rx="14" fill="none" stroke="${colors.dashed}" stroke-width="2" stroke-dasharray="7 11"/>
	<circle cx="1040" cy="112" r="61" fill="${colors.accent}"/>
	<circle cx="1040" cy="112" r="49" fill="none" stroke="${colors.card}" stroke-width="2" stroke-dasharray="3 7"/>
	${quantity}
	<text x="110" y="132" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="7" fill="${colors.accent}">BON POUR</text>
	<text x="600" y="208" text-anchor="middle" font-family="Arial, sans-serif" font-size="27" letter-spacing="3" fill="${colors.muted}">POUR ${escapeXml(voucher.recipientName.toUpperCase())}</text>
	${subject}
	<line x1="160" y1="510" x2="1040" y2="510" stroke="${colors.dashed}" stroke-width="2"/>
	<text x="600" y="552" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" letter-spacing="2" fill="${colors.muted}">OFFERT PAR ${escapeXml(voucher.senderName.toUpperCase())}</text>
</svg>`;
}

export function renderVoucherPng(voucher: OgVoucher) {
	return new Resvg(renderVoucherSvg(voucher), {
		fitTo: { mode: 'width', value: 1200 }
	})
		.render()
		.asPng();
}
