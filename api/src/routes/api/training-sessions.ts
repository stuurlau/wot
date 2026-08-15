import { and, asc, desc, eq, gte, lt, or } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { db } from "../../db/client.js";
import { trainingSessionComponents, trainingSessions } from "../../db/schema/index.js";
import { authenticatedUserId, requireAuthentication } from "../../lib/authentication.js";
import { ApiError, notFoundError } from "../../lib/api-error.js";
import {
  parseRequest,
  rejectUnknownQuery,
  requireNonEmptyPatch,
} from "../../lib/api-validation.js";
import { decodeCursor, encodeCursor } from "../../lib/cursor.js";
import { serializeTrainingComponent, serializeTrainingSession } from "../../lib/serialization.js";
import {
  componentPathSchema,
  createComponentBodySchema,
  createTrainingSessionBodySchema,
  trainingSessionListQuerySchema,
  trainingSessionPathSchema,
  updateComponentBodySchema,
  updateTrainingSessionBodySchema,
} from "./schemas.js";

type TrainingSessionUpdate = z.infer<typeof updateTrainingSessionBodySchema>;
type ComponentUpdate = z.infer<typeof updateComponentBodySchema>;

const utcMidnight = (date: string) => new Date(`${date}T00:00:00.000Z`);

function trainingSessionUpdateValues(input: TrainingSessionUpdate): Partial<typeof trainingSessions.$inferInsert> {
  const values: Partial<typeof trainingSessions.$inferInsert> = {};
  if (input.startedAt !== undefined) values.startedAt = new Date(input.startedAt);
  if (input.duration !== undefined) values.duration = input.duration;
  if (input.srpe !== undefined) values.srpe = input.srpe.toString();
  if (input.type !== undefined) values.type = input.type;
  if (input.title !== undefined) values.title = input.title;
  if (input.notes !== undefined) values.notes = input.notes;
  return values;
}

function componentUpdateValues(
  input: ComponentUpdate,
): Partial<typeof trainingSessionComponents.$inferInsert> {
  const values: Partial<typeof trainingSessionComponents.$inferInsert> = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.bodyRegions !== undefined) values.bodyRegions = input.bodyRegions;
  if (input.weight !== undefined) values.weight = input.weight?.toString() ?? null;
  if (input.reps !== undefined) values.reps = input.reps;
  if (input.rir !== undefined) values.rir = input.rir?.toString() ?? null;
  if (input.distance !== undefined) values.distance = input.distance?.toString() ?? null;
  if (input.duration !== undefined) values.duration = input.duration;
  if (input.pace !== undefined) values.pace = input.pace?.toString() ?? null;
  if (input.rpe !== undefined) values.rpe = input.rpe?.toString() ?? null;
  if (input.sortOrder !== undefined) values.sortOrder = input.sortOrder;
  if (input.notes !== undefined) values.notes = input.notes;
  return values;
}

async function requireOwnedTrainingSession(userId: string, trainingSessionId: string) {
  const [session] = await db
    .select({ id: trainingSessions.id })
    .from(trainingSessions)
    .where(and(eq(trainingSessions.id, trainingSessionId), eq(trainingSessions.userId, userId)))
    .limit(1);
  if (!session) throw notFoundError();
}

function trainingSessionCursor(cursor: string) {
  const decoded = decodeCursor(cursor, "sessions");
  const startedAt = new Date(decoded.value);
  if (Number.isNaN(startedAt.getTime())) {
    throw new ApiError(400, "INVALID_QUERY", "Query parameters are invalid.", [
      { path: "cursor", message: "Cursor is invalid." },
    ]);
  }
  return { ...decoded, startedAt };
}

