// src/components/Questionnaire/stepsData.ts

import type { Step } from './types';
import { getTranslations } from 'next-intl/server';

function merge<T>(a: T[], b: T[]): T[] {
  return Array.from(new Set([...a, ...b]));
}

export const getStepsData = async (locale: string, doubleEntry: boolean): Promise<Step[]> => {
  const t = await getTranslations({ locale, namespace: 'Questionnaire' });
  const commonQuestions: Step[] = [
    {
      id: 0,
      title: t('step0.title'),
      description: t('step0.description'),
      fields: [
        {
          label: t('step0.title'),
          name: 'message',
          type: 'message',
          description: t('step0.body'),
        },
        {
          label: t('step0.title'),
          name: 'messageLinks',
          type: 'message',
          description: (
            <div className="mt-4">
              <div className="mb-3">{t('step0.more_info_heading')}</div>
              <div className="flex flex-col items-start gap-3">
                <a
                  href="/assets/documents/NC_Leitfaden-Digitaler-Belegaustausch_doppelte-Buchhaltung.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 px-4 py-3 rounded-md border border-gray-200 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 text-blue-700 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Leitfaden: Doppelte Buchhaltung</span>
                </a>
                <a
                  href="/assets/documents/NC_Leitfaden-Digitaler-Belegaustausch_Einnahmen-Ausgaben-Rechnung.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 px-4 py-3 rounded-md border border-gray-200 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 text-blue-700 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Leitfaden: Einnahmen-Ausgaben-Rechnung</span>
                </a>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 1,
      title: t('step1.title'),
      description: t('step1.description'),
      fields: [
        {
          label: t('step1.title'),
          name: 'accounts',
          type: 'person',
          fields: [
            {
              label: t('step1.field.firstname.label'),
              name: 'firstName',
              type: 'text',
              description: 'Geben Sie Ihren Vornamen ein.',
              validation: {
                required: { value: true, message: 'Vorname ist erforderlich' },
                minLength: { value: 2, message: `Minimale Länge ist 10` },
                maxLength: { value: 30, message: `Maximale Länge ist 30` },
              },
            },
            {
              label: t('step1.field.lastname.label'),
              name: 'lastName',
              type: 'text',
              description: 'Enter your family name.',
              validation: {
                required: { value: true, message: 'Vorname ist erforderlich' },
                minLength: { value: 2, message: `Minimale Länge ist 10` },
                maxLength: { value: 30, message: `Maximale Länge ist 30` },
              },
            },
            {
              label: t('step1.field.email.label'),
              name: 'email',
              type: 'email',
              description: 'We will contact you through this email.',
            },
            {
              label: 'Betriebssystem',
              name: 'operatingSystem',
              type: 'radio',
              options: [
                { label: 'Windows', value: 'windows' },
                { label: 'Mac OS', value: 'macos' },
              ],
              description: t('step1.field.operatingSystem.description'),
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: t('step6.title'),
      description: t('step6.description'),
      fields: [
        {
          label: 'Lohnverrechnung',
          name: 'payrollAccounting',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
      ],
    },
    {
      id: 3,
      title: t('step5.title'),
      description: t('step5.description'),
      fields: [
        {
          label: t('step5.fields.dynamicCheckboxDropdown.label'),
          name: 'filingCategories',
          type: 'multiCheckbox',
          options: [
            { label: t('step5.fields.dynamicCheckboxDropdown.options.purchaseContract'), value: 'Kaufverträge' }, // Kaufverträge
            { label: t('step5.fields.dynamicCheckboxDropdown.options.loanAgreement'), value: 'Darlehensverträge' }, // Darlehensverträge
            { label: t('step5.fields.dynamicCheckboxDropdown.options.leasingContract'), value: 'Leasingverträge' }, // Leasingverträge
            { label: t('step5.fields.dynamicCheckboxDropdown.options.insurancePolicy'), value: 'Versicherungspolizzen' }, // Versicherungspolizzen
          ],
          extraOptions: [
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.saleAgreement'), value: 'Kaufvertrag' }, // Kaufverträge
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.indemnityAgreement'), value: 'Entschädigungsvereinbarungen' }, // Entschädigungsvereinbarungen
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.mortgageAgreement'), value: 'Hypothekarkredite' }, // Hypothekarkredite
          ],
        },
      ],
    },
  ];
  if (doubleEntry) {
    const doubleEntry: Step[] = [
      {
        id: 4,
        title: t('step2.title'),
        description: t('step2.description'),
        fields: [
          {
            label: 'Ausgangsrechnungen',
            name: 'outgoingInvoices',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
          },
        ],
      },
      {
        id: 5,
        title: t('step7.title'),
        description: t('step7.description'),
        fields: [
          {
            label: 'HV-Abrechnungen',
            name: 'agmSettlements',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
          },
        ],
      },
      {
        id: 6,
        title: t('step3.title'),
        description: '',
        fields: [
          {
            label: t('step3.fields.incomingInvoices.label'),
            name: 'incomingInvoices',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
            description: t('step3.fields.incomingInvoices.description'),
          },
          {
            label: t('step3.fields.recurringBills.label'),
            name: 'recurringBills',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
            description: t('step3.fields.recurringBills.description'),
          },
        ],
      },
      {
        id: 7,
        title: t('step8.title'),
        description: t('step8.description'),
        fields: [
          {
            label: 'Person',
            name: 'person',
            type: 'person',
            description: t('step8.description'),
            fields: [
              {
                label: t('step1.field.firstname.label'),
                name: 'firstName',
                type: 'text',
                description: 'Geben Sie Ihren Vornamen ein.',
                validation: {
                  required: { value: true, message: 'Vorname ist erforderlich' },
                  minLength: { value: 2, message: `Minimale Länge ist 10` },
                  maxLength: { value: 30, message: `Maximale Länge ist 30` },
                },
              },
              {
                label: t('step1.field.lastname.label'),
                name: 'lastName',
                type: 'text',
                description: 'Enter your family name.',
                validation: {
                  required: { value: true, message: 'Vorname ist erforderlich' },
                  minLength: { value: 2, message: `Minimale Länge ist 10` },
                  maxLength: { value: 30, message: `Maximale Länge ist 30` },
                },
              },
            ],
          },
        ],
      },
      {
        id: 8,
        title: t('step4.title'),
        description: t('step4.description'),
        fields: [
          {
            label: 'IBAN Format',
            name: 'bankFileObtain',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
              { label: t('text_camt'), value: 'camt' },
            ],
          },
          {
            label: 'IBAN',
            name: 'ibans',
            type: 'iban',
            description: '',
          },
        ],
      },
      {
        id: 9,
        title: t('step9.title'),
        description: t('step9.description'),
        fields: [
          {
            label: 'Kreditkarten Format',
            name: 'ccFileObtain',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
              { label: t('text_camt'), value: 'camt' },
            ],
          },
          {
            label:
          'Kreditkarte',
            name: 'creditCards',
            type: 'creditcard',
            description: 'Enter your credit card details.',
          },
        ],
      },
      {
        id: 10,
        title: 'PayPal',
        description: t('step10.description'),
        fields: [
          {
            label: 'PayPal',
            name: 'paypal',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
          },
        ],
      },
      {
        id: 11,
        title: t('step11.title'),
        description: t('step11.description'),
        fields: [
          {
            label: 'Kassa',
            name: 'cashDesk',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
          },
        ],
      },
      {
        id: 12,
        title: t('step12.title'),
        description: t('step12.description'),
        fields: [
          {
            label: 'Inventur',
            name: 'inventory',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
          },
        ],
      },
    ];
    return merge(commonQuestions, doubleEntry);
  }

  const singleEntry: Step[] = [
    {
      id: 4,
      title: t('step4.title'),
      description: t('step4.description'),
      fields: [
        {
          label: 'IBAN Format',
          name: 'bankFileObtain',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
            { label: t('text_camt'), value: 'camt' },
          ],
        },
        {
          label: 'IBAN',
          name: 'ibans',
          type: 'iban',
          description: '',
        },
      ],
    },
    {
      id: 5,
      title: t('step7.title'),
      description: t('step7.description'),
      fields: [
        {
          label: 'HV-Abrechnungen',
          name: 'agmSettlements',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
      ],
    },
    {
      id: 6,
      title: t('step2.title2'),
      description: t('step2.description2'),
      fields: [
        {
          label: 'Eingangsrechnungen',
          name: 'incomingInvoices',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
          description: t('step3.fields.incomingInvoices.description'),
        },
        {
          label: 'Wiederkehrende Rechnungen',
          name: 'recurringBills',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
          description: t('step3.fields.recurringBills.description'),
        },
      ],
    },
    {
      id: 7,
      title: t('step9.title'),
      description: t('step9.description'),
      fields: [
        {
          label: 'Kreditkarten Format',
          name: 'ccFileObtain',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
            { label: t('text_camt'), value: 'camt' },
          ],
        },
        {
          label:
          'Kreditkarte',
          name: 'creditCards',
          type: 'creditcard',
          description: 'Enter your credit card details.',
        },
      ],
    },
    {
      id: 8,
      title: 'PayPal',
      description: t('step10.description'),
      fields: [
        {
          label: 'PayPal',
          name: 'paypal',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
      ],
    },
    {
      id: 9,
      title: t('cashrecipient.title'),
      description: t('cashrecipient.description'),
      fields: [
        {
          label: 'Barbelege',
          name: 'cashrecipiets',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
      ],
    },
    {
      id: 10,
      title: t('step11.title'),
      description: t('step11.description'),
      fields: [
        {
          label: 'Kassa',
          name: 'cashDesk',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
      ],
    },
    {
      id: 11,
      title: t('step12.title'),
      description: t('step12.description'),
      fields: [
        {
          label: 'Inventur',
          name: 'inventory',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
      ],
    },
    // Additional steps for single entry...
  ];
  return merge(commonQuestions, singleEntry);
};
