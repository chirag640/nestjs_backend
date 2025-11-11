'use client';

import React from 'react';
import { Progress } from './ui/progress';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

export function StepProgress({ currentStep, totalSteps, stepTitle }: StepProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-blue-500">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="text-sm text-zinc-400">{Math.round(percentage)}% Complete</p>
      </div>
      <Progress value={currentStep} max={totalSteps} />
      <h1 className="text-3xl font-bold text-white mt-6 mb-2">{stepTitle}</h1>
    </div>
  );
}
