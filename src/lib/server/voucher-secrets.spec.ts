import { describe, expect, it } from 'vitest';
import { createManagementToken, createPublicSlug, hashManagementToken } from './voucher-secrets';

describe('voucher secrets', () => {
	it('creates distinct URL-safe secrets and a stable hash', () => {
		const slug = createPublicSlug();
		const token = createManagementToken();

		expect(slug).toMatch(/^[\w-]+$/);
		expect(token).toMatch(/^[\w-]+$/);
		expect(token).not.toBe(createManagementToken());
		expect(hashManagementToken(token)).toHaveLength(64);
		expect(hashManagementToken(token)).toBe(hashManagementToken(token));
	});
});
