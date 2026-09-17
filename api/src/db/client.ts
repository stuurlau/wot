import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "../env.js";
import * as schema from "./schema/index.js";

export const pool = new Pool({
  connectionString: getEnv().DATABASE_URL,
});

export const db = drizzle(pool, { schema });
