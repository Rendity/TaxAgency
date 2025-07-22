import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCreditCard } from '@/utils/Helpers';

type CCFieldProps = {
  name: string;
};

export const CreditCardField = ({ name }: CCFieldProps) => {
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

  const ccErrors = errors?.[name];
  const handleAdd = () => append({ value: '' });

  const ccFileObtain = useWatch({ name: 'ccFileObtain' });
  useEffect(() => {
    if (ccFileObtain === 'Yes' && fields.length === 0) {
      append({ value: '' });
    } else if (ccFileObtain !== 'Yes' && fields.length > 0) {
      fields.map((_, index) => remove(index)); // Clear all fields if 'No' is selected
    }
  }, [ccFileObtain, fields, append, remove]);

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const fieldName = `${name}.${index}.value` as const;
        const errorMessage = (ccErrors as any[] | undefined)?.[index]?.value?.message as string | undefined;

        return (
          <Card key={field.id} className="p-4 shadow-sm border">
            <CardContent className="p-0 flex items-center gap-1">
              <Input
                {...register(fieldName)}
                placeholder="1234 5678 9012 3456"
                onChange={(e) => {
                  const formatted = formatCreditCard(e.target.value);
                  setValue(fieldName, formatted, { shouldValidate: true });
                  trigger(fieldName);
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
            </CardContent>

            {errorMessage && (
              <span className="text-sm text-red-500 mt-1">{errorMessage}</span>
            )}
          </Card>
        );
      })}
      <Button type="button" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onClick={handleAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Kreditkarte
      </Button>
    </div>
  );
};
