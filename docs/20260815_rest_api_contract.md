# WOT REST API contract

**Date:** 2026-08-15  
**Status:** proposed  
**Base URL:** `{API_URL}/api/v1`

This contract covers WOT-owned resources. Authentication remains owned by
better-auth at `{API_URL}/api/auth/*`; its routes and payloads are not
duplicated here.

## Conventions

- Every `/api/v1/*` endpoint requires a valid better-auth session cookie.
  Requests without one return `401`.
- Resources are always scoped to the authenticated user. A resource that does
  not belong to that user returns `404`, never `403`.
- Requests and responses use `application/json`. Session cookies require
  `credentials: "include"` on browser-based clients.
- Timestamps are ISO 8601 UTC strings, for example
  `2026-08-15T10:14:28.708Z`. Dates are `YYYY-MM-DD` and represent the
  user's local calendar day.
- Measurements use the canonical units in the data model: durations and pace
  are seconds, distance is metres, weight is kilograms, HRV is milliseconds,
  and sleep duration is minutes. Decimal values are JSON numbers, not strings.
- A nullable field returned as `null` has no value. To clear an optional
  field in a `PATCH` request, explicitly send `null`; omitting it leaves it
  unchanged.
- Unknown request properties are rejected.

Successful mutation responses return the changed resource. `DELETE` returns
`204 No Content`.

### Error response

All WOT-owned failures use this envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid.",
    "details": [
      {
        "path": "srpe",
        "message": "Must be less than or equal to 10."
      }
    ]
  }
}
```

| Status | Code | Meaning |
|---|---|---|
| `400` | `INVALID_QUERY` | A query parameter is malformed or incompatible. |
| `401` | `UNAUTHENTICATED` | No valid session was supplied. |
| `404` | `NOT_FOUND` | The requested resource does not exist for this user. |
| `409` | `CONFLICT` | The operation conflicts with the current state. |
| `422` | `VALIDATION_ERROR` | A path-valid JSON body violates the resource schema. |
| `500` | `INTERNAL_ERROR` | An unexpected server error occurred. |

## Resource representations

### Session

```json
{
  "id": "8d944b03-9724-4c06-b2c1-61e3e0d5ba42",
  "startedAt": "2026-08-15T06:30:00Z",
  "duration": 3600,
  "srpe": 7.5,
  "type": "strength",
  "title": "Push day",
  "notes": null,
  "createdAt": "2026-08-15T10:14:28.708Z",
  "load": 27000
}
```

`load` is server-derived as `duration * srpe`; clients never submit it.
`components` is included only by the session-detail endpoint.

### Session component

```json
{
  "id": "5f82e40f-7ef9-4ca9-abf3-f4b211e353ab",
  "sessionId": "8d944b03-9724-4c06-b2c1-61e3e0d5ba42",
  "name": "Bench Press",
  "bodyRegions": ["push", "shoulders"],
  "weight": 82.5,
  "reps": 5,
  "rir": 2,
  "distance": null,
  "duration": null,
  "pace": null,
  "rpe": 8,
  "sortOrder": 0,
  "notes": null,
  "createdAt": "2026-08-15T10:14:29.012Z"
}
```

`bodyRegions` is a user-controlled free-text list; WOT does not expose an
exercise or body-region catalogue.

### Daily log

```json
{
  "id": "b84487e0-3e5b-4efa-b4f1-36c7188fc7d0",
  "date": "2026-08-15",
  "sleepDuration": 450,
  "sleepQuality": 8,
  "soreness": 3.5,
  "fatigue": 4,
  "stress": null,
  "motivation": 8,
  "hrv": 62.4,
  "bodyWeight": 78.3,
  "notes": null,
  "createdAt": "2026-08-15T10:14:28.708Z"
}
```

### Pain log

```json
{
  "id": "e1c0a6bd-39a3-4d96-954c-3a3fc02cd402",
  "date": "2026-08-15",
  "bodyRegion": "shoulders",
  "severity": 4.5,
  "notes": "Sore after pressing.",
  "createdAt": "2026-08-15T10:14:28.708Z"
}
```

## Session endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/sessions` | Create a session. |
| `GET` | `/sessions` | List sessions in reverse chronological order. |
| `GET` | `/sessions/{sessionId}` | Get a session and all its components. |
| `PATCH` | `/sessions/{sessionId}` | Update session fields. |
| `DELETE` | `/sessions/{sessionId}` | Delete a session and cascade-delete its components. |
| `POST` | `/sessions/{sessionId}/components` | Add one component. |
| `PATCH` | `/sessions/{sessionId}/components/{componentId}` | Update one component. |
| `DELETE` | `/sessions/{sessionId}/components/{componentId}` | Delete one component. |

`POST /sessions` body:

```json
{
  "startedAt": "2026-08-15T06:30:00Z",
  "duration": 3600,
  "srpe": 7.5,
  "type": "strength",
  "title": "Push day",
  "notes": null
}
```

`PATCH /sessions/{sessionId}` accepts any non-empty subset of the same fields.
`startedAt`, `duration`, `srpe`, and `type` must be present for creation.
`duration` is a non-negative integer; `srpe` is a number from 1 to 10;
`type` is non-empty text.

`POST /sessions/{sessionId}/components` body:

```json
{
  "name": "Bench Press",
  "bodyRegions": ["push", "shoulders"],
  "weight": 82.5,
  "reps": 5,
  "rir": 2,
  "rpe": 8,
  "sortOrder": 0,
  "notes": null
}
```

