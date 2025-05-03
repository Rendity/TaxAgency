'use client';

import { useState } from 'react';

const steps = [
  { step: 1, questions: ['What is your name?', 'What is your age?'] },
  { step: 2, questions: ['What is your favorite color?'] },
  { step: 3, questions: [] },
  { step: 4, questions: ['Do you have any pets?'] },
  { step: 5, questions: ['Where do you live?'] },
  { step: 6, questions: ['What is your occupation?'] },
  { step: 7, questions: ['Do you like traveling?'] },
  { step: 8, questions: ['What languages do you speak?'] },
  { step: 9, questions: ['What is your dream job?'] },
  { step: 10, questions: ['Any additional comments?'] },
];

export default function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(1);

  // const t = useTranslations('Questionnaire');

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const selectedStep = steps.find(s => s.step === currentStep);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4">
        <h2 className="text-lg font-semibold mb-4">Steps</h2>
        <ul className="space-y-2">
          {steps.map(s => (
            <li key={s.step}>
              <button
                type="button"
                onClick={() => handleStepClick(s.step)}
                className={`w-full text-left p-2 rounded ${
                  currentStep === s.step ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                }`}
              >
                Step
                {s.step}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">
          Step
          {currentStep}
        </h1>

        {selectedStep?.questions.length
          ? (
              <div className="space-y-4">
                {selectedStep.questions.map(question => (
                  <div key={question}>
                    <label className="block text-gray-700 font-medium mb-2">{question}</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="Your answer"
                    />
                  </div>
                ))}
              </div>
            )
          : (
              <p>No questions for this step.</p>
            )}
      </div>
    </div>
  );
}
