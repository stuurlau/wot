# WOT — Entity Relationship Diagram

> Source of truth: `api/src/db/schema/`. Regenerate the SVG with
> `npm run db:erd` from `api/` (uses `drizzle-erd`).

```mermaid
erDiagram
    user ||--o{ session : "owns (better-auth)"
    user ||--o{ account : "has (better-auth)"
    user ||--o{ verification : "has (better-auth)"
    user ||--o{ training_sessions : "logs"
    user ||--o{ daily_logs : "logs"
    user ||--o{ pain_logs : "logs"
    training_sessions ||--o{ training_session_exercises : "contains"
    training_session_exercises ||--o{ training_session_exercise_sets : "contains"

    user {
        text id PK
        text name
        text email
        boolean emailVerified
        text image
        timestamp createdAt
        timestamp updatedAt
    }

    session {
        text id PK
        text userId FK
        text token
        timestamp expiresAt
        text ipAddress
        text userAgent
    }

    account {
        text id PK
        text accountId
        text providerId
        text userId FK
        text accessToken
        text refreshToken
        timestamp accessTokenExpiresAt
        timestamp refreshTokenExpiresAt
        text scope
        text password
    }

    verification {
        text id PK
        text identifier
        text value
        timestamp expiresAt
    }

    training_sessions {
        uuid id PK
        text user_id FK
        timestamptz started_at
        integer duration "seconds"
        numeric srpe "1–10, (3,1)"
        text type "strength, run, yoga…"
        text title
        text notes
        timestamptz created_at
    }

    training_session_exercises {
        uuid id PK
        uuid training_session_id FK
        text name "free text: Bench Press…"
        text_array body_regions "push, legs…"
        smallint sort_order
        text notes
        timestamptz created_at
    }

    training_session_exercise_sets {
        uuid id PK
        uuid training_session_exercise_id FK
        smallint sort_order
        numeric weight "kg (6,2)"
        smallint reps
        numeric rir "0–10 (3,1)"
        numeric distance "meters (8,2)"
        integer duration "seconds"
        numeric pace "sec/km (6,2)"
        numeric rpe "1–10 (3,1)"
        text notes
        timestamptz created_at
    }

    daily_logs {
        uuid id PK
        text user_id FK
        date date "unique per user"
        smallint sleep_duration "minutes"
        numeric sleep_quality "1–10 (3,1)"
        numeric soreness "1–10 (3,1)"
        numeric fatigue "1–10 (3,1)"
        numeric stress "1–10 (3,1)"
        numeric motivation "1–10 (3,1)"
        numeric hrv "ms (5,2)"
        numeric body_weight "kg (5,2)"
        text notes
        timestamptz created_at
    }

    pain_logs {
        uuid id PK
        text user_id FK
        date date
        text body_region
        numeric severity "1–10 (3,1)"
        text notes
        timestamptz created_at
    }
```

## Notes

- `user`, `session`, `account`, `verification` are owned by `better-auth` —
  app tables reference `user.id` (`text`) but don't define it.
- Core load formula: `session load = duration × srpe`. All higher-order
  metrics (weekly load, monotony, strain, ACWR) are derived at query time.
- `daily_logs` has a unique `(user_id, date)` index.
- `pain_logs` and `daily_logs` are intentionally decoupled from `training_sessions`.

## Generated SVG

![WOT ERD](./erd.svg)
