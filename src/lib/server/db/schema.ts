import { relations } from 'drizzle-orm';
import { customType, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

const bytea = customType<{ data: Buffer }>({
	dataType: () => 'bytea'
});

export const voucher = pgTable(
	'voucher',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		publicSlug: text('public_slug').notNull().unique(),
		managementTokenHash: text('management_token_hash').notNull().unique(),
		ownerId: text('owner_id').references(() => user.id, { onDelete: 'set null' }),
		senderName: text('sender_name').notNull(),
		recipientName: text('recipient_name').notNull(),
		subject: text('subject').notNull(),
		quantity: integer('quantity'),
		message: text('message'),
		theme: text('theme', { enum: ['terracotta', 'ocean', 'lavender', 'love'] })
			.notNull()
			.default('terracotta'),
		themeMode: text('theme_mode', { enum: ['system', 'light', 'dark'] })
			.notNull()
			.default('system'),
		status: text('status', {
			enum: ['created', 'sent', 'viewed', 'accepted', 'declined', 'redeemed', 'cancelled']
		})
			.notNull()
			.default('created'),
		expiresAt: timestamp('expires_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('voucher_owner_id_idx').on(table.ownerId)]
);

export const voucherOgImage = pgTable('voucher_og_image', {
	voucherId: uuid('voucher_id')
		.primaryKey()
		.references(() => voucher.id, { onDelete: 'cascade' }),
	png: bytea('png').notNull()
});

export const voucherEvent = pgTable(
	'voucher_event',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		voucherId: uuid('voucher_id')
			.notNull()
			.references(() => voucher.id, { onDelete: 'cascade' }),
		type: text('type').notNull(),
		source: text('source').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('voucher_event_voucher_id_idx').on(table.voucherId)]
);

export const voucherRelations = relations(voucher, ({ many, one }) => ({
	events: many(voucherEvent),
	ogImage: one(voucherOgImage),
	owner: one(user, { fields: [voucher.ownerId], references: [user.id] })
}));

export const voucherOgImageRelations = relations(voucherOgImage, ({ one }) => ({
	voucher: one(voucher, { fields: [voucherOgImage.voucherId], references: [voucher.id] })
}));

export const voucherEventRelations = relations(voucherEvent, ({ one }) => ({
	voucher: one(voucher, { fields: [voucherEvent.voucherId], references: [voucher.id] })
}));

export * from './auth.schema';
