import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
    // Load .env from the root directory if DATABASE_URL is not set
    require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
}

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Please provide it in your environment or in the root .env file.');
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(
    sql,
    {
        schema,
        logger: true,
    }
);