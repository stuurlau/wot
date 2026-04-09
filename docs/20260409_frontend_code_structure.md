# Frontend Code Structure — Mobile Client

**Date:** 2026-04-09  
**Scope:** `mobile-client/` only. Type definitions shared across layers live in a future `shared/types/` module (out of scope here).

---

## Design System — "The Kinetic Manuscript"

The full visual spec lives in `docs/ui-designs/`. The north star is a **premium analog athlete's journal meets lab report**: intentional asymmetry, generous whitespace, high-contrast type, data that breathes. Read that doc before building any new screen or component.

### Color tokens (`constants/theme.ts`)

| Token | Value | Semantic meaning |
|---|---|---|
| `primary` | `#154212` / `#2D5A27` | Action, growth — CTA buttons, active states |
| `secondary` | `#395F94` | Analysis, data — charts, history, trends |
| `tertiary` | `#6E1A0F` / `#C05746` | Intensity — PRs, high-effort indicators |
| `warning` | `#E6AF2E` | Injury risk, load alerts — use sparingly |
| `surface` | `#faf9f8` | Base layer — the "desk" |
| `surface-container-low` | `#f4f3f2` | Mid layer — section groupings |
| `surface-container-highest` | `#e3e2e1` | Top layer — active/interactive elements |
| `on-surface` | `#1A1A1A` | All body text (warm charcoal, never pure black) |

### Typography
- **Headlines & stats:** Space Grotesk — tracking `-2%` to `-4%` for editorial feel
- **Body & labels:** Inter
- **Numbers (weights, reps, timers):** Inter with tabular/monospace settings — columns must align vertically

### Non-negotiable rules
- **No card borders.** Boundaries via background color shifts or whitespace only.
- **No pure black text.** Always `#1A1A1A`.
- **No italics.**
- **Tabular numbers** for all numeric data.
- **24–32px side margins** — whitespace is a feature, not waste.
- **Color carries meaning** — don't use primary/secondary/tertiary decoratively.
- **No dark mode for MVP.**

---

## Styling

### NativeWind
Tailwind CSS utility classes for React Native. All layout and spacing uses Tailwind class names via the `className` prop.

### react-native-reusables
shadcn/ui-inspired component primitives for React Native. Components are copy-pasted into `components/ui/` and tweaked to match WOT's branding. These are the base building blocks; never use them directly in screens — wrap them in domain-specific components first.

---

## Directory Structure

```
mobile-client/
├── app/                        # Expo Router — file-based routing
│   ├── _layout.tsx             # Root layout (providers, global setup)
│   ├── (tabs)/                 # Tab navigator group
│   │   ├── _layout.tsx         # Tab bar definition
│   │   ├── index.tsx           # Home tab (default)
│   │   ├── session.tsx         # Session tab — active workout logging
│   │   ├── history.tsx         # History tab
│   │   └── insights.tsx        # Insights tab
│   │                           # Plan tab: out of scope for MVP
│   └── session/
│       └── [id].tsx            # Session detail screen (/session/:id)
│
├── components/
│   ├── ui/                     # Base primitives (react-native-reusables + custom atoms)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── [domain]/               # Domain-specific, reusable components
│       ├── session/
│       │   ├── session-card.tsx
│       │   ├── session-header.tsx
│       │   └── ...
│       ├── workout/
│       │   ├── set-row.tsx
│       │   ├── component-block.tsx
│       │   └── ...
│       └── insights/
│           ├── load-trend-chart.tsx
│           └── body-region-heatmap.tsx
│
├── hooks/                      # Data manipulation and local state logic
│   ├── use-session-form.ts     # Form state + mutation for active session
│   ├── use-load-metrics.ts     # Derived load calculations
│   └── ...
│
├── contexts/                   # Global state that spans multiple screens
│   ├── active-session-context.tsx  # Reducer-based in-progress workout state
│   └── ...
│
├── lib/
│   ├── api/                    # API client layer
│   │   ├── client.ts           # Base Axios/fetch client (base URL, auth headers, interceptors)
│   │   ├── sessions-api.ts     # CRUD for sessions
│   │   ├── components-api.ts   # CRUD for session components / sets
│   │   ├── daily-logs-api.ts   # CRUD for daily wellness logs
│   │   ├── pain-logs-api.ts    # CRUD for pain logs
│   │   └── index.ts            # Re-exports all clients
│   └── utils.ts                # Pure utility functions (formatters, date helpers, etc.)
│
├── constants/
│   └── theme.ts                # Kinetic Manuscript tokens: colors, surfaces, font scale
│
└── types/                      # Local-only types (not yet in shared package)
    └── ...                     # Mirrors shared package shape until it exists
```

