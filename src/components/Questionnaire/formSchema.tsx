// src/components/Questionnaire/formSchema.ts

import { isValidCreditCard } from '@/utils/Helpers';
import * as z from 'zod';

const personSchema = z.object({
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
});

// Define allowed enum values
const dynamicCats = z.enum([
  'purchaseContract',
  'loanAgreement',
  'leasingContract',
  'insurancePolicy',
  'saleAgreement',
  'indemnityAgreement',
  'mortgageAgreement',
]);

export const formSchema = z.object({
  // Step 1: User Account
  clientId: z.number().min(1, 'Client ID is required'),
  companyName: z.string().min(1, 'Company Name is required'),
  // Step 1: User Account
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.string().email('Ungültige Email Adresse'),
  operatingSystem: z.enum(['windows', 'macos'], {
    errorMap: () => ({ message: 'Bitte geben Sie Ihr präferiertes Betriebsystem an' }),
  }),

  // Step 2: Outgoing Invoices
  outgoingInvoices: z.enum(['Yes', 'No']),

  // Step 3: Incoming Invoices / Standing Invoices
  incomingInvoices: z.enum(['Yes', 'No']),
  recurringBills: z.enum(['Yes', 'No']),

  // Step 4: Bank Details
  ibans: z
    .array(
      z.string()
        .min(1, 'Bitte geben Sie den IBAN an.') // NEW LINE — ensures value is not empty
        .transform(val => val.replace(/\s+/g, '').toUpperCase())
        .refine(val => /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(val), {
          message: 'Invalid IBAN',
        }),
    )
    .min(1, 'Bitte geben Sie mindestens einen IBAN an.')
    .max(5, 'Sie können maximal 5 IBANs angeben.'),
  // Note: The regex for IBAN is simplified and may not cover all cases. Adjust as necessary.
  bankFileObtain: z.enum(['Yes', 'No', 'camt']),

  // Step 5: Filing Categories
  filingCategories: z.array(dynamicCats).min(1, 'Select at least one category'),

  // Step 6: Payroll Accounting
  payrollAccounting: z.enum(['Yes', 'No']),

  // Step 7: AGM Settlements
  agmSettlements: z.enum(['Yes', 'No']),

  // Step 8: Persons
  person: z.array(personSchema).min(1, 'At least one person is required').max(5, 'Maximum 5 persons allowed'),

  // Step 9: Credit Cards
  creditCards: z
    .array(
      z.string()
        .min(1, 'Bite geben Sie die Kreditkartennummer an.')
        .refine(val => isValidCreditCard(val), {
          message: 'Ungültige Kreditkartennummer',
        }),
    )
    .min(1, 'Mindestens eine Kreditkarte muss angegeben werden.')
    .max(5, 'Maximal 5 Kreditkarten können angegeben werden.'),
  ccFileObtain: z.enum(['Yes', 'No', 'camt']),

  // Step 10: PayPal
  paypal: z.enum(['Yes', 'No']),

  // Step 11: Cash Desk
  cashDesk: z.enum(['Yes', 'No']),

  // Step 12: Inventory
  inventory: z.enum(['Yes', 'No']),
});
