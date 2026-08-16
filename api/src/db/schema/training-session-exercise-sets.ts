import { index, integer, numeric, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { trainingSessionExercises } from "./training-session-exercises.js";

export const trainingSessionExerciseSets = pgTable(
  "training_session_exercise_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trainingSessionExerciseId: uuid("training_session_exercise_id")
      .notNull()
      .references(() => trainingSessionExercises.id, { onDelete: "cascade" }),
    sortOrder: smallint("sort_order").notNull(),
    weight: numeric("weight", { precision: 6, scale: 2 }),
    reps: smallint("reps"),
    rir: numeric("rir", { precision: 3, scale: 1 }),
    distance: numeric("distance", { precision: 8, scale: 2 }),
    duration: integer("duration"),
    pace: numeric("pace", { precision: 6, scale: 2 }),
    rpe: numeric("rpe", { precision: 3, scale: 1 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("training_session_exercise_sets_exercise_id_sort_order_idx").on(table.trainingSessionExerciseId, table.sortOrder),
  ],
);
