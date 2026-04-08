// src/components/Questionnaire/formSchema.ts

import * as z from 'zod';

const personSchema = z.object({
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
});

const filingCategorySchema = z
  .string()
  .optional()
  .refine(
    val => typeof val === 'string' && val.length > 0,
    { message: 'Ungültige Kategorie' },
  );

const filingCategoriesSchema = z
  .array(filingCategorySchema)
  // .min(1, 'Bitte mindestens eine Kategorie auswählen')
  .optional()
  .refine(
    arr => Array.isArray(arr) && arr.length > 0 ? new Set(arr).size === arr.length : true,
    { message: 'Kategorien müssen eindeutig sein' },
  );

const isValidIBAN = (value: string): boolean => {
  const iban = value.replace(/\s+/g, '').toUpperCase();

  // General structure check: starts with 2 letters, 2 digits, and 12–30 alphanumeric characters
  const basicStructure = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;
  return basicStructure.test(iban);
};
const ibanSchema = z.object({
  value: z
    .string()
    .min(1, 'Bitte IBAN angeben')
    .transform(val => val.replace(/\s/g, ''))
    .refine(isValidIBAN, {
      message: 'Ungältiger IBAN',
    }),
});

// Define a placeholder isValidCreditCard function
const isValidCreditCard = (value: string): boolean => {
  // Add your credit card validation logic here
  return /^\d{16}$/.test(value); // Example: checks for a 16-digit number
};

const CCSchema = z.object({
  value: z
    .string()
    .min(1, 'Bitte eine Kreditkarte angeben')
    .transform(val => val.replace(/\s/g, ''))
    .refine(isValidCreditCard, {
      message: 'Ungültige Kreditkartennummer',
    }),
});

type checkEmails = {
  email: string;
  status: boolean;
};

const validatedEmails: checkEmails[] = [];

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Running in the browser, use the origin of the current request
    return window.location.origin;
  }

  // Running on the server (Node.js)
  return 'http://localhost:3000';
};

