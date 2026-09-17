import { ApiError } from "./api-error.js";

interface Cursor {
  kind: string;
  value: string;
  id: string;
}

export function encodeCursor(kind: string, value: string | Date, id: string): string {
  const cursor: Cursor = {
    kind,
    value: value instanceof Date ? value.toISOString() : value,
    id,
  };
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor(cursor: string, expectedKind: string): Cursor {
  try {
    const decoded: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (
      !isCursor(decoded) ||
      decoded.kind !== expectedKind ||
      decoded.value.length === 0 ||
      decoded.id.length === 0
    ) {
      throw new Error("Invalid cursor.");
    }
    return decoded;
  } catch {
    throw new ApiError(400, "INVALID_QUERY", "Query parameters are invalid.", [
      { path: "cursor", message: "Cursor is invalid." },
    ]);
  }
}

function isCursor(value: unknown): value is Cursor {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    "value" in value &&
    "id" in value &&
    typeof value.kind === "string" &&
    typeof value.value === "string" &&
    typeof value.id === "string"
  );
}
