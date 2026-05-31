import { createHash, randomBytes } from 'node:crypto';

export function createPublicSlug() {
	return randomBytes(12).toString('base64url');
}

export function createManagementToken() {
	return randomBytes(24).toString('base64url');
}

export function hashManagementToken(token: string) {
	return createHash('sha256').update(token).digest('hex');
}
