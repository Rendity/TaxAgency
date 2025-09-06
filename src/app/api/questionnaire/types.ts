import type { z } from 'zod';
import { formSchema } from '@/components/Questionnaire/formSchema';

// export const extendedSchema = (formSchema as unknown as z.ZodEffects<z.ZodObject<any>>)._def.schema;
// const extendedSchema = formSchema(client, company).innerType();
// export type QuestionnaireDataType = z.infer<typeof extendedSchema>;

export const createExtendedSchema = (company: string) =>
  formSchema(company).innerType();

export type QuestionnaireDataType = z.infer<
  ReturnType<typeof createExtendedSchema>
>;

export type FolderNode = {
  name: string;
  children?: FolderNode[];
};
