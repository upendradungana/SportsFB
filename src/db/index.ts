import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create the shared Drizzle client using Neon’s serverless HTTP driver.
// Passing the schema keeps the exported table definitions available to Drizzle.
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
