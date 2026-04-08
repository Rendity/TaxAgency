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

type RowProps = { label: string; children: React.ReactNode };
const Row: FC<RowProps> = ({ label, children }) => (
  <div className="grid grid-cols-8 gap-2 items-start text-sm text-gray-700 py-1 border-b border-gray-100 last:border-0">
    <span className="col-span-5 font-medium">{label}</span>
    <span className="col-span-3 text-right text-gray-800">{children}</span>
  </div>
);

const YesNo = ({ value }: { value: string }) =>
  value === 'Yes' ? 'Ja' : value === 'No' ? 'Nein' : value;

const Review: FC<Props> = ({ steps, onSubmit, isSubmitting }) => {
  const { getValues } = useFormContext();
  const data = getValues();

  return (
    <form onSubmit={onSubmit}>
      <h3 className="text-3xl font-bold text-gray-800 mb-4">Überprüfen Sie Ihre Antworten</h3>

      <div className="space-y-6">
        {steps.map((step, stepIdx) => {
          // Skip welcome step
          if (step.id === 0) {
            return null;
          }

          const visibleFields = step.fields.filter((field) => {
            // Skip purely presentational fields
            if (field.type === 'message') {
              return false;
            }
            // Skip hasOnlineShop — only the shop name is shown
            if (field.name === 'hasOnlineShop') {
              return false;
            }
            // Skip ccFileObtain when credit cards are listed (cards tell the story)
            if (field.name === 'ccFileObtain' && Array.isArray(data.creditCards) && data.creditCards.length > 0) {
              return false;
            }
            // Skip cashDesk only when Yes — usesRegisterCash / usesHandCash shown instead
            if (field.name === 'cashDesk' && data.cashDesk === 'Yes') {
              return false;
            }
            // Respect showWhen conditions — skip fields whose conditions aren't met
            if (field.showWhen) {
              const conditions = Array.isArray(field.showWhen) ? field.showWhen : [field.showWhen];
              const conditionsMet = conditions.every((condition: any) => {
                if (condition.or) {
                  return condition.or.some((c: any) => {
                    if (c.exists) {
                      const v = data[c.field];
                      return v !== undefined && v !== null && v !== '';
                    }
                    return data[c.field] === c.value;
                  });
                }
                if (condition.exists) {
                  const v = data[condition.field];
                  return v !== undefined && v !== null && v !== '';
                }
                return data[condition.field] === condition.value;
              });
              if (!conditionsMet) {
                return false;
              }
            }
            // Skip fields with no value
            const v = data[field.name];
            if (v === undefined || v === null || v === '') {
              return false;
            }
            if (Array.isArray(v) && v.length === 0) {
              return false;
            }
            return true;
          });

          if (visibleFields.length === 0) {
            return null;
          }

          return (
            <div key={stepIdx} className="relative border border-gray-300 rounded-lg p-6 bg-white shadow-sm mt-6">
              <div className="absolute -top-4 left-4 bg-white px-2 text-gray-700 text-lg font-semibold">
                {step.title}
              </div>

              <div className="pt-2">
                {visibleFields.map((field) => {
                  const value = data[field.name];
                  const label = (visibleFields.length === 1 && step.description)
                    ? step.description
                    : field.label;

                  // --- paymentProviders: array of { name, checked } ---
                  if (field.type === 'paymentProviders' && Array.isArray(value)) {
                    const checked = value
                      .filter((p: { name: string; checked: boolean }) => p.checked)
                      .map((p: { name: string; checked: boolean }) => p.name);
                    if (checked.length === 0) {
                      return null;
                    }
                    return (
                      <div key={field.name} className="py-1 border-b border-gray-100 last:border-0 text-sm text-gray-700">
                        <span className="font-medium block mb-1">{label}</span>
                        <ul className="list-disc list-inside text-gray-600 pl-1">
                          {checked.map((name: string, i: number) => <li key={i}>{name}</li>)}
                        </ul>
                      </div>
                    );
                  }

                  // --- cashDeskSystem: { selected, other, grantAccess, username } ---
                  if (field.type === 'cashDeskSystem' && value && typeof value === 'object' && !Array.isArray(value)) {
                    const { selected, other, grantAccess, username } = value as {
                      selected: string[];
                      other: string;
                      grantAccess?: string;
                      username?: string;
                    };
                    const entries = [
                      ...selected.filter((s: string) => s !== '__other__'),
                      ...(other ? [other] : []),
                    ];
                    if (entries.length === 0) {
                      return null;
                    }
                    return (
                      <div key={field.name} className="py-1 border-b border-gray-100 last:border-0 text-sm text-gray-700">
                        <span className="font-medium block mb-1">{label}</span>
                        <ul className="list-disc list-inside text-gray-600 pl-1">
                          {entries.map((e: string, i: number) => <li key={i}>{e}</li>)}
                        </ul>
                        {grantAccess && (
                          <div className="mt-1 text-gray-600">
                            Zugriff:
                            {' '}
                            <YesNo value={grantAccess} />
                            {grantAccess === 'Yes' && username && (
                              <span className="ml-2">
                                (
                                {username}
                                )
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // --- multiCheckbox: string[] ---
                  if (field.type === 'multiCheckbox' && Array.isArray(value)) {
                    if (value.length === 0) {
                      return null;
                    }
                    return (
                      <div key={field.name} className="py-1 border-b border-gray-100 last:border-0 text-sm text-gray-700">
                        <span className="font-medium block mb-1">{label}</span>
                        <ul className="list-disc list-inside text-gray-600 pl-1">
                          {value.map((v: string, i: number) => <li key={i}>{v}</li>)}
                        </ul>
                      </div>
                    );
                  }

                  // --- person: array of { firstName, lastName, ... } ---
                  if (field.type === 'person' && Array.isArray(value)) {
                    if (value.length === 0) {
                      return null;
                    }
                    return (
                      <div key={field.name} className="py-1 border-b border-gray-100 last:border-0 text-sm text-gray-700">
                        <span className="font-medium block mb-1">{label}</span>
                        <div className="overflow-x-auto border rounded mt-1">
                          <table className="min-w-full text-sm text-left text-gray-600 border-collapse">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                              <tr>
                                {field.fields?.map(f => (
                                  <th key={f.name} className="px-4 py-2 border">{f.label}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {value.map((person: Record<string, any>, idx: number) => (
                                <tr key={idx} className="bg-white border-t">
                                  {Object.values(person).map((v, i) => (
                                    <td key={i} className="px-4 py-2 border">{String(v)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }

                  // --- iban / creditcard: array of { value } ---
                  if ((field.type === 'iban' || field.type === 'creditcard') && Array.isArray(value)) {
                    if (value.length === 0) {
                      return null;
                    }
                    return (
                      <div key={field.name} className="py-1 border-b border-gray-100 last:border-0 text-sm text-gray-700">
                        <span className="font-medium block mb-1">{label}</span>
                        <ul className="list-disc list-inside text-gray-600 pl-1">
                          {value.map((item: { value: string }, i: number) => (
                            <li key={i}>{typeof item?.value === 'string' ? maskValue(item.value) : String(item)}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  // --- boolean ---
                  if (typeof value === 'boolean') {
                    return (
                      <Row key={field.name} label={label}>
                        {value ? 'Ja' : 'Nein'}
                      </Row>
                    );
                  }

                  // --- radio / text / email: plain string ---
                  return (
                    <Row key={field.name} label={label}>
                      <YesNo value={String(value)} />
                    </Row>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        className="w-full py-3 mt-6 bg-blue-600 text-white text-lg font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
          </svg>
        )}
        {isSubmitting ? 'Senden...' : 'Abschicken'}
      </button>
    </form>
  );
};

export default Review;
