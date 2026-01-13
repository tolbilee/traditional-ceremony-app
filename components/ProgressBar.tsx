'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm font-medium text-gray-600">
        <span>진행 단계</span>
        <span>
          {currentStep} / {totalSteps}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
