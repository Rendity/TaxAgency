import path from 'node:path';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { schemaModules } from '@/models/schema';
import { Env } from './Env';
import { logger } from './Logger';

const schema = Object.assign({}, ...schemaModules);

let dbPromise: Promise<ReturnType<typeof drizzlePg<typeof schema, Pool>>> | null = null;

async function initializeDb() {
  const pool = new Pool({
    connectionString: Env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 5,
  });
  // The pool removes disconnected idle clients and replaces them when needed.
  pool.on('error', (error) => {
    logger.error(error, 'Idle database connection failed');
  });

  try {
    const db = drizzlePg(pool, { schema });
    await migratePg(db, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
    return db;
  } catch (error) {
    await pool.end();
    throw error;
  }
}

export async function getDb() {
  if (process.env.SKIP_DB === 'true') {
    console.warn('⚠️ Database connection skipped (SKIP_DB=true)');
    return null;
  }

  if (!dbPromise) {
    // Concurrent requests share initialization; failed startup can be retried.
    dbPromise = initializeDb().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}
