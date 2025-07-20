import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: './src/app/api/**/model.ts', // Glob pattern for nested schema files
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/abgwt.at',
  },
  verbose: true,
  strict: true,
});
