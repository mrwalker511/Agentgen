/**
 * Blueprint builder - construct blueprint from options
 */

import { Blueprint } from '../core/types.js';
import { Pack } from '../packs/types.js';
import { BlueprintSchema } from './schema.js';
import { ValidationError } from '../core/errors.js';
import { AnswerSet } from '../interview/types.js';

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

/**
 * Build blueprint from interview answers
 */
export function buildBlueprintFromAnswers(
  pack: Pack,
  answers: AnswerSet,
  outputDir: string
): Blueprint {
  const now = new Date().toISOString();

  // Extract answers with defaults
  const projectName = String(answers.projectName || 'my-api');
  const description = String(answers.description || `A ${pack.metadata.framework} application`);
  const author = answers.author ? String(answers.author) : undefined;
  const pythonVersion = String(answers.pythonVersion || '3.11');
  const enableDatabase = Boolean(answers.enableDatabase);
  const databaseType = enableDatabase ? String(answers.databaseType || 'postgresql') : 'none';
  const enableAuth = Boolean(answers.enableAuth);
  const authMethod = enableAuth ? String(answers.authMethod || 'jwt') : 'none';
  const enableDocker = Boolean(answers.enableDocker);
  const enableCI = Boolean(answers.enableCI);
  const ciProvider = enableCI ? String(answers.ciProvider || 'github-actions') : 'none';

  // Map Python version to version constraint
  const pythonVersionMap: Record<string, string> = {
    '3.10': '>=3.10,<4.0',
    '3.11': '>=3.11,<4.0',
    '3.12': '>=3.12,<4.0',
  };
  const runtimeVersion = pythonVersionMap[pythonVersion] || '>=3.11,<4.0';

  // Base dependencies
  const dependencies: Record<string, string> = {
    fastapi: '^0.104.1',
    uvicorn: '^0.24.0',
    pydantic: '^2.5.0',
  };

  // Add database dependencies
  if (enableDatabase) {
    dependencies.sqlalchemy = '^2.0.23';

    if (databaseType === 'postgresql') {
      dependencies.asyncpg = '^0.29.0';
    } else if (databaseType === 'mysql') {
      dependencies.aiomysql = '^0.2.0';
    }
  }

  // Add auth dependencies
  if (enableAuth && authMethod === 'jwt') {
    dependencies['python-jose'] = '^3.3.0';
    dependencies['passlib'] = '^1.7.4';
  }

  // Dev dependencies
  const devDependencies: Record<string, string> = {
    pytest: '^7.4.3',
    httpx: '^0.25.2',
    ruff: '^0.1.8',
  };

  // CI checks
  const ciChecks: string[] = [];
  if (enableCI) {
    ciChecks.push('lint', 'typecheck', 'test');
  }

  const blueprint: Blueprint = {
    version: '1.0',
    meta: {
      packId: pack.metadata.id,
      packVersion: pack.metadata.version,
      generatedAt: now,
      agentgenVersion: AGENTGEN_VERSION,
    },
    project: {
      name: projectName,
      description,
      author,
      license: 'MIT',
    },
    stack: {
      language: pack.metadata.language,
      framework: pack.metadata.framework,
      runtime: {
        version: runtimeVersion,
        manager: 'poetry',
      },
      dependencies,
      devDependencies,
    },
    features: {
      database: {
        enabled: enableDatabase,
        type: databaseType,
        orm: enableDatabase ? 'sqlalchemy' : 'none',
        migrations: enableDatabase,
        async: enableDatabase,
      },
      authentication: {
        enabled: enableAuth,
        method: authMethod,
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
        enabled: enableDocker,
        compose: enableDocker && enableDatabase,
        registry: 'docker.io',
      },
      ci: {
        provider: ciProvider,
        checks: ciChecks,
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
      outputDir,
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
