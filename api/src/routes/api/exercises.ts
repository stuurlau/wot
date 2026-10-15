import { and, asc, desc, eq, gte, inArray, lt } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../../db/client.js";
import {
  exerciseConfig,
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
  setExerciseConfigBodySchema,
  setExerciseTagsBodySchema,
} from "./schemas.js";

const utcMidnight = (date: string) => new Date(`${date}T00:00:00.000Z`);

export async function registerExerciseRoutes(app: FastifyInstance) {
  app.patch(
    "/exercises/rename",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const input = parseRequest(renameExercisesBodySchema, request.body);
      const userId = authenticatedUserId(request);
      // `from` names are matched exactly: the fuzzy matching lives in the
      // client, which confirms the concrete list before calling this.
      // Tags and per-name config move along so a rename keeps the cog-menu
      // settings; on collision the target name's own rows win.
      const updated = await db.transaction(async (tx) => {
        const renamed = await tx
          .update(trainingSessionExercise)
          .set({ name: input.to })
          .where(
            and(
              inArray(trainingSessionExercise.name, input.from),
              inArray(
                trainingSessionExercise.trainingSessionId,
                tx
                  .select({ id: trainingSession.id })
                  .from(trainingSession)
                  .where(eq(trainingSession.userId, userId)),
              ),
            ),
          )
          .returning({ id: trainingSessionExercise.id });

        const [targetConfig] = await tx
          .select({ id: exerciseConfig.id })
          .from(exerciseConfig)
          .where(and(eq(exerciseConfig.userId, userId), eq(exerciseConfig.exerciseName, input.to)))
          .limit(1);
        if (targetConfig) {
          await tx
            .delete(exerciseConfig)
            .where(
              and(eq(exerciseConfig.userId, userId), inArray(exerciseConfig.exerciseName, input.from)),
            );
        } else {
          await tx
            .update(exerciseConfig)
            .set({ exerciseName: input.to })
            .where(
              and(eq(exerciseConfig.userId, userId), inArray(exerciseConfig.exerciseName, input.from)),
            );
        }

        const targetTags = await tx
          .select({ tag: exerciseTag.tag })
          .from(exerciseTag)
          .where(and(eq(exerciseTag.userId, userId), eq(exerciseTag.exerciseName, input.to)));
        const takenTags = new Set(targetTags.map((row) => row.tag));
        const fromTags = await tx
          .select({ id: exerciseTag.id, tag: exerciseTag.tag })
          .from(exerciseTag)
          .where(and(eq(exerciseTag.userId, userId), inArray(exerciseTag.exerciseName, input.from)));
        const movableTagIds: string[] = [];
        const duplicateTagIds: string[] = [];
        for (const row of fromTags) {
          if (takenTags.has(row.tag)) {
            duplicateTagIds.push(row.id);
          } else {
            takenTags.add(row.tag);
            movableTagIds.push(row.id);
          }
        }
        if (duplicateTagIds.length > 0) {
          await tx.delete(exerciseTag).where(inArray(exerciseTag.id, duplicateTagIds));
        }
        if (movableTagIds.length > 0) {
          await tx
            .update(exerciseTag)
            .set({ exerciseName: input.to })
            .where(inArray(exerciseTag.id, movableTagIds));
        }

        return renamed;
      });

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

  // Per-exercise logging config (cog menu), keyed by exercise name like the
  // tags above. GET returns every (exercise name -> config) pair for the
  // user; PUT replaces the config of one exercise name — an all-null config
  // resets to inheriting the global settings (the row is deleted).
  app.get(
    "/exercises/config",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const rows = await db
        .select({
          exerciseName: exerciseConfig.exerciseName,
          fields: exerciseConfig.fields,
          tempo: exerciseConfig.tempo,
          bodyRegions: exerciseConfig.bodyRegions,
        })
        .from(exerciseConfig)
        .where(eq(exerciseConfig.userId, authenticatedUserId(request)))
        .orderBy(asc(exerciseConfig.exerciseName));

      return { data: rows };
    },
  );

  app.put(
    "/exercises/config",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const input = parseRequest(setExerciseConfigBodySchema, request.body);
      const userId = authenticatedUserId(request);
      const { fields, tempo, bodyRegions } = input.config;

      if (fields === null && tempo === null && bodyRegions === null) {
        await db
          .delete(exerciseConfig)
          .where(
            and(eq(exerciseConfig.userId, userId), eq(exerciseConfig.exerciseName, input.exerciseName)),
          );
        return { exerciseName: input.exerciseName, ...input.config };
      }

      await db
        .insert(exerciseConfig)
        .values({ userId, exerciseName: input.exerciseName, fields, tempo, bodyRegions })
        .onConflictDoUpdate({
          target: [exerciseConfig.userId, exerciseConfig.exerciseName],
          set: { fields, tempo, bodyRegions },
        });

      return { exerciseName: input.exerciseName, ...input.config };
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

  app.get(
    "/exercises/history",
    { preHandler: requireAuthentication },
    async (request) => {
      const query = parseRequest(exerciseHistoryQuerySchema, request.query, true);
      const rows = await db
        .select({
          name: trainingSessionExercise.name,
          bodyRegions: trainingSessionExercise.bodyRegions,
          date: trainingSession.startedAt,
          weight: trainingSessionExerciseSet.weight,
          reps: trainingSessionExerciseSet.reps,
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
        .orderBy(asc(trainingSession.startedAt));

      return {
        data: rows.map((row) => ({
          name: row.name,
          bodyRegions: row.bodyRegions ?? [],
          date: row.date.toISOString().slice(0, 10),
          weight: row.weight === null ? null : Number(row.weight),
          reps: row.reps,
        })),
      };
    },
  );
}
