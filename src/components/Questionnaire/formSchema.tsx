// src/components/Questionnaire/formSchema.ts

import { isValidCreditCard } from '@/utils/Helpers';
import * as z from 'zod';

const personSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
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
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email('Invalid email address'),
  operatingSystem: z.enum(['windows', 'macos'], {
    errorMap: () => ({ message: 'Operating System must be selected' }),
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
        .min(1, 'IBAN cannot be empty') // NEW LINE — ensures value is not empty
        .transform(val => val.replace(/\s+/g, '').toUpperCase())
        .refine(val => /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(val), {
          message: 'Invalid IBAN',
        }),
    )
    .min(1, 'At least one IBAN is required')
    .max(5, 'Maximum 5 IBANs allowed'),
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
        .min(1, 'Credit card number cannot be empty')
        .refine(val => isValidCreditCard(val), {
          message: 'Invalid credit card',
        }),
    )
    .min(1, 'At least one credit card is required')
    .max(5, 'Maximum 5 Credit Cards allowed'),
  ccFileObtain: z.enum(['Yes', 'No', 'camt']),

  // Step 10: PayPal
  paypal: z.enum(['Yes', 'No']),

  // Step 11: Cash Desk
  cashDesk: z.enum(['Yes', 'No']),

  // Step 12: Inventory
  inventory: z.enum(['Yes', 'No']),
});
