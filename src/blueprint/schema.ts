/**
 * Blueprint schema validation using Zod
 */

import { z } from 'zod';

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
  dependencies: z.record(z.string()),
  devDependencies: z.record(z.string()),
});

const DatabaseFeatureSchema = z.object({
  enabled: z.boolean(),
  type: z.string(),
  orm: z.string(),
  migrations: z.boolean(),
  async: z.boolean(),
});

const AuthenticationFeatureSchema = z.object({
  enabled: z.boolean(),
  method: z.string(),
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
  configFile: z.string(),
});

const TestingConfigSchema = z.object({
  framework: z.string(),
  coverage: z.boolean(),
  coverageThreshold: z.number(),
});

const ToolingConfigSchema = z.object({
  linter: ToolConfigSchema,
  formatter: ToolConfigSchema,
  typeChecker: ToolConfigSchema,
  testing: TestingConfigSchema,
});

const DockerConfigSchema = z.object({
  enabled: z.boolean(),
  compose: z.boolean(),
  registry: z.string(),
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

export const BlueprintSchema = z.object({
  version: z.string(),
  meta: BlueprintMetaSchema,
  project: ProjectConfigSchema,
  stack: StackConfigSchema,
  features: FeaturesConfigSchema,
  tooling: ToolingConfigSchema,
  infrastructure: InfrastructureConfigSchema,
  agent: AgentConfigSchema,
  paths: PathsConfigSchema,
});

export type BlueprintType = z.infer<typeof BlueprintSchema>;
