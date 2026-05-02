import { date, index, numeric, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth.js";

export const dailyLogs = pgTable(
  "daily_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    sleepDuration: smallint("sleep_duration"),
    sleepQuality: numeric("sleep_quality", { precision: 3, scale: 1 }),
    soreness: numeric("soreness", { precision: 3, scale: 1 }),
    fatigue: numeric("fatigue", { precision: 3, scale: 1 }),
    stress: numeric("stress", { precision: 3, scale: 1 }),
    motivation: numeric("motivation", { precision: 3, scale: 1 }),
    hrv: numeric("hrv", { precision: 5, scale: 2 }),
    bodyWeight: numeric("body_weight", { precision: 5, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("daily_logs_user_id_date_idx").on(table.userId, table.date),
    index("daily_logs_user_id_idx").on(table.userId),
  ],
);
