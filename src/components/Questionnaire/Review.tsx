/* eslint-disable react/no-array-index-key */
import type { FC } from 'react';
import type { Step } from './types';
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
    <form onSubmit={onSubmit}>
      <h3 className="text-3xl font-bold text-gray-800 mb-4">Überprüfen Sie Ihre Antworten</h3>

      <div className="space-y-6">
        {steps.map((step, stepIdx) => (
          <div key={stepIdx} className="border rounded-lg p-6 bg-gray-50">
            <h4 className="text-2xl font-semibold text-blue-700 mb-4">{step.title}</h4>

            <div className="space-y-4">
              {step.fields.map((field) => {
                const userValue = data[field.name];
                if (userValue === undefined || userValue === null) {
                  return null;
                }

                let displayValue;
                let skipLabel = false;
                const isBoolean = typeof userValue === 'boolean';

                if (Array.isArray(userValue)) {
                  if (field.type === 'person' && userValue.length > 0) {
                    const firstRow = userValue[0];
                    skipLabel = true;
                    displayValue = (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600 border">
                          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                            <tr>
                              {Object.keys(firstRow).map(key => (
                                <th key={key} className="px-4 py-2 border">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {userValue.map((person: Record<string, any>, idx: number) => (
                              <tr key={idx} className="bg-white border-t">
                                {Object.values(person).map((value, i) => (
                                  <td key={i} className="px-4 py-2 border">
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  } else {
                    skipLabel = true;
                    displayValue = (
                      <ul className="list-disc list-inside text-gray-600">
                        {userValue.map((value, idx) => (
                          <li key={idx}>
                            {field.type === 'multiCheckbox' ? value : maskValue(value.value)}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                } else if (isBoolean) {
                  displayValue = userValue ? 'Yes' : 'No';
                } else {
                  displayValue = String(userValue);
                }

                if (!skipLabel) {
                  return (
                    <div
                      key={field.name}
                      className={`flex justify-between items-center text-sm text-gray-700 ${
                        isBoolean ? '' : 'pb-2'
                      }`}
                    >
                      <span className="font-medium">{field.label}</span>
                      <span className="text-gray-600">{displayValue}</span>
                    </div>
                  );
                }

                return (
                  <div key={field.name} className="text-sm text-gray-700">
                    {displayValue}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full py-3 mt-6 bg-blue-600 text-white text-lg font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
          </svg>
        )}
        {isSubmitting ? 'Senden...' : 'Abschicken'}
      </button>
    </form>
  );
};

export default Review;
