# WOT technical brainstorm

## Does a mobile app still have a frontend and backend?

Yes.

The same separation still exists:

- **frontend / client** -> the mobile app the user interacts with
- **backend / server** -> APIs, auth, sync, notifications, analytics, storage, sharing

The main difference versus web is just the client platform:

- web app -> browser frontend
- mobile app -> native or cross-platform mobile frontend

So your mental model from web dev absolutely transfers.

## A useful way to think about WOT

For this app, I would think in **4 layers**:

### 1. Mobile client

Responsible for:

- logging workouts
- viewing trends and charts
- offline usage
- local notifications / reminders
- capturing pain, readiness, sleep, soreness, etc.

### 2. Shared domain logic

Responsible for:

- load calculations
- monotony / strain calculations
- regional strength-load calculations
- validation schemas
- reusable types

This is where full TypeScript becomes especially nice.

### 3. Backend API

Responsible for:

- user accounts
- sync across devices
- cloud backup
- long-term history
- server-side jobs
- push notification orchestration

### 4. Database

Responsible for:

- workout storage
- exercise library
- user settings
- derived metrics snapshots
- symptom and recovery logs

## My recommendation: full TypeScript stack

Given your background, I think a TS stack is a very strong fit.

## Suggested stack

### Mobile app

- **React Native**
- **Expo**
- **TypeScript**

Why:

- easiest path from React/web thinking into mobile
- strong developer experience
- good ecosystem
- simpler device access than rolling native setup from scratch

### Navigation

- **Expo Router**

Why:

- feels familiar if you come from React/Next-style routing
- good DX

### Local state

- **Zustand** for app/UI state

Why:

- simple
- low boilerplate
- great for filters, active workout state, temporary selections

### Server/cache state

- **TanStack Query**

Why:

- excellent for API data, caching, retries, sync flows
- works well on mobile too

### Validation and shared types

- **Zod**

Why:

- validate API payloads
- share schemas between client and server
- avoid drift between frontend forms and backend expectations

### Backend

I would choose one of these:

- **Hono** + TypeScript
- **Fastify** + TypeScript
- **NestJS** + TypeScript

My recommendation for you:

- **Fastify** if you want something pragmatic and light
- **NestJS** if you want a more opinionated, enterprise-ish structure

For this project, I would personally lean **Fastify**.

### Database

- **PostgreSQL**

Why:

- reliable
- flexible enough for analytics
- strong ecosystem

### ORM / query layer

- **Drizzle**

Why:

- TypeScript-friendly
- SQL-like and explicit
- nice fit if you care about schema clarity

### Auth

Good options:

- build your own auth in the backend
- use **Supabase Auth**
- use **Clerk**

My recommendation:

- for an MVP, use **Supabase Auth** or **Clerk**
- if you later want full control, move auth fully in-house

### Charts

Potential options:

- Victory Native
- React Native SVG based chart libs
- custom chart layer later if needed

You will likely want:

- weekly load charts
- regional load charts
- monotony / strain trend lines
- pain overlays

## Important architectural idea: local-first is probably the right fit

For a workout app, I would strongly consider a **local-first** architecture.

That means:

- workouts are written to local storage first
- the app works offline
- sync to backend happens afterward

Why this is a good fit:

- workouts are often logged in gyms, outdoors, or mid-session
- you do not want logging to depend on network quality
- local responsiveness matters

## Suggested storage model

### On-device database

Use:

- **SQLite on device**

In Expo/React Native this is a very natural fit.

Store locally:

- workouts
- sets
- exercises
- body-region weights
- pain logs
- readiness check-ins
- pending sync actions

### Cloud database

Use:

- **PostgreSQL**

Store in cloud:

- user account
- synced workout history
- exercise templates
- cross-device data
- backups

## Recommended architecture shape

I would structure the project something like this:

```text
wot/
  apps/
    mobile/
    api/
  packages/
    domain/
    ui/
    schemas/
    config/
```

### `apps/mobile`

Contains:

- React Native / Expo app
- screens
- forms
- charts
- local persistence
- sync client

### `apps/api`

Contains:

