'use client';

import { Info } from 'lucide-react';

const FIXED_OPTIONS = ['Ready2Order', 'TIPOS'];

type CashDeskSystemValue = {
  selected: string[];
  other: string;
  grantAccess: 'Yes' | 'No' | '';
  username: string;
  password: string;
};

type CashDeskSystemFieldProps = {
  name: string;
  value: CashDeskSystemValue;
  onChange: (value: CashDeskSystemValue) => void;
  translations?: Record<string, string>;
  errors?: Record<string, { message?: string } | undefined>;
};

const DEFAULT_VALUE: CashDeskSystemValue = {
  selected: [],
  other: '',
  grantAccess: '',
  username: '',
  password: '',
};

export const CashDeskSystemField = ({ name, value, onChange, translations, errors }: CashDeskSystemFieldProps) => {
  const selected = value?.selected?.[0] ?? '';
  const other = value?.other ?? '';
  const grantAccess = value?.grantAccess ?? '';
  const username = value?.username ?? '';
  const password = value?.password ?? '';

  const t = (key: string, fallback: string) => translations?.[key] ?? fallback;

  const inputClass
    = 'w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  const handleSelect = (option: string) => {
    // Switching system clears credentials
    onChange({
      ...DEFAULT_VALUE,
      selected: [option],
      other: option === '__other__' ? other : '',
    });
  };

  const handleDeselect = () => {
    onChange(DEFAULT_VALUE);
  };

  const update = (patch: Partial<CashDeskSystemValue>) => {
    onChange({ ...DEFAULT_VALUE, ...value, selected: selected ? [selected] : [], ...patch });
  };

  const handleGrantAccess = (val: 'Yes' | 'No') => {
    update({
      grantAccess: val,
      username: val === 'Yes' ? username : '',
      password: val === 'Yes' ? password : '',
    });
  };

  const allOptions = [...FIXED_OPTIONS, '__other__'];
  const hasSelection = selected !== '';

  return (
    <div className="space-y-3">
      {/* Single-select radio list */}
      <div className="flex flex-col gap-3 w-fit">
        {allOptions.map((option) => {
          const isOther = option === '__other__';
          const label = isOther ? 'Andere' : option;
          const isChecked = selected === option;

          return (
            <div key={option} className="flex flex-col gap-3">
              <label
                htmlFor={`cashdesk-${option}`}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl border cursor-pointer transition hover:shadow-sm text-sm font-medium
                  ${isChecked ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
              >
                <input
                  type="radio"
                  id={`cashdesk-${option}`}
                  name={`${name}-system`}
                  checked={isChecked}
                  onChange={() => isChecked ? handleDeselect() : handleSelect(option)}
                  className="w-4 h-4 accent-blue-600"
                />
                {label}
              </label>

              {isOther && isChecked && (
                <input
                  type="text"
                  value={other}
                  onChange={e => update({ other: e.target.value })}
                  placeholder="Name des Kassensystems eingeben"
                  className={inputClass}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Sub-flow: grant access */}
      {hasSelection && (
        <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">
              {t('grantAccess', 'Möchten Sie uns Zugriff zu dem Registrierkassensystem geben?')}
            </p>
            {translations?.grantAccessTooltip && (
              <span className="group relative inline-flex">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {translations.grantAccessTooltip}
                </span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {(['Yes', 'No'] as const).map(val => (
              <label
                key={val}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl border cursor-pointer transition hover:shadow-sm text-sm font-medium
                  ${grantAccess === val ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
              >
                <input
                  type="radio"
                  name={`${name}-grantAccess`}
                  value={val}
                  checked={grantAccess === val}
                  onChange={() => handleGrantAccess(val)}
                  className="w-4 h-4 accent-blue-600"
                />
                {val === 'Yes' ? t('yes', 'Ja') : t('no', 'Nein')}
              </label>
            ))}
          </div>

          {grantAccess === 'Yes' && (
            <div className="space-y-2 mt-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t('username', 'Benutzername')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => update({ username: e.target.value })}
                  placeholder={t('username', 'Benutzername')}
                  className={`${inputClass} ${errors?.username ? 'border-red-500' : ''}`}
                />
                {errors?.username?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t('password', 'Passwort')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => update({ password: e.target.value })}
                  placeholder={t('password', 'Passwort')}
                  className={`${inputClass} ${errors?.password ? 'border-red-500' : ''}`}
                />
                {errors?.password?.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
