import { and, asc, desc, eq, gte, inArray, lt } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../../db/client.js";
import {
  exerciseTag,
  trainingSessionExerciseSet,
  trainingSessionExercise,
  trainingSession,
} from "../../db/schema/index.js";
import { authenticatedUserId, requireAuthentication } from "../../lib/authentication.js";
import { notFoundError } from "../../lib/api-error.js";
import { parseRequest, rejectUnknownQuery } from "../../lib/api-validation.js";
import { serializeTrainingSessionExerciseSet } from "../../lib/serialization.js";
import {
  exerciseHistoryQuerySchema,
  lastExerciseQuerySchema,
  recentsQuerySchema,
  renameExercisesBodySchema,
  setExerciseTagsBodySchema,
} from "./schemas.js";

const utcMidnight = (date: string) => new Date(`${date}T00:00:00.000Z`);

export async function registerExerciseRoutes(app: FastifyInstance) {
  app.patch(
    "/exercises/rename",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const input = parseRequest(renameExercisesBodySchema, request.body);
      // `from` names are matched exactly: the fuzzy matching lives in the
      // client, which confirms the concrete list before calling this.
      const updated = await db
        .update(trainingSessionExercise)
        .set({ name: input.to })
        .where(
          and(
            inArray(trainingSessionExercise.name, input.from),
            inArray(
              trainingSessionExercise.trainingSessionId,
              db
                .select({ id: trainingSession.id })
                .from(trainingSession)
                .where(eq(trainingSession.userId, authenticatedUserId(request))),
            ),
          ),
        )
        .returning({ id: trainingSessionExercise.id });

      return { updated: updated.length };
    },
  );

  app.get(
    "/exercises/recents",
    { preHandler: requireAuthentication },
    async (request) => {
      const query = parseRequest(recentsQuerySchema, request.query, true);
      const rows = await db
        .selectDistinctOn([trainingSessionExercise.name], {
          name: trainingSessionExercise.name,
          bodyRegions: trainingSessionExercise.bodyRegions,
          lastUsedAt: trainingSession.startedAt,
          weight: trainingSessionExerciseSet.weight,
          reps: trainingSessionExerciseSet.reps,
          rir: trainingSessionExerciseSet.rir,
          rpe: trainingSessionExerciseSet.rpe,
        })
        .from(trainingSessionExercise)
        .innerJoin(
          trainingSession,
          eq(trainingSessionExercise.trainingSessionId, trainingSession.id),
        )
        .leftJoin(
          trainingSessionExerciseSet,
          eq(trainingSessionExerciseSet.trainingSessionExerciseId, trainingSessionExercise.id),
        )
        .where(eq(trainingSession.userId, authenticatedUserId(request)))
        .orderBy(
          trainingSessionExercise.name,
          desc(trainingSession.startedAt),
          desc(trainingSessionExercise.id),
          desc(trainingSessionExerciseSet.sortOrder),
        );

      return {
        data: rows
          .sort(
            (left, right) =>
              right.lastUsedAt.getTime() - left.lastUsedAt.getTime() ||
              left.name.localeCompare(right.name),
          )
          .slice(0, query.limit)
          .map((row) => ({
            name: row.name,
            bodyRegions: row.bodyRegions ?? [],
            lastUsedAt: row.lastUsedAt.toISOString(),
            lastSet: {
              weight: row.weight === null ? null : Number(row.weight),
              reps: row.reps,
              rir: row.rir === null ? null : Number(row.rir),
              rpe: row.rpe === null ? null : Number(row.rpe),
            },
          })),
      };
    },
  );

  // Tags let users group free-text exercise names (e.g. "prehab",
  // "flexibility"). GET returns every (exercise name -> tags) pair for the
  // user; PUT replaces the tag set of one exercise name.
  app.get(
    "/exercises/tags",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const rows = await db
        .select({ exerciseName: exerciseTag.exerciseName, tag: exerciseTag.tag })
        .from(exerciseTag)
        .where(eq(exerciseTag.userId, authenticatedUserId(request)))
        .orderBy(asc(exerciseTag.exerciseName), asc(exerciseTag.tag));

      const byExercise = new Map<string, string[]>();
      for (const row of rows) {
        const tags = byExercise.get(row.exerciseName) ?? [];
        tags.push(row.tag);
        byExercise.set(row.exerciseName, tags);
      }

      return {
        data: [...byExercise.entries()].map(([exerciseName, tags]) => ({ exerciseName, tags })),
      };
    },
  );

  app.put(
    "/exercises/tags",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const input = parseRequest(setExerciseTagsBodySchema, request.body);
      const userId = authenticatedUserId(request);
      const tags = [...new Set(input.tags)];

      await db.transaction(async (tx) => {
        await tx
          .delete(exerciseTag)
          .where(
            and(eq(exerciseTag.userId, userId), eq(exerciseTag.exerciseName, input.exerciseName)),
          );
        if (tags.length > 0) {
          await tx.insert(exerciseTag).values(
            tags.map((tag) => ({ userId, exerciseName: input.exerciseName, tag })),
          );
        }
      });

      return { exerciseName: input.exerciseName, tags };
    },
  );

  // The most recent occurrence of an exercise name, with its sets — the
  // client uses this to prefill sets when repeating an exercise.
  app.get(
    "/exercises/last",
    { preHandler: requireAuthentication },
    async (request) => {
      const query = parseRequest(lastExerciseQuerySchema, request.query, true);
      const rows = await db
        .select({
          exerciseId: trainingSessionExercise.id,
          name: trainingSessionExercise.name,
          bodyRegions: trainingSessionExercise.bodyRegions,
          lastUsedAt: trainingSession.startedAt,
          set: trainingSessionExerciseSet,
        })
        .from(trainingSessionExercise)
        .innerJoin(
          trainingSession,
          eq(trainingSessionExercise.trainingSessionId, trainingSession.id),
        )
        .leftJoin(
          trainingSessionExerciseSet,
          eq(trainingSessionExerciseSet.trainingSessionExerciseId, trainingSessionExercise.id),
        )
        .where(
          and(
            eq(trainingSession.userId, authenticatedUserId(request)),
            eq(trainingSessionExercise.name, query.name),
          ),
        )
        .orderBy(
          desc(trainingSession.startedAt),
          desc(trainingSessionExercise.createdAt),
          asc(trainingSessionExerciseSet.sortOrder),
        );

      const first = rows[0];
      if (!first) throw notFoundError();
      const sets = rows
        .filter((row) => row.exerciseId === first.exerciseId && row.set !== null)
        .map((row) => serializeTrainingSessionExerciseSet(row.set!));

      return {
        name: first.name,
        bodyRegions: first.bodyRegions ?? [],
        lastUsedAt: first.lastUsedAt.toISOString(),
        sets,
      };
    },
  );

  // Full set-level history joined with its session: the Insights dashboard
  // computes every metric client-side from these rows (see
  // docs/20261015_insights_glance_explorer_redesign.md). Sessions without any
  // sets never appear here — they carry no training stimulus.
  app.get(
    "/exercises/history",
    { preHandler: requireAuthentication },
    async (request) => {
      const query = parseRequest(exerciseHistoryQuerySchema, request.query, true);
      const rows = await db
        .select({
          sessionId: trainingSession.id,
          sessionType: trainingSession.type,
          sessionDuration: trainingSession.duration,
          sessionSrpe: trainingSession.srpe,
          exerciseId: trainingSessionExercise.id,
          name: trainingSessionExercise.name,
          bodyRegions: trainingSessionExercise.bodyRegions,
          date: trainingSession.startedAt,
          sortOrder: trainingSessionExerciseSet.sortOrder,
          weight: trainingSessionExerciseSet.weight,
          reps: trainingSessionExerciseSet.reps,
          rir: trainingSessionExerciseSet.rir,
          rpe: trainingSessionExerciseSet.rpe,
          duration: trainingSessionExerciseSet.duration,
        })
        .from(trainingSessionExercise)
        .innerJoin(
          trainingSession,
          eq(trainingSessionExercise.trainingSessionId, trainingSession.id),
        )
        .innerJoin(
          trainingSessionExerciseSet,
          eq(trainingSessionExerciseSet.trainingSessionExerciseId, trainingSessionExercise.id),
        )
        .where(
          and(
            eq(trainingSession.userId, authenticatedUserId(request)),
            gte(trainingSession.startedAt, utcMidnight(query.from)),
            lt(trainingSession.startedAt, utcMidnight(query.to)),
          ),
        )
        .orderBy(
          asc(trainingSession.startedAt),
          asc(trainingSessionExercise.id),
          asc(trainingSessionExerciseSet.sortOrder),
        );

      return {
        data: rows.map((row) => ({
          sessionId: row.sessionId,
          sessionType: row.sessionType,
          sessionDuration: row.sessionDuration,
          sessionSrpe: Number(row.sessionSrpe),
          exerciseId: row.exerciseId,
          name: row.name,
          bodyRegions: row.bodyRegions ?? [],
          date: row.date.toISOString().slice(0, 10),
          sortOrder: row.sortOrder,
          weight: row.weight === null ? null : Number(row.weight),
          reps: row.reps,
          rir: row.rir === null ? null : Number(row.rir),
          rpe: row.rpe === null ? null : Number(row.rpe),
          duration: row.duration,
        })),
      };
    },
  );
}
