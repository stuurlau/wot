# Shared Types Module Plan

**Date:** 2026-04-14  
**Goal:** create one shared source of truth for app-level types used by the mobile client and the future API.
**Status:** initial package scaffolded at `shared/types/` and imported by the mobile client as `@wot/types`.

---

## Proposed shape

- Create a workspace package exposed as `@wot/types`.
- Keep it focused on **domain contracts**, not database or ORM internals.
- Use **Zod schemas as the source of truth** and export inferred TypeScript types from them.

This keeps validation consistent with the mobile client and avoids coupling the shared module to Drizzle or PostgreSQL-specific representations.

---

## Initial scope

Start with the MVP entities already defined in `docs/20260323_data_model.md`:

- `Session`
- `SessionComponent`
- `DailyLog`
- `PainLog`

For each entity, define:

- base schema/type
- create input schema/type
- update input schema/type

Also add a small shared primitives layer for:

- `id` fields (`string`/UUID at the app boundary)
- ISO date/time strings for transport shapes
- numeric validation rules for 1–10 decimal scales

---

## Important rules from the data model

- `user` stays owned by `better-auth`; app types only reference `userId`.
- `body_regions` remains a free-text string array, even if the UI offers suggestions.
- `daily_logs` and `pain_logs` stay independent from sessions.
- Derived metrics like load, monotony, strain, and ACWR are **not stored** in base entity types.

---

## Implementation steps

1. Scaffold `@wot/types` and wire the repo so the mobile client can import from it.
2. Move current local domain types out of `mobile-client/types/` into Zod-backed shared schemas.
3. Export stable DTO-style types first; keep Drizzle schema inference in a separate backend package.
4. Migrate mobile imports from `@/types` to `@wot/types` with no screen-level logic changes.

---

## Notes

- Keep the first version minimal. Do not model analytics result shapes until the API endpoints exist.
- If shared constants are added for convenience, keep them optional and non-authoritative. For example, body-region suggestions can be exported for UI reuse, but the stored type should still accept any string.
