import { z } from "zod";
import type { FastifyRequest } from "fastify";

import { ApiError, validationError } from "./api-error.js";

export function parseRequest<T>(schema: z.ZodType<T>, value: unknown, isQuery = false): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw validationError(result.error.issues, isQuery);
  }
  return result.data;
}

export function requireNonEmptyPatch<T extends Record<string, unknown>>(input: T): T {
  if (Object.keys(input).length === 0) {
    throw new ApiError(422, "VALIDATION_ERROR", "Request body must include at least one field.", [
      { path: "", message: "At least one field is required." },
    ]);
  }
  return input;
}

export const queryLimit = (maximum: number, defaultValue: number) =>
  z
    .string()
    .regex(/^[1-9]\d*$/, "Must be a positive integer.")
    .transform(Number)
    .pipe(z.number().int().min(1).max(maximum))
    .optional()
    .default(defaultValue);

export function validateDateRange(
  value: { from?: string; to?: string },
  ctx: z.RefinementCtx,
  required = false,
) {
  if (required && (!value.from || !value.to)) {
    if (!value.from) {
      ctx.addIssue({ code: "custom", path: ["from"], message: "Required." });
    }
    if (!value.to) {
      ctx.addIssue({ code: "custom", path: ["to"], message: "Required." });
    }
    return;
  }

  if (value.from && value.to && value.from >= value.to) {
    ctx.addIssue({
      code: "custom",
      path: ["to"],
      message: "Must be later than from.",
    });
  }
}

const noQuerySchema = z.object({}).strict();

export async function rejectUnknownQuery(request: FastifyRequest): Promise<void> {
  parseRequest(noQuerySchema, request.query, true);
}
