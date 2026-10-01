CREATE TABLE "rest_times" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"set_before_id" uuid NOT NULL,
	"set_after_id" uuid NOT NULL,
	"from_at" timestamp with time zone NOT NULL,
	"till_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rest_times" ADD CONSTRAINT "rest_times_set_before_id_training_session_exercise_sets_id_fk" FOREIGN KEY ("set_before_id") REFERENCES "public"."training_session_exercise_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rest_times" ADD CONSTRAINT "rest_times_set_after_id_training_session_exercise_sets_id_fk" FOREIGN KEY ("set_after_id") REFERENCES "public"."training_session_exercise_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_session_exercise_sets" DROP COLUMN "rest";