export async function registerTrainingSessionRoutes(app: FastifyInstance) {
  app.post(
    "/sessions",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const input = parseRequest(createTrainingSessionBodySchema, request.body);
      const [session] = await db
        .insert(trainingSessions)
        .values({
          userId: authenticatedUserId(request),
          startedAt: new Date(input.startedAt),
          duration: input.duration,
          srpe: input.srpe.toString(),
          type: input.type,
          title: input.title ?? null,
          notes: input.notes ?? null,
        })
        .returning();

      if (!session) throw new ApiError(500, "INTERNAL_ERROR", "Unable to create session.");
      return reply.code(201).send(serializeTrainingSession(session));
    },
  );

  app.get(
    "/sessions",
    { preHandler: requireAuthentication },
    async (request) => {
      const query = parseRequest(trainingSessionListQuerySchema, request.query, true);
      const filters = [eq(trainingSessions.userId, authenticatedUserId(request))];
      if (query.from) filters.push(gte(trainingSessions.startedAt, utcMidnight(query.from)));
      if (query.to) filters.push(lt(trainingSessions.startedAt, utcMidnight(query.to)));
      if (query.type) filters.push(eq(trainingSessions.type, query.type));
      if (query.cursor) {
        const cursor = trainingSessionCursor(query.cursor);
        filters.push(
          or(
            lt(trainingSessions.startedAt, cursor.startedAt),
            and(eq(trainingSessions.startedAt, cursor.startedAt), lt(trainingSessions.id, cursor.id)),
          )!,
        );
      }

      const rows = await db
        .select()
        .from(trainingSessions)
        .where(and(...filters))
        .orderBy(desc(trainingSessions.startedAt), desc(trainingSessions.id))
        .limit(query.limit + 1);
      const pageRows = rows.slice(0, query.limit);
      const last = pageRows.at(-1);

      return {
        data: pageRows.map(serializeTrainingSession),
        page: {
          nextCursor:
            rows.length > query.limit && last
              ? encodeCursor("sessions", last.startedAt, last.id)
              : null,
        },
      };
    },
  );

  app.get(
    "/sessions/:trainingSessionId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const { trainingSessionId } = parseRequest(trainingSessionPathSchema, request.params);
      const session = await db.query.trainingSessions.findFirst({
        where: and(
          eq(trainingSessions.id, trainingSessionId),
          eq(trainingSessions.userId, authenticatedUserId(request)),
        ),
        with: {
          components: {
            orderBy: asc(trainingSessionComponents.sortOrder),
          },
        },
      });
      if (!session) throw notFoundError();

      return {
        ...serializeTrainingSession(session),
        components: session.components.map(serializeTrainingComponent),
      };
    },
  );

  app.patch(
    "/sessions/:trainingSessionId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const { trainingSessionId } = parseRequest(trainingSessionPathSchema, request.params);
      const input = requireNonEmptyPatch(parseRequest(updateTrainingSessionBodySchema, request.body));
      const [session] = await db
        .update(trainingSessions)
        .set(trainingSessionUpdateValues(input))
        .where(
          and(
            eq(trainingSessions.id, trainingSessionId),
            eq(trainingSessions.userId, authenticatedUserId(request)),
          ),
        )
        .returning();
      if (!session) throw notFoundError();
      return serializeTrainingSession(session);
    },
  );

  app.delete(
    "/sessions/:trainingSessionId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const { trainingSessionId } = parseRequest(trainingSessionPathSchema, request.params);
      const [session] = await db
        .delete(trainingSessions)
        .where(
          and(
            eq(trainingSessions.id, trainingSessionId),
            eq(trainingSessions.userId, authenticatedUserId(request)),
          ),
        )
        .returning({ id: trainingSessions.id });
      if (!session) throw notFoundError();
      return reply.code(204).send();
    },
  );

  app.post(
    "/sessions/:trainingSessionId/components",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const { trainingSessionId } = parseRequest(trainingSessionPathSchema, request.params);
      const input = parseRequest(createComponentBodySchema, request.body);
      await requireOwnedTrainingSession(authenticatedUserId(request), trainingSessionId);
      const [component] = await db
        .insert(trainingSessionComponents)
        .values({
          trainingSessionId,
          name: input.name,
          bodyRegions: input.bodyRegions ?? null,
          weight: input.weight?.toString() ?? null,
          reps: input.reps ?? null,
          rir: input.rir?.toString() ?? null,
          distance: input.distance?.toString() ?? null,
          duration: input.duration ?? null,
          pace: input.pace?.toString() ?? null,
          rpe: input.rpe?.toString() ?? null,
          sortOrder: input.sortOrder,
          notes: input.notes ?? null,
        })
        .returning();
      if (!component) throw new ApiError(500, "INTERNAL_ERROR", "Unable to create component.");
      return reply.code(201).send(serializeTrainingComponent(component));
    },
  );

  app.patch(
    "/sessions/:trainingSessionId/components/:componentId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const { trainingSessionId, componentId } = parseRequest(componentPathSchema, request.params);
      const input = requireNonEmptyPatch(parseRequest(updateComponentBodySchema, request.body));
      await requireOwnedTrainingSession(authenticatedUserId(request), trainingSessionId);
      const [component] = await db
        .update(trainingSessionComponents)
        .set(componentUpdateValues(input))
        .where(
          and(
            eq(trainingSessionComponents.id, componentId),
            eq(trainingSessionComponents.trainingSessionId, trainingSessionId),
          ),
        )
        .returning();
      if (!component) throw notFoundError();
      return serializeTrainingComponent(component);
    },
  );

  app.delete(
    "/sessions/:trainingSessionId/components/:componentId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const { trainingSessionId, componentId } = parseRequest(componentPathSchema, request.params);
      await requireOwnedTrainingSession(authenticatedUserId(request), trainingSessionId);
      const [component] = await db
        .delete(trainingSessionComponents)
        .where(
          and(
            eq(trainingSessionComponents.id, componentId),
            eq(trainingSessionComponents.trainingSessionId, trainingSessionId),
          ),
        )
        .returning({ id: trainingSessionComponents.id });
      if (!component) throw notFoundError();
      return reply.code(204).send();
    },
  );
}