- API routes
- auth integration
- database access
- notification jobs

### `packages/domain`

This is a very important package.

It should contain:

- `calculateSessionLoad`
- `calculateWeeklyLoad`
- `calculateMonotony`
- `calculateStrain`
- `calculateRegionalStrengthLoad`
- `suggestDeloadFlags`

This keeps your important logic portable and testable.

### `packages/schemas`

Contains shared Zod schemas like:

- `WorkoutSchema`
- `SetEntrySchema`
- `ReadinessCheckinSchema`
- `PainLogSchema`
- `ExerciseDefinitionSchema`

## Domain-driven design will help a lot here

Even if you do not go full "DDD", this app has a clean domain.

Useful core entities:

- **User**
- **Workout**
- **Exercise**
- **SetEntry**
- **BodyRegion**
- **PainLog**
- **RecoveryCheckin**
- **DerivedMetric**
- **ProgramTemplate**

## What belongs on frontend vs backend?

### Frontend responsibilities

- active workout flow
- local form validation
- local charts
- offline storage
- immediate metric preview

Example:

- user logs squat 5 x 5 @ 100 kg
- app immediately calculates tonnage and regional distribution locally

### Backend responsibilities

- identity
- sync resolution
- long-term reporting
- notifications
- sharing data across devices
- future coach / social features

Example:

- backend stores monthly trend snapshots
- backend sends reminder notifications
- backend powers cross-device sync

## Do you need a backend immediately?

Not necessarily.

For a first version, you could build:

- mobile app
- local SQLite database
- no backend yet

This would already let you test:

- workout logging UX
- regional load calculations
- monotony / strain dashboards
- pain tracking

Then add backend when you need:

- account login
- device sync
- backups
- sharing

This is probably the safest MVP path.

## If you do want backend from the start

Then I would do:

- **Expo / React Native**
- **Fastify**
- **PostgreSQL**
- **Drizzle**
- **Zod**
- **TanStack Query**

That gives you a consistent TS story end to end.

## API style

Two good options:

### Option A. REST

Pros:

- familiar
- easy to debug
- great for mobile

### Option B. tRPC

Pros:

- very TypeScript-native
- strong end-to-end type safety

My take:

- if you want maximum familiarity and long-term flexibility, choose **REST + Zod**
- if you want a very TS-heavy internal product and enjoy the developer ergonomics, **tRPC** is attractive

For mobile + possible future web dashboard, I would still slightly lean:

- **REST + shared Zod schemas**

## Sync concerns to think about early

If the app is local-first, plan for:

- temporary local IDs
- server IDs after sync
- updated timestamps
- conflict resolution rules
- pending write queue

Simple rule to start with:

- last write wins for editable notes
- append-only model for workout sets when possible

## What I would build first

### Phase 1

- exercise library
- workout logging
- set logging
- pain logging
- readiness check-in
- local calculations
- local charts

### Phase 2

- user auth
- sync backend
- cloud backup
- push reminders

### Phase 3

- program templates
- deload suggestions
- regional variety suggestions
- coach / review tools

## My concrete recommendation for WOT

If I were starting this with your background, I would choose:

- **Expo + React Native + TypeScript**
- **Zustand**
- **TanStack Query**
- **Zod**
- **SQLite locally**
- **Fastify API**
- **PostgreSQL**
- **Drizzle**

And I would design the app as:

- **mobile-first**
- **local-first**
- **sync-capable**
- **shared-domain-logic in TypeScript**

## Why this is a strong fit for your app

Because WOT is not just CRUD.

It has real domain logic:

- training load calculations
- regional exposure calculations
- pain/load interpretation
- deload heuristics

That logic should live in shared TS modules, not scattered across screens or API routes.

## Final opinion

Yes, your web-dev intuition is correct.

A mobile app can absolutely be built with the same client/server thinking as a web app, and for your project a full TS stack is a very sensible choice.

If anything, I would just tweak the mindset from:

- "web app with a phone UI"

to:

- "offline-capable app with shared domain logic and optional cloud sync"

That framing will probably lead to better architecture decisions for this product.
