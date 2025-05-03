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
    mode: 'onChange',
    resolver: zodResolver(formSchema),
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
      data.ibans = data.ibans.map((iban: string) => iban.replace(/\s+/g, ''));
      data.creditCards = data.creditCards.map((card: string) => card.replace(/\s+/g, ''));
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
    const valid = await trigger(steps[currentStep]?.fields.map((f: Field) => f.name) as (keyof typeof formSchema.shape)[]); // Validate current fields
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
