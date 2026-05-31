export const voucherStatuses = [
	'created',
	'sent',
	'viewed',
	'accepted',
	'declined',
	'redeemed',
	'cancelled'
] as const;

export type VoucherStatus = (typeof voucherStatuses)[number];
export type DisplayStatus = VoucherStatus | 'expired';
export const voucherThemes = ['system', 'light', 'dark'] as const;
export type VoucherTheme = (typeof voucherThemes)[number];

export type VoucherView = {
	senderName: string;
	recipientName: string;
	subject: string;
	quantity: number | null;
	message: string | null;
	status: VoucherStatus;
	expiresAt: Date | string | null;
};

const terminalStatuses: VoucherStatus[] = ['declined', 'redeemed', 'cancelled'];

export function isExpired(voucher: Pick<VoucherView, 'expiresAt' | 'status'>, now = new Date()) {
	return Boolean(
		voucher.expiresAt &&
		!terminalStatuses.includes(voucher.status) &&
		new Date(voucher.expiresAt).getTime() < now.getTime()
	);
}

export function getDisplayStatus(
	voucher: Pick<VoucherView, 'expiresAt' | 'status'>,
	now = new Date()
): DisplayStatus {
	return isExpired(voucher, now) ? 'expired' : voucher.status;
}

export function canTransition(from: DisplayStatus, to: VoucherStatus) {
	if (from === 'expired') return false;

	const allowed: Record<VoucherStatus, VoucherStatus[]> = {
		created: ['sent', 'viewed', 'accepted', 'declined', 'cancelled'],
		sent: ['viewed', 'accepted', 'declined', 'cancelled'],
		viewed: ['accepted', 'declined', 'cancelled'],
		accepted: ['redeemed', 'cancelled'],
		declined: [],
		redeemed: [],
		cancelled: []
	};

	return allowed[from].includes(to);
}

export function canDeleteVoucher(status: VoucherStatus) {
	return status === 'declined' || status === 'cancelled';
}

export const statusLabels: Record<DisplayStatus, string> = {
	created: 'Créé',
	sent: 'Envoyé',
	viewed: 'Vu',
	accepted: 'Accepté',
	declined: 'Refusé',
	redeemed: 'Utilisé',
	cancelled: 'Annulé',
	expired: 'Expiré'
};
