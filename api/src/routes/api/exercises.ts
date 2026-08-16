import { desc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../../db/client.js";
import {
  trainingSessionExerciseSets,
  trainingSessionExercises,
  trainingSessions,
} from "../../db/schema/index.js";
import { authenticatedUserId, requireAuthentication } from "../../lib/authentication.js";
import { parseRequest } from "../../lib/api-validation.js";
import { recentsQuerySchema } from "./schemas.js";

export async function registerExerciseRoutes(app: FastifyInstance) {
  app.get(
    "/exercises/recents",
    { preHandler: requireAuthentication },
    async (request) => {
      const query = parseRequest(recentsQuerySchema, request.query, true);
      const rows = await db
        .selectDistinctOn([trainingSessionExercises.name], {
          name: trainingSessionExercises.name,
          bodyRegions: trainingSessionExercises.bodyRegions,
          lastUsedAt: trainingSessions.startedAt,
          weight: trainingSessionExerciseSets.weight,
          reps: trainingSessionExerciseSets.reps,
          rir: trainingSessionExerciseSets.rir,
          rpe: trainingSessionExerciseSets.rpe,
        })
        .from(trainingSessionExercises)
        .innerJoin(
          trainingSessions,
          eq(trainingSessionExercises.trainingSessionId, trainingSessions.id),
        )
        .leftJoin(
          trainingSessionExerciseSets,
          eq(trainingSessionExerciseSets.trainingSessionExerciseId, trainingSessionExercises.id),
        )
        .where(eq(trainingSessions.userId, authenticatedUserId(request)))
        .orderBy(
          trainingSessionExercises.name,
          desc(trainingSessions.startedAt),
          desc(trainingSessionExercises.id),
          desc(trainingSessionExerciseSets.sortOrder),
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
}
