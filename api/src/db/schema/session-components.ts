import { index, integer, numeric, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { sessions } from "./sessions.js";

export const sessionComponents = pgTable(
  "session_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
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
    index("session_components_session_id_sort_order_idx").on(table.sessionId, table.sortOrder),
    index("session_components_name_idx").on(table.name),
  ],
);
