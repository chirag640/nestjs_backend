import { FullConfig, ModelConfig, FieldConfig } from '../schemas';

export type PrimitiveType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'objectId'
  | 'array'
  | 'embedded';

export interface ModelFieldIR {
  name: string; // camelCase
  tsType: string; // TypeScript type
  mongooseType: string; // Mongoose constructor
  required: boolean;
  unique?: boolean;
  index?: boolean;
  defaultValue?: string | number | boolean | null;
  validation?: { min?: number; max?: number; regex?: string };
}

export interface ModelIR {
  name: string; // PascalCase
  fileName: string; // kebab-case
  route: string; // plural kebab-case
  collectionName?: string;
  fields: ModelFieldIR[];
  timestamps: boolean;
}

export interface IR {
  project: any;
  database: { orm: 'mongoose' | 'prisma'; provider: string };
  models: ModelIR[];
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function pluralize(word: string): string {
  // Simple pluralization rules
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}

function mapFieldTypeToTS(type: PrimitiveType): string {
  const typeMap: Record<PrimitiveType, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    date: 'Date',
    objectId: 'Types.ObjectId',
    array: 'string[]', // default to string array
    embedded: 'Record<string, any>',
  };
  return typeMap[type] || 'any';
}

function mapFieldTypeToMongoose(type: PrimitiveType): string {
  const typeMap: Record<PrimitiveType, string> = {
    string: 'String',
    number: 'Number',
    boolean: 'Boolean',
    date: 'Date',
    objectId: 'Schema.Types.ObjectId',
    array: '[String]', // default to string array
    embedded: 'Schema.Types.Mixed',
  };
  return typeMap[type] || 'Schema.Types.Mixed';
}

function buildFieldIR(field: FieldConfig): ModelFieldIR {
  return {
    name: field.name,
    tsType: mapFieldTypeToTS(field.type),
    mongooseType: mapFieldTypeToMongoose(field.type),
    required: field.required || false,
    unique: field.unique,
    index: field.index,
    defaultValue: field.defaultValue,
    validation: field.validation,
  };
}

function buildModelIR(model: ModelConfig): ModelIR {
  const fileName = toKebabCase(model.name);
  const route = pluralize(fileName);

  // Filter out reserved fields
  const validFields = model.fields.filter((field) => !['id', '_id', '__v'].includes(field.name));

  return {
    name: model.name,
    fileName,
    route,
    collectionName: model.collectionName || undefined,
    fields: validFields.map(buildFieldIR),
    timestamps: model.timestamps,
  };
}

export function buildIR(config: FullConfig): IR {
  return {
    project: {
      name: config.projectName,
      description: config.description,
      author: config.author,
      license: config.license,
      nodeVersion: config.nodeVersion,
      pkgManager: config.pkgManager,
    },
    database: {
      orm: config.orm,
      provider: config.provider,
    },
    models: (config.models || []).map(buildModelIR),
  };
}
