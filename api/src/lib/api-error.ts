import type { ZodIssue } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_QUERY"
  | "UNAUTHENTICATED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export interface ErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
  }
}

export function validationDetails(issues: ZodIssue[]): ErrorDetail[] {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export function validationError(issues: ZodIssue[], isQuery = false) {
  return new ApiError(
    isQuery ? 400 : 422,
    isQuery ? "INVALID_QUERY" : "VALIDATION_ERROR",
    isQuery ? "Query parameters are invalid." : "Request body is invalid.",
    validationDetails(issues),
  );
}

export const notFoundError = () =>
  new ApiError(404, "NOT_FOUND", "The requested resource was not found.");

export const unauthenticatedError = () =>
  new ApiError(401, "UNAUTHENTICATED", "A valid session is required.");