---

## Routing (Expo Router)

Files in `app/` map directly to routes. The tab bar contains four screens for MVP (Plan is deferred). Session detail is a dedicated route, not a modal.

```
/               → app/(tabs)/index.tsx        (Home)
/session        → app/(tabs)/session.tsx      (Active session logging)
/history        → app/(tabs)/history.tsx      (History)
/insights       → app/(tabs)/insights.tsx     (Insights)
/session/:id    → app/session/[id].tsx        (Session detail)
```

---

## Component Rules

1. **One responsibility per component.** If a component does more than one thing, split it.
2. **Screens are thin orchestrators.** They compose domain components and wire data — no layout or business logic inline.
3. **`components/ui/`** — stateless, fully styled primitives. No data fetching, no business logic.
4. **`components/[domain]/`** — composed from `ui/` primitives. May receive data as props. No direct API calls.
5. **All data arrives via props or hooks** — components never call API clients directly.

---

## Data Fetching — TanStack Query

All server state is managed with TanStack Query (`@tanstack/react-query`).

```ts
// hooks/use-sessions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api';

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsApi.list,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
}
```

- Query keys are co-located with their hooks, not scattered across screens.
- Mutations invalidate the relevant queries on success.
- No `useEffect` + `useState` for remote data — always TanStack Query.

---

## API Client Layer

### Base client (`lib/api/client.ts`)
Owns: base URL, auth token injection, error normalisation, refresh logic.

```ts
// lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

apiClient.interceptors.request.use((config) => {
  // attach auth token
  return config;
});
```

### Domain clients (`lib/api/sessions-api.ts`, etc.)
Each file exports typed functions for one resource. They import `apiClient` and nothing else from the API layer.

```ts
// lib/api/sessions-api.ts
import { apiClient } from './client';
import type { Session, CreateSessionInput } from '@/types';

export const sessionsApi = {
  list: () => apiClient.get<Session[]>('/sessions').then(r => r.data),
  get: (id: string) => apiClient.get<Session>(`/sessions/${id}`).then(r => r.data),
  create: (body: CreateSessionInput) => apiClient.post<Session>('/sessions', body).then(r => r.data),
  update: (id: string, body: Partial<Session>) => apiClient.patch<Session>(`/sessions/${id}`, body).then(r => r.data),
  remove: (id: string) => apiClient.delete(`/sessions/${id}`),
};
```

---

## Data Manipulation — Hooks and Contexts

| Mechanism | When to use |
|---|---|
| **Custom hook** | Local or per-screen state (form state, derived values, single-resource mutations) |
| **Context + Reducer** | Cross-screen state that must survive navigation (e.g. in-progress workout) |
| **TanStack Query cache** | All server-sourced state — single source of truth for remote data |

### Active session (context + reducer example)
The in-progress workout is the primary cross-screen state. It lives in a context so the Log tab and any nested screens share it without prop drilling.

```ts
// contexts/active-session-context.tsx
type Action =
  | { type: 'START'; payload: SessionDraft }
  | { type: 'ADD_COMPONENT'; payload: ComponentDraft }
  | { type: 'FINISH' };

function reducer(state: SessionDraft | null, action: Action): SessionDraft | null { ... }

export function ActiveSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null);
  return (
    <ActiveSessionContext.Provider value={{ state, dispatch }}>
      {children}
    </ActiveSessionContext.Provider>
  );
}
```

---

## Types

Until `shared/types/` exists, types mirror the data model defined in `docs/20260323_data_model.md` and live in `mobile-client/types/`. When the shared package is scaffolded, imports switch from `@/types` to `@wot/types` with no logic changes.
