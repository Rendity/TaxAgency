/* eslint-disable react-dom/no-dangerously-set-innerhtml */
import type { StepFormProps } from './types';
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

      <div className="flex justify-between items-center pt-10">
        {/* Previous Button */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800
            ${isPreviousDisabled
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:hover:bg-gray-700 dark:focus:ring-gray-800'
      : ''}
            `}
        >
          <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M13 5H1m0 0l4 4M1 5l4-4" />
          </svg>
          <span className="sr-only">Back</span>
        </button>
        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          type="button"
          className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800
          ${isNextDisabled
      ? 'bg-blue-100 text-blue-300 cursor-not-allowed'
      : ''}
        `}
        >
          <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
          </svg>
          <span className="sr-only">Next</span>
        </button>
      </div>
    </div>
  );
}
