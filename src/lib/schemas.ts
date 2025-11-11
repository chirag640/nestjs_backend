import { z } from 'zod';

export const projectSchema = z.object({
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .regex(
      /^[a-z][a-z0-9\-]+$/,
      'Project name must start with lowercase letter and contain only lowercase letters, numbers, and hyphens',
    ),
  description: z.string().max(180, 'Description must be 180 characters or less').optional(),
  author: z.string().min(1, 'Author is required'),
  license: z.enum(['MIT', 'Apache 2.0', 'GPL 3.0']),
  nodeVersion: z.string(),
  pkgManager: z.enum(['npm', 'yarn', 'pnpm']),
});

export const databaseSchema = z.object({
  orm: z.enum(['mongoose', 'prisma']),
  provider: z.string(),
  connectionMode: z.enum(['URL', 'Local']),
  dbURL: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  autoMigrate: z.enum(['manual', 'push']),
});

// Model Builder Schemas
export const fieldSchema = z.object({
  name: z
    .string()
    .min(1, 'Field name is required')
    .regex(/^[a-z][a-zA-Z0-9]*$/, 'Field name must be camelCase')
    .refine(
      (name) => !['id', '_id', '__v'].includes(name),
      'Reserved field names (id, _id, __v) are not allowed',
    ),
  type: z.enum(['string', 'number', 'boolean', 'date', 'objectId', 'array', 'embedded']),
  required: z.boolean().optional().default(false),
  unique: z.boolean().optional().default(false),
  index: z.boolean().optional().default(false),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      regex: z.string().optional(),
    })
    .optional(),
});

export const modelSchema = z.object({
  name: z
    .string()
    .min(1, 'Model name is required')
    .regex(/^[A-Z][a-zA-Z0-9]*$/, 'Model name must be PascalCase'),
  collectionName: z
    .string()
    .refine(
      (val) => val === '' || /^[a-z][a-z0-9\-]*$/.test(val),
      'Collection name must be kebab-case or empty',
    )
    .optional(),
  timestamps: z.boolean().default(true),
  fields: z.array(fieldSchema).min(1, 'At least one field is required'),
});

export const modelsSchema = z.array(modelSchema).refine(
  (models) => {
    const names = models.map((m) => m.name);
    return new Set(names).size === names.length;
  },
  { message: 'Model names must be unique' },
);

export const fullConfigSchema = projectSchema.merge(databaseSchema).extend({
  models: modelsSchema.optional().default([]),
});

export type FieldConfig = z.infer<typeof fieldSchema>;
export type ModelConfig = z.infer<typeof modelSchema>;
export type ProjectConfig = z.infer<typeof projectSchema>;
export type DatabaseConfig = z.infer<typeof databaseSchema>;
export type FullConfig = z.infer<typeof fullConfigSchema>;
