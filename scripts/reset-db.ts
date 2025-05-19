import { sql } from "drizzle-orm";
import { db } from "@db";

async function resetDatabase() {
  try {
    // Check if public schema exists before dropping
    const schemaExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_namespace WHERE nspname = 'public'
      );
    `);

    if (schemaExists.rows[0].exists) {
      await db.execute(sql`DROP SCHEMA public CASCADE;`);
    }
    
    await db.execute(sql`CREATE SCHEMA public;`);
    console.log("🧹 Database has been reset successfully!");
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
  process.exit(0);
}

resetDatabase();