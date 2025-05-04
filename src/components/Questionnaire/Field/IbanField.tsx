import type { RepeatFieldRendererProps } from '../types';
import Button from '@/components/Button';
import React, { useState } from 'react';

const formatIBAN = (iban: string) => {
  // Remove all non-alphanumeric characters (spaces, etc.)
  const cleaned = iban.replace(/\s+/g, '').toUpperCase();

  // Add spaces after every 4 characters
  return cleaned.replace(/(.{4})(?=.)/g, '$1 ');
};

export const IBANField = ({ index, value, errors, register, onChange, onClick }: RepeatFieldRendererProps) => {
  const [formattedIBAN, setFormattedIBAN] = useState(value || '');
  const fieldName = `ibans.${index}`;
  const inputId = `iban_multiple_${index}`;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\s+/g, '').toUpperCase();
    const formatted = formatIBAN(rawValue);
    setFormattedIBAN(formatted); // Update the formatted IBAN state
    onChange(rawValue); // Pass the raw value without spaces for validation
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          id={inputId}
          value={formattedIBAN}
          {...register(fieldName)}
          onChange={handleInputChange}
          className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
        />
        <label
          htmlFor={inputId}
          className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
        >
          IBAN #
          {index + 1}
        </label>
        <Button
          type="button"
          onClick={() => onClick(index)}
          className="absolute right-2 top-6 -translate-y-1/2 px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          label="Löschen"
        />
      </div>
      {errors?.ibans?.[index] && (
        <span className="text-red-500 mt-1 text-sm">{errors.ibans[index]?.message}</span>
      )}
    </div>
  );
};

export default IBANField;
