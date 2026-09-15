import { buildApp } from "./app.js";
import { getEnv } from "./env.js";

const env = getEnv();
const app = await buildApp();

await app.listen({
  host: env.API_HOST,
  port: env.API_PORT,
});
