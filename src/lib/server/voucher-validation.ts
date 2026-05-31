import { voucherThemes, type VoucherTheme } from '$lib/voucher';

export type VoucherInput = {
	senderName: string;
	recipientName: string;
	subject: string;
	quantity: number | null;
	message: string | null;
	themeMode: VoucherTheme;
	expiresAt: Date | null;
};

export type VoucherFormValues = Record<
	| 'senderName'
	| 'recipientName'
	| 'subject'
	| 'quantity'
	| 'message'
	| 'expirationDate'
	| 'themeMode',
	string
> & { hasExpiration: boolean };

export type VoucherFormErrors = Partial<Record<keyof VoucherFormValues, string>>;

function field(formData: FormData, name: string) {
	return formData.get(name)?.toString().trim() ?? '';
}

export function defaultExpirationDate(now = new Date()) {
	const expiration = new Date(now);
	expiration.setDate(expiration.getDate() + 30);
	return expiration.toISOString().slice(0, 10);
}

export function parseVoucherForm(formData: FormData, now = new Date()) {
	const values: VoucherFormValues = {
		senderName: field(formData, 'senderName'),
		recipientName: field(formData, 'recipientName'),
		subject: field(formData, 'subject'),
		quantity: field(formData, 'quantity'),
		message: field(formData, 'message'),
		expirationDate: field(formData, 'expirationDate'),
		themeMode: field(formData, 'themeMode') || 'system',
		hasExpiration: formData.get('hasExpiration') === 'on'
	};
	const errors: VoucherFormErrors = {};

	if (values.senderName.length < 1 || values.senderName.length > 60) {
		errors.senderName = 'Indique un nom entre 1 et 60 caractères.';
	}
	if (values.recipientName.length < 1 || values.recipientName.length > 60) {
		errors.recipientName = 'Indique un nom entre 1 et 60 caractères.';
	}
	if (values.subject.length < 1 || values.subject.length > 120) {
		errors.subject = 'Décris le bon en 120 caractères maximum.';
	}
	if (values.message.length > 280) {
		errors.message = 'Le petit mot ne peut pas dépasser 280 caractères.';
	}
	if (!voucherThemes.includes(values.themeMode as VoucherTheme)) {
		errors.themeMode = 'Choisis un style de bon valide.';
	}

	let quantity: number | null = null;
	if (values.quantity) {
		quantity = Number(values.quantity);
		if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
			errors.quantity = 'Choisis une quantité entière entre 1 et 999.';
		}
	}

	let expiresAt: Date | null = null;
	if (values.hasExpiration) {
		expiresAt = new Date(`${values.expirationDate}T23:59:59.999Z`);
		if (!values.expirationDate || Number.isNaN(expiresAt.getTime()) || expiresAt <= now) {
			errors.expirationDate = 'Choisis une date à venir.';
		}
	}

	if (Object.keys(errors).length > 0) return { values, errors };

	return {
		values,
		input: {
			senderName: values.senderName,
			recipientName: values.recipientName,
			subject: values.subject,
			quantity,
			message: values.message || null,
			themeMode: values.themeMode as VoucherTheme,
			expiresAt
		} satisfies VoucherInput
	};
}
