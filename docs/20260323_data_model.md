# WOT data model

## Overview

The MVP data model is intentionally minimal. Six tables are enough to support workout logging, wellness tracking, load analytics, monotony, strain, regional load, and pain tracking.

```
users
training_sessions                 → FK users
training_session_exercises        → FK training_sessions
training_session_exercise_sets    → FK training_session_exercises
daily_logs                        → FK users
pain_logs                         → FK users
```

No exercise library. The app stays flexible by using free-text exercise names and surfacing recents from query history rather than a managed catalogue.

---

## Tables

### users

Owned and managed by `better-auth`. Your app tables reference `user.id` as a foreign key but do not define the `users` table itself.

See `20260321_auth_and_database_setup.md` for the full auth setup.

---

### training_sessions

The core entity. Each row is one training session.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `user_id` | `text` | FK → `users.id` |
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

### training_session_exercises

Child rows of a training session. Each row represents an exercise performed during the session.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `training_session_id` | `uuid` | FK → `training_sessions.id` (CASCADE) |
| `name` | `text` | free text: "Bench Press", "Back Squat" |
| `body_regions` | `text[]` | e.g. `["push", "shoulders"]`, nullable |
| `sort_order` | `smallint` | preserves ordering within a session |
| `notes` | `text` | optional free text |
| `created_at` | `timestamptz` | defaults to now |

---

### training_session_exercise_sets

Child rows of a training session exercise. Each row represents a single set, interval, or round with flexible performance metrics.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `training_session_exercise_id` | `uuid` | FK → `training_session_exercises.id` (CASCADE) |
| `sort_order` | `smallint` | preserves ordering within an exercise |
| `weight` | `numeric(6,2)` | kg, nullable |
| `reps` | `smallint` | nullable |
| `rir` | `numeric(3,1)` | reps in reserve, 0–10, nullable |
| `distance` | `numeric(8,2)` | meters, nullable |
| `duration` | `integer` | seconds, nullable |
| `pace` | `numeric(6,2)` | seconds per km, nullable |
| `rpe` | `numeric(3,1)` | set RPE, 1–10, decimals allowed, nullable |
| `notes` | `text` | optional free text |
| `created_at` | `timestamptz` | defaults to now |

**Derived from exercises and sets:**

- per-exercise RPE trends over time (matched on `name`)
- volume trends: `weight × reps` per exercise name per week
- effort-adjusted volume: `weight × reps × effort_factor(rir)` where RIR 0–1 → 1.00, RIR 2 → 0.95, RIR 3 → 0.90, RIR 4+ → 0.80
- regional weekly load, regional monotony, regional strain (from `body_regions`)
- exposure gaps: days since any exercise tagged with a given region
- push:pull ratio from `body_regions` tags
- "recents" for the UI: most recently used exercise names and their last set values for a user

---

### daily_logs

One optional row per user per day. Captures wellness and recovery context. Intentionally decoupled from training sessions — sleep and soreness belong to a day, not a workout.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `user_id` | `text` | FK → `users.id` |
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

One row per reported pain instance. Decoupled from training sessions — pain can exist on rest days and may outlast the session that caused it.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `user_id` | `text` | FK → `users.id` |
| `date` | `date` | when the pain was noticed |
| `body_region` | `text` | matches region tags used in `training_session_exercises` |
| `severity` | `numeric(3,1)` | 1–10, decimals allowed |
| `notes` | `text` | optional free text |
| `created_at` | `timestamptz` | defaults to now |

**Derived from this table:**

- pain trend per region over time
- pain-load correlation: does regional load spike precede pain in that region?
- stacked signal: high regional strain + rising pain → deload or pivot suggestion

---

## Derived metrics summary

All of these are computed at query time or in the frontend domain layer — no stored derived columns or server-side computation overhead.

| Metric | Formula | Inputs |
|---|---|---|
| Session load | `duration × srpe` | `training_sessions` |
| Daily load | sum of session loads on a day | `training_sessions` |
| Weekly load | sum of daily loads over 7 days | `training_sessions` |
| Monotony | `mean(daily loads) / stddev(daily loads)` | `training_sessions` |
| Strain | `weekly load × monotony` | `training_sessions` |
| ACWR | `7-day load / 28-day rolling avg load` | `training_sessions` |
| Consecutive high-load days | streak of days above personal avg load | `training_sessions` |
| Set volume | `weight × reps` | `training_session_exercise_sets` |
| Effort-adjusted volume | `weight × reps × rir_factor` | `training_session_exercise_sets` |
| Exercise / Set RPE trend | RPE over time for a given `name` | `training_session_exercises` + `sets` |
| Progressive overload | weight/reps trend over time per `name` | `training_session_exercises` + `sets` |
| Regional weekly load | sum of exercise loads per `body_region` | `training_session_exercises` |
| Regional monotony | `mean / stddev` of daily regional load | `training_session_exercises` |
| Regional strain | `regional weekly load × regional monotony` | `training_session_exercises` |
| Exposure gap | days since last exercise tagged with a region | `training_session_exercises` |
| Push:pull ratio | push load / pull load over a window | `training_session_exercises` |
| Readiness composite | weighted avg of wellness fields | `daily_logs` |
| Load:wellness correlation | load spike vs next-day fatigue/soreness | `training_sessions` + `daily_logs` |
| Pain trend | severity over time per `body_region` | `pain_logs` |
| Pain-load correlation | regional load vs pain in that region | `training_session_exercises` + `pain_logs` |

---

## Design decisions

**No exercise library.** Exercise names are free text. Recents and reuse are handled at the application layer by querying the most recently used `name` values for a user. This keeps the model flexible and avoids the friction of maintaining a managed catalogue.

**Hierarchical exercises and sets.** `training_sessions -> training_session_exercises -> training_session_exercise_sets`. An exercise holds grouping metadata (`name`, `body_regions`, `notes`), while sets hold individual performance and measurement metrics (`weight`, `reps`, `rir`, `distance`, `duration`, `pace`, `rpe`).

**`body_regions` is a free-text array on `training_session_exercises`.** No region lookup table. The UI offers a fixed list of suggestions (push, pull, legs, core, shoulders, hinge, carry, etc.) but the DB stores plain text. This keeps the regional model flexible without a join table.

**`pain_logs` is decoupled from training sessions.** Pain can exist on rest days, can persist after the session that caused it, and should be tracked independently from workout data.

**`daily_logs` is decoupled from training sessions.** A user can log a rest day with wellness data and no session. A user can log a session with no wellness data. These are independent concerns.

**Frontend metric derivation.** Derived metrics (monotony, strain, ACWR, load summaries) are derived client-side to eliminate backend compute load and avoid redundant network round-trips.

**All wellness scales use `numeric(3,1)`** to allow decimal values (e.g. 7.5) while staying within the 1–10 range. Validation is enforced at the application layer via Zod schemas.

**`sleep_duration` is stored in minutes** as a plain `smallint`. This avoids fractional values and is easy to display in any format.

**`hrv` is optional.** Users with a wearable that exposes HRV (Garmin, Whoop, Oura, Apple Watch) can log their morning value. Users without one simply leave it null. A future wearable integration would populate it automatically.
