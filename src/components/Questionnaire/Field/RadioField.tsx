import type { RadioType } from '../types';

export const RadioField = (radioField: RadioType) => {
  const { name, value, label, checked, onChange } = radioField;

  return (
    <label
      htmlFor={`${name}-${value}`}
      className={`
        flex items-center gap-4 px-4 py-3 rounded-xl border 
        ${checked ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'} 
        cursor-pointer transition hover:shadow-sm dark:text-gray-200
      `}
    >
      <input
        type="radio"
        id={`${name}-${value}`}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="w-5 h-5 accent-blue-600 cursor-pointer"
      />
      <span className="text-base font-medium">{label}</span>
    </label>
  );
};

export default RadioField;
