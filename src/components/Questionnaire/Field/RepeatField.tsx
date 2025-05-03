/* eslint-disable react/no-array-index-key */
import type { FieldRendererProps } from '../types';
import CreditCardField from './CreditCardField';
import IBANField from './IbanField';
import PersonField from './PersonField';

export const RepeatField = ({ field, value, register, errors, onChange }: FieldRendererProps) => {
  const items: any[] = Array.isArray(value) ? value : [];

  const handleAdd = () => {
    const emptyItem = field.type === 'person' ? { firstname: '', lastname: '' } : '';
    onChange([...items, emptyItem]);
  };

  const handleRemove = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleItemChange = (index: number, newValue: any) => {
    const updated = [...items];
    updated[index] = newValue;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const fieldProps = {
          index: idx,
          field,
          value: item,
          register,
          errors,
          onChange: (val: any) => handleItemChange(idx, val),
          onClick: () => handleRemove(idx),
        };

        switch (field.type) {
          case 'creditcard':
            return <CreditCardField key={`credit-${idx}`} {...fieldProps} />;
          case 'person':
            return <PersonField key={`person-${idx}`} {...fieldProps} />;
          default:
            return <IBANField key={`iban-${idx}`} {...fieldProps} />;
        }
      })}
      {items.length < 5 && (
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-green-500 text-white rounded-sm hover:bg-green-600"
        >
          +
          {' '}
          {field.label}
        </button>
      )}
    </div>
  );
};
