'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/context/ProjectContext';
import { ModelConfig, modelSchema } from '@/lib/schemas';
import { StepProgress } from '@/components/StepProgress';
import { Button } from '@/components/ui/button';
import { ModelCard } from '@/components/ModelCard';
import { ModelPreview } from '@/components/ModelPreview';
import { Diamond, ArrowLeft, Plus } from 'lucide-react';

export default function ModelsPage() {
  const router = useRouter();
  const { config, addModel, updateModel, deleteModel, duplicateModel, setCurrentStep } =
    useProject();
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddModel = () => {
    const newModel: ModelConfig = {
      name: `Model${(config.models?.length || 0) + 1}`,
      collectionName: '',
      timestamps: true,
      fields: [
        {
          name: 'name',
          type: 'string',
          required: true,
          unique: false,
          index: false,
        },
      ],
    };

    try {
      modelSchema.parse(newModel);
      addModel(newModel);
      setError('');
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || 'Failed to create model';
      setError(errorMessage);
      console.error('Model validation error:', err);
    }
  };

  const handleUpdateModel = (index: number, model: ModelConfig) => {
    try {
      modelSchema.parse(model);
      updateModel(index, model);
      setError('');
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || 'Invalid model data';
      setError(errorMessage);
      console.error('Model validation error:', err);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(2);
    router.push('/database');
  };

  const handleGenerate = async () => {
    if (!config.models || config.models.length === 0) {
      setError('Please add at least one model before generating');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to generate project');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.projectName || 'project'}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating project:', error);
      setError('Failed to generate project. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Diamond className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-semibold text-white">NextGen</h1>
        </div>

        <StepProgress currentStep={3} totalSteps={6} stepTitle="Model Definition" />

        <p className="text-zinc-400 mb-8">
          Define your data models, fields, and relationships. Each model will generate a complete
          CRUD module.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Models</h2>
              <Button onClick={handleAddModel} variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Model
              </Button>
            </div>

            <div className="space-y-4">
              {!config.models || config.models.length === 0 ? (
                <div className="text-center py-12 border border-white/10 rounded-xl bg-white/5">
                  <p className="text-zinc-400 mb-4">No models defined yet</p>
                  <Button onClick={handleAddModel} variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Model
                  </Button>
                </div>
              ) : (
                config.models.map((model, index) => (
                  <ModelCard
                    key={index}
                    model={model}
                    onUpdate={(updated) => handleUpdateModel(index, updated)}
                    onDelete={() => deleteModel(index)}
                    onDuplicate={() => duplicateModel(index)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <ModelPreview config={config} />
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-8">
          <Button type="button" variant="secondary" onClick={handlePrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleGenerate}
            disabled={isGenerating || !config.models || config.models.length === 0}
          >
            {isGenerating ? 'Generating...' : 'Generate Project'}
          </Button>
        </div>
      </div>
    </div>
  );
}
