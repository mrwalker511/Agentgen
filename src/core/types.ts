/**
 * Core type definitions shared across modules
 */

/**
 * Blueprint - deterministic, serializable project configuration
 */
export interface Blueprint {
  version: string;
  meta: BlueprintMeta;
  project: ProjectConfig;
  stack: StackConfig;
  features: FeaturesConfig;
  tooling: ToolingConfig;
  infrastructure: InfrastructureConfig;
  agent: AgentConfig;
  paths: PathsConfig;
}

export interface BlueprintMeta {
  packId: string;
  packVersion: string;
  generatedAt: string;
  agentgenVersion: string;
}

export interface ProjectConfig {
  name: string;
  description: string;
  author?: string;
  license?: string;
  repository?: string;
}

export interface StackConfig {
  language: string;
  framework: string;
  runtime: RuntimeConfig;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface RuntimeConfig {
  version: string;
  manager: string;
}

export interface FeaturesConfig {
  database: DatabaseFeature;
  authentication: AuthenticationFeature;
  cors: boolean;
  rateLimiting: boolean;
  openapi: boolean;
  healthCheck: boolean;
}

export interface DatabaseFeature {
  enabled: boolean;
  type: string;
  orm: string;
  migrations: boolean;
  async: boolean;
}

export interface AuthenticationFeature {
  enabled: boolean;
  method: string;
}

export interface ToolingConfig {
  linter: ToolConfig;
  formatter: ToolConfig;
  typeChecker: ToolConfig;
  testing: TestingConfig;
}

export interface ToolConfig {
  tool: string;
  configFile: string;
}

export interface TestingConfig {
  framework: string;
  coverage: boolean;
  coverageThreshold: number;
}

export interface InfrastructureConfig {
  docker: DockerConfig;
  ci: CIConfig;
  deployment: DeploymentConfig;
}

export interface DockerConfig {
  enabled: boolean;
  compose: boolean;
  registry: string;
}

export interface CIConfig {
  provider: string;
  checks: string[];
}

export interface DeploymentConfig {
  target: string;
}

export interface AgentConfig {
  strictness: 'strict' | 'balanced' | 'permissive';
  testRequirements: 'always' | 'on-request' | 'never';
  allowedOperations: string[];
  prohibitedOperations: string[];
  customRules: string[];
}

export interface PathsConfig {
  outputDir: string;
  sourceDir: string;
  testDir: string;
}

/**
 * Template context for Handlebars
 */
export interface TemplateContext extends Blueprint {
  // Additional helper context can be added here
}

/**
 * Rendered file output
 */
export interface RenderedFile {
  path: string;
  content: string;
  executable?: boolean;
}
