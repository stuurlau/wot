import { index, integer, numeric, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { trainingSessions } from "./training-sessions.js";

export const trainingSessionComponents = pgTable(
  "training_session_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trainingSessionId: uuid("training_session_id")
      .notNull()
      .references(() => trainingSessions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    bodyRegions: text("body_regions").array(),
    weight: numeric("weight", { precision: 6, scale: 2 }),
    reps: smallint("reps"),
    rir: numeric("rir", { precision: 3, scale: 1 }),
    distance: numeric("distance", { precision: 8, scale: 2 }),
    duration: integer("duration"),
    pace: numeric("pace", { precision: 6, scale: 2 }),
    rpe: numeric("rpe", { precision: 3, scale: 1 }),
    sortOrder: smallint("sort_order").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("training_session_components_training_session_id_sort_order_idx").on(table.trainingSessionId, table.sortOrder),
    index("training_session_components_name_idx").on(table.name),
  ],
);
