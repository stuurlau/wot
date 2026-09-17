import { date, index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth.js";

export const painLogs = pgTable(
  "pain_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    bodyRegion: text("body_region").notNull(),
    severity: numeric("severity", { precision: 3, scale: 1 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("pain_logs_user_id_date_idx").on(table.userId, table.date),
    index("pain_logs_user_id_body_region_idx").on(table.userId, table.bodyRegion),
  ],
);
