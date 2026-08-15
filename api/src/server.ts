import { buildApp } from "./app.js";
import { env } from "./env.js";

const app = await buildApp();

await app.listen({
  host: env.API_HOST,
  port: env.API_PORT,
});
