import { Check } from 'lucide-react';

type SidebarProps = {
  steps: { title: string }[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (index: number) => void;
};

export default function Sidebar({ steps, currentStep, completedSteps, onStepClick }: SidebarProps) {
  return (
    <div className="w-16 sm:w-64">
      <ul className="space-y-2 sm:space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = currentStep === index;
          const isClickable = isCompleted || isActive;

          const iconColor = isCompleted
            ? 'bg-green-500 text-white border-green-500'
            : isActive
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-gray-100 text-gray-500 border-gray-300';

          return (
            <li key={step.title}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={`flex items-center gap-3 w-full px-2 py-2 sm:px-4 sm:py-3 rounded-lg transition
                  ${isActive ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700'}
                  ${!isClickable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}
                `}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 shrink-0 ${iconColor}`}
                >
                  <span className="text-sm sm:hidden">{index + 1}</span>
                  <span className="hidden sm:block">
                    {isCompleted
                      ? (
                          <Check className="w-4 h-4" strokeWidth={3} />
                        )
                      : (
                          <span className="text-sm">{index + 1}</span>
                        )}
                  </span>
                </div>

                <span className="text-sm hidden sm:inline-block leading-none">{step.title}</span>
              </button>
            </li>
          );
        })}

        {/* Review tab */}
        <li key="review tab">
          <button
            type="button"
            disabled={steps.length !== completedSteps.length}
            className={`flex items-center gap-3 w-full px-2 py-2 sm:px-4 sm:py-3 rounded-lg transition
              ${steps.length === completedSteps.length ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700'}
              ${steps.length !== completedSteps.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}
            `}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 shrink-0 ${
                steps.length === completedSteps.length
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-gray-100 text-gray-500 border-gray-300'
              }`}
            >
              <span className="text-sm sm:hidden">R</span>
              <span className="hidden sm:block">
                {steps.length === completedSteps.length
                  ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    )
                  : (
                      <span className="text-xs">R</span>
                    )}
              </span>
            </div>

            <span className="text-sm hidden sm:inline-block leading-none">Review</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
