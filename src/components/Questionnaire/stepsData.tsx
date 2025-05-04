// src/components/Questionnaire/stepsData.ts

import type { Step } from './types';
import { getTranslations } from 'next-intl/server';

export const getStepsData = async (locale: string): Promise<Step[]> => {
  const t = await getTranslations({ locale, namespace: 'Questionnaire' });
  return [
    {
      id: 1,
      title: t('step1.title'),
      description: t('step1.description'),
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
    {
      id: 2,
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
          description: 'Select Yes or No.',
        },
      ],
    },
    {
      id: 3,
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
      id: 4,
      title: t('step4.title'),
      description: t('step4.description'),
      fields: [
        {
          label: 'IBAN',
          name: 'ibans',
          type: 'iban',
          description: '',
        },
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
      ],
    },
    {
      id: 5,
      title: t('step5.title'),
      description: t('step5.description'),
      fields: [
        {
          label: t('step5.fields.dynamicCheckboxDropdown.label'),
          name: 'filingCategories',
          type: 'dynamicCheckboxDropdown',
          options: [
            { label: t('step5.fields.dynamicCheckboxDropdown.options.purchaseContract'), value: 'purchaseContract' },
            { label: t('step5.fields.dynamicCheckboxDropdown.options.loanAgreement'), value: 'loanAgreement' },
            { label: t('step5.fields.dynamicCheckboxDropdown.options.leasingContract'), value: 'leasingContract' },
            { label: t('step5.fields.dynamicCheckboxDropdown.options.insurancePolicy'), value: 'insurancePolicy' },
          ],
          extraOptions: [
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.saleAgreement'), value: 'saleAgreement' },
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.indemnityAgreement'), value: 'indemnityAgreement' },
            { label: t('step5.fields.dynamicCheckboxDropdown.extraOptions.mortgageAgreement'), value: 'mortgageAgreement' },
          ],
        },
      ],
    },
    {
      id: 6,
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
      id: 7,
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
      id: 8,
      title: t('step8.title'),
      description: t('step8.description'),
      fields: [
        {
          label: 'Person',
          name: 'person',
          type: 'person',
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
          label:
          'Kreditkarte',
          name: 'creditCards',
          type: 'creditcard',
          description: 'Enter your credit card details.',
        },
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
};
