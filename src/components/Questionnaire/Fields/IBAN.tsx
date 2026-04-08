import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatIban } from '@/utils/Helpers';

type IBANFieldProps = {
  name: string;
  /** The form field name to watch for the trigger condition. Defaults to 'bankFileObtain'. */
  triggerField?: string;
  /** The value of triggerField that activates this IBAN list. Defaults to 'No'. */
  triggerValue?: string;
  /** Label for the add button. Defaults to 'IBAN hinzufügen'. */
  addLabel?: string;
  /** When true, each card also shows advisor name + contact fields below the IBAN input. */
  withAdvisor?: boolean;
  /** Label for the advisor name input. */
  advisorNameLabel?: string;
  /** Label for the advisor contact input. */
  advisorContactLabel?: string;
};

export const IBANField = ({
  name,
  triggerField = 'bankFileObtain',
  triggerValue = 'No',
  addLabel = 'IBAN hinzufügen',
  withAdvisor = false,
  advisorNameLabel = 'Name des Bankbetreuers',
  advisorContactLabel = 'Telefon / E-Mail des Bankbetreuers',
}: IBANFieldProps) => {
  const {
    register,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const ibanErrors = errors?.[name];

  const handleAdd = () =>
    withAdvisor
      ? append({ value: '', advisorName: '', advisorContact: '' })
      : append({ value: '' });

  const watchedValue = useWatch({ name: triggerField });
  const isActive = watchedValue === triggerValue;

  useEffect(() => {
    if (isActive && fields.length === 0) {
      withAdvisor
        ? append({ value: '', advisorName: '', advisorContact: '' })
        : append({ value: '' });
    } else if (!isActive && fields.length > 0) {
      fields.forEach((_, index) => remove(index));
    }
  }, [isActive, fields, append, remove, withAdvisor]);

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const ibanFieldName = `${name}.${index}.value` as const;
        const advisorNameFieldName = `${name}.${index}.advisorName` as const;
        const advisorContactFieldName = `${name}.${index}.advisorContact` as const;
        const errorMessage = (ibanErrors as any[] | undefined)?.[index]?.value?.message as string | undefined;

        return (
          <Card key={field.id} className="p-4 shadow-sm border">
            <CardContent className="p-0 space-y-3">
              {/* IBAN row */}
              <div className="flex items-center gap-1">
                <Input
                  {...register(ibanFieldName)}
                  placeholder="DE44 1234 1234 1234 1234 00"
                  onChange={(e) => {
                    const formatted = formatIban(e.target.value);
                    setValue(ibanFieldName, formatted, { shouldValidate: true });
                    trigger(ibanFieldName);
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              {errorMessage && (
                <span className="text-sm text-red-500">{errorMessage}</span>
              )}

              {/* Advisor fields — side by side, inside the same card */}
              {withAdvisor && (
                <div className="flex gap-3 pt-1 border-t border-gray-100">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">{advisorNameLabel}</label>
                    <Input
                      {...register(advisorNameFieldName)}
                      placeholder={advisorNameLabel}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">{advisorContactLabel}</label>
                    <Input
                      {...register(advisorContactFieldName)}
                      placeholder={advisorContactLabel}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {isActive && (
        <Button
          type="button"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          {addLabel}
        </Button>
      )}
    </div>
  );
};
