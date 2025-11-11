'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { projectSchema, ProjectConfig } from '@/lib/schemas';
import { useProject } from '@/context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StepProgress } from '@/components/StepProgress';
import { InputGroup } from '@/components/InputGroup';
import { SelectGroup } from '@/components/SelectGroup';
import { TextareaGroup } from '@/components/TextareaGroup';
import { Diamond } from 'lucide-react';

export default function ProjectSetupPage() {
  const router = useRouter();
  const { config, updateConfig, setCurrentStep } = useProject();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectConfig>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: config.projectName || '',
      description: config.description || '',
      author: config.author || '',
      license: config.license || 'MIT',
      nodeVersion: config.nodeVersion || '20.x (LTS)',
      pkgManager: config.pkgManager || 'npm',
    },
  });

  const onSubmit = (data: ProjectConfig) => {
    updateConfig(data);
    setCurrentStep(2);
    router.push('/database');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-2 mb-8">
          <Diamond className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-semibold text-white">NextGen</h1>
        </div>

        <StepProgress currentStep={1} totalSteps={6} stepTitle="Project Setup" />

        <p className="text-zinc-400 mb-8">
          Fill in the details below to configure and generate your new project.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputGroup
                  label="Project Name"
                  name="projectName"
                  required
                  error={errors.projectName?.message}
                  inputProps={{
                    ...register('projectName'),
                    placeholder: 'my-awesome-project',
                  }}
                />

                <InputGroup
                  label="Author"
                  name="author"
                  required
                  error={errors.author?.message}
                  inputProps={{
                    ...register('author'),
                    placeholder: 'Your Name',
                  }}
                />
              </div>

              <div className="mb-6">
                <TextareaGroup
                  label="Description"
                  name="description"
                  error={errors.description?.message}
                  textareaProps={{
                    ...register('description'),
                    placeholder: 'A short description of your project.',
                    rows: 3,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Technical Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectGroup
                  label="License"
                  name="license"
                  options={['MIT', 'Apache 2.0', 'GPL 3.0']}
                  error={errors.license?.message}
                  selectProps={{
                    ...register('license'),
                  }}
                />

                <SelectGroup
                  label="Node.js Version"
                  name="nodeVersion"
                  options={['20.x (LTS)', '22.x']}
                  error={errors.nodeVersion?.message}
                  selectProps={{
                    ...register('nodeVersion'),
                  }}
                />
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium text-zinc-200 mb-3 block">
                  Package Manager
                </label>
                <div className="flex gap-2">
                  {['npm', 'yarn', 'pnpm'].map((pm) => (
                    <label key={pm} className="flex-1">
                      <input
                        type="radio"
                        value={pm}
                        {...register('pkgManager')}
                        className="sr-only peer"
                      />
                      <div className="h-12 flex items-center justify-center rounded-xl border border-white/10 bg-transparent text-white cursor-pointer transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 hover:bg-white/5">
                        {pm}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.pkgManager && (
                  <p className="text-sm text-red-500 mt-2">{errors.pkgManager.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-8">
            <Button type="submit" variant="primary">
              Next
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
