import type { Field } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FieldRenderer from '../FieldRenderer';

type PersonFieldProps = {
  name: string; // e.g. 'accounts'
  fields: Field[]; // e.g. [{ name: 'firstName', label: 'First Name' }, ...]
};

export const PersonField = ({ name, fields }: PersonFieldProps) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const { fields: items, append, remove } = useFieldArray({
    control,
    name,
  });

  const handleAdd = () => {
    const emptyPerson = fields.reduce((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {} as Record<string, string>);
    append(emptyPerson);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={item.id} className="p-4 shadow-sm border">
          <CardContent className="p-0 flex flex-col gap-4">
            {fields.map(field => (
              <div key={field.name}>
                <Controller
                  control={control}
                  name={`${name}.${index}.${field.name}`}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <>
                      <FieldRenderer
                        field={field}
                        value={controllerField.value}
                        register={register}
                        uniqueName={`${name}.${index}.${field.name}`}
                        errors={
                          (Array.isArray(errors?.[name])
                            ? (errors?.[name] as any[])
                            : []
                          )?.[index]?.[field.name]
                        }
                        onChange={controllerField.onChange}
                      />
                      {Array.isArray(errors?.[name])
                        && errors?.[name]?.[index]?.[field.name]?.message && (
                        <span className="text-sm text-red-500">
                          {String(
                            (errors[name] as any[])[index]?.[field.name]?.message,
                          )}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>
            ))}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Löschen
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onClick={handleAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Hinzufügen
      </Button>
    </div>
  );
};
