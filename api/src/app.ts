import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";

import { env } from "./env.js";
import { auth } from "./lib/auth.js";
import { ApiError } from "./lib/api-error.js";
import { registerApiRoutes } from "./routes/api/index.js";
import { registerHealthRoutes } from "./routes/health.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  app.setErrorHandler((error, request, reply) => {
    if (!request.url.startsWith("/api/v1")) {
      return reply.status(errorStatusCode(error)).send(error);
    }

    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      });
    }

    if (isUniqueViolation(error)) {
      return reply.status(409).send({
        error: {
          code: "CONFLICT",
          message: "The operation conflicts with the current state.",
        },
      });
    }

    if (isInvalidRequestBody(error)) {
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request body is invalid.",
        },
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected server error occurred.",
      },
    });
  });

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/api/v1")) {
      return reply.status(404).send({
        error: {
          code: "NOT_FOUND",
          message: "The requested resource was not found.",
        },
      });
    }
    return reply.status(404).send();
  });

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
      const url = new URL(request.url, env.API_URL);
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

  await app.register(registerApiRoutes, { prefix: "/api/v1" });

  return app;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

function isInvalidRequestBody(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "FST_ERR_CTP_INVALID_JSON_BODY" ||
      error.code === "FST_ERR_CTP_EMPTY_JSON_BODY" ||
      error.code === "FST_ERR_CTP_INVALID_MEDIA_TYPE" ||
      error.code === "FST_ERR_CTP_INVALID_CONTENT_LENGTH")
  );
}

function errorStatusCode(error: unknown): number {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  )
    ? error.statusCode
    : 500;
}
