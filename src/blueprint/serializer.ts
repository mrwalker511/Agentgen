/**
 * Blueprint serialization utilities
 */

import { Blueprint } from '../core/types.js';
import { writeFileSafe, readFileString } from '../core/fs.js';
import { logger } from '../core/logger.js';

/**
 * Serialize blueprint to JSON file
 */
export function serializeBlueprint(blueprint: Blueprint, filePath: string): void {
  const jsonContent = JSON.stringify(blueprint, null, 2);
  writeFileSafe(filePath, jsonContent);
  logger.info(`Blueprint serialized to ${filePath}`);
}

/**
 * Deserialize blueprint from JSON file
 */
export function deserializeBlueprint(filePath: string): Blueprint {
  const jsonContent = readFileString(filePath);
  const blueprint = JSON.parse(jsonContent) as Blueprint;
  logger.info(`Blueprint deserialized from ${filePath}`);
  return blueprint;
}

/**
 * Serialize blueprint to JSON string
 */
export function blueprintToJson(blueprint: Blueprint): string {
  return JSON.stringify(blueprint, null, 2);
}

/**
 * Deserialize blueprint from JSON string
 */
export function blueprintFromJson(json: string): Blueprint {
  return JSON.parse(json) as Blueprint;
}

/**
 * Create a minimal blueprint for testing
 */
export function createTestBlueprint(): Blueprint {
  const now = new Date().toISOString();
  
  return {
    version: '1.0',
    meta: {
      packId: 'test-pack',
      packVersion: '1.0.0',
      generatedAt: now,
      agentgenVersion: '0.1.0',
    },
    project: {
      name: 'test-project',
      description: 'A test project',
      author: 'Test Author',
      license: 'MIT',
    },
    stack: {
      language: 'python',
      framework: 'fastapi',
      runtime: {
        version: '>=3.11,<4.0',
        manager: 'poetry',
      },
      dependencies: {
        fastapi: '^0.104.1',
        uvicorn: '^0.24.0',
      },
      devDependencies: {
        pytest: '^7.4.3',
      },
    },
    features: {
      database: {
        enabled: false,
        type: 'none',
        orm: 'none',
        migrations: false,
        async: false,
      },
      authentication: {
        enabled: false,
        method: 'none',
      },
      cors: false,
      rateLimiting: false,
      openapi: true,
      healthCheck: true,
    },
    tooling: {
      linter: {
        tool: 'ruff',
        configFile: 'pyproject.toml',
      },
      formatter: {
        tool: 'ruff',
        configFile: 'pyproject.toml',
      },
      typeChecker: {
        tool: 'mypy',
        configFile: 'pyproject.toml',
      },
      testing: {
        framework: 'pytest',
        coverage: false,
        coverageThreshold: 80,
      },
    },
    infrastructure: {
      docker: {
        enabled: false,
        compose: false,
        registry: 'docker.io',
      },
      ci: {
        provider: 'none',
        checks: [],
      },
      deployment: {
        target: 'docker',
      },
    },
    agent: {
      strictness: 'balanced',
      testRequirements: 'on-request',
      allowedOperations: ['add-endpoint', 'add-test', 'refactor-code'],
      prohibitedOperations: ['disable-type-checking'],
      customRules: ['All endpoints should have docstrings'],
    },
    paths: {
      outputDir: './test-output',
      sourceDir: 'src',
      testDir: 'tests',
    },
  };
}