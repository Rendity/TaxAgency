// src/components/Questionnaire/stepsData.ts

import { Info } from 'lucide-react';
import type { Step } from './types';
import { getTranslations } from 'next-intl/server';

function merge<T>(a: T[], b: T[]): T[] {
  return Array.from(new Set([...a, ...b]));
}

export const getStepsData = async (locale: string, doubleEntry: boolean, companyType?: string): Promise<Step[]> => {
  const t = await getTranslations({ locale, namespace: 'Questionnaire' });
  const commonQuestions: Step[] = [
    {
      id: 0,
      title: t('step0.title'),
      sidebarTitle: 'Willkommen',
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
          name: 'messageNote',
          type: 'message',
          description: (
            <div className="mt-4">
              {t('step0.note')}
            </div>
          ),
        },
      ],
    },
    {
      id: 1,
      title: t('step1.title'),
      displayTitle: (
        <div className="flex items-center gap-2">
          <span>{t('step1.title')}</span>
          <span className="group relative inline-flex">
            <Info className="w-5 h-5 text-gray-400 cursor-help" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t('step1.tooltip')}
            </span>
          </span>
        </div>
      ),
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
      description: '',
      fields: [
        {
          label: t('step6.hasEmployees'),
          name: 'hasEmployees',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
          validation: {
            required: { value: true, message: 'Bitte eine Auswahl treffen' },
          },
        },
        {
          label: t('step6.hasManagingDirector'),
          name: 'hasManagingDirector',
          type: 'radio',
          showWhen: { field: 'hasEmployees', value: 'Yes' },
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
          validation: {
            required: { value: true, message: 'Bitte eine Auswahl treffen' },
          },
        },
        {
          label: t('step6.payrollAccounting'),
          name: 'payrollAccounting',
          type: 'radio',
          showWhen: { field: 'hasEmployees', value: 'Yes' },
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
          validation: {
            required: { value: true, message: 'Bitte eine Auswahl treffen' },
          },
        },
        {
          label: 'payrollInfo',
          name: 'payrollInfo',
          type: 'message',
          showWhen: [
            { field: 'hasEmployees', value: 'Yes' },
            { field: 'payrollAccounting', value: 'Yes' },
          ],
          description: (
            <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <p>{t('step6.description')}</p>
            </div>
          ),
        },
      ],
    },
    {
      id: 3,
      title: t('step4.title'),
      description: t('step4.description'),
      fields: [
        {
          label: t('step4.bank_access_label'),
          name: 'bankFileObtain',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
        // Yes flow: camt.053 — IBAN list for Einsichtsberechtigung + bank advisor
        {
          label: t('step4.camt_iban_heading'),
          name: 'camtIbanHeading',
          type: 'message',
          showWhen: { field: 'bankFileObtain', value: 'Yes' },
          description: (
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span>{t('step4.camt_iban_heading')}</span>
              <span className="group relative inline-flex">
                <Info className="w-5 h-5 text-gray-400 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {t('step4.camt_iban_tooltip')}
                </span>
              </span>
            </div>
          ),
        },
        {
          label: t('step4.camt_iban_heading'),
          name: 'camtIbans',
          type: 'iban',
          showWhen: { field: 'bankFileObtain', value: 'Yes' },
          triggerField: 'bankFileObtain',
          triggerValue: 'Yes',
          withAdvisor: true,
          advisorNameLabel: t('step4.bank_advisor_name'),
          advisorContactLabel: t('step4.bank_advisor_contact'),
        },
        // No flow: upload IBANs manually
        {
          label: t('step4.iban_heading'),
          name: 'ibanHeading',
          type: 'message',
          showWhen: { field: 'bankFileObtain', value: 'No' },
          description: (
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span>{t('step4.iban_heading')}</span>
              <span className="group relative inline-flex">
                <Info className="w-5 h-5 text-gray-400 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {t('step4.iban_tooltip')}
                </span>
              </span>
            </div>
          ),
        },
        {
          label: 'IBAN',
          name: 'ibans',
          type: 'iban',
          showWhen: { field: 'bankFileObtain', value: 'No' },
        },
        {
          label: t('step4.payment_providers_question'),
          name: 'hasPaymentProviders',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
        {
          label: t('step4.payment_providers_list'),
          name: 'paymentProviders',
          type: 'paymentProviders',
          showWhen: { field: 'hasPaymentProviders', value: 'Yes' },
          translations: {
            paypal: t('step4.paypal'),
            addButton: t('step4.add_button'),
            confirmButton: t('step4.confirm_button'),
            placeholder: 'Zahlungsdienstleister eingeben',
          },
        },
      ],
    },
  ];
  if (doubleEntry) {
    const doubleEntry: Step[] = [
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
        title: companyType === 'Einzelunternehmen' ? t('step2.title2') : t('step2.title'),
        sidebarTitle: 'Rechnungen',
        description: companyType === 'Einzelunternehmen' ? t('step2.description2') : t('step2.description'),
        fields: companyType === 'Einzelunternehmen'
          ? [
              {
                label: 'Rechnungen',
                name: 'invoices',
                type: 'radio',
                options: [
                  { label: t('text_yes'), value: 'Yes' },
                  { label: t('text_no'), value: 'No' },
                ],
                validation: {
                  required: { value: true, message: 'Bitte eine Auswahl treffen' },
                },
              },
              {
                label: 'Wiederkehrende Rechnungen (Dauerrechnungen)',
                name: 'recurringBills',
                type: 'radio',
                options: [
                  { label: t('text_yes'), value: 'Yes' },
                  { label: t('text_no'), value: 'No' },
                ],
                description: 'Bezieht das Unternehmen regelmäßig wiederkehrende Leistungen von einem Lieferanten und stellt dieser nur eine Rechnung aus, die jedoch für einen längeren Zeitraum gültig ist und alle wiederkehrenden Leistungen abdeckt, handelt es sich um eine Dauerrechnung. zB Miete die für das gesamte Jahr vorgeschrieben, jedoch mtl. bezahlt wird.',
                showWhen: { field: 'invoices', value: 'Yes' },
              },
            ]
          : [
              {
                label: 'Ausgangsrechnungen',
                name: 'outgoingInvoices',
                type: 'radio',
                options: [
                  { label: t('text_yes'), value: 'Yes' },
                  { label: t('text_no'), value: 'No' },
                ],
              },
              {
                label: t('step2.onlineShop.question'),
                name: 'hasOnlineShop',
                type: 'radio',
                options: [
                  { label: t('text_yes'), value: 'Yes' },
                  { label: t('text_no'), value: 'No' },
                ],
                showWhen: { field: 'outgoingInvoices', value: 'Yes' },
              },
              {
                label: t('step2.onlineShop.label'),
                name: 'onlineShopName',
                type: 'text',
                placeholder: t('step2.onlineShop.namePlaceholder'),
                showWhen: { field: 'hasOnlineShop', value: 'Yes' },
              },
              {
                label: t('step3.fields.incomingInvoices.label'),
                name: 'incomingInvoices',
                type: 'radio',
                options: [
                  { label: t('text_yes'), value: 'Yes' },
                  { label: t('text_no'), value: 'No' },
                ],
                description: t('step3.fields.incomingInvoices.description'),
                showWhen: { or: [
                  { field: 'outgoingInvoices', value: 'No' },
                  { field: 'hasOnlineShop', exists: true },
                ] },
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
                showWhen: { field: 'incomingInvoices', exists: true },
              },
            ],
      },
      {
        id: 7,
        title: t('step8.title'),
        displayTitle: (
          <div className="flex items-center gap-2">
            <span>{t('step8.title')}</span>
            <span className="group relative inline-flex">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {t('step8.tooltip')}
              </span>
            </span>
          </div>
        ),
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
        title: t('step9.title'),
        description: t('step9.description'),
        fields: [
          {
            label: t('step9.title'),
            name: 'ccFileObtain',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
          },
          {
            label: 'Kreditkarte',
            name: 'creditCards',
            type: 'creditcard',
            description: 'Enter your credit card details.',
          },
        ],
      },
      {
        id: 9,
        title: t('step11.title'),
        description: t('step11.description'),
        fields: [
          {
            label: t('step11.hasCashBalance'),
            name: 'hasCashBalance',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
          },
          {
            label: t('step11.keepsCashBook'),
            name: 'keepsCashBook',
            type: 'radio',
            showWhen: { field: 'hasCashBalance', value: 'Yes' },
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
          },
          {
            label: 'Kassabuch Info',
            name: 'cashBookUploadInfo',
            type: 'message',
            showWhen: [{ field: 'hasCashBalance', value: 'Yes' }, { field: 'keepsCashBook', value: 'Yes' }],
            description: (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                {t('step11.cashBookUploadInfo')}
              </div>
            ),
          },
          {
            label: 'Kassabuch Vorlage',
            name: 'cashBookTemplateInfo',
            type: 'message',
            showWhen: [{ field: 'hasCashBalance', value: 'Yes' }, { field: 'keepsCashBook', value: 'No' }],
            description: (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                {t('step11.cashBookTemplateInfo')}
                {' '}
                <a
                  href="/assets/documents/Vorlage Kassabuch.xlsx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  {t('step11.cashBookTemplateInfoLink')}
                </a>
                .
              </div>
            ),
          },
        ],
      },
      {
        id: 10,
        title: t('step13.title'),
        description: t('step13.description'),
        fields: [
          {
            label: t('step11.usesRegisterCash.question'),
            name: 'usesRegisterCash',
            type: 'radio',
            options: [
              { label: t('text_yes'), value: 'Yes' },
              { label: t('text_no'), value: 'No' },
            ],
          },
          {
            label: t('step11.cashDeskSystem.label'),
            name: 'cashDeskSystem',
            type: 'cashDeskSystem',
            showWhen: { field: 'usesRegisterCash', value: 'Yes' },
            translations: {
              grantAccess: t('step11.cashDeskSystem.grantAccess'),
              grantAccessTooltip: t('step11.cashDeskSystem.grantAccessTooltip'),
              username: t('step11.cashDeskSystem.username'),
              password: t('step11.cashDeskSystem.password'),
              yes: t('text_yes'),
              no: t('text_no'),
            },
          },
          {
            label: t('step11.usesHandCash.question'),
            name: 'usesHandCashHint',
            type: 'message',
            showWhen: { field: 'usesRegisterCash', value: 'No' },
            description: (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('step11.usesHandCash.question')}</span>
                <span className="group relative inline-flex">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('step11.usesHandCash.tooltip')}
                  </span>
                </span>
              </div>
            ),
          },
          {
            label: t('step11.usesHandCash.question'),
            name: 'usesHandCash',
            type: 'radio',
            showWhen: { field: 'usesRegisterCash', value: 'No' },
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
            label: '',
            name: 'inventory',
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
        title: t('step5.title'),
        displayTitle: (
          <div className="flex items-center gap-2">
            <span>{t('step5.title')}</span>
            <span className="group relative inline-flex">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {t('step5.tooltip')}
              </span>
            </span>
          </div>
        ),
        description: t('step5.description'),
        fields: [
          {
            label: t('step5.fields.dynamicCheckboxDropdown.label'),
            name: 'filingCategories',
            type: 'multiCheckbox',
            options: [
              { label: t('step5.fields.dynamicCheckboxDropdown.options.purchaseContract'), value: 'Kaufverträge' }, // Kaufverträge
              { label: t('step5.fields.dynamicCheckboxDropdown.options.loanAgreement'), value: 'Darlehensverträge' }, // Darlehensverträge
              { label: t('step5.fields.dynamicCheckboxDropdown.options.incorporationDocuments'), value: 'Gründungsdokumente' }, // Gründungsdokumente
            ],
            extraOptions: [
              { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.leasingContract'), value: 'Leasingverträge', tooltip: t('step5.fields.dynamicCheckboxDropdown.extraOptions.leasingContractTooltip') },
              { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.insuranceContract'), value: 'Versicherungsverträge', tooltip: t('step5.fields.dynamicCheckboxDropdown.extraOptions.insuranceContractTooltip') },
              { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.saleAgreement'), value: 'Mietverträge' }, // Mietverträge
              { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.indemnityAgreement'), value: 'Entschädigungsvereinbarungen' }, // Entschädigungsvereinbarungen
              { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.mortgageAgreement'), value: 'Hypothekarkredite' }, // Hypothekarkredite
              { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.subsidiaryFoundation'), value: 'Gründungsdokumente von Tochterunternehmen' }, // Gründungsdokumente von Tochterunternehmen
            ],
          },
        ],
      },
      {
        id: 13,
        title: t('step0.more_info_heading'),
        sidebarTitle: 'Digitaler Belegaustausch',
        description: '',
        fields: [
          {
            label: t('step0.more_info_heading'),
            name: 'downloadLinks',
            type: 'message',
            description: (
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
            ),
          },
        ],
      },
    ];
    return merge(commonQuestions, doubleEntry);
  }

  const singleEntry: Step[] = [
    {
      id: 4,
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
      id: 5,
      title: t('step2.title2'),
      sidebarTitle: 'Rechnungen',
      description: t('step2.description2'),
      fields: companyType === 'Einzelunternehmen'
        ? [
            {
              label: 'Rechnungen',
              name: 'invoices',
              type: 'radio',
              options: [
                { label: t('text_yes'), value: 'Yes' },
                { label: t('text_no'), value: 'No' },
              ],
              validation: {
                required: { value: true, message: 'Bitte wählen Sie Ja oder Nein' },
              },
            },
            {
              label: 'Wiederkehrende Rechnungen (Dauerrechnungen)',
              name: 'recurringBills',
              type: 'radio',
              options: [
                { label: t('text_yes'), value: 'Yes' },
                { label: t('text_no'), value: 'No' },
              ],
              description: 'Bezieht das Unternehmen regelmäßig wiederkehrende Leistungen von einem Lieferanten und stellt dieser nur eine Rechnung aus, die jedoch für einen längeren Zeitraum gültig ist und alle wiederkehrenden Leistungen abdeckt, handelt es sich um eine Dauerrechnung. zB Miete die für das gesamte Jahr vorgeschrieben, jedoch mtl. bezahlt wird.',
              showWhen: { field: 'invoices', value: 'Yes' },
            },
          ]
        : [
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
              showWhen: { field: 'incomingInvoices', exists: true },
            },
          ],
    },
    {
      id: 7,
      title: t('step9.title'),
      description: t('step9.description'),
      fields: [
        {
          label: t('step9.title'),
          name: 'ccFileObtain',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
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
      id: 7,
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
      id: 8,
      title: t('step11.title'),
      description: t('step11.description'),
      fields: [
        {
          label: t('step11.hasCashBalance'),
          name: 'hasCashBalance',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
        {
          label: t('step11.keepsCashBook'),
          name: 'keepsCashBook',
          type: 'radio',
          showWhen: { field: 'hasCashBalance', value: 'Yes' },
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
        {
          label: 'Kassabuch Info',
          name: 'cashBookUploadInfo',
          type: 'message',
          showWhen: [{ field: 'hasCashBalance', value: 'Yes' }, { field: 'keepsCashBook', value: 'Yes' }],
          description: (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              {t('step11.cashBookUploadInfo')}
            </div>
          ),
        },
        {
          label: 'Kassabuch Vorlage',
          name: 'cashBookTemplateInfo',
          type: 'message',
          showWhen: [{ field: 'hasCashBalance', value: 'Yes' }, { field: 'keepsCashBook', value: 'No' }],
          description: (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              {t('step11.cashBookTemplateInfo')}
              {' '}
              <a
                href="/assets/documents/Vorlage Kassabuch.xlsx"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                {t('step11.cashBookTemplateInfoLink')}
              </a>
              .
            </div>
          ),
        },
      ],
    },
    {
      id: 9,
      title: t('step13.title'),
      description: t('step13.description'),
      fields: [
        {
          label: t('step11.usesRegisterCash.question'),
          name: 'usesRegisterCash',
          type: 'radio',
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
        {
          label: t('step11.cashDeskSystem.label'),
          name: 'cashDeskSystem',
          type: 'cashDeskSystem',
          showWhen: { field: 'usesRegisterCash', value: 'Yes' },
          translations: {
            grantAccess: t('step11.cashDeskSystem.grantAccess'),
            grantAccessTooltip: t('step11.cashDeskSystem.grantAccessTooltip'),
            username: t('step11.cashDeskSystem.username'),
            password: t('step11.cashDeskSystem.password'),
            yes: t('text_yes'),
            no: t('text_no'),
          },
        },
        {
          label: t('step11.usesHandCash.question'),
          name: 'usesHandCashHint',
          type: 'message',
          showWhen: { field: 'usesRegisterCash', value: 'No' },
          description: (
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t('step11.usesHandCash.question')}</span>
              <span className="group relative inline-flex">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('step11.usesHandCash.tooltip')}
                </span>
              </span>
            </div>
          ),
        },
        {
          label: t('step11.usesHandCash.question'),
          name: 'usesHandCash',
          type: 'radio',
          showWhen: { field: 'usesRegisterCash', value: 'No' },
          options: [
            { label: t('text_yes'), value: 'Yes' },
            { label: t('text_no'), value: 'No' },
          ],
        },
      ],
    },
    {
      id: 10,
      title: t('step12.title'),
      description: t('step12.description'),
      fields: [
        {
          label: '',
          name: 'inventory',
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
      title: t('step5.title'),
      displayTitle: (
        <div className="flex items-center gap-2">
          <span>{t('step5.title')}</span>
          <span className="group relative inline-flex">
            <Info className="w-5 h-5 text-gray-400 cursor-help" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t('step5.tooltip')}
            </span>
          </span>
        </div>
      ),
      description: t('step5.description'),
      fields: [
        {
          label: t('step5.fields.dynamicCheckboxDropdown.label'),
          name: 'filingCategories',
          type: 'multiCheckbox',
          options: [
            { label: t('step5.fields.dynamicCheckboxDropdown.options.purchaseContract'), value: 'Kaufverträge' }, // Kaufverträge
            { label: t('step5.fields.dynamicCheckboxDropdown.options.loanAgreement'), value: 'Darlehensverträge' }, // Darlehensverträge
            { label: t('step5.fields.dynamicCheckboxDropdown.options.incorporationDocuments'), value: 'Gründungsdokumente' }, // Gründungsdokumente
          ],
          extraOptions: [
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.leasingContract'), value: 'Leasingverträge', tooltip: t('step5.fields.dynamicCheckboxDropdown.extraOptions.leasingContractTooltip') },
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.insuranceContract'), value: 'Versicherungsverträge', tooltip: t('step5.fields.dynamicCheckboxDropdown.extraOptions.insuranceContractTooltip') },
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.saleAgreement'), value: 'Mietverträge' }, // Mietverträge
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.indemnityAgreement'), value: 'Entschädigungsvereinbarungen' }, // Entschädigungsvereinbarungen
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.mortgageAgreement'), value: 'Hypothekarkredite' }, // Hypothekarkredite
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.subsidiaryFoundation'), value: 'Gründungsdokumente von Tochterunternehmen' }, // Gründungsdokumente von Tochterunternehmen
          ],
        },
      ],
    },
    {
      id: 11,
      title: t('step0.more_info_heading'),
      sidebarTitle: 'Digitaler Belegaustausch',
      description: '',
      fields: [
        {
          label: t('step0.more_info_heading'),
          name: 'downloadLinks',
          type: 'message',
          description: (
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
          ),
        },
      ],
    },
  ];
  return merge(commonQuestions, singleEntry);
};
