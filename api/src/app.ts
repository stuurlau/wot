import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";

import { env } from "./env.js";
import { auth } from "./lib/auth.js";
import { registerHealthRoutes } from "./routes/health.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cookie);
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await registerHealthRoutes(app);

  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    handler: async (request, reply) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (value) headers.append(key, value.toString());
      }
      const body =
        request.method === "GET"
          ? undefined
          : JSON.stringify(request.body ?? {});
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body,
      });
      const response = await auth.handler(req);
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    },
  });

  return app;
}
