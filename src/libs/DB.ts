import path from 'node:path';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import { schemaModules } from '@/models/Schema'; // Your manual schema list

import { Env } from './Env'; // Your env loader

// Set up clients and apply migrations
const schema = Object.assign({}, ...schemaModules);

const client = new Client({
  connectionString: Env.DATABASE_URL,
});
await client.connect();

const drizzle = drizzlePg(client, { schema });
await migratePg(drizzle, {
  migrationsFolder: path.join(process.cwd(), 'migrations'),
});

export const db = drizzle;
