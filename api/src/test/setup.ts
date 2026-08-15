process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.API_URL ??= "http://localhost:3000";
process.env.CORS_ORIGIN ??= "http://localhost:8081";
process.env.BETTER_AUTH_SECRET ??= "0".repeat(64);
