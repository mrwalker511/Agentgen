/**
 * Renderer type definitions
 */

import { Blueprint } from '../core/types.js';

/**
 * Template context passed to Handlebars
 */
export interface TemplateContext extends Blueprint {
  // Helper methods and additional context can be added here
}

/**
 * Rendered file ready to be written
 */
export interface RenderedFile {
  /** Relative path within output directory */
  path: string;
  /** Rendered content */
  content: string;
  /** Whether file should be executable */
  executable?: boolean;
}
