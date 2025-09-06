import { z } from 'zod';
import { json, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const HashSchema = pgTable('short_link', {
  id: serial('id').primaryKey(),
  hash: varchar('hash', { length: 100 }).notNull().unique(),
  payload: json('data'),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const SetupFormSchema = z.object({
  clientId: z.number({ required_error: 'Client ID ist erforderlich' }).positive(),
  companyName: z.string().trim().min(1, 'Firmenname ist erforderlich'),
  doubleEntry: z.enum(['true', 'false']),
});

export type SetupFormValues = z.infer<typeof SetupFormSchema>;
