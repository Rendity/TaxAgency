// src/libs/schemaModules.ts

import * as questionnaire from '@/app/api/questionnaire/model';
import * as HashSchema from '@/app/api/setup/model';
// Add more imports as needed...

// Collect all model exports into one array for use in drizzle
export const schemaModules = [
  questionnaire,
  HashSchema,
];
