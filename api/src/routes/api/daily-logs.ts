import { and, asc, eq, gte, lt } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { db } from "../../db/client.js";
import { dailyLogs } from "../../db/schema/index.js";
import { authenticatedUserId, requireAuthentication } from "../../lib/authentication.js";
import { ApiError, notFoundError } from "../../lib/api-error.js";
import { parseRequest, rejectUnknownQuery } from "../../lib/api-validation.js";
import { serializeDailyLog } from "../../lib/serialization.js";
import {
  dailyLogBodySchema,
  dailyLogListQuerySchema,
  dailyLogPathSchema,
} from "./schemas.js";

type DailyLogInput = z.infer<typeof dailyLogBodySchema>;

function dailyLogValues(userId: string, date: string, input: DailyLogInput) {
  return {
    userId,
    date,
    sleepDuration: input.sleepDuration ?? null,
    sleepQuality: input.sleepQuality?.toString() ?? null,
    soreness: input.soreness?.toString() ?? null,
    fatigue: input.fatigue?.toString() ?? null,
    stress: input.stress?.toString() ?? null,
    motivation: input.motivation?.toString() ?? null,
    hrv: input.hrv?.toString() ?? null,
    bodyWeight: input.bodyWeight?.toString() ?? null,
    notes: input.notes ?? null,
  };
}

export async function registerDailyLogRoutes(app: FastifyInstance) {
  app.put(
    "/daily-logs/:date",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const { date } = parseRequest(dailyLogPathSchema, request.params);
      const input = parseRequest(dailyLogBodySchema, request.body);
      const values = dailyLogValues(authenticatedUserId(request), date, input);
      const [dailyLog] = await db
        .insert(dailyLogs)
        .values(values)
        .onConflictDoUpdate({
          target: [dailyLogs.userId, dailyLogs.date],
          set: {
            sleepDuration: values.sleepDuration,
            sleepQuality: values.sleepQuality,
            soreness: values.soreness,
            fatigue: values.fatigue,
            stress: values.stress,
            motivation: values.motivation,
            hrv: values.hrv,
            bodyWeight: values.bodyWeight,
            notes: values.notes,
          },
        })
        .returning();
      if (!dailyLog) throw new ApiError(500, "INTERNAL_ERROR", "Unable to save daily log.");
      return serializeDailyLog(dailyLog);
    },
  );

  app.get(
    "/daily-logs/:date",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const { date } = parseRequest(dailyLogPathSchema, request.params);
      const [dailyLog] = await db
        .select()
        .from(dailyLogs)
        .where(
          and(
            eq(dailyLogs.userId, authenticatedUserId(request)),
            eq(dailyLogs.date, date),
          ),
        )
        .limit(1);
      if (!dailyLog) throw notFoundError();
      return serializeDailyLog(dailyLog);
    },
  );

  app.get(
    "/daily-logs",
    { preHandler: requireAuthentication },
    async (request) => {
      const query = parseRequest(dailyLogListQuerySchema, request.query, true);
      if (!query.from || !query.to) {
        throw new ApiError(400, "INVALID_QUERY", "Query parameters are invalid.");
      }
      const rows = await db
        .select()
        .from(dailyLogs)
        .where(
          and(
            eq(dailyLogs.userId, authenticatedUserId(request)),
            gte(dailyLogs.date, query.from),
            lt(dailyLogs.date, query.to),
          ),
        )
        .orderBy(asc(dailyLogs.date));
      return { data: rows.map(serializeDailyLog) };
    },
  );

  app.delete(
    "/daily-logs/:date",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request, reply) => {
      const { date } = parseRequest(dailyLogPathSchema, request.params);
      const [dailyLog] = await db
        .delete(dailyLogs)
        .where(
          and(
            eq(dailyLogs.userId, authenticatedUserId(request)),
            eq(dailyLogs.date, date),
          ),
        )
        .returning({ id: dailyLogs.id });
      if (!dailyLog) throw notFoundError();
      return reply.code(204).send();
    },
  );
}
