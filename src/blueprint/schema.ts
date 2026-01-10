/**
 * Blueprint schema validation using Zod
 */

import { z } from 'zod';

/**
 * Validates semver-like version constraints
 * Accepts: ^1.0.0, ~1.0.0, >=1.0.0, 1.0.0, >=1.0.0,<2.0.0, etc.
 */
function isValidSemverConstraint(version: string): boolean {
  // Basic semver constraint patterns
  const patterns = [
    /^\d+\.\d+\.\d+$/, // exact: 1.0.0
    /^\^\d+\.\d+\.\d+$/, // caret: ^1.0.0
    /^~\d+\.\d+\.\d+$/, // tilde: ~1.0.0
    /^>=\d+\.\d+\.\d+$/, // gte: >=1.0.0
    /^<=\d+\.\d+\.\d+$/, // lte: <=1.0.0
    /^>\d+\.\d+\.\d+$/, // gt: >1.0.0
    /^<\d+\.\d+\.\d+$/, // lt: <1.0.0
    /^>=\d+\.\d+\.\d+,<\d+\.\d+\.\d+$/, // range: >=1.0.0,<2.0.0
    /^\*$/, // any: *
    /^latest$/, // latest tag
  ];

  return patterns.some((pattern) => pattern.test(version));
}

const BlueprintMetaSchema = z.object({
  packId: z.string(),
  packVersion: z.string(),
  generatedAt: z.string(),
  agentgenVersion: z.string(),
});

const ProjectConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  author: z.string().optional(),
  license: z.string().optional(),
  repository: z.string().optional(),
});

const RuntimeConfigSchema = z.object({
  version: z.string(),
  manager: z.string(),
});

const StackConfigSchema = z.object({
  language: z.string(),
  framework: z.string(),
  runtime: RuntimeConfigSchema,
  dependencies: z.record(
    z.string().refine((version) => isValidSemverConstraint(version), {
      message: 'Invalid semver constraint. Use formats like: ^1.0.0, ~1.0.0, >=1.0.0,<2.0.0',
    })
  ),
  devDependencies: z.record(
    z.string().refine((version) => isValidSemverConstraint(version), {
      message: 'Invalid semver constraint. Use formats like: ^1.0.0, ~1.0.0, >=1.0.0,<2.0.0',
    })
  ),
});

const DatabaseFeatureSchema = z.object({
  enabled: z.boolean(),
  type: z.string().optional(),
  orm: z.string().optional(),
  migrations: z.boolean().optional(),
  async: z.boolean().optional(),
});

const AuthenticationFeatureSchema = z.object({
  enabled: z.boolean(),
  method: z.string().optional(),
});

const FeaturesConfigSchema = z.object({
  database: DatabaseFeatureSchema,
  authentication: AuthenticationFeatureSchema,
  cors: z.boolean(),
  rateLimiting: z.boolean(),
  openapi: z.boolean(),
  healthCheck: z.boolean(),
});

const ToolConfigSchema = z.object({
  tool: z.string(),
  configFile: z.string().optional(),
});

const TestingConfigSchema = z.object({
  framework: z.string(),
  coverage: z.boolean(),
  coverageThreshold: z.number().optional(),
});

const ToolingConfigSchema = z.object({
  linter: ToolConfigSchema,
  formatter: ToolConfigSchema,
  typeChecker: ToolConfigSchema,
  testing: TestingConfigSchema,
});

const DockerConfigSchema = z.object({
  enabled: z.boolean(),
  compose: z.boolean().optional(),
  registry: z.string().optional(),
});

const CIConfigSchema = z.object({
  provider: z.string(),
  checks: z.array(z.string()),
});

const DeploymentConfigSchema = z.object({
  target: z.string(),
});

const InfrastructureConfigSchema = z.object({
  docker: DockerConfigSchema,
  ci: CIConfigSchema,
  deployment: DeploymentConfigSchema,
});

const AgentConfigSchema = z.object({
  strictness: z.enum(['strict', 'balanced', 'permissive']),
  testRequirements: z.enum(['always', 'on-request', 'never']),
  allowedOperations: z.array(z.string()),
  prohibitedOperations: z.array(z.string()),
  customRules: z.array(z.string()),
});

const PathsConfigSchema = z.object({
  outputDir: z.string(),
  sourceDir: z.string(),
  testDir: z.string(),
});

export const BlueprintSchema = z
  .object({
    version: z.string(),
    meta: BlueprintMetaSchema,
    project: ProjectConfigSchema,
    stack: StackConfigSchema,
    features: FeaturesConfigSchema,
    tooling: ToolingConfigSchema,
    infrastructure: InfrastructureConfigSchema,
    agent: AgentConfigSchema,
    paths: PathsConfigSchema,
  })
  .refine(
    (blueprint) => {
      // If database is disabled, migrations should not be enabled
      if (!blueprint.features.database.enabled && blueprint.features.database.migrations) {
        return false;
      }
      return true;
    },
    {
      message: 'Cannot enable database migrations when database is disabled',
      path: ['features', 'database', 'migrations'],
    }
  )
  .refine(
    (blueprint) => {
      // If database is disabled, async driver should not be enabled
      if (!blueprint.features.database.enabled && blueprint.features.database.async) {
        return false;
      }
      return true;
    },
    {
      message: 'Cannot enable async database driver when database is disabled',
      path: ['features', 'database', 'async'],
    }
  )
  .refine(
    (blueprint) => {
      // If database is enabled, type and orm should be specified
      if (blueprint.features.database.enabled) {
        if (!blueprint.features.database.type || blueprint.features.database.type === 'none') {
          return false;
        }
        if (!blueprint.features.database.orm || blueprint.features.database.orm === 'none') {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Database type and ORM must be specified when database is enabled',
      path: ['features', 'database'],
    }
  )
  .refine(
    (blueprint) => {
      // If authentication is enabled, method should be specified
      if (blueprint.features.authentication.enabled) {
        if (!blueprint.features.authentication.method || blueprint.features.authentication.method === 'none') {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Authentication method must be specified when authentication is enabled',
      path: ['features', 'authentication', 'method'],
    }
  )
  .refine(
    (blueprint) => {
      // If coverage is enabled, coverageThreshold should be specified
      if (blueprint.tooling.testing.coverage && blueprint.tooling.testing.coverageThreshold === undefined) {
        return false;
      }
      return true;
    },
    {
      message: 'Coverage threshold must be specified when coverage is enabled',
      path: ['tooling', 'testing', 'coverageThreshold'],
    }
  )
  .refine(
    (blueprint) => {
      // If coverage threshold is specified, it should be between 0 and 100
      if (blueprint.tooling.testing.coverageThreshold !== undefined) {
        const threshold = blueprint.tooling.testing.coverageThreshold;
        return threshold >= 0 && threshold <= 100;
      }
      return true;
    },
    {
      message: 'Coverage threshold must be between 0 and 100',
      path: ['tooling', 'testing', 'coverageThreshold'],
    }
  )
  .refine(
    (blueprint) => {
      // If docker compose is enabled, docker should be enabled
      if (blueprint.infrastructure.docker.compose && !blueprint.infrastructure.docker.enabled) {
        return false;
      }
      return true;
    },
    {
      message: 'Cannot enable docker-compose when Docker is disabled',
      path: ['infrastructure', 'docker', 'compose'],
    }
  );

export type BlueprintType = z.infer<typeof BlueprintSchema>;
