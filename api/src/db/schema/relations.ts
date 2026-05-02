import { relations } from "drizzle-orm";

import { user } from "./auth.js";
import { dailyLogs } from "./daily-logs.js";
import { painLogs } from "./pain-logs.js";
import { sessionComponents } from "./session-components.js";
import { sessions } from "./sessions.js";

export const sessionsRelations = relations(sessions, ({ many, one }) => ({
  user: one(user, {
    fields: [sessions.userId],
    references: [user.id],
  }),
  components: many(sessionComponents),
}));

export const sessionComponentsRelations = relations(sessionComponents, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionComponents.sessionId],
    references: [sessions.id],
  }),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  user: one(user, {
    fields: [dailyLogs.userId],
    references: [user.id],
  }),
}));

export const painLogsRelations = relations(painLogs, ({ one }) => ({
  user: one(user, {
    fields: [painLogs.userId],
    references: [user.id],
  }),
}));
