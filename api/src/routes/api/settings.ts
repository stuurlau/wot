import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { defaultUserSettings, userSettingsSchema } from "@wot/types";

import { db } from "../../db/client.js";
import { userSettings } from "../../db/schema/index.js";
import { authenticatedUserId, requireAuthentication } from "../../lib/authentication.js";
import { parseRequest, rejectUnknownQuery } from "../../lib/api-validation.js";
import { userSettingsBodySchema } from "./schemas.js";

export async function registerSettingsRoutes(app: FastifyInstance) {
  app.get(
    "/settings",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const [row] = await db
        .select({ data: userSettings.data })
        .from(userSettings)
        .where(eq(userSettings.userId, authenticatedUserId(request)))
        .limit(1);
      // Rows were validated on write; a parse failure (e.g. after a schema
      // change) falls back to defaults instead of breaking the client.
      const parsed = userSettingsSchema.safeParse(row?.data);
      return parsed.success ? parsed.data : defaultUserSettings;
    },
  );

  app.put(
    "/settings",
    { preHandler: [requireAuthentication, rejectUnknownQuery] },
    async (request) => {
      const input = parseRequest(userSettingsBodySchema, request.body);
      const userId = authenticatedUserId(request);
      await db
        .insert(userSettings)
        .values({ userId, data: input })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: { data: input, updatedAt: new Date() },
        });
      return input;
    },
  );
}
