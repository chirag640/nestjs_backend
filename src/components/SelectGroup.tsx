'use client';

import React from 'react';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { cn } from '@/lib/utils';

interface SelectGroupProps {
  label: string;
  name: string;
  options: string[] | { value: string; label: string }[];
  error?: string;
  required?: boolean;
  className?: string;
  selectProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
}

export function SelectGroup({
  label,
  name,
  options,
  error,
  required,
  className,
  selectProps,
}: SelectGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select id={name} options={options} {...selectProps} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
