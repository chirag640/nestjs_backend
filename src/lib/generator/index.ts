import * as fs from 'fs';
import * as path from 'path';
import nunjucks from 'nunjucks';
import * as prettier from 'prettier';
import { FullConfig } from '../schemas';
import { buildIR, IR } from './ir-builder';

// Configure Nunjucks to load templates from the templates directory
const templatesDir = path.join(process.cwd(), 'templates');
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templatesDir), {
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
});

export interface GeneratedFile {
  path: string;
  content: string;
}

export async function formatCode(
  code: string,
  parser: 'typescript' | 'json' | 'markdown' = 'typescript',
): Promise<string> {
  try {
    return await prettier.format(code, {
      parser,
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 100,
      tabWidth: 2,
    });
  } catch (error) {
    console.warn('Prettier formatting failed, returning unformatted code:', error);
    return code;
  }
}

export function renderTemplate(templatePath: string, context: Record<string, unknown>): string {
  return env.render(templatePath, context);
}

/**
 * Generate base NestJS files (main.ts, app.controller.ts, etc.)
 */
async function generateBaseFiles(config: FullConfig, ir: IR): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  // Base templates to render
  const baseTemplates = [
    { template: 'base/main.ts.njk', output: 'src/main.ts' },
    { template: 'base/app.controller.ts.njk', output: 'src/app.controller.ts' },
    { template: 'base/app.service.ts.njk', output: 'src/app.service.ts' },
  ];

  for (const { template, output } of baseTemplates) {
    const rendered = renderTemplate(template, { config, ir });
    const formatted = await formatCode(rendered, 'typescript');
    files.push({ path: output, content: formatted });
  }

  return files;
}

/**
 * Generate app.module.ts with database and model imports
 */
async function generateAppModule(config: FullConfig, ir: IR): Promise<GeneratedFile> {
  const rendered = renderTemplate('base/app.module.ts.njk', { config, ir });
  const formatted = await formatCode(rendered, 'typescript');
  return { path: 'src/app.module.ts', content: formatted };
}

/**
 * Generate all Mongoose files for a single model
 */
async function generateMongooseFilesForModel(
  model: IR['models'][0],
  ir: IR,
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];
  const basePath = `src/${model.fileName}`;

  // Mongoose templates to render for each model
  const mongooseTemplates = [
    { template: 'mongoose/schema.njk', output: `${basePath}/${model.fileName}.schema.ts` },
    {
      template: 'mongoose/repository.njk',
      output: `${basePath}/${model.fileName}.repository.ts`,
    },
    { template: 'mongoose/service.njk', output: `${basePath}/${model.fileName}.service.ts` },
    {
      template: 'mongoose/controller.njk',
      output: `${basePath}/${model.fileName}.controller.ts`,
    },
    { template: 'mongoose/module.njk', output: `${basePath}/${model.fileName}.module.ts` },
    {
      template: 'mongoose/dto-create.njk',
      output: `${basePath}/dto/create-${model.fileName}.dto.ts`,
    },
    {
      template: 'mongoose/dto-update.njk',
      output: `${basePath}/dto/update-${model.fileName}.dto.ts`,
    },
    {
      template: 'mongoose/dto-output.njk',
      output: `${basePath}/dto/${model.fileName}-output.dto.ts`,
    },
  ];

  for (const { template, output } of mongooseTemplates) {
    const rendered = renderTemplate(template, { model, ir });
    const formatted = await formatCode(rendered, 'typescript');
    files.push({ path: output, content: formatted });
  }

  return files;
}

/**
 * Generate configuration files (package.json, tsconfig.json, etc.)
 */
