#!/usr/bin/env tsx

/**
 * Database Schema Validation Script
 * 
 * This script helps prevent schema drift by:
 * 1. Checking if local schema matches remote database
 * 2. Validating migrations before applying them
 * 3. Providing warnings for potentially destructive changes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

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

async function checkSchemaStatus() {
  console.log('🔍 Checking database schema status...\n');

  const dbPath = path.join(process.cwd(), 'packages/db');
  
  try {
    // Check if there are pending migrations
    console.log('📋 Generating migrations...');
    const generateOutput = await runCommand('drizzle-kit generate', dbPath);
    
    if (generateOutput.includes('No schema changes, nothing to migrate')) {
      console.log('✅ No pending schema changes - database is in sync!');
      return true;
    }
    
    console.log('📝 New migration detected:');
    console.log(generateOutput);
    
    // Check for potentially destructive operations
    const destructiveOperations = [
      'DROP TABLE',
      'DROP COLUMN',
      'ALTER TABLE',
      'DROP CONSTRAINT',
      'DROP INDEX'
    ];
    
    let hasDestructiveChanges = false;
    destructiveOperations.forEach(operation => {
      if (generateOutput.toLowerCase().includes(operation.toLowerCase())) {
        console.log(`⚠️  WARNING: Detected potentially destructive operation: ${operation}`);
        hasDestructiveChanges = true;
      }
    });
    
    if (hasDestructiveChanges) {
      console.log('\n🚨 CAUTION: This migration contains potentially destructive changes!');
      console.log('   Please review the migration file carefully before applying.');
      console.log('   Consider backing up your data first.');
    }
    
    return false;
    
  } catch (error: any) {
    if (error.message.includes('ECONNRESET')) {
      console.error('❌ Connection error - check your DATABASE_URL and network connection');
      console.log('💡 Try running the command again, or check if Neon database is accessible');
    } else if (error.message.includes('column') && error.message.includes('primary key')) {
      console.error('❌ Primary key constraint error detected');
      console.log('💡 This usually indicates schema drift. Consider running db:reset if this is a development environment');
    } else {
      console.error('❌ Schema check failed:', error.message);
    }
    return false;
  }
}

async function main() {
  const isInSync = await checkSchemaStatus();
  process.exit(isInSync ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}
