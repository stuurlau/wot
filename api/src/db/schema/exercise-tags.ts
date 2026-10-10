import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth.js";

// Tags group free-text exercise names per user (e.g. "prehab",
// "flexibility"). Like body_regions there is no lookup table for the tag
// itself — plain strings, one row per (user, exercise name, tag).
export const exerciseTag = pgTable(
  "exercise_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseName: text("exercise_name").notNull(),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("exercise_tags_user_exercise_tag_idx").on(
      table.userId,
      table.exerciseName,
      table.tag,
    ),
    index("exercise_tags_user_id_idx").on(table.userId),
  ],
);
