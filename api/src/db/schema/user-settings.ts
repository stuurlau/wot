import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { UserSettings } from "@wot/types";

import { users } from "./auth.js";

// One row per user. The payload is validated against userSettingsSchema
// (@wot/types) on write, so the jsonb blob stays the single source of truth
// for UI preferences without a migration per new preference.
export const userSettings = pgTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<UserSettings>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
