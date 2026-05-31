ALTER TABLE "voucher_og_image" ADD COLUMN "renderer_version" integer DEFAULT 1 NOT NULL;
ALTER TABLE "voucher_og_image" ALTER COLUMN "renderer_version" SET DEFAULT 3;
