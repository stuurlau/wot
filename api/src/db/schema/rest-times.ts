import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { trainingSessionExerciseSet } from "./training-session-exercise-sets.js";

export const restTime = pgTable("rest_times", {
  id: uuid("id").defaultRandom().primaryKey(),
  setBeforeId: uuid("set_before_id")
    .notNull()
    .references(() => trainingSessionExerciseSet.id, { onDelete: "cascade" }),
  setAfterId: uuid("set_after_id")
    .notNull()
    .references(() => trainingSessionExerciseSet.id, { onDelete: "cascade" }),
  fromAt: timestamp("from_at", { withTimezone: true }).notNull(),
  tillAt: timestamp("till_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