const emailSchema = (company: string) => z
  .string()
  .email('Invalid email format')
  .nonempty('Email is required')
  .refine(async (email) => {
    const trimmedEmail = email.toLowerCase().trim();
    const existingEmail = validatedEmails.find(item => item.email === trimmedEmail);
    if (existingEmail) {
      return existingEmail.status; // Return the cached status
    }
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/questionnaire?email=${encodeURIComponent(trimmedEmail)}&company=${company}`;
    const res = await fetch(url);
    validatedEmails.push({
      email: trimmedEmail,
      status: res.status === 200,
    });
    return res.status === 200; // Must return true if valid
  }, {
    message: 'Die E-Mail Adresse wurde bereits angelegt',
  });

const accountSchema = (company: string) => z.object({
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  email: emailSchema(company),
  operatingSystem: z.enum(['windows', 'macos'], {
    errorMap: () => ({ message: 'Bitte präferiertes Betriebsystem angeben' }),
  }),
});

export const formSchema = (company: string, companyType?: string, isDoubleEntry?: boolean) => {
  const isEinzel = companyType === 'Einzelunternehmen';

  return z
    .object({
      // Step 1
      clientId: z.number().min(1, 'Bitte ID des Klienten angeben'),
      companyName: z.string().min(1, 'Bitte Firmenname angeben'),
      doubleEntry: z.boolean().default(false),
      accounts: z.array(accountSchema(company)).min(1, 'Mindestens eine Person erforderlich').refine((accounts) => {
        const emails = accounts.map(acc => acc.email.toLowerCase().trim());
        const allEmpty = emails.every(item => item === '');
        if (allEmpty) {
          return true;
        }
        return new Set(emails).size === emails.length;
      }, {
        message: 'E-Mail-Adressen müssen eindeutig sein',
      }),

      // Step 2 — invoices (shown for Einzelunternehmen in both flows)
      invoices: z.enum(['Yes', 'No']).optional(),
      // Shown for non-Einzelunternehmen in double entry
      outgoingInvoices: z.enum(['Yes', 'No']).optional(),

      // Step 3 — incoming invoices
      // Shown for non-Einzelunternehmen in both flows
      incomingInvoices: z.enum(['Yes', 'No']).optional(),
      recurringBills: z.enum(['Yes', 'No']).optional(),

      // Step 4
      ibans: z.array(ibanSchema).optional().refine(
        (ibans) => {
          if (!ibans) {
            return true;
          } // Skip if optional and undefined
          const values = ibans.map(item => item.value);
          return new Set(values).size === values.length;
        },
        { message: 'IBANs müssen eindeutig sein' },
      ),
      bankFileObtain: z.enum(['Yes', 'No']),
      camtIbans: z.array(z.object({
        value: z.string().min(1, 'Bitte IBAN angeben').transform(val => val.replace(/\s/g, '')).refine(isValidIBAN, { message: 'Ungültiger IBAN' }),
        advisorName: z.string().optional(),
        advisorContact: z.string().optional(),
      })).optional().refine(
        (ibans) => {
          if (!ibans) {
            return true;
          }
          const values = ibans.map(item => item.value);
          return new Set(values).size === values.length;
        },
        { message: 'IBANs müssen eindeutig sein' },
      ),
      hasPaymentProviders: z.enum(['Yes', 'No']).optional(),
      paymentProviders: z.array(z.object({
        name: z.string(),
        checked: z.boolean(),
      })).optional(),

      // Step 5
      filingCategories: filingCategoriesSchema,

      // Step 6
      hasEmployees: z.enum(['Yes', 'No']).optional().refine(val => val !== undefined, {
        message: 'Bitte eine Auswahl treffen',
      }),
      hasManagingDirector: z.enum(['Yes', 'No']).optional(),
      payrollAccounting: z.enum(['Yes', 'No']).optional(),

      // Step 7
      agmSettlements: z.enum(['Yes', 'No']),

      // Step 8
      person: z.array(personSchema).optional(),

      // Step 9
      creditCards: z.array(CCSchema).optional().refine(
        (cards) => {
          if (!cards) {
            return true;
          }
          const values = cards.map(item => item.value);
          return new Set(values).size === values.length;
        },
        { message: 'Kreditkartennummern müssen eindeutig sein' },
      ),
      ccFileObtain: z.enum(['Yes', 'No', 'camt']),

      // Step 10–12
      paypal: z.enum(['Yes', 'No']).optional().default('No'),
      cashrecipiets: z.enum(['Yes', 'No']).optional(),
      hasCashBalance: z.enum(['Yes', 'No']).optional(),
      keepsCashBook: z.enum(['Yes', 'No']).optional(),
      cashDesk: z.enum(['Yes', 'No']).optional(),
      usesRegisterCash: z.enum(['Yes', 'No']).optional(),
      cashDeskSystem: z.object({
        selected: z.array(z.string()),
        other: z.string(),
        grantAccess: z.enum(['Yes', 'No', '']).optional(),
        username: z.string().optional(),
        password: z.string().optional(),
      }).superRefine((val, ctx) => {
        if (val.grantAccess === 'Yes') {
          if (!val.username || val.username.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Benutzername ist erforderlich.',
              path: ['username'],
            });
          }
          if (!val.password || val.password.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Passwort ist erforderlich.',
              path: ['password'],
            });
          }
        }
      }).optional(),
      usesHandCash: z.enum(['Yes', 'No']).optional(),
      inventory: z.enum(['Yes', 'No']),
    })
    .refine((data) => {
      // Validate hasManagingDirector when hasEmployees = 'Yes'
      if (data.hasEmployees === 'Yes' && !data.hasManagingDirector) {
        return false;
      }
      return true;
    }, {
      message: 'Bitte eine Auswahl treffen',
      path: ['hasManagingDirector'],
    })
    .refine((data) => {
      // Validate payrollAccounting when hasEmployees = 'Yes'
      if (data.hasEmployees === 'Yes' && !data.payrollAccounting) {
        return false;
      }
      return true;
    }, {
      message: 'Bitte eine Auswahl treffen',
      path: ['payrollAccounting'],
    })
    .superRefine((data, ctx) => {
      // --- Always-required fields shown in every flow ---
      if (!data.bankFileObtain) {
        ctx.addIssue({
          path: ['bankFileObtain'],
          code: z.ZodIssueCode.custom,
          message: 'Bitte eine Auswahl treffen',
        });
      }

      if (!data.agmSettlements) {
        ctx.addIssue({
          path: ['agmSettlements'],
          code: z.ZodIssueCode.custom,
          message: 'Bitte eine Auswahl treffen',
        });
      }

      if (!data.ccFileObtain) {
        ctx.addIssue({
          path: ['ccFileObtain'],
          code: z.ZodIssueCode.custom,
          message: 'Bitte eine Auswahl treffen',
        });
      }

      if (!data.inventory) {
        ctx.addIssue({
          path: ['inventory'],
          code: z.ZodIssueCode.custom,
          message: 'Bitte eine Auswahl treffen',
        });
      }

      // --- Invoice fields: depend on companyType ---
      if (isEinzel) {
        // Einzelunternehmen: invoices is shown, incomingInvoices is not
        if (!data.invoices) {
          ctx.addIssue({
            path: ['invoices'],
            code: z.ZodIssueCode.custom,
            message: 'Bitte eine Auswahl treffen',
          });
        }
        // recurringBills shown when invoices = 'Yes'
        if (data.invoices === 'Yes' && !data.recurringBills) {
          ctx.addIssue({
            path: ['recurringBills'],
            code: z.ZodIssueCode.custom,
            message: 'Bitte eine Auswahl treffen',
          });
        }
      } else {
        // Non-Einzelunternehmen
        if (isDoubleEntry) {
          // doubleEntry + non-Einzel: outgoingInvoices, incomingInvoices, recurringBills shown
          if (!data.outgoingInvoices) {
            ctx.addIssue({
              path: ['outgoingInvoices'],
              code: z.ZodIssueCode.custom,
              message: 'Bitte eine Auswahl treffen',
            });
          }
        }
        if (!data.incomingInvoices) {
          ctx.addIssue({
            path: ['incomingInvoices'],
            code: z.ZodIssueCode.custom,
            message: 'Bitte eine Auswahl treffen',
          });
        }
        // recurringBills shown when incomingInvoices exists (after selection)
        if (data.incomingInvoices && !data.recurringBills) {
          ctx.addIssue({
            path: ['recurringBills'],
            code: z.ZodIssueCode.custom,
            message: 'Bitte eine Auswahl treffen',
          });
        }
      }

      // --- doubleEntry-specific validations ---
      if (data.doubleEntry) {
        if (data.person && data.person.length > 5) {
          ctx.addIssue({
            path: ['person'],
            code: z.ZodIssueCode.custom,
            message: 'Es können maximal 5 Personen angegeben werden.',
          });
        }
      } else {
        // Single entry: cashrecipiets required
        if (!data.cashrecipiets) {
          ctx.addIssue({
            path: ['cashrecipiets'],
            code: z.ZodIssueCode.custom,
            message: 'Bitte eine Auswahl treffen',
          });
        }
      }

      // --- IBAN validations based on bankFileObtain ---
      if (data.bankFileObtain === 'No') {
        if (!data.ibans || data.ibans.length === 0) {
          ctx.addIssue({
            path: ['ibans'],
            code: z.ZodIssueCode.custom,
            message: 'Mindestens ein IBAN ist anzugeben, wenn "Nein" ausgewählt wurde.',
          });
        }
      }

      if (data.bankFileObtain === 'Yes') {
        if (!data.camtIbans || data.camtIbans.length === 0) {
          ctx.addIssue({
            path: ['camtIbans'],
            code: z.ZodIssueCode.custom,
            message: 'Mindestens ein IBAN ist anzugeben.',
          });
        }
      }

      // --- Credit card validations based on ccFileObtain ---
      if (data.ccFileObtain === 'Yes') {
        if (!data.creditCards || data.creditCards.length === 0) {
          ctx.addIssue({
            path: ['creditCards'],
            code: z.ZodIssueCode.custom,
            message: 'Mindestens eine Kreditkarte ist anzugeben, wenn "Ja" ausgewählt wurde.',
          });
        }
      }
    });
};
