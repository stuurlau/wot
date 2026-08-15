import { and, desc, eq, gte, lt } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { db } from "../../db/client.js";
import {
  dailyLogs,
  painLogs,
  trainingSessionComponents,
  trainingSessions,
} from "../../db/schema/index.js";
import { authenticatedUserId, requireAuthentication } from "../../lib/authentication.js";
import { ApiError } from "../../lib/api-error.js";
import { parseRequest } from "../../lib/api-validation.js";
import {
  dailyLoads,
  loadMetrics,
  localDate,
  localMidnight,
} from "../../lib/insights.js";
import { insightQuerySchema } from "./schemas.js";

type InsightQuery = z.infer<typeof insightQuerySchema>;

interface InsightRange {
  from: string;
  to: string;
  timezone: string;
}

function insightRange(query: InsightQuery): InsightRange {
  if (!query.from || !query.to || !query.timezone) {
    throw new ApiError(400, "INVALID_QUERY", "Query parameters are invalid.");
  }
  return { from: query.from, to: query.to, timezone: query.timezone };
}

async function loadData(userId: string, range: InsightRange) {
  const rows = await db
    .select({
      startedAt: trainingSessions.startedAt,
      duration: trainingSessions.duration,
      srpe: trainingSessions.srpe,
    })
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.userId, userId),
        gte(trainingSessions.startedAt, localMidnight(range.from, range.timezone)),
        lt(trainingSessions.startedAt, localMidnight(range.to, range.timezone)),
      ),
    );

  return dailyLoads(rows, range.from, range.to, range.timezone);
}

export async function registerInsightRoutes(app: FastifyInstance) {
  app.get(
    "/insights/load",
    { preHandler: requireAuthentication },
    async (request) => {
      const range = insightRange(parseRequest(insightQuerySchema, request.query, true));
      const daily = await loadData(authenticatedUserId(request), range);
      const metrics = loadMetrics(daily);

      return {
        data: {
          daily,
          totals: {
            load: daily.reduce((total, day) => total + day.load, 0),
            sessionCount: daily.reduce((total, day) => total + day.sessionCount, 0),
            monotony: metrics.monotony,
            strain: metrics.strain,
            acwr: metrics.acwr,
          },
        },
      };
    },
  );

  app.get(
    "/insights/regions",
    { preHandler: requireAuthentication },
    async (request) => {
      const range = insightRange(parseRequest(insightQuerySchema, request.query, true));
      const userId = authenticatedUserId(request);
      const rows = await db
        .select({
          bodyRegions: trainingSessionComponents.bodyRegions,
          duration: trainingSessionComponents.duration,
          rpe: trainingSessionComponents.rpe,
          startedAt: trainingSessions.startedAt,
        })
        .from(trainingSessionComponents)
        .innerJoin(
          trainingSessions,
          eq(trainingSessionComponents.trainingSessionId, trainingSessions.id),
        )
        .where(
          and(
            eq(trainingSessions.userId, userId),
            gte(trainingSessions.startedAt, localMidnight(range.from, range.timezone)),
            lt(trainingSessions.startedAt, localMidnight(range.to, range.timezone)),
          ),
        );
      const regions = new Map<
        string,
        { bodyRegion: string; componentCount: number; load: number; lastExposedOn: string }
      >();

      for (const row of rows) {
        const exposedOn = localDate(row.startedAt, range.timezone);
        const load =
          row.duration === null || row.rpe === null ? 0 : row.duration * Number(row.rpe);
        for (const bodyRegion of new Set(row.bodyRegions ?? [])) {
          const existing = regions.get(bodyRegion);
          if (existing) {
            existing.componentCount += 1;
            existing.load += load;
            if (exposedOn > existing.lastExposedOn) existing.lastExposedOn = exposedOn;
          } else {
            regions.set(bodyRegion, {
              bodyRegion,
              componentCount: 1,
              load,
              lastExposedOn: exposedOn,
            });
          }
        }
      }

      return {
        data: [...regions.values()].sort(
          (left, right) =>
            right.load - left.load || left.bodyRegion.localeCompare(right.bodyRegion),
        ),
      };
    },
  );

  app.get(
    "/insights/summary",
    { preHandler: requireAuthentication },
    async (request) => {
      const range = insightRange(parseRequest(insightQuerySchema, request.query, true));
      const userId = authenticatedUserId(request);
      const [daily, latestDailyLog, painRows] = await Promise.all([
        loadData(userId, range),
        db
          .select()
          .from(dailyLogs)
          .where(
            and(
              eq(dailyLogs.userId, userId),
              gte(dailyLogs.date, range.from),
              lt(dailyLogs.date, range.to),
            ),
          )
          .orderBy(desc(dailyLogs.date))
          .limit(1),
        db
          .select()
          .from(painLogs)
          .where(
            and(
              eq(painLogs.userId, userId),
              gte(painLogs.date, range.from),
              lt(painLogs.date, range.to),
            ),
          )
          .orderBy(desc(painLogs.date), desc(painLogs.createdAt)),
      ]);
      const metrics = loadMetrics(daily);
      const latest = latestDailyLog[0];
      const painByRegion = new Map<
        string,
        { bodyRegion: string; latestSeverity: number; latestDate: string }
      >();
      for (const painLog of painRows) {
        if (!painByRegion.has(painLog.bodyRegion)) {
          painByRegion.set(painLog.bodyRegion, {
            bodyRegion: painLog.bodyRegion,
            latestSeverity: Number(painLog.severity),
            latestDate: painLog.date,
          });
        }
      }

      return {
        data: {
          load: {
            weeklyLoad: metrics.weeklyLoad,
            monotony: metrics.monotony,
            strain: metrics.strain,
            acwr: metrics.acwr,
          },
          wellness: {
            latestDate: latest?.date ?? null,
            fatigue: latest?.fatigue === null || latest === undefined ? null : Number(latest.fatigue),
            soreness:
              latest?.soreness === null || latest === undefined ? null : Number(latest.soreness),
            stress: latest?.stress === null || latest === undefined ? null : Number(latest.stress),
            motivation:
              latest?.motivation === null || latest === undefined
                ? null
                : Number(latest.motivation),
          },
          pain: [...painByRegion.values()].sort(
            (left, right) =>
              right.latestDate.localeCompare(left.latestDate) ||
              left.bodyRegion.localeCompare(right.bodyRegion),
          ),
        },
      };
    },
  );
}
