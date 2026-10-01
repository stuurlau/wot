import { relations } from "drizzle-orm";

import { users } from "./auth.js";
import { dailyLog } from "./daily-logs.js";
import { painLog } from "./pain-logs.js";
import { restTime } from "./rest-times.js";
import { trainingSessionExerciseSet } from "./training-session-exercise-sets.js";
import { trainingSessionExercise } from "./training-session-exercises.js";
import { trainingSession } from "./training-sessions.js";

export const trainingSessionRelations = relations(trainingSession, ({ many, one }) => ({
  user: one(users, {
    fields: [trainingSession.userId],
    references: [users.id],
  }),
  exercises: many(trainingSessionExercise),
}));

export const trainingSessionExerciseRelations = relations(trainingSessionExercise, ({ many, one }) => ({
  trainingSession: one(trainingSession, {
    fields: [trainingSessionExercise.trainingSessionId],
    references: [trainingSession.id],
  }),
  sets: many(trainingSessionExerciseSet),
}));

export const trainingSessionExerciseSetRelations = relations(trainingSessionExerciseSet, ({ one, many }) => ({
  exercise: one(trainingSessionExercise, {
    fields: [trainingSessionExerciseSet.trainingSessionExerciseId],
    references: [trainingSessionExercise.id],
  }),
  restTimesBefore: many(restTime, { relationName: "restTimeSetBefore" }),
  restTimesAfter: many(restTime, { relationName: "restTimeSetAfter" }),
}));

export const restTimeRelations = relations(restTime, ({ one }) => ({
  setBefore: one(trainingSessionExerciseSet, {
    fields: [restTime.setBeforeId],
    references: [trainingSessionExerciseSet.id],
    relationName: "restTimeSetBefore",
  }),
  setAfter: one(trainingSessionExerciseSet, {
    fields: [restTime.setAfterId],
    references: [trainingSessionExerciseSet.id],
    relationName: "restTimeSetAfter",
  }),
}));

export const dailyLogRelations = relations(dailyLog, ({ one }) => ({
  user: one(users, {
    fields: [dailyLog.userId],
    references: [users.id],
  }),
}));

export const painLogRelations = relations(painLog, ({ one }) => ({
  user: one(users, {
    fields: [painLog.userId],
    references: [users.id],
  }),
}));
