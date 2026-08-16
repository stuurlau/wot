# Work-Out-Tracker (WOT)

An app aimed at injury prevention. Tracking training load should be easy. Getting insights into your training load should be easier. Everything in this app is designed to help me stay happy in training. 

### Approach:
Stress can have many sources. Some we can't control. But at least the workouts we plan and do, we can monitor. 
In WOT you can track any activity and get meaningful measures to track training stress. Because different activities add up, and tracking your runs in Strava & strength sessions on a piece of paper isn't necessary in this day and age.

## Quickstart (Make commands)

Run `make help` to see all available commands:

```bash
make help
```

| Command | Description |
|---|---|
| `make dev` | Start Postgres container, apply migrations, and run API + Mobile client concurrently |
| `make db-up` | Start local Postgres container |
| `make db-down` | Stop local Postgres container |
| `make db-migrate` | Apply Drizzle migrations |
| `make db-studio` | Launch Drizzle Studio database UI |
| `make api` | Run Fastify backend API in development mode |
| `make mobile` | Run Expo mobile app dev server |
| `make test` | Run backend unit and integration tests |
| `make typecheck` | Run type checking on API and mobile client |
| `make lint` | Run mobile client linter |
| `make check` | Run typecheck, lint, and all test suites |

