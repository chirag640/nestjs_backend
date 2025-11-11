'use client';

import React from 'react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

interface TextareaGroupProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  className?: string;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

export function TextareaGroup({
  label,
  name,
  error,
  required,
  className,
  textareaProps,
}: TextareaGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea id={name} {...textareaProps} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
