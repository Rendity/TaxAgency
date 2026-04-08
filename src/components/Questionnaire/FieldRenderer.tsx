import type { FieldRendererProps } from './types';
import React from 'react';
import { CreditCardField } from './Fields/CreditCard';
import { DynamicCheckboxDropdownField } from './Fields/DynamicCheckbox';
import { IBANField } from './Fields/IBAN';
import { PaymentProvidersField } from './Fields/PaymentProviders';
import { PersonField } from './Fields/PersonField';
import { CashDeskSystemField } from './Fields/CashDeskSystem';
import RadioField from './Fields/RadioField';
import TextField from './Fields/TextField';

export default function FieldRenderer({
  field,
  value,
  register,
  uniqueName,
  errors,
  onChange,
}: FieldRendererProps) {
  const commonProps = {
    id: field.name,
    value: value ?? '',
    onChange,
    placeholder: field.placeholder || '',
    className:
      'w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
  };

  switch (field.type) {
    case 'message':
      return (
        <div>{field.description}</div>
      );
    case 'multiCheckbox':
      return (
        <DynamicCheckboxDropdownField field={field} value={value} register={register} errors={errors} onChange={onChange} />
      );
    case 'person':
      return (
        <PersonField fields={field.fields ?? []} name={field.name} />
      );
    case 'paymentProviders':
      return (
        <PaymentProvidersField
          name={field.name}
          label={field.label}
          translations={field.translations}
        />
      );
    case 'iban':
      return (
        <IBANField
          name={field.name}
          triggerField={field.triggerField}
          triggerValue={field.triggerValue}
          addLabel={field.addLabel}
          withAdvisor={field.withAdvisor}
          advisorNameLabel={field.advisorNameLabel}
          advisorContactLabel={field.advisorContactLabel}
        />
      );
    case 'creditcard':
      return (
        <CreditCardField
          name={field.name}
        />
      );
    case 'cashDeskSystem':
      return (
        <CashDeskSystemField
          name={field.name}
          value={value}
          onChange={onChange}
          translations={field.translations}
          errors={errors?.[field.name] as Record<string, { message?: string }> | undefined}
        />
      );
    case 'text':
    case 'email':
      return (
        <TextField
          disabled={false}
          name={field.name}
          key={`${field.type}-${field.name}`}
          label={field.label}
          {...commonProps}
          type={field.type}
        />
      );

    case 'radio':
      return (
        <div className="flex flex-wrap gap-6">
          {field.options?.map(opt => (
            <RadioField
              label={opt.label}
              key={`bordered-radio-${opt.value}`}
              name={uniqueName ?? field.name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
            />
          ))}
        </div>
      );

    default:
      return (
        <TextField
          disabled={false}
          name={field.name}
          key={`${field.type}-${field.name}`}
          label={field.label}
          {...commonProps}
          type={field.type}
        />
      );
  }
}
