import { relations } from "drizzle-orm";

import { user } from "./auth.js";
import { dailyLogs } from "./daily-logs.js";
import { painLogs } from "./pain-logs.js";
import { trainingSessionExerciseSets } from "./training-session-exercise-sets.js";
import { trainingSessionExercises } from "./training-session-exercises.js";
import { trainingSessions } from "./training-sessions.js";

export const trainingSessionsRelations = relations(trainingSessions, ({ many, one }) => ({
  user: one(user, {
    fields: [trainingSessions.userId],
    references: [user.id],
  }),
  exercises: many(trainingSessionExercises),
}));

export const trainingSessionExercisesRelations = relations(trainingSessionExercises, ({ many, one }) => ({
  trainingSession: one(trainingSessions, {
    fields: [trainingSessionExercises.trainingSessionId],
    references: [trainingSessions.id],
  }),
  sets: many(trainingSessionExerciseSets),
}));

export const trainingSessionExerciseSetsRelations = relations(trainingSessionExerciseSets, ({ one }) => ({
  exercise: one(trainingSessionExercises, {
    fields: [trainingSessionExerciseSets.trainingSessionExerciseId],
    references: [trainingSessionExercises.id],
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
