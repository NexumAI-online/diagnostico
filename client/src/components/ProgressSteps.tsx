import React from 'react';

interface Step {
  label: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'text-white'
                    : isCurrent
                    ? 'text-accent border border-accent'
                    : 'bg-gray-800 text-gray-600 border border-gray-700'
                }`}
                style={
                  isCompleted
                    ? { background: 'linear-gradient(135deg, #F239FF 0%, #8943E3 100%)' }
                    : isCurrent
                    ? {
                        background: 'rgba(242,57,255,0.15)',
                        boxShadow: '0 0 12px rgba(242,57,255,0.4)',
                      }
                    : {}
                }
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.label
                )}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1 transition-all duration-300"
                style={{
                  background: isCompleted
                    ? 'linear-gradient(90deg, #F239FF 0%, #8943E3 100%)'
                    : 'rgba(255,255,255,0.1)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
