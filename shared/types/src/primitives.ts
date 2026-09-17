import { z } from 'zod';

// Resource ids are uuid columns; better-auth user ids are opaque text.
export const identifierSchema = z.uuid();
export const userIdSchema = z.string().min(1);
export const isoDateSchema = z.iso.date();
export const isoDateTimeSchema = z.iso.datetime({ offset: true });
// Nullable text columns come back as null on the wire and may be omitted on
// input.
export const optionalTextSchema = z.string().nullish();
export const decimalRatingSchema = z.number().min(1).max(10);
export const rirSchema = z.number().min(0).max(10);
export const secondsSchema = z.number().int().min(0).max(2_147_483_647);
export const smallIntSchema = z.number().int().min(0).max(32_767);
export const kilogramsSchema = z.number().nonnegative();
export const metersSchema = z.number().nonnegative();
export const paceSecondsPerKmSchema = z.number().nonnegative();
export const hrvSchema = z.number().nonnegative();
