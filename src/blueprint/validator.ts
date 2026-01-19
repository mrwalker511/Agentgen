/**
 * Blueprint validation utilities
 */

import { Blueprint } from '../core/types.js';
import { BlueprintSchema } from './schema.js';
import { ValidationError } from '../core/errors.js';
import { logger } from '../core/logger.js';

/**
 * Validate blueprint against schema
 */
export function validateBlueprint(blueprint: Blueprint): void {
  const result = BlueprintSchema.safeParse(blueprint);
  
  if (!result.success) {
    const errors = result.error.errors.map((e) => {
      return `${e.path.join('.')}: ${e.message}`;
    }).join('\n');
    
    throw new ValidationError(`Blueprint validation failed:\n${errors}`);
  }
  
  logger.info('Blueprint validation passed');
}

/**
 * Validate blueprint consistency
 */
export function validateBlueprintConsistency(blueprint: Blueprint): void {
  const errors: string[] = [];

  // Check that database configuration is consistent
  if (blueprint.features.database.enabled) {
    if (!blueprint.features.database.type || blueprint.features.database.type === 'none') {
      errors.push('Database type must be specified when database is enabled');
    }
    if (!blueprint.features.database.orm || blueprint.features.database.orm === 'none') {
      errors.push('Database ORM must be specified when database is enabled');
    }
    if (blueprint.features.database.migrations && !blueprint.features.database.enabled) {
      errors.push('Cannot enable migrations when database is disabled');
    }
    if (blueprint.features.database.async && !blueprint.features.database.enabled) {
      errors.push('Cannot enable async database when database is disabled');
    }
  }

  // Check that authentication configuration is consistent
  if (blueprint.features.authentication.enabled) {
    if (!blueprint.features.authentication.method || blueprint.features.authentication.method === 'none') {
      errors.push('Authentication method must be specified when authentication is enabled');
    }
  }

  // Check that CI configuration is consistent
  if (blueprint.infrastructure.ci.provider !== 'none') {
    if (blueprint.infrastructure.ci.checks.length === 0) {
      errors.push('CI checks must be specified when CI provider is configured');
    }
  }

  // Check that Docker configuration is consistent
  if (blueprint.infrastructure.docker.compose && !blueprint.infrastructure.docker.enabled) {
    errors.push('Cannot enable Docker Compose when Docker is disabled');
  }

  // Check that coverage configuration is consistent
  if (blueprint.tooling.testing.coverage && blueprint.tooling.testing.coverageThreshold === undefined) {
    errors.push('Coverage threshold must be specified when coverage is enabled');
  }

  // Check that coverage threshold is valid
  if (blueprint.tooling.testing.coverageThreshold !== undefined) {
    const threshold = blueprint.tooling.testing.coverageThreshold;
    if (threshold < 0 || threshold > 100) {
      errors.push('Coverage threshold must be between 0 and 100');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(`Blueprint consistency validation failed:\n${errors.join('\n')}`);
  }
  
  logger.info('Blueprint consistency validation passed');
}

/**
 * Validate that blueprint dependencies are compatible
 */
export function validateBlueprintDependencies(blueprint: Blueprint): void {
  // This is a basic validation - actual dependency resolution is handled by ecosystem tools
  const errors: string[] = [];

  // Check that all dependencies have valid version constraints
  for (const [depName, version] of Object.entries(blueprint.stack.dependencies)) {
    if (!isValidSemverConstraint(version)) {
      errors.push(`Invalid version constraint for dependency '${depName}': ${version}`);
    }
  }

  for (const [devDepName, version] of Object.entries(blueprint.stack.devDependencies)) {
    if (!isValidSemverConstraint(version)) {
      errors.push(`Invalid version constraint for dev dependency '${devDepName}': ${version}`);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(`Dependency validation failed:\n${errors.join('\n')}`);
  }
  
  logger.info('Blueprint dependency validation passed');
}

/**
 * Check if a version constraint is valid
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

/**
 * Validate blueprint completeness
 */
export function validateBlueprintCompleteness(blueprint: Blueprint): void {
  const errors: string[] = [];

  // Check required fields
  if (!blueprint.project.name) {
    errors.push('Project name is required');
  }

  if (!blueprint.project.description) {
    errors.push('Project description is required');
  }

  if (!blueprint.stack.language) {
    errors.push('Stack language is required');
  }

  if (!blueprint.stack.framework) {
    errors.push('Stack framework is required');
  }

  if (!blueprint.stack.runtime.version) {
    errors.push('Runtime version is required');
  }

  if (!blueprint.stack.runtime.manager) {
    errors.push('Runtime manager is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Blueprint completeness validation failed:\n${errors.join('\n')}`);
  }
  
  logger.info('Blueprint completeness validation passed');
}