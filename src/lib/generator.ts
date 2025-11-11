import nunjucks from 'nunjucks';
import * as prettier from 'prettier';
import { FullConfig } from './schemas';

// Configure Nunjucks
const env = new nunjucks.Environment(null, {
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

export function renderTemplate(template: string, context: Record<string, unknown>): string {
  return env.renderString(template, context);
}

export async function generateProjectFiles(config: FullConfig): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  // Template content (would normally be read from files)
  const templates: Record<
    string,
    { content: string; parser?: 'typescript' | 'json' | 'markdown' }
  > = {
    'src/main.ts': {
      content: `
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('🚀 App running on http://localhost:3000');
}
bootstrap();
`,
      parser: 'typescript',
    },
    'src/app.module.ts': {
      content: `
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`,
      parser: 'typescript',
    },
    'src/app.controller.ts': {
      content: `
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
`,
      parser: 'typescript',
    },
    'src/app.service.ts': {
      content: `
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
`,
      parser: 'typescript',
    },
    'package.json': {
      content: `{
  "name": "{{ projectName }}",
  "version": "0.1.0",
  "description": "{{ description }}",
  "author": "{{ author }}",
  "license": "{{ license }}",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "format": "prettier --write \\"src/**/*.ts\\"",
    "lint": "eslint \\"{src,apps,libs,test}/**/*.ts\\" --fix"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}`,
      parser: 'json',
    },
    'tsconfig.json': {
      content: `{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}`,
      parser: 'json',
    },
    'tsconfig.build.json': {
      content: `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "outDir": "../../dist/apps/app"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}`,
      parser: 'json',
    },
    'README.md': {
      content: `# {{ projectName }}

{{ description }}

## Description

This project was generated using NextGen - a NestJS project generator.

## Installation

\`\`\`bash
$ {{ pkgManager }} install
\`\`\`

## Running the app

\`\`\`bash
# development
$ {{ pkgManager }} run start

# watch mode
$ {{ pkgManager }} run start:dev

# production mode
$ {{ pkgManager }} run start:prod
\`\`\`

## Build

\`\`\`bash
$ {{ pkgManager }} run build
\`\`\`

## Project Information

- **Author:** {{ author }}
- **License:** {{ license }}
- **Node Version:** {{ nodeVersion }}

## Database Configuration

- **ORM:** {{ orm }}
- **Provider:** {{ provider }}
{% if connectionMode === 'URL' and dbURL %}
- **Connection URL:** \`{{ dbURL }}\`
{% endif %}
- **Auto-migration:** {{ autoMigrate }}

## Support

For support, please open an issue in the project repository.
`,
      parser: 'markdown',
    },
    '.gitignore': {
      content: `node_modules
dist
.env
*.log
.DS_Store
`,
    },
    'nest-cli.json': {
      content: `{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
}`,
      parser: 'json',
    },
  };

  // Context for template rendering
  const context = {
    projectName: config.projectName,
    description: config.description || 'A NestJS application',
    author: config.author,
    license: config.license,
    nodeVersion: config.nodeVersion,
    pkgManager: config.pkgManager,
    orm: config.orm,
    provider: config.provider,
    connectionMode: config.connectionMode,
    dbURL: config.dbURL,
    autoMigrate: config.autoMigrate,
  };

  // Generate each file
  for (const [path, { content, parser }] of Object.entries(templates)) {
    const rendered = renderTemplate(content, context);
    const formatted = parser ? await formatCode(rendered, parser) : rendered;
    files.push({ path, content: formatted });
  }

  return files;
}
