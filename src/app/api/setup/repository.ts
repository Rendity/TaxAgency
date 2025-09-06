import { HashSchema } from '@/app/api/setup/model';
// question.repo.ts
import { getDb } from '@/libs/DB';
import { eq } from 'drizzle-orm';

const db = await getDb();

export async function saveHash(hash: string, payload: Record<string, any>) {
  if (!db) {
    throw new Error('Database connection is not available');
  }
  return await db.insert(HashSchema).values({
    hash,
    payload,
  }).returning();
}

export async function getHash(hash: string) {
  if (!db) {
    throw new Error('Database connection is not available');
  }
  // Assuming you are using Drizzle ORM or similar, import 'eq' and use it for the where clause
  // import { eq } from 'drizzle-orm'; // Make sure this import is at the top of your file
  return await db.select().from(HashSchema).where(eq(HashSchema.hash, hash)).limit(1).then(res => res[0] || null);
}
