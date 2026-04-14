import { z } from 'zod';

export const identifierSchema = z.string().min(1);
export const isoDateSchema = z.iso.date();
export const isoDateTimeSchema = z.iso.datetime({ offset: true });
export const optionalTextSchema = z.string().optional();
export const decimalRatingSchema = z.number().min(1).max(10);
export const rirSchema = z.number().min(0).max(10);
export const secondsSchema = z.number().int().nonnegative();
export const smallIntSchema = z.number().int().nonnegative();
export const kilogramsSchema = z.number().nonnegative();
export const metersSchema = z.number().nonnegative();
export const paceSecondsPerKmSchema = z.number().nonnegative();
export const hrvSchema = z.number().nonnegative();
