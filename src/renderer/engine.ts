/**
 * Template rendering engine using Handlebars
 */

import Handlebars from 'handlebars';
import { Blueprint } from '../core/types.js';
import { Pack } from '../packs/types.js';
import { RenderedFile, TemplateContext } from './types.js';
import { loadTemplateFiles } from '../packs/loader.js';
import { TemplateRenderError } from '../core/errors.js';
import { logger } from '../core/logger.js';

/**
 * Register Handlebars helpers
 */
function registerHelpers(): void {
  // Helper: Convert snake_case to PascalCase
  Handlebars.registerHelper('toPascalCase', (str: string) => {
    return str
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  });

  // Helper: Convert kebab-case to snake_case
  Handlebars.registerHelper('toSnakeCase', (str: string) => {
    return str.replace(/-/g, '_');
  });

  // Helper: Capitalize first letter
  Handlebars.registerHelper('capitalize', (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  // Helper: Add two numbers
  Handlebars.registerHelper('add', (a: number, b: number) => {
    return a + b;
  });

  // Helper: Equality check
  Handlebars.registerHelper('eq', (a: unknown, b: unknown) => {
    return a === b;
  });

  // Helper: Replace string
  Handlebars.registerHelper('replace', (str: string, search: string, replacement: string) => {
    return str.replace(new RegExp(search, 'g'), replacement);
  });
}

// Register helpers once
registerHelpers();

/**
 * Build template context from blueprint
 */
function buildTemplateContext(blueprint: Blueprint): TemplateContext {
  // For now, just pass through the blueprint
  // In full implementation, can add helper methods here
  return blueprint;
}

/**
 * Render a single template
 */
function renderTemplate(templateContent: string, context: TemplateContext): string {
  const template = Handlebars.compile(templateContent);
  return template(context);
}

/**
 * Convert template path to output path
 * Example: pyproject.toml.hbs -> pyproject.toml
 */
function templatePathToOutputPath(templatePath: string, context: TemplateContext): string {
  let outputPath = templatePath;

  // Remove .hbs extension
  if (outputPath.endsWith('.hbs')) {
    outputPath = outputPath.slice(0, -4);
  }

  // Replace {{paths.sourceDir}} and {{paths.testDir}}
  outputPath = outputPath.replace(/\{\{paths\.sourceDir\}\}/g, context.paths.sourceDir);
  outputPath = outputPath.replace(/\{\{paths\.testDir\}\}/g, context.paths.testDir);

  // Replace {{toSnakeCase project.name}} with snake_case version
  const snakeCaseName = context.project.name.replace(/-/g, '_');
  outputPath = outputPath.replace(/\{\{toSnakeCase project\.name\}\}/g, snakeCaseName);

  // Replace remaining {{project.name}} placeholders
  outputPath = outputPath.replace(/\{\{project\.name\}\}/g, context.project.name);

  return outputPath;
}

/**
 * Render all templates from a pack
 */
export async function renderPack(pack: Pack, blueprint: Blueprint): Promise<RenderedFile[]> {
  logger.info(`Rendering templates from pack '${pack.metadata.id}'`);

  const context = buildTemplateContext(blueprint);
  const templateFiles = loadTemplateFiles(pack);
  const renderedFiles: RenderedFile[] = [];

  for (const templateFile of templateFiles) {
    try {
      const content = renderTemplate(templateFile.content, context);
      const outputPath = templatePathToOutputPath(templateFile.relativePath, context);

      renderedFiles.push({
        path: outputPath,
        content,
      });

      logger.debug(`Rendered template: ${templateFile.relativePath} -> ${outputPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new TemplateRenderError(templateFile.relativePath, message);
    }
  }

  logger.info(`Rendered ${renderedFiles.length} files`);
  return renderedFiles;
}
