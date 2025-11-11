'use client';

import React from 'react';
import { FieldConfig } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface FieldRowProps {
  field: FieldConfig;
  onUpdate: (field: FieldConfig) => void;
  onDelete: () => void;
}

export function FieldRow({ field, onUpdate, onDelete }: FieldRowProps) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="col-span-3">
        <Input
          value={field.name}
          onChange={(e) => onUpdate({ ...field, name: e.target.value })}
          placeholder="fieldName"
          className="h-10"
        />
      </div>

      <div className="col-span-2">
        <Select
          value={field.type}
          onChange={(e) => onUpdate({ ...field, type: e.target.value as FieldConfig['type'] })}
          options={['string', 'number', 'boolean', 'date', 'objectId', 'array', 'embedded']}
          className="h-10"
        />
      </div>

      <div className="col-span-1 flex justify-center">
        <input
          type="checkbox"
          checked={field.required || false}
          onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
          className="w-4 h-4"
          title="Required"
        />
      </div>

      <div className="col-span-1 flex justify-center">
        <input
          type="checkbox"
          checked={field.unique || false}
          onChange={(e) => onUpdate({ ...field, unique: e.target.checked })}
          className="w-4 h-4"
          title="Unique"
        />
      </div>

      <div className="col-span-1 flex justify-center">
        <input
          type="checkbox"
          checked={field.index || false}
          onChange={(e) => onUpdate({ ...field, index: e.target.checked })}
          className="w-4 h-4"
          title="Indexed"
        />
      </div>

      <div className="col-span-3">
        <Input
          value={field.defaultValue?.toString() || ''}
          onChange={(e) => {
            let value: string | number | boolean | null = e.target.value;
            if (field.type === 'number' && value) {
              value = parseFloat(value);
            } else if (field.type === 'boolean') {
              value = value === 'true';
            }
            onUpdate({ ...field, defaultValue: value });
          }}
          placeholder="default"
          className="h-10"
        />
      </div>

      <div className="col-span-1 flex justify-center">
        <Button size="sm" onClick={onDelete} variant="secondary" className="h-10 w-10 p-0">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
