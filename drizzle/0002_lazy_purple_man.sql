CREATE TABLE "voucher_og_image" (
	"voucher_id" uuid PRIMARY KEY NOT NULL,
	"png" "bytea" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "voucher_og_image" ADD CONSTRAINT "voucher_og_image_voucher_id_voucher_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."voucher"("id") ON DELETE cascade ON UPDATE no action;