import { desc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../../db/client.js";
import { trainingSessionComponents, trainingSessions } from "../../db/schema/index.js";
import { authenticatedUserId, requireAuthentication } from "../../lib/authentication.js";
import { parseRequest } from "../../lib/api-validation.js";
import { recentsQuerySchema } from "./schemas.js";

export async function registerComponentRoutes(app: FastifyInstance) {
  app.get(
    "/components/recents",
    { preHandler: requireAuthentication },
    async (request) => {
      const query = parseRequest(recentsQuerySchema, request.query, true);
      const rows = await db
        .selectDistinctOn([trainingSessionComponents.name], {
          name: trainingSessionComponents.name,
          lastUsedAt: trainingSessions.startedAt,
          weight: trainingSessionComponents.weight,
          reps: trainingSessionComponents.reps,
          rir: trainingSessionComponents.rir,
          rpe: trainingSessionComponents.rpe,
        })
        .from(trainingSessionComponents)
        .innerJoin(
          trainingSessions,
          eq(trainingSessionComponents.trainingSessionId, trainingSessions.id),
        )
        .where(eq(trainingSessions.userId, authenticatedUserId(request)))
        .orderBy(
          trainingSessionComponents.name,
          desc(trainingSessions.startedAt),
          desc(trainingSessionComponents.id),
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
            lastUsedAt: row.lastUsedAt.toISOString(),
            lastComponent: {
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
