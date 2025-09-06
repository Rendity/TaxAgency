/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import type { FieldRendererProps } from '../types';
import { useEffect, useMemo, useState } from 'react';

export const DynamicCheckboxDropdownField = ({
  field,
  value,
  onChange,
}: FieldRendererProps) => {
  const fixedOptions = field.options || [];
  const extraOptions = useMemo(() => field.extraOptions || [], [field.extraOptions]);

  const [selectedValues, setSelectedValues] = useState<string[]>(() =>
    Array.isArray(value) ? value : [],
  );
  const [availableExtraOptions, setAvailableExtraOptions] = useState(() =>
    extraOptions.filter(opt => !selectedValues.includes(opt.value)),
  );
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const OTHER_OPTION_VALUE = '__other__';

  useEffect(() => {
    if (Array.isArray(value)) {
      setSelectedValues(value);
      setAvailableExtraOptions(
        extraOptions.filter(opt => !value.includes(opt.value)),
      );
    }
  }, [value, extraOptions]);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === OTHER_OPTION_VALUE) {
      setShowCustomInput(true);
      return;
    }

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
    onChange(updatedSelected);
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || selectedValues.includes(trimmed)) {
      return;
    }

    const updated = [...selectedValues, trimmed];
    setSelectedValues(updated);
    onChange(updated);
    setCustomInput('');
    setShowCustomInput(false);
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

        {/* Custom user-added values as checkboxes */}
        {selectedValues
          .filter(
            val =>
              !fixedOptions.some(opt => opt.value === val)
              && !extraOptions.some(opt => opt.value === val),
          )
          .map(val => (
            <div key={val} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={true}
                onChange={() => handleCheckboxChange(val)}
              />
              <label>{val}</label>
            </div>
          ))}
      </div>

      {/* Always show dropdown */}
      <select
        value=""
        onChange={e => handleSelect(e.target.value)}
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
        <option value={OTHER_OPTION_VALUE}>Andere Auswahl</option>
      </select>

      {/* Input for Other */}
      {showCustomInput && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="Eigene Kategorie"
            className="p-2 border rounded-md"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="px-3 py-2 bg-blue-500 text-white rounded"
          >
            Hinzufügen
          </button>
        </div>
      )}
    </div>
  );
};

export default DynamicCheckboxDropdownField;
