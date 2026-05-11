import { QuestionnaireSchema } from '@/app/api/questionnaire/model';
import { getDb } from '@/libs/DB';

export async function saveQuestionnaire(data: Record<string, any>) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection is not available');
  }
  return await db.insert(QuestionnaireSchema).values({
    data,
  }).returning();
}
