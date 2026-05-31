import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { parse } from '@twemoji/parser';
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

const require = createRequire(import.meta.url);
const emojiSvgCache = new Map<string, string | null>();

export const voucherOgRendererVersion = 2;

export function escapeXml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function getEmojiDataUrl(url: string) {
	const filename = url.split('/').at(-1);
	if (!filename?.endsWith('.svg')) return null;

	if (!emojiSvgCache.has(filename)) {
		try {
			const svg = readFileSync(require.resolve(`@twemoji/svg/${filename}`), 'utf8');
			emojiSvgCache.set(
				filename,
				`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
			);
		} catch {
			emojiSvgCache.set(filename, null);
		}
	}

	return emojiSvgCache.get(filename);
}

function estimateTextWidth(value: string, fontSize: number, letterSpacing = 0) {
	return (
		[...value].reduce((width, character) => {
			if (character === ' ') return width + fontSize * 0.28;
			if (/[ilI1.,'’]/.test(character)) return width + fontSize * 0.28;
			if (/[mwMW@]/.test(character)) return width + fontSize * 0.85;
			return width + fontSize * 0.56;
		}, 0) +
		Math.max(0, [...value].length - 1) * letterSpacing
	);
}

function renderText({
	value,
	x,
	y,
	fontFamily,
	fontSize,
	fill,
	fontWeight,
	letterSpacing = 0,
	textAnchor = 'start'
}: {
	value: string;
	x: number;
	y: number;
	fontFamily: string;
	fontSize: number;
	fill: string;
	fontWeight?: number;
	letterSpacing?: number;
	textAnchor?: 'start' | 'middle';
}) {
	const entities = parse(value);
	if (!entities.length) {
		return `<text x="${x}" y="${y}" text-anchor="${textAnchor}" font-family="${fontFamily}" font-size="${fontSize}"${fontWeight ? ` font-weight="${fontWeight}"` : ''}${letterSpacing ? ` letter-spacing="${letterSpacing}"` : ''} fill="${fill}">${escapeXml(value)}</text>`;
	}

	const tokens: { content: string; emojiDataUrl?: string; width: number }[] = [];
	let cursor = 0;

	for (const entity of entities) {
		const before = value.slice(cursor, entity.indices[0]);
		if (before)
			tokens.push({ content: before, width: estimateTextWidth(before, fontSize, letterSpacing) });

		const emojiDataUrl = getEmojiDataUrl(entity.url);
		if (emojiDataUrl) {
			tokens.push({ content: entity.text, emojiDataUrl, width: fontSize * 1.1 });
		} else {
			tokens.push({
				content: entity.text,
				width: estimateTextWidth(entity.text, fontSize, letterSpacing)
			});
		}
		cursor = entity.indices[1];
	}

	const after = value.slice(cursor);
	if (after)
		tokens.push({ content: after, width: estimateTextWidth(after, fontSize, letterSpacing) });

	const totalWidth = tokens.reduce((width, token) => width + token.width, 0);
	let currentX = textAnchor === 'middle' ? x - totalWidth / 2 : x;

	return tokens
		.map((token) => {
			const tokenX = currentX;
			currentX += token.width;
			if (token.emojiDataUrl) {
				return `<image x="${tokenX + fontSize * 0.05}" y="${y - fontSize * 0.82}" width="${fontSize}" height="${fontSize}" href="${token.emojiDataUrl}"/>`;
			}
			return `<text x="${tokenX}" y="${y}" font-family="${fontFamily}" font-size="${fontSize}"${fontWeight ? ` font-weight="${fontWeight}"` : ''}${letterSpacing ? ` letter-spacing="${letterSpacing}"` : ''} fill="${fill}">${escapeXml(token.content)}</text>`;
		})
		.join('');
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
		.map((line, index) =>
			renderText({
				value: line,
				x: 600,
				y: 286 + index * 76,
				textAnchor: 'middle',
				fontFamily: 'Georgia, serif',
				fontSize: 62,
				fontWeight: 700,
				fill: colors.ink
			})
		)
		.join('');
	const quantity = voucher.quantity
		? renderText({
				value: `× ${voucher.quantity}`,
				x: 1040,
				y: 112,
				textAnchor: 'middle',
				fontFamily: 'Arial, sans-serif',
				fontSize: 25,
				fontWeight: 700,
				fill: colors.card
			})
		: '';

	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
	<rect width="1200" height="630" fill="${colors.page}"/>
	<rect x="38" y="34" width="1124" height="562" rx="22" fill="${colors.card}" stroke="${colors.border}" stroke-width="3"/>
	<rect x="60" y="56" width="1080" height="518" rx="14" fill="none" stroke="${colors.dashed}" stroke-width="2" stroke-dasharray="7 11"/>
	<circle cx="1040" cy="112" r="61" fill="${colors.accent}"/>
	<circle cx="1040" cy="112" r="49" fill="none" stroke="${colors.card}" stroke-width="2" stroke-dasharray="3 7"/>
	${quantity}
	${renderText({ value: 'BON POUR', x: 110, y: 132, fontFamily: 'Arial, sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: 7, fill: colors.accent })}
	${renderText({ value: `POUR ${voucher.recipientName.toUpperCase()}`, x: 600, y: 208, textAnchor: 'middle', fontFamily: 'Arial, sans-serif', fontSize: 27, letterSpacing: 3, fill: colors.muted })}
	${subject}
	<line x1="160" y1="510" x2="1040" y2="510" stroke="${colors.dashed}" stroke-width="2"/>
	${renderText({ value: `OFFERT PAR ${voucher.senderName.toUpperCase()}`, x: 600, y: 552, textAnchor: 'middle', fontFamily: 'Arial, sans-serif', fontSize: 24, letterSpacing: 2, fill: colors.muted })}
</svg>`;
}

export function renderVoucherPng(voucher: OgVoucher) {
	return new Resvg(renderVoucherSvg(voucher), {
		fitTo: { mode: 'width', value: 1200 }
	})
		.render()
		.asPng();
}
