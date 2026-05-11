import { HashSchema } from '@/app/api/setup/model';
import { getDb } from '@/libs/DB';
import { eq } from 'drizzle-orm';

export async function saveHash(hash: string, payload: Record<string, any>) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection is not available');
  }
  return await db.insert(HashSchema).values({
    hash,
    payload,
  }).returning();
}

export async function getHash(hash: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection is not available');
  }
  return await db.select().from(HashSchema).where(eq(HashSchema.hash, hash)).limit(1).then(res => res[0] || null);
}
