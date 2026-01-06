/**
 * Template pack type definitions
 */

/**
 * Pack metadata from pack.json
 */
export interface PackMetadata {
  id: string;
  version: string;
  name: string;
  description: string;
  author?: string;
  license?: string;
  language: string;
  framework: string;
  tags?: string[];
}

/**
 * Loaded pack with all resources
 */
export interface Pack {
  metadata: PackMetadata;
  rootPath: string;
  templatesPath: string;
}

/**
 * Template file reference
 */
export interface TemplateFile {
  relativePath: string;
  absolutePath: string;
  content: string;
}
