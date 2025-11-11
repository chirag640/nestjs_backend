'use client';

import React, { useState } from 'react';
import { ModelConfig, FieldConfig } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, Copy, Plus, Save } from 'lucide-react';
import { FieldRow } from '@/components/FieldRow';

interface ModelCardProps {
  model: ModelConfig;
  onUpdate: (model: ModelConfig) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function ModelCard({ model, onUpdate, onDelete, onDuplicate }: ModelCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedModel, setEditedModel] = useState<ModelConfig>(model);

  const handleSave = () => {
    onUpdate(editedModel);
    setIsEditing(false);
  };

  const handleAddField = () => {
    const newField: FieldConfig = {
      name: `field${editedModel.fields.length + 1}`,
      type: 'string',
      required: false,
      unique: false,
      index: false,
    };
    setEditedModel({
      ...editedModel,
      fields: [...editedModel.fields, newField],
    });
  };

  const handleUpdateField = (index: number, field: FieldConfig) => {
    const fields = [...editedModel.fields];
    fields[index] = field;
    setEditedModel({ ...editedModel, fields });
  };

  const handleDeleteField = (index: number) => {
    setEditedModel({
      ...editedModel,
      fields: editedModel.fields.filter((_, i) => i !== index),
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{model.name}</CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <Button size="sm" onClick={handleSave} variant="primary">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)} variant="secondary">
                Edit
              </Button>
            )}
            <Button size="sm" onClick={onDuplicate} variant="secondary">
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={onDelete} variant="secondary">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Model Name (PascalCase)</Label>
                <Input
                  value={editedModel.name}
                  onChange={(e) => setEditedModel({ ...editedModel, name: e.target.value })}
                  placeholder="User"
                />
              </div>
              <div>
                <Label>Collection Name (optional)</Label>
                <Input
                  value={editedModel.collectionName || ''}
                  onChange={(e) =>
                    setEditedModel({ ...editedModel, collectionName: e.target.value })
                  }
                  placeholder="users"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`timestamps-${model.name}`}
                checked={editedModel.timestamps}
                onChange={(e) => setEditedModel({ ...editedModel, timestamps: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor={`timestamps-${model.name}`}>Enable createdAt/updatedAt</Label>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-zinc-200">Fields</h4>
                <Button size="sm" onClick={handleAddField} variant="primary">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-2">
                {editedModel.fields.map((field, index) => (
                  <FieldRow
                    key={index}
                    field={field}
                    onUpdate={(updated: FieldConfig) => handleUpdateField(index, updated)}
                    onDelete={() => handleDeleteField(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">
              Collection: <span className="text-white">{model.collectionName || model.name}</span>
            </p>
            <p className="text-sm text-zinc-400">
              Timestamps: <span className="text-white">{model.timestamps ? 'Yes' : 'No'}</span>
            </p>
            <p className="text-sm text-zinc-400">
              Fields: <span className="text-white">{model.fields.length}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
