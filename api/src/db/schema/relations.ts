import { relations } from "drizzle-orm";

import { user } from "./auth.js";
import { dailyLogs } from "./daily-logs.js";
import { painLogs } from "./pain-logs.js";
import { trainingSessionComponents } from "./training-session-components.js";
import { trainingSessions } from "./training-sessions.js";

export const trainingSessionsRelations = relations(trainingSessions, ({ many, one }) => ({
  user: one(user, {
    fields: [trainingSessions.userId],
    references: [user.id],
  }),
  components: many(trainingSessionComponents),
}));

export const trainingSessionComponentsRelations = relations(trainingSessionComponents, ({ one }) => ({
  trainingSession: one(trainingSessions, {
    fields: [trainingSessionComponents.trainingSessionId],
    references: [trainingSessions.id],
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
