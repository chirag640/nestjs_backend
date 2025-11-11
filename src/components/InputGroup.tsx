'use client';

import React from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface InputGroupProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export function InputGroup({
  label,
  name,
  error,
  required,
  className,
  inputProps,
}: InputGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input id={name} {...inputProps} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
