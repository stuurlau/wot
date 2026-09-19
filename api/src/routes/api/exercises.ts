import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../../db/client.js";
import {
  trainingSessionExerciseSet,
  trainingSessionExercise,
  trainingSession,
} from "../../db/schema/index.js";
import { authenticatedUserId, requireAuthentication } from "../../lib/authentication.js";
import { parseRequest } from "../../lib/api-validation.js";
import { exerciseHistoryQuerySchema, recentsQuerySchema } from "./schemas.js";

const utcMidnight = (date: string) => new Date(`${date}T00:00:00.000Z`);

export async function registerExerciseRoutes(app: FastifyInstance) {
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
