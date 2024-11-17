CREATE TYPE "public"."type" AS ENUM('document', 'image', 'media', 'other');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'archived');--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_file_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "file_type_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "file_name_idx";--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "uploaded_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "title" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "mime_type" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "path" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "status" "status" DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "type" "type" NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "tags" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_idx" ON "files" USING btree ("type");--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN IF EXISTS "file_name";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN IF EXISTS "file_type";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN IF EXISTS "encrypted_url";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN IF EXISTS "file_size";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN IF EXISTS "file_path";--> statement-breakpoint
DROP TYPE "public"."file_type";