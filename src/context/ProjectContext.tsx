'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FullConfig, ModelConfig } from '@/lib/schemas';

const STORAGE_KEY = 'nextgen:projectConfig';

interface ProjectContextType {
  config: Partial<FullConfig>;
  updateConfig: (updates: Partial<FullConfig>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  addModel: (model: ModelConfig) => void;
  updateModel: (index: number, model: ModelConfig) => void;
  deleteModel: (index: number) => void;
  duplicateModel: (index: number) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

function loadFromStorage(): Partial<FullConfig> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveToStorage(config: Partial<FullConfig>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Partial<FullConfig>>(loadFromStorage);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    saveToStorage(config);
  }, [config]);

  const updateConfig = (updates: Partial<FullConfig>) => {
    setConfig((prev: Partial<FullConfig>) => ({ ...prev, ...updates }));
  };

  const addModel = (model: ModelConfig) => {
    setConfig((prev) => ({
      ...prev,
      models: [...(prev.models || []), model],
    }));
  };

  const updateModel = (index: number, model: ModelConfig) => {
    setConfig((prev) => {
      const models = [...(prev.models || [])];
      models[index] = model;
      return { ...prev, models };
    });
  };

  const deleteModel = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      models: (prev.models || []).filter((_, i) => i !== index),
    }));
  };

  const duplicateModel = (index: number) => {
    setConfig((prev) => {
      const models = [...(prev.models || [])];
      const original = models[index];
      const duplicate = { ...original, name: `${original.name}Copy` };
      models.splice(index + 1, 0, duplicate);
      return { ...prev, models };
    });
  };

  return (
    <ProjectContext.Provider
      value={{
        config,
        updateConfig,
        currentStep,
        setCurrentStep,
        addModel,
        updateModel,
        deleteModel,
        duplicateModel,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
