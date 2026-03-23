# WOT data model

## Overview

The MVP data model is intentionally minimal. Five tables are enough to support workout logging, wellness tracking, load analytics, monotony, strain, regional load, and pain tracking.

```
users
sessions          → FK users
session_components → FK sessions
daily_logs        → FK users
pain_logs         → FK users
```

No exercise library. The app stays flexible by using free-text component names and surfacing recents from query history rather than a managed catalogue.

---

## Tables

### users

Owned and managed by `better-auth`. Your app tables reference `user.id` as a foreign key but do not define the `users` table itself.

See `20260321_auth_and_database_setup.md` for the full auth setup.

---

### sessions

The core entity. Each row is one training session.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `user_id` | `uuid` | FK → `users.id` |
| `started_at` | `timestamptz` | when the session began |
| `duration` | `integer` | total duration in seconds |
| `srpe` | `numeric(3,1)` | session RPE, 1–10, decimals allowed |
| `type` | `text` | free text: "strength", "run", "yoga", etc. |
| `title` | `text` | optional label, e.g. "Push day" |
| `notes` | `text` | optional free text |
| `created_at` | `timestamptz` | defaults to now |

**Derived from this table:**

- `session load = duration × srpe`
- `daily load = sum of session loads on a given day`
- `weekly load = sum of daily loads over 7 days`
- `monotony = mean(daily loads) / stddev(daily loads)` over a 7-day window
- `strain = weekly load × monotony`

---

### session_components

Child rows of a session. Each row is one component of a workout — a single set, interval, or exercise block.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `session_id` | `uuid` | FK → `sessions.id` |
| `name` | `text` | free text: "Bench Press", "Sprint 1000m" |
| `body_regions` | `text[]` | e.g. `["push", "shoulders"]`, nullable |
| `weight` | `numeric(6,2)` | kg, nullable |
| `reps` | `smallint` | nullable |
| `rir` | `numeric(3,1)` | reps in reserve, 0–10, nullable |
| `distance` | `numeric(8,2)` | meters, nullable |
| `duration` | `integer` | seconds, nullable (e.g. interval duration) |
| `pace` | `numeric(6,2)` | seconds per km, nullable |
| `rpe` | `numeric(3,1)` | component RPE, 1–10, decimals allowed, nullable |
| `sort_order` | `smallint` | preserves ordering within a session |
| `notes` | `text` | optional free text |
| `created_at` | `timestamptz` | defaults to now |

**Derived from this table:**

- per-component RPE trends over time (matched on `name`)
- volume trends: `weight × reps` per component name per week
- effort-adjusted volume: `weight × reps × effort_factor(rir)` where RIR 0–1 → 1.00, RIR 2 → 0.95, RIR 3 → 0.90, RIR 4+ → 0.80
- regional weekly load, regional monotony, regional strain (from `body_regions`)
- exposure gaps: days since any component tagged with a given region
- push:pull ratio from `body_regions` tags
- "recents" for the UI: most recently used component names for a user

---

### daily_logs

One optional row per user per day. Captures wellness and recovery context. Intentionally decoupled from sessions — sleep and soreness belong to a day, not a workout.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `user_id` | `uuid` | FK → `users.id` |
| `date` | `date` | one row per user per day (unique constraint) |
| `sleep_duration` | `smallint` | minutes, nullable |
| `sleep_quality` | `numeric(3,1)` | 1–10, decimals allowed, nullable |
| `soreness` | `numeric(3,1)` | 1–10, decimals allowed, nullable |
| `fatigue` | `numeric(3,1)` | 1–10, decimals allowed, nullable |
| `stress` | `numeric(3,1)` | 1–10, decimals allowed, nullable |
| `motivation` | `numeric(3,1)` | 1–10, decimals allowed, nullable |
| `hrv` | `numeric(5,2)` | heart rate variability in ms, nullable |
| `body_weight` | `numeric(5,2)` | kg, nullable |
| `notes` | `text` | optional free text |
| `created_at` | `timestamptz` | defaults to now |

