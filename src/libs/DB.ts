import path from 'node:path';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import { schemaModules } from '@/models/schema';
import { Env } from './Env';

const schema = Object.assign({}, ...schemaModules);

let dbInstance: ReturnType<typeof drizzlePg> | null = null;

export async function getDb() {
  if (process.env.SKIP_DB === 'true') {
    console.warn('⚠️ Database connection skipped (SKIP_DB=true)');
    return null;
  }

  if (!dbInstance) {
    const client = new Client({
      connectionString: Env.DATABASE_URL,
    });
    await client.connect();

    const drizzle = drizzlePg(client, { schema });

    // Run migrations only once
    await migratePg(drizzle, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });

    dbInstance = drizzle;
  }

  return dbInstance;
}
