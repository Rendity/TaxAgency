/* eslint-disable react/no-array-index-key */
import type { FieldErrors } from 'react-hook-form';
import type { FC } from 'react';
import type { Step } from './types';
import { useFormContext } from 'react-hook-form';

const maskValue = (value: string) => {
  const clean = value.replace(/\s+/g, '');
  return `${clean.slice(0, 2)}************${clean.slice(-4)}`;
};

type Props = {
  steps: Step[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  errors: FieldErrors<any>;
  reviewSubmitAttempted: boolean;
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

const getStepErrorFieldNames = (step: Step, errors: FieldErrors<any>): string[] => {
  const fieldNames: string[] = [];
  for (const field of step.fields) {
    if (field.type === 'message') {
      continue;
    }
    if (errors[field.name]) {
      fieldNames.push(field.name);
    }
    // Check nested array errors (e.g. accounts.0.firstName)
    if (field.fields) {
      const arr = errors[field.name];
      if (Array.isArray(arr)) {
        arr.forEach((item: any, idx: number) => {
          if (item) {
            Object.keys(item).forEach((subField) => {
              if (item[subField]?.message) {
                fieldNames.push(`${field.name}.${idx}.${subField}`);
              }
            });
          }
        });
      }
    }
  }
  return fieldNames;
};

const getFieldError = (fieldName: string, errors: FieldErrors<any>): string | undefined => {
  const err = errors[fieldName];
  if (err?.message) {
    return err.message as string;
  }
  // Check nested errors for array fields
  if (Array.isArray(err)) {
    const messages: string[] = [];
    err.forEach((item: any) => {
      if (item) {
        Object.values(item).forEach((sub: any) => {
          if (sub?.message) {
            messages.push(sub.message as string);
          }
        });
      }
    });
    return messages.length > 0 ? messages[0] : undefined;
  }
  return undefined;
};

const Review: FC<Props> = ({ steps, onSubmit, isSubmitting, errors, reviewSubmitAttempted }) => {
  const { getValues } = useFormContext();
  const data = getValues();

  const hasErrors = reviewSubmitAttempted && Object.keys(errors).length > 0;

  // Build list of steps with errors for the summary banner
  const stepsWithErrors = hasErrors
    ? steps
        .filter((step) => {
          if (step.id === 0) {
            return false;
          }
          return getStepErrorFieldNames(step, errors).length > 0;
        })
        .map(step => step.title)
    : [];

  return (
    <form onSubmit={onSubmit}>
      <h3 className="text-3xl font-bold text-gray-800 mb-4">Überprüfen Sie Ihre Antworten</h3>

      {/* Error summary banner */}
      {hasErrors && stepsWithErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Pflichtfelder fehlen in folgenden Schritten:
              </p>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {stepsWithErrors.map(title => (
                  <li key={title}>{title}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {steps.map((step, stepIdx) => {
          // Skip welcome step
          if (step.id === 0) {
            return null;
          }

          const stepErrorFields = reviewSubmitAttempted
            ? getStepErrorFieldNames(step, errors)
            : [];
          const stepHasErrors = stepErrorFields.length > 0;

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

          if (visibleFields.length === 0 && !stepHasErrors) {
            return null;
          }

          return (
            <div key={stepIdx} className={`relative border rounded-lg p-6 bg-white shadow-sm mt-6 ${stepHasErrors ? 'border-red-300' : 'border-gray-300'}`}>
              <div className="absolute -top-4 left-4 bg-white px-2 text-gray-700 text-lg font-semibold flex items-center gap-2">
                {step.title}
                {stepHasErrors && (
                  <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Pflichtfeld fehlt
                  </span>
                )}
              </div>

              <div className="pt-2">
                {visibleFields.map((field) => {
                  const value = data[field.name];
                  const label = (visibleFields.length === 1 && step.description)
                    ? step.description
                    : field.label;

                  // Check if this specific field has an error
                  const fieldError = reviewSubmitAttempted
                    ? getFieldError(field.name, errors)
                    : undefined;

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
                    const hasGrantAccess = grantAccess && grantAccess !== '';
                    if (entries.length === 0 && !hasGrantAccess) {
                      return null;
                    }
                    return (
                      <div key={field.name} className="py-1 border-b border-gray-100 last:border-0 text-sm text-gray-700">
                        <span className="font-medium block mb-1">{label}</span>
                        {entries.length > 0 && (
                          <ul className="list-disc list-inside text-gray-600 pl-1">
                            {entries.map((e: string, i: number) => <li key={i}>{e}</li>)}
                          </ul>
                        )}
                        {hasGrantAccess && (
                          <div className="mt-1 text-gray-600">
                            Zugriff:
                            {' '}
                            <YesNo value={grantAccess!} />
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

                  // --- iban / creditcard: array of { value, advisorName?, advisorContact? } ---
                  if ((field.type === 'iban' || field.type === 'creditcard') && Array.isArray(value)) {
                    if (value.length === 0) {
                      return null;
                    }
                    const hasAdvisor = value.some(
                      (item: any) => item.advisorName || item.advisorContact,
                    );
                    return (
                      <div key={field.name} className="py-1 border-b border-gray-100 last:border-0 text-sm text-gray-700">
                        <span className="font-medium block mb-1">{label}</span>
                        {hasAdvisor
                          ? (
                              <div className="space-y-2 pl-1">
                                {value.map((item: any, i: number) => (
                                  <div key={i} className="border rounded-md p-2 bg-gray-50">
                                    <span className="font-mono">{typeof item?.value === 'string' ? maskValue(item.value) : String(item)}</span>
                                    {(item.advisorName || item.advisorContact) && (
                                      <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                                        {item.advisorName && (
                                          <div>
                                            Betreuer:
                                            {item.advisorName}
                                          </div>
                                        )}
                                        {item.advisorContact && (
                                          <div>
                                            Kontakt:
                                            {item.advisorContact}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )
                          : (
                              <ul className="list-disc list-inside text-gray-600 pl-1">
                                {value.map((item: { value: string }, i: number) => (
                                  <li key={i}>{typeof item?.value === 'string' ? maskValue(item.value) : String(item)}</li>
                                ))}
                              </ul>
                            )}
                      </div>
                    );
                  }

                  // --- boolean ---
                  if (typeof value === 'boolean') {
                    return (
                      <div key={field.name}>
                        <Row label={label}>
                          {value ? 'Ja' : 'Nein'}
                        </Row>
                        {fieldError && (
                          <p className="text-sm text-red-500">{fieldError}</p>
                        )}
                      </div>
                    );
                  }

                  // --- radio / text / email: plain string ---
                  return (
                    <div key={field.name}>
                      <Row label={label}>
                        <YesNo value={String(value)} />
                      </Row>
                      {fieldError && (
                        <p className="text-sm text-red-500">{fieldError}</p>
                      )}
                    </div>
                  );
                })}

                {/* Show errors for fields that are required but have no value (not in visibleFields) */}
                {stepHasErrors && stepErrorFields
                  .filter(errFieldName => !visibleFields.some(f => f.name === errFieldName))
                  .map((errFieldName) => {
                    const fieldDef = step.fields.find(f => f.name === errFieldName);
                    const fieldLabel = fieldDef?.label || errFieldName;
                    const fieldError = getFieldError(errFieldName, errors);
                    return (
                      <div key={errFieldName} className="py-1 border-b border-gray-100 last:border-0 text-sm">
                        <div className="grid grid-cols-8 gap-2 items-start text-gray-400">
                          <span className="col-span-5 font-medium">{fieldLabel}</span>
                          <span className="col-span-3 text-right italic">— fehlt —</span>
                        </div>
                        {fieldError && (
                          <p className="text-sm text-red-500">{fieldError}</p>
                        )}
                      </div>
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
