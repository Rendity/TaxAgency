import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

type PaymentProvidersFieldProps = {
  name: string;
  label: string;
  translations?: {
    paypal?: string;
    addButton?: string;
    confirmButton?: string;
    placeholder?: string;
  };
};

export const PaymentProvidersField = ({ name, label, translations }: PaymentProvidersFieldProps) => {
  const {
    control,
    setValue,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const [showAddInput, setShowAddInput] = useState(false);
  const [newProvider, setNewProvider] = useState('');
  const initializedRef = useRef(false);

  const watchedFields = useWatch({ name });

  const paypalLabel = translations?.paypal || 'PayPal';
  const addButtonLabel = translations?.addButton || '+ Hinzufügen';
  const confirmButtonLabel = translations?.confirmButton || 'Bestätigen';
  const placeholderText = translations?.placeholder || 'Zahlungsdienstleister eingeben';

  // Ensure PayPal is always present and only once
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    // Check if PayPal already exists
    const hasPayPal = fields.some((field: any) => field.name === paypalLabel);

    if (!hasPayPal) {
      append({ name: paypalLabel, checked: false });
    }

    initializedRef.current = true;
  }, [fields, paypalLabel, append]); // Re-run when fields length changes

  // Filter out duplicate PayPal entries when rendering
  const uniqueFields = fields.filter((field: any, index: number, self: any[]) =>
    index === self.findIndex(f => f.name === field.name),
  );

  const handleAddProvider = () => {
    if (newProvider.trim()) {
      append({ name: newProvider.trim(), checked: true });
      setNewProvider('');
      setShowAddInput(false);
    }
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const fieldName = `${name}.${index}.checked`;
    setValue(fieldName, checked);

    // If unchecked and it's a custom provider (not PayPal), remove it
    const field = fields[index] as any;
    if (!checked && field?.name !== paypalLabel) {
      setTimeout(() => remove(index), 0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="font-medium">{label}</div>
      {uniqueFields.map((field: any, _uniqueIndex: number) => {
        // Find the original index in the fields array
        const originalIndex = fields.findIndex(f => f.id === field.id);

        return (
          <div key={field.id} className="flex items-center gap-3">
            <Checkbox
              id={`${name}-${originalIndex}`}
              checked={watchedFields?.[originalIndex]?.checked || false}
              onChange={e => handleCheckboxChange(originalIndex, e.target.checked)}
            />
            <label
              htmlFor={`${name}-${originalIndex}`}
              className="text-sm cursor-pointer flex-1"
            >
              {field.name}
            </label>
            {field.name !== paypalLabel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(originalIndex)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        );
      })}
      {showAddInput
        ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={newProvider}
                onChange={e => setNewProvider(e.target.value)}
                placeholder={placeholderText}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProvider();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddProvider}
                className="bg-blue-600 text-white"
              >
                {confirmButtonLabel}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddInput(false);
                  setNewProvider('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )
        : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddInput(true)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {addButtonLabel.replace('+ ', '')}
            </Button>
          )}
    </div>
  );
};
