/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import type { FieldRendererProps } from '../types';
import { Info, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export const DynamicCheckboxDropdownField = ({
  field,
  value,
  onChange,
}: FieldRendererProps) => {
  const allPredefinedOptions = [
    ...(field.options || []),
    ...(field.extraOptions || []),
  ];

  const [selectedValues, setSelectedValues] = useState<string[]>(() =>
    Array.isArray(value) ? value : [],
  );

  // Custom entries: values not in any predefined option
  const [customEntries, setCustomEntries] = useState<string[]>(() =>
    Array.isArray(value)
      ? value.filter(v => !allPredefinedOptions.some(opt => opt.value === v))
      : [],
  );

  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (Array.isArray(value)) {
      setSelectedValues(value);
      setCustomEntries(
        value.filter(v => !allPredefinedOptions.some(opt => opt.value === v)),
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (showInput) {
      inputRef.current?.focus();
    }
  }, [showInput]);

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const updated = checked
      ? [...selectedValues, optionValue]
      : selectedValues.filter(v => v !== optionValue);
    setSelectedValues(updated);
    onChange(updated);
  };

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || selectedValues.includes(trimmed)) {
      setInputValue('');
      setShowInput(false);
      return;
    }
    const updated = [...selectedValues, trimmed];
    setSelectedValues(updated);
    setCustomEntries(prev => [...prev, trimmed]);
    onChange(updated);
    setInputValue('');
    setShowInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      setInputValue('');
      setShowInput(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Predefined options */}
      {allPredefinedOptions.map(option => (
        <div key={option.value} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`dyncheck-${option.value}`}
            checked={selectedValues.includes(option.value)}
            onChange={e => handleCheckboxChange(option.value, e.target.checked)}
          />
          <label htmlFor={`dyncheck-${option.value}`} className="cursor-pointer">
            {option.label}
          </label>
          {option.tooltip && (
            <span className="group relative inline-flex">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {option.tooltip}
              </span>
            </span>
          )}
        </div>
      ))}

      {/* Custom user-added entries */}
      {customEntries.map(entry => (
        <div key={entry} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`dyncheck-custom-${entry}`}
            checked={selectedValues.includes(entry)}
            onChange={e => handleCheckboxChange(entry, e.target.checked)}
          />
          <label htmlFor={`dyncheck-custom-${entry}`} className="cursor-pointer">
            {entry}
          </label>
        </div>
      ))}

      {/* Add custom entry */}
      {showInput
        ? (
            <div className="flex items-center space-x-2 pt-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Kategorie eingeben"
                className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Hinzufügen
              </Button>
              <button
                type="button"
                onClick={() => {
                  setInputValue('');
                  setShowInput(false);
                }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Abbrechen
              </button>
            </div>
          )
        : (
            <Button
              type="button"
              onClick={() => setShowInput(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Weitere Kategorien hinzufügen
            </Button>
          )}
    </div>
  );
};

export default DynamicCheckboxDropdownField;