**What this unlocks:**

Correlating load metrics with wellness over time. For example: monotony is climbing while fatigue has been above 7 for five consecutive days. This is the stacked-signal pattern described in `20260316_brainstorm_sesh.md` that makes deload and variety suggestions meaningful.

`body_weight` enables corrected load estimates for bodyweight exercises (push-ups, pull-ups, dips, lunges). `hrv` is optional — users with a wearable (Garmin, Whoop, Oura, Apple Watch) can log their morning HRV for a stronger recovery signal than subjective measures alone.

---

### pain_logs

One row per reported pain instance. Decoupled from sessions — pain can exist on rest days and may outlast the session that caused it.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `user_id` | `uuid` | FK → `users.id` |
| `date` | `date` | when the pain was noticed |
| `body_region` | `text` | matches region tags used in `session_components` |
| `severity` | `numeric(3,1)` | 1–10, decimals allowed |
| `notes` | `text` | optional free text |
| `created_at` | `timestamptz` | defaults to now |

**Derived from this table:**

- pain trend per region over time
- pain-load correlation: does regional load spike precede pain in that region?
- stacked signal: high regional strain + rising pain → deload or pivot suggestion

---

## Derived metrics summary

All of these are computed at query time or in the domain layer — no stored derived columns needed for MVP.

| Metric | Formula | Inputs |
|---|---|---|
| Session load | `duration × srpe` | `sessions` |
| Daily load | sum of session loads on a day | `sessions` |
| Weekly load | sum of daily loads over 7 days | `sessions` |
| Monotony | `mean(daily loads) / stddev(daily loads)` | `sessions` |
| Strain | `weekly load × monotony` | `sessions` |
| ACWR | `7-day load / 28-day rolling avg load` | `sessions` |
| Consecutive high-load days | streak of days above personal avg load | `sessions` |
| Component volume | `weight × reps` | `session_components` |
| Effort-adjusted volume | `weight × reps × rir_factor` | `session_components` |
| Component RPE trend | RPE over time for a given `name` | `session_components` |
| Progressive overload | weight/reps trend over time per `name` | `session_components` |
| Regional weekly load | sum of component loads per `body_region` | `session_components` |
| Regional monotony | `mean / stddev` of daily regional load | `session_components` |
| Regional strain | `regional weekly load × regional monotony` | `session_components` |
| Exposure gap | days since last component tagged with a region | `session_components` |
| Push:pull ratio | push load / pull load over a window | `session_components` |
| Readiness composite | weighted avg of wellness fields | `daily_logs` |
| Load:wellness correlation | load spike vs next-day fatigue/soreness | `sessions` + `daily_logs` |
| Pain trend | severity over time per `body_region` | `pain_logs` |
| Pain-load correlation | regional load vs pain in that region | `session_components` + `pain_logs` |

---

## Design decisions

**No exercise library.** Component names are free text. Recents and reuse are handled at the application layer by querying the most recently used `name` values for a user. This keeps the model flexible and avoids the friction of maintaining a managed catalogue.

**`body_regions` is a free-text array on `session_components`.** No region lookup table. The UI offers a fixed list of suggestions (push, pull, legs, core, shoulders, hinge, carry, etc.) but the DB stores plain text. This keeps the regional model flexible without a join table.

**`pain_logs` is decoupled from sessions.** Pain can exist on rest days, can persist after the session that caused it, and should be tracked independently from workout data.

**`daily_logs` is decoupled from sessions.** A user can log a rest day with wellness data and no session. A user can log a session with no wellness data. These are independent concerns.

**All wellness scales use `numeric(3,1)`** to allow decimal values (e.g. 7.5) while staying within the 1–10 range. Validation is enforced at the application layer via Zod schemas.

**`sleep_duration` is stored in minutes** as a plain `smallint`. This avoids fractional values and is easy to display in any format.

**`hrv` is optional.** Users with a wearable that exposes HRV (Garmin, Whoop, Oura, Apple Watch) can log their morning value. Users without one simply leave it null. A future wearable integration would populate it automatically.
