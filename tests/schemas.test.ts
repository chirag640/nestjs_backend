import { describe, it, expect } from 'vitest';
import { projectSchema, databaseSchema, fullConfigSchema } from '../src/lib/schemas';

describe('Validation Schemas', () => {
  describe('projectSchema', () => {
    it('should validate a valid project configuration', () => {
      const validConfig = {
        projectName: 'my-awesome-project',
        description: 'A test project',
        author: 'John Doe',
        license: 'MIT' as const,
        nodeVersion: '20.x (LTS)',
        pkgManager: 'npm' as const,
      };

      const result = projectSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject invalid project name', () => {
      const invalidConfig = {
        projectName: 'Invalid-Name',
        description: 'A test project',
        author: 'John Doe',
        license: 'MIT' as const,
        nodeVersion: '20.x (LTS)',
        pkgManager: 'npm' as const,
      };

      const result = projectSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidConfig = {
        projectName: 'my-project',
      };

      const result = projectSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('databaseSchema', () => {
    it('should validate a valid database configuration', () => {
      const validConfig = {
        orm: 'prisma' as const,
        provider: 'postgresql',
        connectionMode: 'URL' as const,
        dbURL: 'https://example.com/db',
        autoMigrate: 'manual' as const,
      };

      const result = databaseSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should validate local connection mode', () => {
      const validConfig = {
        orm: 'mongoose' as const,
        provider: 'mongodb',
        connectionMode: 'Local' as const,
        autoMigrate: 'push' as const,
      };

      const result = databaseSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('fullConfigSchema', () => {
    it('should validate a complete configuration', () => {
      const fullConfig = {
        projectName: 'test-project',
        description: 'Test description',
        author: 'Jane Doe',
        license: 'MIT' as const,
        nodeVersion: '20.x (LTS)',
        pkgManager: 'npm' as const,
        orm: 'prisma' as const,
        provider: 'postgresql',
        connectionMode: 'Local' as const,
        autoMigrate: 'manual' as const,
      };

      const result = fullConfigSchema.safeParse(fullConfig);
      expect(result.success).toBe(true);
    });
  });
});
