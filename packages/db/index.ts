import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from './schema'

export function getDb(dbUrl?: string) {
    const url = dbUrl || process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not set. Please provide it as an argument or in your environment.');
    }
    const sql = neon(url);
    return drizzle({ client: sql, schema });
}

export const db = getDb();