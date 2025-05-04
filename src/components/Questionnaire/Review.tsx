/* eslint-disable react/no-array-index-key */
import type { FC } from 'react';
import type { PersonFieldProps, Step } from './types';
import { useFormContext } from 'react-hook-form';

const maskValue = (value: string) => `${value.slice(0, 2)}************${value.slice(-4)}`;

type Props = {
  steps: Step[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
};

const Review: FC<Props> = ({ steps, onSubmit, isSubmitting }) => {
  const { getValues } = useFormContext();
  const data = getValues();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h3 className="text-2xl font-semibold">Überprüfen Sie Ihre Antworten</h3>

      <div className="space-y-8">
        {steps.map((step, stepIdx) => (
          <div key={stepIdx} className="space-y-4">
            <h4 className="text-xl font-semibold text-blue-700">{step.title}</h4>

            <div className="space-y-2">
              {step.fields.map((field) => {
                const userValue = data[field.name];

                if (userValue === undefined || userValue === null) {
                  return null;
                }

                let displayValue;

                if (Array.isArray(userValue)) {
                  if (field.type === 'person') {
                    displayValue = (
                      <ul>
                        {userValue.map((person: PersonFieldProps, idx) => (
                          <li key={idx}>
                            {person.firstName}
                            {' '}
                            {person.lastName}
                          </li>
                        ))}
                      </ul>
                    );
                  } else {
                    displayValue = (
                      <ul>
                        {userValue.map((value, idx) => (
                          <li key={idx}>{field.type === 'dynamicCheckboxDropdown' ? value : maskValue(value)}</li>
                        ))}
                      </ul>
                    );
                  }
                } else if (typeof userValue === 'boolean') {
                  displayValue = userValue ? 'Yes' : 'No';
                } else {
                  displayValue = String(userValue);
                }

                return (
                  <div key={field.name} className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-700 font-medium">{field.label}</span>
                    <span className="text-gray-500">{displayValue}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full py-3 mt-8 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Senden...' : 'Abschicken'}
      </button>
    </form>
  );
};

export default Review;
