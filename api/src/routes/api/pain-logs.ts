import { and, desc, eq, gte, lt, or } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { db } from "../../db/client.js";
import { painLogs } from "../../db/schema/index.js";
import { authenticatedUserId, requireAuthentication } from "../../lib/authentication.js";
import { ApiError, notFoundError } from "../../lib/api-error.js";
import {
  parseRequest,
  rejectUnknownQuery,
  requireNonEmptyPatch,
} from "../../lib/api-validation.js";
import { decodeCursor, encodeCursor } from "../../lib/cursor.js";
import { serializePainLog } from "../../lib/serialization.js";
import {
  createPainLogBodySchema,
  painLogListQuerySchema,
  painLogPathSchema,
  updatePainLogBodySchema,
} from "./schemas.js";

type PainLogUpdate = z.infer<typeof updatePainLogBodySchema>;

function painLogUpdateValues(input: PainLogUpdate): Partial<typeof painLogs.$inferInsert> {
  const values: Partial<typeof painLogs.$inferInsert> = {};
  if (input.date !== undefined) values.date = input.date;
  if (input.bodyRegion !== undefined) values.bodyRegion = input.bodyRegion;
  if (input.severity !== undefined) values.severity = input.severity.toString();
  if (input.notes !== undefined) values.notes = input.notes;
  return values;
}

function painLogCursor(cursor: string) {
  const decoded = decodeCursor(cursor, "pain-logs");
  if (!z.iso.date().safeParse(decoded.value).success) {
    throw new ApiError(400, "INVALID_QUERY", "Query parameters are invalid.", [
      { path: "cursor", message: "Cursor is invalid." },
    ]);
  }
  return decoded;
}

export async function registerPainLogRoutes(app: FastifyInstance) {
  app.post(
    "/pain-logs",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const input = parseRequest(createPainLogBodySchema, request.body);
      const [painLog] = await db
        .insert(painLogs)
        .values({
          userId: authenticatedUserId(request),
          date: input.date,
          bodyRegion: input.bodyRegion,
          severity: input.severity.toString(),
          notes: input.notes ?? null,
        })
        .returning();
      if (!painLog) throw new ApiError(500, "INTERNAL_ERROR", "Unable to create pain log.");
      return reply.code(201).send(serializePainLog(painLog));
    },
  );

  app.get(
    "/pain-logs",
    { preHandler: requireAuthentication },
    async (request) => {
      const query = parseRequest(painLogListQuerySchema, request.query, true);
      const filters = [eq(painLogs.userId, authenticatedUserId(request))];
      if (query.from) filters.push(gte(painLogs.date, query.from));
      if (query.to) filters.push(lt(painLogs.date, query.to));
      if (query.bodyRegion) filters.push(eq(painLogs.bodyRegion, query.bodyRegion));
      if (query.cursor) {
        const cursor = painLogCursor(query.cursor);
        filters.push(
          or(
            lt(painLogs.date, cursor.value),
            and(eq(painLogs.date, cursor.value), lt(painLogs.id, cursor.id)),
          )!,
        );
      }

      const rows = await db
        .select()
        .from(painLogs)
        .where(and(...filters))
        .orderBy(desc(painLogs.date), desc(painLogs.id))
        .limit(query.limit + 1);
      const pageRows = rows.slice(0, query.limit);
      const last = pageRows.at(-1);

      return {
        data: pageRows.map(serializePainLog),
        page: {
          nextCursor:
            rows.length > query.limit && last
              ? encodeCursor("pain-logs", last.date, last.id)
              : null,
        },
      };
    },
  );

  app.get(
    "/pain-logs/:painLogId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const { painLogId } = parseRequest(painLogPathSchema, request.params);
      const [painLog] = await db
        .select()
        .from(painLogs)
        .where(
          and(
            eq(painLogs.id, painLogId),
            eq(painLogs.userId, authenticatedUserId(request)),
          ),
        )
        .limit(1);
      if (!painLog) throw notFoundError();
      return serializePainLog(painLog);
    },
  );

  app.patch(
    "/pain-logs/:painLogId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const { painLogId } = parseRequest(painLogPathSchema, request.params);
      const input = requireNonEmptyPatch(parseRequest(updatePainLogBodySchema, request.body));
      const [painLog] = await db
        .update(painLogs)
        .set(painLogUpdateValues(input))
        .where(
          and(
            eq(painLogs.id, painLogId),
            eq(painLogs.userId, authenticatedUserId(request)),
          ),
        )
        .returning();
      if (!painLog) throw notFoundError();
      return serializePainLog(painLog);
    },
  );

  app.delete(
    "/pain-logs/:painLogId",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const { painLogId } = parseRequest(painLogPathSchema, request.params);
      const [painLog] = await db
        .delete(painLogs)
        .where(
          and(
            eq(painLogs.id, painLogId),
            eq(painLogs.userId, authenticatedUserId(request)),
          ),
        )
        .returning({ id: painLogs.id });
      if (!painLog) throw notFoundError();
      return reply.code(204).send();
    },
  );
}
