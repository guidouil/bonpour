ALTER TABLE "voucher_og_image" ALTER COLUMN "renderer_version" SET DEFAULT 4;--> statement-breakpoint
ALTER TABLE "voucher" ADD COLUMN "font" text DEFAULT 'classic' NOT NULL;