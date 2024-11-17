CREATE TYPE "public"."file_type" AS ENUM('document', 'image', 'media', 'audio', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('client', 'operation');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_type" "file_type" NOT NULL,
	"encrypted_url" varchar(512) NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" varchar(512) NOT NULL,
	"uploaded_by" integer NOT NULL,
	"uploaded_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "files_file_name_unique" UNIQUE("file_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"password" varchar NOT NULL,
	"user_type" "user_type" DEFAULT 'client' NOT NULL,
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_type_idx" ON "files" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_name_idx" ON "files" USING btree ("file_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email");