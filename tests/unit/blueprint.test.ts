/**
 * Blueprint builder unit tests
 */

import { describe, it, expect } from 'vitest';
import { buildBlueprint, buildBlueprintFromAnswers } from '../../src/blueprint/builder.js';
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
});
