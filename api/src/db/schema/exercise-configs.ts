import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth.js";

// Per-exercise logging configuration (the cog menu in the workout screen),
// keyed by (user, exercise name). No exercise catalogue: names stay free
// text, rows are created lazily on first save, and PATCH /exercises/rename
// moves them along. Null columns mean "inherit" (global user_settings /
// recents behaviour).
export const exerciseConfig = pgTable(
  "exercise_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseName: text("exercise_name").notNull(),
    // Flat subset of the set-input properties (weight/reps/rir/rpe/
    // distance/duration) — any combination, not restricted per mode.
    fields: text("fields").array(),
    // Tempo notation ("3-2-1"); stamped onto new sets of this exercise.
    tempo: text("tempo"),
    // Prefill when the exercise is added to a session.
    bodyRegions: text("body_regions").array(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("exercise_configs_user_exercise_idx").on(table.userId, table.exerciseName),
    index("exercise_configs_user_id_idx").on(table.userId),
  ],
);
