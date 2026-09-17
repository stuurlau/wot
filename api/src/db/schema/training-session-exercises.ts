import { index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { trainingSessions } from "./training-sessions.js";

export const trainingSessionExercises = pgTable(
  "training_session_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trainingSessionId: uuid("training_session_id")
      .notNull()
      .references(() => trainingSessions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    bodyRegions: text("body_regions").array(),
    sortOrder: smallint("sort_order").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("training_session_exercises_training_session_id_sort_order_idx").on(table.trainingSessionId, table.sortOrder),
    index("training_session_exercises_name_idx").on(table.name),
  ],
);
