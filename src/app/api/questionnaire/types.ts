import type { z } from 'zod';
import { formSchema } from '@/components/Questionnaire/formSchema';

export const extendedSchema = (formSchema as z.ZodEffects<z.ZodObject<any>>)._def.schema;

export type QuestionnaireDataType = z.infer<typeof extendedSchema>;

export type FolderNode = {
  name: string;
  children?: FolderNode[];
};
