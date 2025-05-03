/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import type { FieldRendererProps } from '../types';
import { useEffect, useState } from 'react';

export const DynamicCheckboxDropdownField = ({
  field,
  value,
  onChange,
}: FieldRendererProps) => {
  const fixedOptions = field.options || [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const extraOptions = field.extraOptions || [];

  const [selectedValues, setSelectedValues] = useState<string[]>(() =>
    Array.isArray(value) ? value : [],
  );

  const [availableExtraOptions, setAvailableExtraOptions] = useState(() =>
    extraOptions.filter(opt => !selectedValues.includes(opt.value)),
  );

  useEffect(() => {
    if (Array.isArray(value)) {
      setSelectedValues(value);
      setAvailableExtraOptions(
        extraOptions.filter(opt => !value.includes(opt.value)),
      );
    }
  }, [value, extraOptions]);

  const handleSelect = (selectedValue: string) => {
    const updated = [...selectedValues, selectedValue];
    setSelectedValues(updated);
    setAvailableExtraOptions(prev =>
      prev.filter(opt => opt.value !== selectedValue),
    );
    onChange(updated);
  };

  const handleCheckboxChange = (optionValue: string) => {
    let updatedSelected: string[];
    if (selectedValues.includes(optionValue)) {
      updatedSelected = selectedValues.filter(val => val !== optionValue);

      if (extraOptions.some(opt => opt.value === optionValue)) {
        const restored = extraOptions.find(opt => opt.value === optionValue);
        if (restored) {
          setAvailableExtraOptions(prev => [...prev, restored]);
        }
      }
    } else {
      updatedSelected = [...selectedValues, optionValue];
      setAvailableExtraOptions(prev =>
        prev.filter(opt => opt.value !== optionValue),
      );
    }

    setSelectedValues(updatedSelected);
    onChange(updatedSelected); // trigger validation
  };

  return (
    <div className="space-y-4">
      {/* Checkboxes */}
      <div className="space-y-2">
        {[...fixedOptions, ...extraOptions.filter(opt => selectedValues.includes(opt.value))].map(
          option => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={option.label}
                checked={selectedValues.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
              />
              <label htmlFor={option.label}>{option.label}</label>
            </div>
          ),
        )}
      </div>

      {/* Dropdown */}
      {availableExtraOptions.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              handleSelect(val);
            }
          }}
          className="p-2 border rounded-md"
        >
          <option value="" disabled>
            {field.label || 'Add more options...'}
          </option>
          {availableExtraOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default DynamicCheckboxDropdownField;
