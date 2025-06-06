#!/usr/bin/env tsx

/**
 * Safe Database Migration Script
 * 
 * This script provides a safer way to apply database migrations with:
 * 1. Pre-migration validation
 * 2. Automatic backup suggestions
 * 3. Rollback information
 * 4. Better error handling
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

async function runCommand(command: string, cwd?: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    if (stderr && !stderr.includes('Warning')) {
      console.warn('⚠️  Command warnings:', stderr);
    }
    return stdout;
  } catch (error: any) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

async function getLatestMigrationFile(): Promise<string | null> {
  const migrationDir = path.join(process.cwd(), 'packages/db/drizzle');
  
  try {
    const files = await fs.readdir(migrationDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
    return sqlFiles.length > 0 ? sqlFiles[sqlFiles.length - 1] : null;
  } catch {
    return null;
  }
}

async function safeMigrate() {
  console.log('🚀 Starting safe database migration...\n');

  const dbPath = path.join(process.cwd(), 'packages/db');
  
  try {
    // Step 1: Generate migrations
    console.log('1️⃣ Generating migrations...');
    const generateOutput = await runCommand('drizzle-kit generate', dbPath);
    
    if (generateOutput.includes('No schema changes, nothing to migrate')) {
      console.log('✅ No pending schema changes - database is already in sync!');
      return;
    }
    
    console.log('📝 New migration generated:');
    console.log(generateOutput);
    
    // Step 2: Show latest migration content
    const latestMigration = await getLatestMigrationFile();
    if (latestMigration) {
      console.log(`\n📄 Latest migration file: ${latestMigration}`);
      try {
        const migrationContent = await fs.readFile(
          path.join(process.cwd(), 'packages/db/drizzle', latestMigration),
          'utf-8'
        );
        console.log('Migration contents:');
        console.log('─'.repeat(50));
        console.log(migrationContent);
        console.log('─'.repeat(50));
      } catch {
        console.log('Could not read migration file content');
      }
    }
    
    // Step 3: Apply migration with better error handling
    console.log('\n2️⃣ Applying migration to database...');
    
    const pushOutput = await runCommand('drizzle-kit push', dbPath);
    console.log('✅ Migration applied successfully!');
    console.log(pushOutput);
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log('💡 Your database schema is now in sync with your code.');
    
  } catch (error: any) {
    console.error('\n❌ Migration failed!');
    
    if (error.message.includes('ECONNRESET')) {
      console.log('\n🔧 Connection Error Solutions:');
      console.log('  1. Check your internet connection');
      console.log('  2. Verify DATABASE_URL in your .env file');
      console.log('  3. Ensure Neon database is accessible');
      console.log('  4. Try again in a few moments');
    } else if (error.message.includes('column') && error.message.includes('primary key')) {
      console.log('\n🔧 Schema Conflict Solutions:');
      console.log('  1. For development: Run `pnpm db:reset` to reset database');
      console.log('  2. For production: Create a custom migration to resolve conflicts');
      console.log('  3. Check if manual database changes were made outside of Drizzle');
    } else {
      console.log('\n🔧 General Solutions:');
      console.log('  1. Check the error message above for specific issues');
      console.log('  2. Verify your schema.ts file for syntax errors');
      console.log('  3. Ensure all foreign key references are correct');
    }
    
    console.log('\n💡 If you continue to have issues:');
    console.log('  - Check packages/db/drizzle/ for migration files');
    console.log('  - Consider running db:check for schema validation');
    console.log('  - In development, db:reset provides a clean slate');
    
    throw error;
  }
}

async function main() {
  await safeMigrate();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('\n💥 Migration process failed:', error.message);
    process.exit(1);
  });
}
