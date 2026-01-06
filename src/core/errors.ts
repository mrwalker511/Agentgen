/**
 * Custom error classes for Agentgen
 */

export class AgentgenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentgenError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class PackNotFoundError extends AgentgenError {
  constructor(packId: string) {
    super(`Pack not found: ${packId}`);
    this.name = 'PackNotFoundError';
  }
}

export class PackLoadError extends AgentgenError {
  constructor(packId: string, reason: string) {
    super(`Failed to load pack '${packId}': ${reason}`);
    this.name = 'PackLoadError';
  }
}

export class TemplateRenderError extends AgentgenError {
  constructor(templatePath: string, reason: string) {
    super(`Failed to render template '${templatePath}': ${reason}`);
    this.name = 'TemplateRenderError';
  }
}

export class FileWriteError extends AgentgenError {
  constructor(filePath: string, reason: string) {
    super(`Failed to write file '${filePath}': ${reason}`);
    this.name = 'FileWriteError';
  }
}

export class ValidationError extends AgentgenError {
  constructor(message: string) {
    super(`Validation failed: ${message}`);
    this.name = 'ValidationError';
  }
}
