/**
 * Blueprint builder - construct blueprint from options
 */

import { Blueprint } from '../core/types.js';
import { Pack } from '../packs/types.js';
import { BlueprintSchema } from './schema.js';
import { ValidationError } from '../core/errors.js';

// Get agentgen version from package.json
const AGENTGEN_VERSION = '0.1.0';

export interface BuildBlueprintOptions {
  projectName: string;
  outputDir: string;
  description?: string;
  author?: string;
}

/**
 * Build a minimal blueprint for the vertical slice
 * In the full implementation, this would take interview answers
 */
export function buildBlueprint(pack: Pack, options: BuildBlueprintOptions): Blueprint {
  const now = new Date().toISOString();

  // For vertical slice: hardcode minimal Python API configuration
  const blueprint: Blueprint = {
    version: '1.0',
    meta: {
      packId: pack.metadata.id,
      packVersion: pack.metadata.version,
      generatedAt: now,
      agentgenVersion: AGENTGEN_VERSION,
    },
    project: {
      name: options.projectName,
      description: options.description || `A ${pack.metadata.framework} application`,
      author: options.author,
      license: 'MIT',
    },
    stack: {
      language: pack.metadata.language,
      framework: pack.metadata.framework,
      runtime: {
        version: '>=3.11,<4.0',
        manager: 'poetry',
      },
      dependencies: {
        fastapi: '^0.104.1',
        uvicorn: '^0.24.0',
        pydantic: '^2.5.0',
      },
      devDependencies: {
        pytest: '^7.4.3',
        httpx: '^0.25.2',
        ruff: '^0.1.8',
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
      outputDir: options.outputDir,
      sourceDir: 'src',
      testDir: 'tests',
    },
  };

  // Validate blueprint against schema
  const result = BlueprintSchema.safeParse(blueprint);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new ValidationError(`Blueprint validation failed: ${errors}`);
  }

  return blueprint;
}