async function generateConfigFiles(config: FullConfig, ir: IR): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  // Package.json
  const packageJson = {
    name: config.projectName,
    version: '0.1.0',
    description: config.description || 'A NestJS application',
    author: config.author,
    license: config.license,
    scripts: {
      start: 'nest start',
      'start:dev': 'nest start --watch',
      'start:prod': 'node dist/main',
      build: 'nest build',
      format: 'prettier --write "src/**/*.ts"',
      lint: 'eslint "{src,apps,libs,test}/**/*.ts" --fix',
    },
    dependencies: {
      '@nestjs/common': '^11.0.0',
      '@nestjs/core': '^11.0.0',
      '@nestjs/platform-express': '^11.0.0',
      'reflect-metadata': '^0.2.0',
      rxjs: '^7.8.0',
      ...(config.orm === 'mongoose' && {
        '@nestjs/mongoose': '^10.0.0',
        mongoose: '^8.0.0',
      }),
    },
    devDependencies: {
      '@nestjs/cli': '^11.0.0',
      '@nestjs/schematics': '^11.0.0',
      '@nestjs/testing': '^11.0.0',
      '@types/express': '^4.17.17',
      '@types/node': '^20.0.0',
      '@typescript-eslint/eslint-plugin': '^8.0.0',
      '@typescript-eslint/parser': '^8.0.0',
      eslint: '^9.0.0',
      prettier: '^3.0.0',
      typescript: '^5.0.0',
    },
  };

  files.push({
    path: 'package.json',
    content: await formatCode(JSON.stringify(packageJson, null, 2), 'json'),
  });

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      module: 'commonjs',
      declaration: true,
      removeComments: true,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      allowSyntheticDefaultImports: true,
      target: 'ES2021',
      sourceMap: true,
      outDir: './dist',
      baseUrl: './',
      incremental: true,
      skipLibCheck: true,
      strictNullChecks: false,
      noImplicitAny: false,
      strictBindCallApply: false,
      forceConsistentCasingInFileNames: false,
      noFallthroughCasesInSwitch: false,
    },
  };

  files.push({
    path: 'tsconfig.json',
    content: await formatCode(JSON.stringify(tsconfig, null, 2), 'json'),
  });

  // tsconfig.build.json
  const tsconfigBuild = {
    extends: './tsconfig.json',
    exclude: ['node_modules', 'dist', 'test', '**/*spec.ts'],
  };

  files.push({
    path: 'tsconfig.build.json',
    content: await formatCode(JSON.stringify(tsconfigBuild, null, 2), 'json'),
  });

  // nest-cli.json
  const nestCli = {
    collection: '@nestjs/schematics',
    sourceRoot: 'src',
  };

  files.push({
    path: 'nest-cli.json',
    content: await formatCode(JSON.stringify(nestCli, null, 2), 'json'),
  });

  // README.md
  const readmeContext = {
    projectName: config.projectName,
    description: config.description || 'A NestJS application',
    author: config.author,
    license: config.license,
    nodeVersion: config.nodeVersion,
    pkgManager: config.pkgManager,
    orm: config.orm,
    provider: config.provider,
    connectionMode: config.connectionMode,
    dbURL: config.dbURL || '',
    autoMigrate: config.autoMigrate,
    models: ir.models,
  };

  const readme = renderTemplate('base/README.md.njk', readmeContext);
  files.push({
    path: 'README.md',
    content: await formatCode(readme, 'markdown'),
  });

  // .gitignore
  files.push({
    path: '.gitignore',
    content: `node_modules
dist
.env
*.log
.DS_Store
`,
  });

  // .env.example
  if (config.connectionMode === 'URL') {
    files.push({
      path: '.env.example',
      content: `DATABASE_URL=${config.dbURL || 'mongodb://localhost:27017/database'}
PORT=3000
`,
    });
  }

  return files;
}

/**
 * Main generator function - orchestrates all file generation
 */
export async function generateProjectFiles(config: FullConfig): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  // Step 1: Build IR from config
  const ir = buildIR(config);

  // Step 2: Generate base NestJS files
  const baseFiles = await generateBaseFiles(config, ir);
  files.push(...baseFiles);

  // Step 3: Generate Mongoose files for each model
  if (config.models && config.models.length > 0) {
    for (const model of ir.models) {
      const modelFiles = await generateMongooseFilesForModel(model, ir);
      files.push(...modelFiles);
    }
  }

  // Step 4: Generate app.module.ts (with all model imports)
  const appModule = await generateAppModule(config, ir);
  files.push(appModule);

  // Step 5: Generate config files (package.json, tsconfig, etc.)
  const configFiles = await generateConfigFiles(config, ir);
  files.push(...configFiles);

  return files;
}
