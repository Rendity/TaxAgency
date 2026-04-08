'use client';

import type { z } from 'zod';
import type { Field, QuestionnaireProps } from './types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { formSchema as getFormSchema } from './formSchema';
import Review from './Review';
import Sidebar from './Sidebar';
import StepForm from './StepForm';
import ThankYou from './ThankYou';
import { toast } from 'react-toastify';

type FormData = z.infer<ReturnType<typeof getFormSchema>>;

export default function Questionnaire({ steps, client, company, doubleEntry, companyType }: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);

  const schema = useMemo<ReturnType<typeof getFormSchema>>(
    () => getFormSchema(`${client}_${company}`, companyType, doubleEntry),

    [client, company, companyType, doubleEntry],
  );

  const methods = useForm({
    resolver: zodResolver(schema),
    // defaultValues: {
    //   accounts: [
    //     {
    //       firstName: 'Shahbaz Ali Khan',
    //       lastName: 'Imrani',
    //       email: 'ishahbaz4.pk@gmail.com',
    //       operatingSystem: 'windows',
    //     },
    //     // {
    //     //   firstName: 'Habib Ali Khan',
    //     //   lastName: 'Imrani',
    //     //   email: 'habib4.pk@gmail.com',
    //     //   operatingSystem: 'macos',
    //     // },
    //   ],
    //   // outgoingInvoices: 'No',
    //   incomingInvoices: 'No',
    //   recurringBills: 'No',
    //   bankFileObtain: 'Yes',
    //   ibans: [
    //     {
    //       value: 'DE89370400440532013000',
    //     },
    //     {
    //       value: 'DE89370400440532013001',
    //     },
    //   ],
    //   // filingCategories: ['Kaufverträge', 'India', 'USA', 'Germany'],
    //   payrollAccounting: 'No',
    //   agmSettlements: 'No',
    //   // person: [
    //   //   {
    //   //     firstName: 'Mahboob Ali Khan',
    //   //     lastName: 'Imrani',
    //   //   },
    //   //   {
    //   //     firstName: 'Mansoor Ali Khan',
    //   //     lastName: 'Imrani',
    //   //   },
    //   // ],
    //   ccFileObtain: 'Yes',
    //   creditCards: [
    //     {
    //       value: '1234 5678 9012 3456',
    //     },
    //     {
    //       value: '9876 5432 1098 7654',
    //     },
    //   ],
    //   paypal: 'No',
    //   cashrecipiets: 'No',
    //   cashDesk: 'No',
    //   inventory: 'No',
    // },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    register,
    trigger,
  } = methods;

  useEffect(() => {
    setValue('clientId', client);
    setValue('companyName', company);
    setValue('doubleEntry', doubleEntry);
  }, [client, company, doubleEntry, setValue]);

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    try {
      setIsSubmitting(true);

      data.creditCards = data.creditCards?.map((card: { value: string }) => ({
        value: card.value.replace(/\s+/g, ''),
      }));
      data.ibans = data.ibans?.map((iban: { value: string }) => ({
        value: iban.value.replace(/\s+/g, ''),
      }));

      const response = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result?.message || response.statusText || 'Etwas ist schief gelaufen');
      } else {
        setSubmitted(true);
        toast.success('Fragebogen erfolgreich übermittelt!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Unerwarteter Fehler');
      console.error('Unexpected error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    // Get field names for current step
    const fieldNames = steps[currentStep]?.fields.map((f: Field) => f.name) as (keyof FormData)[];

    // First validate current step's fields
    await trigger(fieldNames);

    // Then run full validation to trigger schema-level refinements
    await methods.trigger();

    // Check if there are any validation errors for the current step's fields
    const currentStepErrors = fieldNames.some(fieldName => !!errors[fieldName as keyof typeof errors]);

    if (!currentStepErrors) {
      // No errors - proceed to next step
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setValidationAttempted(false); // Reset for next step

      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
    } else {
      // There are errors - show them by setting validationAttempted to true
      setValidationAttempted(true);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (completedSteps.includes(index) || index === currentStep) {
      setCurrentStep(index);
    } else if (index === completedSteps.length) {
      // Allow navigation to the next step if it's the immediate next step
      setCurrentStep(index);
    }
  };

  if (submitted) {
    return <ThankYou />;
  }

  return (
    <div className="flex space-x-6 py-8 items-start">
      <Sidebar
        currentStep={currentStep}
        steps={steps}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
        <FormProvider {...methods}>
          {currentStep <= steps.length + 1 && steps[currentStep]
            ? (
                <StepForm
                  step={steps[currentStep]}
                  control={control}
                  errors={errors}
                  onNext={nextStep}
                  onPrevious={previousStep}
                  setValue={setValue}
                  register={register}
                  validationAttempted={validationAttempted}
                />
              )
            : (
                <Review
                  steps={steps}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit(
                    onSubmit,
                    (formErrors) => {
                      const extractMessages = (errors: Record<string, any>): string[] => {
                        const msgs: string[] = [];
                        Object.values(errors).forEach((err) => {
                          if (err?.message && typeof err.message === 'string') {
                            msgs.push(err.message);
                          } else if (typeof err === 'object' && err !== null) {
                            msgs.push(...extractMessages(err));
                          }
                        });
                        return msgs;
                      };
                      const messages = extractMessages(formErrors);
                      toast.error(messages.length > 0
                        ? messages.join('\n')
                        : 'Bitte überprüfen Sie Ihre Eingaben.');
                    },
                  )}
                />
              )}
        </FormProvider>
      </div>
    </div>
  );
}
