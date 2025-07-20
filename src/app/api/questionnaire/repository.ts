import { QuestionnaireSchema } from '@/app/api/questionnaire/model';
// question.repo.ts
import { db } from '@/libs/DB';

export async function saveQuestionnaire(data: Record<string, any>) {
  return await db.insert(QuestionnaireSchema).values({
    data, // ✅ should work if `data` is defined as `json()` in schema
  }).returning();
}
