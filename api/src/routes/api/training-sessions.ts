import { and, asc, desc, eq, gte, lt, or } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { db } from "../../db/client.js";
import {
  trainingSessionExerciseSet,
  trainingSessionExercise,
  trainingSession,
} from "../../db/schema/index.js";
import { authenticatedUserId, requireAuthentication } from "../../lib/authentication.js";
import { ApiError, notFoundError } from "../../lib/api-error.js";
import {
  parseRequest,
  rejectUnknownQuery,
  requireNonEmptyPatch,
} from "../../lib/api-validation.js";
import { decodeCursor, encodeCursor } from "../../lib/cursor.js";
import {
  serializeTrainingSession,
  serializeTrainingSessionExercise,
  serializeTrainingSessionExerciseSet,
} from "../../lib/serialization.js";
import {
  createExerciseBodySchema,
  createExerciseSetBodySchema,
  createTrainingSessionBodySchema,
  exercisePathSchema,
  setPathSchema,
  trainingSessionListQuerySchema,
  trainingSessionPathSchema,
  updateExerciseBodySchema,
  updateExerciseSetBodySchema,
  updateTrainingSessionBodySchema,
} from "./schemas.js";

type TrainingSessionUpdate = z.infer<typeof updateTrainingSessionBodySchema>;
type ExerciseUpdate = z.infer<typeof updateExerciseBodySchema>;
type SetUpdate = z.infer<typeof updateExerciseSetBodySchema>;

const utcMidnight = (date: string) => new Date(`${date}T00:00:00.000Z`);

function trainingSessionUpdateValues(
  input: TrainingSessionUpdate,
): Partial<typeof trainingSession.$inferInsert> {
  const values: Partial<typeof trainingSession.$inferInsert> = {};
  if (input.startedAt !== undefined) values.startedAt = new Date(input.startedAt);
  if (input.duration !== undefined) values.duration = input.duration;
  if (input.srpe !== undefined) values.srpe = input.srpe.toString();
  if (input.type !== undefined) values.type = input.type;
  if (input.title !== undefined) values.title = input.title;
  if (input.notes !== undefined) values.notes = input.notes;
  return values;
}

function exerciseUpdateValues(
  input: ExerciseUpdate,
): Partial<typeof trainingSessionExercise.$inferInsert> {
  const values: Partial<typeof trainingSessionExercise.$inferInsert> = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.bodyRegions !== undefined) values.bodyRegions = input.bodyRegions;
  if (input.sortOrder !== undefined) values.sortOrder = input.sortOrder;
  if (input.notes !== undefined) values.notes = input.notes;
  return values;
}

function setUpdateValues(
  input: SetUpdate,
): Partial<typeof trainingSessionExerciseSet.$inferInsert> {
  const values: Partial<typeof trainingSessionExerciseSet.$inferInsert> = {};
  if (input.sortOrder !== undefined) values.sortOrder = input.sortOrder;
  if (input.weight !== undefined) values.weight = input.weight?.toString() ?? null;
  if (input.reps !== undefined) values.reps = input.reps;
  if (input.rir !== undefined) values.rir = input.rir?.toString() ?? null;
  if (input.distance !== undefined) values.distance = input.distance?.toString() ?? null;
  if (input.duration !== undefined) values.duration = input.duration;
  if (input.pace !== undefined) values.pace = input.pace?.toString() ?? null;
  if (input.rpe !== undefined) values.rpe = input.rpe?.toString() ?? null;
  if (input.notes !== undefined) values.notes = input.notes;
  return values;
}

async function requireOwnedTrainingSession(userId: string, trainingSessionId: string) {
  const [session] = await db
    .select({ id: trainingSession.id })
    .from(trainingSession)
    .where(and(eq(trainingSession.id, trainingSessionId), eq(trainingSession.userId, userId)))
    .limit(1);
  if (!session) throw notFoundError();
}

