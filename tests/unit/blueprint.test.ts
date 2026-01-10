/**
 * Blueprint builder unit tests
 */

import { describe, it, expect } from 'vitest';
import { buildBlueprint, buildBlueprintFromAnswers } from '../../src/blueprint/builder.js';
import { BlueprintSchema } from '../../src/blueprint/schema.js';
import { PackMetadata } from '../../src/packs/types.js';

describe('Blueprint Builder', () => {
  const mockPack = {
    metadata: {
      id: 'python-api',
      version: '1.0.0',
      name: 'Python API',
      description: 'FastAPI pack',
      language: 'python',
      framework: 'fastapi',
    } as PackMetadata,
    rootPath: '/mock/path',
    templatesPath: '/mock/path/templates',
  };

  describe('buildBlueprint', () => {
    it('should create a valid blueprint with minimal options', () => {
      const blueprint = buildBlueprint(mockPack, {
        projectName: 'test-api',
        outputDir: '/output',
      });

      expect(blueprint.version).toBe('1.0');
      expect(blueprint.project.name).toBe('test-api');
      expect(blueprint.stack.language).toBe('python');
      expect(blueprint.stack.framework).toBe('fastapi');
      expect(blueprint.meta.packId).toBe('python-api');
    });

    it('should include author when provided', () => {
      const blueprint = buildBlueprint(mockPack, {
        projectName: 'test-api',
        outputDir: '/output',
        author: 'John Doe',
      });

      expect(blueprint.project.author).toBe('John Doe');
    });

    it('should include description when provided', () => {
      const blueprint = buildBlueprint(mockPack, {
        projectName: 'test-api',
        outputDir: '/output',
        description: 'My custom API',
      });

      expect(blueprint.project.description).toBe('My custom API');
    });
  });

  describe('buildBlueprintFromAnswers', () => {
    it('should create blueprint with basic answers', () => {
      const answers = {
        projectName: 'my-api',
        description: 'Test API',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: false,
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      expect(blueprint.project.name).toBe('my-api');
      expect(blueprint.project.description).toBe('Test API');
      expect(blueprint.stack.runtime.version).toBe('>=3.11,<4.0');
      expect(blueprint.features.database.enabled).toBe(false);
    });

    it('should add database dependencies when database enabled', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: true,
        databaseType: 'postgresql',
        enableAuth: false,
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      expect(blueprint.features.database.enabled).toBe(true);
      expect(blueprint.features.database.type).toBe('postgresql');
      expect(blueprint.stack.dependencies.sqlalchemy).toBeDefined();
      expect(blueprint.stack.dependencies.asyncpg).toBeDefined();
    });

    it('should add auth dependencies when auth enabled', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: true,
        authMethod: 'jwt',
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      expect(blueprint.features.authentication.enabled).toBe(true);
      expect(blueprint.features.authentication.method).toBe('jwt');
      expect(blueprint.stack.dependencies['python-jose']).toBeDefined();
      expect(blueprint.stack.dependencies['passlib']).toBeDefined();
    });

    it('should enable docker compose when docker and database enabled', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: true,
        databaseType: 'postgresql',
        enableAuth: false,
        enableDocker: true,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      expect(blueprint.infrastructure.docker.enabled).toBe(true);
      expect(blueprint.infrastructure.docker.compose).toBe(true);
    });

    it('should add CI checks when CI enabled', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: false,
        enableDocker: false,
        enableCI: true,
        ciProvider: 'github-actions',
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      expect(blueprint.infrastructure.ci.provider).toBe('github-actions');
      expect(blueprint.infrastructure.ci.checks).toContain('lint');
      expect(blueprint.infrastructure.ci.checks).toContain('typecheck');
      expect(blueprint.infrastructure.ci.checks).toContain('test');
    });
  });

  describe('Schema Validation', () => {
    it('should reject invalid semver constraints in dependencies', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: false,
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      // Manually set invalid semver to test validation
      blueprint.stack.dependencies.fastapi = 'invalid-version';

      const result = BlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: any) =>
          issue.message.includes('Invalid semver constraint')
        )).toBe(true);
      }
    });

    it('should accept valid semver constraints', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: false,
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      // Test various valid semver formats
      blueprint.stack.dependencies = {
        'pkg1': '^1.0.0',
        'pkg2': '~2.3.4',
        'pkg3': '>=3.0.0',
        'pkg4': '>=1.0.0,<2.0.0',
        'pkg5': '1.2.3',
      };

      const result = BlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(true);
    });

    it('should reject migrations when database is disabled', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: false,
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      // Manually enable migrations while database is disabled
      blueprint.features.database.migrations = true;

      const result = BlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: any) =>
          issue.message.includes('Cannot enable database migrations')
        )).toBe(true);
      }
    });

    it('should reject async driver when database is disabled', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: false,
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      // Manually enable async while database is disabled
      blueprint.features.database.async = true;

      const result = BlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: any) =>
          issue.message.includes('Cannot enable async database driver')
        )).toBe(true);
      }
    });

    it('should require database type and orm when database is enabled', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: true,
        databaseType: 'postgresql',
        enableAuth: false,
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      // Manually set type to none
      blueprint.features.database.type = 'none';

      const result = BlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: any) =>
          issue.message.includes('Database type and ORM must be specified')
        )).toBe(true);
      }
    });

    it('should require authentication method when authentication is enabled', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: true,
        authMethod: 'jwt',
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      // Manually set method to none
      blueprint.features.authentication.method = 'none';

      const result = BlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: any) =>
          issue.message.includes('Authentication method must be specified')
        )).toBe(true);
      }
    });

    it('should require coverage threshold when coverage is enabled', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: false,
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      // Enable coverage but remove threshold
      blueprint.tooling.testing.coverage = true;
      blueprint.tooling.testing.coverageThreshold = undefined;

      const result = BlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: any) =>
          issue.message.includes('Coverage threshold must be specified')
        )).toBe(true);
      }
    });

    it('should validate coverage threshold range', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: false,
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      // Set invalid threshold
      blueprint.tooling.testing.coverage = true;
      blueprint.tooling.testing.coverageThreshold = 150;

      const result = BlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: any) =>
          issue.message.includes('Coverage threshold must be between 0 and 100')
        )).toBe(true);
      }
    });

    it('should reject docker-compose when docker is disabled', () => {
      const answers = {
        projectName: 'my-api',
        pythonVersion: '3.11',
        enableDatabase: false,
        enableAuth: false,
        enableDocker: false,
        enableCI: false,
      };

      const blueprint = buildBlueprintFromAnswers(mockPack, answers, '/output');

      // Enable compose without docker
      blueprint.infrastructure.docker.compose = true;

      const result = BlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue: any) =>
          issue.message.includes('Cannot enable docker-compose when Docker is disabled')
        )).toBe(true);
      }
    });
  });
});
