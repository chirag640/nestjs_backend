'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { databaseSchema, DatabaseConfig } from '@/lib/schemas';
import { useProject } from '@/context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StepProgress } from '@/components/StepProgress';
import { SelectGroup } from '@/components/SelectGroup';
import { InputGroup } from '@/components/InputGroup';
import { RadioGroup } from '@/components/RadioGroup';
import { Diamond, ArrowLeft } from 'lucide-react';

export default function DatabasePage() {
  const router = useRouter();
  const { config, updateConfig, setCurrentStep } = useProject();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DatabaseConfig>({
    resolver: zodResolver(databaseSchema),
    defaultValues: {
      orm: config.orm || 'prisma',
      provider: config.provider || 'postgresql',
      connectionMode: config.connectionMode || 'URL',
      dbURL: config.dbURL || '',
      autoMigrate: config.autoMigrate || 'manual',
    },
  });

  const orm = watch('orm');
  const connectionMode = watch('connectionMode');

  const getProviderOptions = () => {
    if (orm === 'mongoose') {
      return ['mongodb'];
    }
    return ['postgresql'];
  };

  const onSubmit = (data: DatabaseConfig) => {
    updateConfig(data);
    setCurrentStep(3);
    router.push('/models');
  };

  const handlePrevious = () => {
    setCurrentStep(1);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-2 mb-8">
          <Diamond className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-semibold text-white">NextGen</h1>
        </div>

        <StepProgress currentStep={2} totalSteps={6} stepTitle="Database Configuration" />

        <p className="text-zinc-400 mb-8">Set up your database connection for the project.</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Database Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectGroup
                  label="Database"
                  name="orm"
                  options={[
                    { value: 'mongoose', label: 'MongoDB' },
                    { value: 'prisma', label: 'PostgreSQL' },
                  ]}
                  error={errors.orm?.message}
                  selectProps={{
                    ...register('orm'),
                  }}
                />

                <SelectGroup
                  label="Provider"
                  name="provider"
                  options={getProviderOptions().map((p) => ({
                    value: p,
                    label: p.charAt(0).toUpperCase() + p.slice(1),
                  }))}
                  error={errors.provider?.message}
                  selectProps={{
                    ...register('provider'),
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Connection Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <RadioGroup
                  label="Connection String"
                  name="connectionMode"
                  options={[
                    { value: 'URL', label: 'Connection URL' },
                    { value: 'Local', label: 'Local Development' },
                  ]}
                  value={connectionMode}
                  onChange={(value) => {
                    register('connectionMode').onChange({ target: { value } });
                  }}
                  error={errors.connectionMode?.message}
                />
              </div>

              {connectionMode === 'URL' && (
                <InputGroup
                  label="Connection URL"
                  name="dbURL"
                  error={errors.dbURL?.message}
                  inputProps={{
                    ...register('dbURL'),
                    placeholder:
                      orm === 'mongoose'
                        ? 'mongodb://user:password@host:port/database'
                        : 'postgresql://user:password@host:port/database',
                  }}
                />
              )}

              {connectionMode === 'Local' && (
                <p className="text-sm text-zinc-400 p-4 bg-white/5 rounded-xl border border-white/10">
                  Local development mode will use default connection settings. You can configure
                  this later in your .env file.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Migration</CardTitle>
            </CardHeader>
            <CardContent>
              <SelectGroup
                label="Auto-migration Strategy"
                name="autoMigrate"
                options={[
                  { value: 'manual', label: 'Manual Migration' },
                  { value: 'push', label: 'Push Changes' },
                ]}
                error={errors.autoMigrate?.message}
                selectProps={{
                  ...register('autoMigrate'),
                }}
              />
              <p className="text-sm text-zinc-400 mt-3">
                'Push Changes' automatically updates the schema. 'Manual' requires you to generate
                and apply migration files.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-4 mt-8">
            <Button type="button" variant="secondary" onClick={handlePrevious}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button type="submit" variant="primary">
              Next: Define Models
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