async function requireOwnedExercise(userId: string, trainingSessionId: string, exerciseId: string) {
  const [exercise] = await db
    .select({ id: trainingSessionExercise.id })
    .from(trainingSessionExercise)
    .innerJoin(
      trainingSession,
      eq(trainingSessionExercise.trainingSessionId, trainingSession.id),
    )
    .where(
      and(
        eq(trainingSessionExercise.id, exerciseId),
        eq(trainingSessionExercise.trainingSessionId, trainingSessionId),
        eq(trainingSession.userId, userId),
      ),
    )
    .limit(1);
  if (!exercise) throw notFoundError();
}

async function requireOwnedSet(
  userId: string,
  trainingSessionId: string,
  exerciseId: string,
  setId: string,
) {
  const [set] = await db
    .select({ id: trainingSessionExerciseSet.id })
    .from(trainingSessionExerciseSet)
    .innerJoin(
      trainingSessionExercise,
      eq(trainingSessionExerciseSet.trainingSessionExerciseId, trainingSessionExercise.id),
    )
    .innerJoin(
      trainingSession,
      eq(trainingSessionExercise.trainingSessionId, trainingSession.id),
    )
    .where(
      and(
        eq(trainingSessionExerciseSet.id, setId),
        eq(trainingSessionExerciseSet.trainingSessionExerciseId, exerciseId),
        eq(trainingSessionExercise.trainingSessionId, trainingSessionId),
        eq(trainingSession.userId, userId),
      ),
    )
    .limit(1);
  if (!set) throw notFoundError();
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
        .insert(trainingSession)
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
      const filters = [eq(trainingSession.userId, authenticatedUserId(request))];
      if (query.from) filters.push(gte(trainingSession.startedAt, utcMidnight(query.from)));
      if (query.to) filters.push(lt(trainingSession.startedAt, utcMidnight(query.to)));
      if (query.type) filters.push(eq(trainingSession.type, query.type));
      if (query.cursor) {
        const cursor = trainingSessionCursor(query.cursor);
        filters.push(
          or(
            lt(trainingSession.startedAt, cursor.startedAt),
            and(eq(trainingSession.startedAt, cursor.startedAt), lt(trainingSession.id, cursor.id)),
          )!,
        );
      }

      const rows = await db
        .select()
        .from(trainingSession)
        .where(and(...filters))
        .orderBy(desc(trainingSession.startedAt), desc(trainingSession.id))
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
      const session = await db.query.trainingSession.findFirst({
        where: and(
          eq(trainingSession.id, trainingSessionId),
          eq(trainingSession.userId, authenticatedUserId(request)),
        ),
        with: {
          exercises: {
            orderBy: asc(trainingSessionExercise.sortOrder),
            with: {
              sets: {
                orderBy: asc(trainingSessionExerciseSet.sortOrder),
              },
            },
          },
        },
      });
      if (!session) throw notFoundError();

      return {
        ...serializeTrainingSession(session),
        exercises: session.exercises.map((exercise) => ({
          ...serializeTrainingSessionExercise(exercise),
          sets: exercise.sets.map(serializeTrainingSessionExerciseSet),
        })),
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
        .update(trainingSession)
        .set(trainingSessionUpdateValues(input))
        .where(
          and(
            eq(trainingSession.id, trainingSessionId),
            eq(trainingSession.userId, authenticatedUserId(request)),
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
        .delete(trainingSession)
        .where(
          and(
            eq(trainingSession.id, trainingSessionId),
            eq(trainingSession.userId, authenticatedUserId(request)),
          ),
        )
        .returning({ id: trainingSession.id });
      if (!session) throw notFoundError();
      return reply.code(204).send();
    },
  );

  // Exercise routes
  app.post(
    "/sessions/:trainingSessionId/exercises",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const { trainingSessionId } = parseRequest(trainingSessionPathSchema, request.params);
      const input = parseRequest(createExerciseBodySchema, request.body);
      await requireOwnedTrainingSession(authenticatedUserId(request), trainingSessionId);
      const [exercise] = await db
        .insert(trainingSessionExercise)
        .values({
          trainingSessionId,
          name: input.name,
          bodyRegions: input.bodyRegions ?? null,
          sortOrder: input.sortOrder,
          notes: input.notes ?? null,
        })
        .returning();
      if (!exercise) throw new ApiError(500, "INTERNAL_ERROR", "Unable to create exercise.");
      return reply.code(201).send(serializeTrainingSessionExercise(exercise));
    },
  );

  app.patch(
    "/sessions/:trainingSessionId/exercises/:exerciseId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const { trainingSessionId, exerciseId } = parseRequest(exercisePathSchema, request.params);
      const input = requireNonEmptyPatch(parseRequest(updateExerciseBodySchema, request.body));
      await requireOwnedExercise(authenticatedUserId(request), trainingSessionId, exerciseId);
      const [exercise] = await db
        .update(trainingSessionExercise)
        .set(exerciseUpdateValues(input))
        .where(
          and(
            eq(trainingSessionExercise.id, exerciseId),
            eq(trainingSessionExercise.trainingSessionId, trainingSessionId),
          ),
        )
        .returning();
      if (!exercise) throw notFoundError();
      return serializeTrainingSessionExercise(exercise);
    },
  );

  app.delete(
    "/sessions/:trainingSessionId/exercises/:exerciseId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const { trainingSessionId, exerciseId } = parseRequest(exercisePathSchema, request.params);
      await requireOwnedExercise(authenticatedUserId(request), trainingSessionId, exerciseId);
      const [exercise] = await db
        .delete(trainingSessionExercise)
        .where(
          and(
            eq(trainingSessionExercise.id, exerciseId),
            eq(trainingSessionExercise.trainingSessionId, trainingSessionId),
          ),
        )
        .returning({ id: trainingSessionExercise.id });
      if (!exercise) throw notFoundError();
      return reply.code(204).send();
    },
  );

  // Exercise Set routes
  app.post(
    "/sessions/:trainingSessionId/exercises/:exerciseId/sets",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const { trainingSessionId, exerciseId } = parseRequest(exercisePathSchema, request.params);
      const input = parseRequest(createExerciseSetBodySchema, request.body);
      await requireOwnedExercise(authenticatedUserId(request), trainingSessionId, exerciseId);
      const [set] = await db
        .insert(trainingSessionExerciseSet)
        .values({
          trainingSessionExerciseId: exerciseId,
          sortOrder: input.sortOrder,
          weight: input.weight?.toString() ?? null,
          reps: input.reps ?? null,
          rir: input.rir?.toString() ?? null,
          distance: input.distance?.toString() ?? null,
          duration: input.duration ?? null,
          pace: input.pace?.toString() ?? null,
          rpe: input.rpe?.toString() ?? null,
          notes: input.notes ?? null,
        })
        .returning();
      if (!set) throw new ApiError(500, "INTERNAL_ERROR", "Unable to create set.");
      return reply.code(201).send(serializeTrainingSessionExerciseSet(set));
    },
  );

  app.patch(
    "/sessions/:trainingSessionId/exercises/:exerciseId/sets/:setId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const { trainingSessionId, exerciseId, setId } = parseRequest(setPathSchema, request.params);
      const input = requireNonEmptyPatch(parseRequest(updateExerciseSetBodySchema, request.body));
      await requireOwnedSet(authenticatedUserId(request), trainingSessionId, exerciseId, setId);
      const [set] = await db
        .update(trainingSessionExerciseSet)
        .set(setUpdateValues(input))
        .where(
          and(
            eq(trainingSessionExerciseSet.id, setId),
            eq(trainingSessionExerciseSet.trainingSessionExerciseId, exerciseId),
          ),
        )
        .returning();
      if (!set) throw notFoundError();
      return serializeTrainingSessionExerciseSet(set);
    },
  );

  app.delete(
    "/sessions/:trainingSessionId/exercises/:exerciseId/sets/:setId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const { trainingSessionId, exerciseId, setId } = parseRequest(setPathSchema, request.params);
      await requireOwnedSet(authenticatedUserId(request), trainingSessionId, exerciseId, setId);
      const [set] = await db
        .delete(trainingSessionExerciseSet)
        .where(
          and(
            eq(trainingSessionExerciseSet.id, setId),
            eq(trainingSessionExerciseSet.trainingSessionExerciseId, exerciseId),
          ),
        )
        .returning({ id: trainingSessionExerciseSet.id });
      if (!set) throw notFoundError();
      return reply.code(204).send();
    },
  );
}
