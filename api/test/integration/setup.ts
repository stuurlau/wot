// Set the real dev DATABASE_URL before any app module loads.
// Integration tests require the local docker-compose Postgres to be running
// and migrations applied (npm run db:migrate in api/).
process.env.DATABASE_URL ??= "postgresql://wot:wot_dev_password@localhost:5432/wot_dev";
process.env.API_URL ??= "http://localhost:3000";
process.env.CORS_ORIGIN ??= "http://localhost:8081";
process.env.BETTER_AUTH_SECRET ??= "0".repeat(64);
