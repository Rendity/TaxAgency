/* eslint-disable react-dom/no-dangerously-set-innerhtml */
import type { StepFormProps } from './types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Controller } from 'react-hook-form';
import FieldRenderer from './FieldRenderer';

export default function StepForm({
  step,
  control,
  errors,
  onNext,
  onPrevious,
  register,
}: StepFormProps) {
  // Only track validation state of current step's fields

  const isPreviousDisabled = step.id === 1; // You can change logic if needed
  const isNextDisabled = false;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
        <div
          className="text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: step.description }}
        />
      </div>

      <div className="space-y-6">
        {step.fields.map(field => (
          <div key={field.name} className="flex flex-col space-y-1">
            {(field.description && field.type === 'radio' && field.name === 'operatingSystem') && (
              <div
                className="text-sm text-gray-600"
                dangerouslySetInnerHTML={{ __html: field.description }}
              />
            )}
            {(field.description && (field.name === 'incomingInvoices' || field.name === 'recurringBills')) && (
              <>
                <h2 className="text-xl font-bold mb-0">{field.label}</h2>
                <div
                  className="text-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: field.description }}
                />
              </>
            )}
            <Controller
              control={control}
              name={field.name}
              rules={field.validation}
              render={({ field: controllerField }) => (
                <>
                  <FieldRenderer
                    field={field}
                    value={controllerField.value}
                    register={register}
                    errors={errors}
                    onChange={controllerField.onChange}
                  />
                  {errors[field.name] && (
                    <span className="text-sm text-red-500">{errors[field.name]?.message}</span>
                  )}
                </>
              )}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-8">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className={`
            inline-flex items-center gap-2 px-6 py-2 rounded-full font-medium transition
            ${isPreviousDisabled
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400'}
          `}
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className={`
            inline-flex items-center gap-2 px-6 py-2 rounded-full font-medium transition
            ${isNextDisabled
      ? 'bg-blue-100 text-blue-300 cursor-not-allowed'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
          `}
        >
          Next
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
