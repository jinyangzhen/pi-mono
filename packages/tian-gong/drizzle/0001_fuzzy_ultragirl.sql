CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"file_path" varchar(1000) NOT NULL,
	"mode" varchar(50) NOT NULL,
	"title" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_active_at" timestamp,
	"message_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_sessions_user_id_id_idx" ON "user_sessions" USING btree ("user_id","id");