`name` and `sortOrder` are required. All measurement fields are optional:
`weight`, `reps`, `rir`, `distance`, `duration`, `pace`, and `rpe`.
Non-negative integer limits apply to `reps`, component `duration`, and
`sortOrder`; `rir` is from 0 to 10 and component `rpe` is from 1 to 10.
`PATCH` accepts any non-empty subset except `sessionId`, which is immutable.

`GET /sessions` query parameters:

| Parameter | Type | Default | Meaning |
|---|---|---|---|
| `from` | date | none | Include sessions starting on or after this local date. |
| `to` | date | none | Include sessions starting before the following local date. |
| `type` | string | none | Exact activity type filter. |
| `limit` | integer, 1–100 | `30` | Maximum results. |
| `cursor` | opaque string | none | Continue after a prior page. |

The list response is:

```json
{
  "data": [{ "id": "...", "startedAt": "...", "load": 27000 }],
  "page": {
    "nextCursor": "opaque-cursor-or-null"
  }
}
```

Results are sorted by `startedAt` descending, then `id` descending. Cursors
are opaque and encode that ordering; clients must not construct or interpret
them.

## Daily-log endpoints

There can be only one daily log per user and date. A date-addressed `PUT`
makes offline autosave idempotent.

| Method | Path | Purpose |
|---|---|---|
| `PUT` | `/daily-logs/{date}` | Create or replace the complete daily log for the date. |
| `GET` | `/daily-logs/{date}` | Get the daily log for the date. |
| `GET` | `/daily-logs` | List daily logs in a date range. |
| `DELETE` | `/daily-logs/{date}` | Remove the daily log for the date. |

`PUT` accepts every wellness field in the representation except `id`,
`date`, and `createdAt`. Fields omitted from the full replacement are stored
as `null`. The body may be `{}` to record an otherwise empty daily log.

`GET /daily-logs` requires `from` and `to` dates. It returns
`{ "data": [DailyLog] }`, sorted by date ascending. The range is
`[from, to)`, matching the session list semantics.

## Pain-log endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/pain-logs` | Record pain. |
| `GET` | `/pain-logs` | List pain entries. |
| `GET` | `/pain-logs/{painLogId}` | Get one entry. |
| `PATCH` | `/pain-logs/{painLogId}` | Update one entry. |
| `DELETE` | `/pain-logs/{painLogId}` | Delete one entry. |

Create requests require `date`, non-empty `bodyRegion`, and `severity` from
1 to 10. `notes` is optional. `PATCH` accepts any non-empty subset.

`GET /pain-logs` accepts optional `from`, `to`, `bodyRegion`, `limit`
(1–100, default 30), and `cursor`; it uses the same opaque-pagination
envelope and cursor rules as the session list, ordered by `date` descending
then `id` descending.

## Convenience and insight endpoints

These endpoints are read-only views over stored resources. They do not create
derived database columns.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/components/recents` | Supply the component picker with recent names and values. |
| `GET` | `/insights/load` | Return daily load and aggregate load metrics. |
| `GET` | `/insights/regions` | Return body-region distribution and load. |
| `GET` | `/insights/summary` | Return the dashboard's current warning inputs. |

`GET /components/recents?limit=20` accepts `limit` from 1 to 50 (default
20). It returns the latest component for each distinct, exact `name`, ordered
by last use:

```json
{
  "data": [
    {
      "name": "Bench Press",
      "lastUsedAt": "2026-08-15T06:30:00Z",
      "lastComponent": { "weight": 82.5, "reps": 5, "rir": 2, "rpe": 8 }
    }
  ]
}
```

The three insight endpoints require `from` and `to` dates, use `[from, to)`,
and return days in ascending order. They also accept an optional `timezone`
IANA identifier (for example `Europe/Amsterdam`), defaulting to the user's
configured timezone once preferences exist. Until then, clients must supply
their timezone to obtain local-day buckets.

`GET /insights/load` response:

```json
{
  "data": {
    "daily": [
      { "date": "2026-08-09", "load": 12000, "sessionCount": 1 }
    ],
    "totals": {
      "load": 12000,
      "sessionCount": 1,
      "monotony": null,
      "strain": null,
      "acwr": null
    }
  }
}
```

`monotony`, `strain`, and `acwr` are `null` when the requested history is
insufficient or a denominator is zero. This avoids misleading sentinel
numbers.

`GET /insights/regions` response:

```json
{
  "data": [
    {
      "bodyRegion": "push",
      "componentCount": 12,
      "load": 9800,
      "lastExposedOn": "2026-08-15"
    }
  ]
}
```

A component tagged with multiple regions contributes its full component load
to every tagged region. Component load is `duration * rpe` when both values
exist; otherwise it is `0`. This definition intentionally avoids inventing
load from strength-set data that has no duration.

`GET /insights/summary` returns the current values needed to render the
Insights tab:

```json
{
  "data": {
    "load": {
      "weeklyLoad": 45600,
      "monotony": 1.4,
      "strain": 63840,
      "acwr": 1.1
    },
    "wellness": {
      "latestDate": "2026-08-15",
      "fatigue": 4,
      "soreness": 3.5,
      "stress": null,
      "motivation": 8
    },
    "pain": [
      { "bodyRegion": "shoulders", "latestSeverity": 4.5, "latestDate": "2026-08-15" }
    ]
  }
}
```

No endpoint declares a user medically unfit or blocks workout logging. The
client may use the returned data to present informational, stacked signals
only.

## Health and authentication

`GET /health` remains unauthenticated and returns:

```json
{ "ok": true }
```

Authentication is exposed at `/api/auth/*` by better-auth. The mobile client
uses its better-auth client for sign-up, sign-in, sign-out, and session
retrieval, then calls this contract with the resulting session cookie.
