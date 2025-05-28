'use client';

import type { z } from 'zod';
import type { Field, QuestionnaireProps } from './types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { formSchema } from './formSchema';
import Review from './Review';
import Sidebar from './Sidebar';
import StepForm from './StepForm';
import ThankYou from './ThankYou';

export default function Questionnaire({ steps, client, company }: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accounts: [{
        firstName: 'Shahbaz Ali Khan',
        lastName: 'Imrani',
        email: 'shahbaz.pk@gmail.com',
        operatingSystem: 'windows',
      }, {
        firstName: 'Habib Ali Khan',
        lastName: 'Imrani',
        email: 'habib.pk@gmail.com',
        operatingSystem: 'macos',
      }],
      outgoingInvoices: 'Yes',
      incomingInvoices: 'Yes',
      recurringBills: 'Yes',
      bankFileObtain: 'Yes',
      ibans: [
        {
          value: 'DE89370400440532013000',
        },
        {
          value: 'DE89370400440532013001',
        },
      ],
      filingCategories: ['Pakistan', 'India', 'USA', 'Germany'],
      payrollAccounting: 'Yes',
      agmSettlements: 'Yes',
      person: [
        {
          firstName: 'Mahboob Ali Khan',
          lastName: 'Imrani',
        },
        {
          firstName: 'Mansoor Ali Khan',
          lastName: 'Imrani',
        },
      ],
      ccFileObtain: 'Yes',
      creditCards: [
        {
          value: '1234 5678 9012 3456',
        },
        {
          value: '9876 5432 1098 7654',
        },
      ],
      paypal: 'Yes',
      cashDesk: 'Yes',
      inventory: 'Yes',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    register,
    trigger,
  } = methods;
  setValue('clientId', client);
  setValue('companyName', company);
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      // data.ibans = data.ibans.map((iban: string) => iban.replace(/\s+/g, ''));
      data.creditCards = data.creditCards?.map((card: { value: string }) => ({
        value: card.value.replace(/\s+/g, ''),
      }));
      data.ibans = data.ibans?.map((card: { value: string }) => ({
        value: card.value.replace(/\s+/g, ''),
      }));
      const response = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
        // Optionally redirect or show success
      } else {
        console.error('Error:', result.message);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const nextStep = async () => {
    const fieldName = steps[currentStep]?.fields.map((f: Field) => f.name) as (keyof typeof formSchema._def.schema.shape)[];
    const valid = await trigger(fieldName); // Validate current fields
    if (valid) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      // setCurrentStep(12);

      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
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
    }
  };

  if (submitted) {
    return <ThankYou />;
  }

  return (
    <div className="flex space-x-6 py-8">
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
                />
              )
            : (
                <Review steps={steps} isSubmitting={isSubmitting} onSubmit={handleSubmit(onSubmit)} />
              )}
        </FormProvider>
      </div>
    </div>
  );
}
