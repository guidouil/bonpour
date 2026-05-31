import { describe, expect, it } from 'vitest';
import { defaultExpirationDate, parseVoucherForm } from './voucher-validation';

function validForm() {
	const form = new FormData();
	const entries = [
		['senderName', 'Camille'],
		['recipientName', 'Alex'],
		['subject', 'un brunch maison'],
		['quantity', '2'],
		['message', 'Avec plaisir'],
		['themeMode', 'dark'],
		['hasExpiration', 'on'],
		['expirationDate', '2026-06-30']
	] as const;
	for (const [name, value] of entries) form.set(name, value);
	return form;
}

describe('voucher form validation', () => {
	it('parses valid fields', () => {
		const result = parseVoucherForm(validForm(), new Date('2026-05-31T12:00:00Z'));
		expect(result.input).toMatchObject({ senderName: 'Camille', quantity: 2, themeMode: 'dark' });
	});

	it('rejects invalid quantity and expired dates', () => {
		const form = validForm();
		form.set('quantity', '0');
		form.set('expirationDate', '2026-05-30');
		const result = parseVoucherForm(form, new Date('2026-05-31T12:00:00Z'));
		expect(result.errors).toMatchObject({
			quantity: expect.any(String),
			expirationDate: expect.any(String)
		});
	});

	it('adds thirty days by default', () => {
		expect(defaultExpirationDate(new Date('2026-05-31T12:00:00Z'))).toBe('2026-06-30');
	});

	it('defaults to the system theme and rejects unknown modes', () => {
		const form = validForm();
		form.delete('themeMode');
		expect(parseVoucherForm(form, new Date('2026-05-31T12:00:00Z')).input?.themeMode).toBe(
			'system'
		);

		form.set('themeMode', 'sepia');
		expect(parseVoucherForm(form, new Date('2026-05-31T12:00:00Z')).errors).toMatchObject({
			themeMode: expect.any(String)
		});
	});
});
