import { describe, expect, it } from 'vitest';
import { canDeleteVoucher, canTransition, getDisplayStatus, isExpired } from './voucher';

describe('voucher lifecycle', () => {
	it('allows the expected happy path', () => {
		expect(canTransition('created', 'sent')).toBe(true);
		expect(canTransition('sent', 'viewed')).toBe(true);
		expect(canTransition('viewed', 'accepted')).toBe(true);
		expect(canTransition('accepted', 'redeemed')).toBe(true);
	});

	it('rejects terminal and expired transitions', () => {
		expect(canTransition('redeemed', 'cancelled')).toBe(false);
		expect(canTransition('declined', 'accepted')).toBe(false);
		expect(canTransition('expired', 'accepted')).toBe(false);
	});

	it('computes expiration only for non-terminal vouchers', () => {
		const now = new Date('2026-05-31T12:00:00Z');
		expect(isExpired({ status: 'sent', expiresAt: '2026-05-30T12:00:00Z' }, now)).toBe(true);
		expect(getDisplayStatus({ status: 'sent', expiresAt: '2026-05-30T12:00:00Z' }, now)).toBe(
			'expired'
		);
		expect(isExpired({ status: 'redeemed', expiresAt: '2026-05-30T12:00:00Z' }, now)).toBe(false);
	});

	it('allows deletion only after cancellation or refusal', () => {
		expect(canDeleteVoucher('cancelled')).toBe(true);
		expect(canDeleteVoucher('declined')).toBe(true);
		expect(canDeleteVoucher('accepted')).toBe(false);
		expect(canDeleteVoucher('redeemed')).toBe(false);
	});
});
