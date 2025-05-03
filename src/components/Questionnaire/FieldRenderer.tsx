import type { FieldRendererProps } from './types';
import React from 'react';
import { DynamicCheckboxDropdownField } from './Field/DynamicCheckbox';
import RadioField from './Field/RadioField';
import { RepeatField } from './Field/RepeatField';
import TextField from './Field/TextField';

export default function FieldRenderer({
  field,
  value,
  register,
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

  // 🆕 NEW: handle special dynamic checkbox+dropdown
  if (field.type === 'dynamicCheckboxDropdown') {
    return <DynamicCheckboxDropdownField field={field} value={value} register={register} errors={errors} onChange={onChange} />;
  }
  // 🆕 NEW: handle special dynamic checkbox+dropdown
  if (field.type === 'person' || field.type === 'iban' || field.type === 'creditcard') {
    return <RepeatField field={field} value={value} register={register} errors={errors} onChange={onChange} />;
  }

  switch (field.type) {
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
              name={field.name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
            />
          ))}
        </div>
      );

    default:
      return <input type="text" {...commonProps} />;
  }
}
