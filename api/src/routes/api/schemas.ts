import { z } from "zod";

import { queryLimit, validateDateRange } from "../../lib/api-validation.js";
import { isValidTimeZone } from "../../lib/insights.js";

const databaseInteger = z.number().int().min(0).max(2_147_483_647);
const databaseSmallInteger = z.number().int().min(0).max(32_767);
const decimal = (schema: z.ZodNumber, maximum: number) => schema.max(maximum);
const nullableOptional = <T extends z.ZodType>(schema: T) => schema.nullable().optional();
const isoDateSchema = z.iso.date();
const isoDateTimeSchema = z.iso.datetime({ offset: true });
const decimalRatingSchema = z.number().min(1).max(10);
const kilogramsSchema = z.number().nonnegative();
const metersSchema = z.number().nonnegative();
const paceSecondsPerKmSchema = z.number().nonnegative();
const rirSchema = z.number().min(0).max(10);
const hrvSchema = z.number().nonnegative();

const nullableText = nullableOptional(z.string());
const nullableRating = nullableOptional(decimalRatingSchema);

export const trainingSessionPathSchema = z.object({ trainingSessionId: z.uuid() }).strict();
export const componentPathSchema = trainingSessionPathSchema.extend({ componentId: z.uuid() }).strict();
export const painLogPathSchema = z.object({ painLogId: z.uuid() }).strict();
export const dailyLogPathSchema = z.object({ date: isoDateSchema }).strict();

export const createTrainingSessionBodySchema = z
  .object({
    startedAt: isoDateTimeSchema,
    duration: databaseInteger,
    srpe: decimalRatingSchema,
    type: z.string().min(1),
    title: nullableText,
    notes: nullableText,
  })
  .strict();

export const updateTrainingSessionBodySchema = createTrainingSessionBodySchema.partial().strict();

export const createComponentBodySchema = z
  .object({
    name: z.string().min(1),
    bodyRegions: nullableOptional(z.array(z.string().min(1))),
    weight: nullableOptional(decimal(kilogramsSchema, 9_999.99)),
    reps: nullableOptional(databaseSmallInteger),
    rir: nullableOptional(rirSchema),
    distance: nullableOptional(decimal(metersSchema, 999_999.99)),
    duration: nullableOptional(databaseInteger),
    pace: nullableOptional(decimal(paceSecondsPerKmSchema, 9_999.99)),
    rpe: nullableRating,
    sortOrder: databaseSmallInteger,
    notes: nullableText,
  })
  .strict();

export const updateComponentBodySchema = createComponentBodySchema.partial().strict();

export const dailyLogBodySchema = z
  .object({
    sleepDuration: nullableOptional(databaseSmallInteger),
    sleepQuality: nullableRating,
    soreness: nullableRating,
    fatigue: nullableRating,
    stress: nullableRating,
    motivation: nullableRating,
    hrv: nullableOptional(decimal(hrvSchema, 999.99)),
    bodyWeight: nullableOptional(decimal(kilogramsSchema, 999.99)),
    notes: nullableText,
  })
  .strict();

export const createPainLogBodySchema = z
  .object({
    date: isoDateSchema,
    bodyRegion: z.string().min(1),
    severity: decimalRatingSchema,
    notes: nullableText,
  })
  .strict();

export const updatePainLogBodySchema = createPainLogBodySchema.partial().strict();

export const trainingSessionListQuerySchema = z
  .object({
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    type: z.string().min(1).optional(),
    limit: queryLimit(100, 30),
    cursor: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => validateDateRange(value, ctx));

export const dailyLogListQuerySchema = z
  .object({
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => validateDateRange(value, ctx, true));

export const painLogListQuerySchema = z
  .object({
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    bodyRegion: z.string().min(1).optional(),
    limit: queryLimit(100, 30),
    cursor: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => validateDateRange(value, ctx));

export const recentsQuerySchema = z
  .object({
    limit: queryLimit(50, 20),
  })
  .strict();

export const insightQuerySchema = z
  .object({
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    timezone: z
      .string()
      .refine(isValidTimeZone, "Must be a valid IANA time zone.")
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    validateDateRange(value, ctx, true);
    if (!value.timezone) {
      ctx.addIssue({ code: "custom", path: ["timezone"], message: "Required." });
    }
  });
