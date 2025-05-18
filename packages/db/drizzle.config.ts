import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  // Load .env from the root directory if DATABASE_URL is not set
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Please provide it in your environment or in the root .env file.');
}


export default defineConfig({
  out: './drizzle',
  schema: './schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
