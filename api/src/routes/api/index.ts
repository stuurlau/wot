import type { FastifyInstance } from "fastify";

import { registerComponentRoutes } from "./components.js";
import { registerDailyLogRoutes } from "./daily-logs.js";
import { registerInsightRoutes } from "./insights.js";
import { registerPainLogRoutes } from "./pain-logs.js";
import { registerTrainingSessionRoutes } from "./training-sessions.js";

export async function registerApiRoutes(app: FastifyInstance) {
  await registerTrainingSessionRoutes(app);
  await registerDailyLogRoutes(app);
  await registerPainLogRoutes(app);
  await registerComponentRoutes(app);
  await registerInsightRoutes(app);
}
