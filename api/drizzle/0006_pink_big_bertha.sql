CREATE TABLE "exercise_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"exercise_name" text NOT NULL,
	"fields" text[],
	"tempo" text,
	"body_regions" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "training_session_exercise_sets" ADD COLUMN "tempo" text;--> statement-breakpoint
ALTER TABLE "exercise_configs" ADD CONSTRAINT "exercise_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_configs_user_exercise_idx" ON "exercise_configs" USING btree ("user_id","exercise_name");--> statement-breakpoint
CREATE INDEX "exercise_configs_user_id_idx" ON "exercise_configs" USING btree ("user_id");