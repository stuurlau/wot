import type { FastifyInstance } from "fastify";

import { registerDailyLogRoutes } from "./daily-logs.js";
import { registerExerciseRoutes } from "./exercises.js";
import { registerPainLogRoutes } from "./pain-logs.js";
import { registerTrainingSessionRoutes } from "./training-sessions.js";

export async function registerApiRoutes(app: FastifyInstance) {
  await registerTrainingSessionRoutes(app);
  await registerDailyLogRoutes(app);
  await registerPainLogRoutes(app);
  await registerExerciseRoutes(app);
}
