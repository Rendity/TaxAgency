import { QuestionnaireSchema } from '@/app/api/questionnaire/model';
// question.repo.ts
import { getDb } from '@/libs/DB';

const db = await getDb();

export async function saveQuestionnaire(data: Record<string, any>) {
  if (!db) {
    throw new Error('Database connection is not available');
  }
  return await db.insert(QuestionnaireSchema).values({
    data, // ✅ should work if `data` is defined as `json()` in schema
  }).returning();
}
