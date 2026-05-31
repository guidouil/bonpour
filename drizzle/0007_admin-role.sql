ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;
--> statement-breakpoint
UPDATE "user" SET "role" = 'admin' WHERE lower("email") = 'guidouil@gmail.com';
