/**
 * Template pack loading
 */

import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Pack, PackMetadata, TemplateFile } from './types.js';
import { PackNotFoundError, PackLoadError } from '../core/errors.js';
import { pathExists, isDirectory, readFileString, listFiles } from '../core/fs.js';
import { logger } from '../core/logger.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the packs directory path
 */
function getPacksDir(): string {
  // In development: src/packs/loader.ts -> ../../packs
  // In production: dist/packs/loader.js -> ../../packs
  return path.resolve(__dirname, '../../packs');
}

/**
 * Load a pack by ID
 */
export async function loadPack(packId: string): Promise<Pack> {
  const packsDir = getPacksDir();
  const packPath = path.join(packsDir, packId);

  logger.debug(`Loading pack '${packId}' from ${packPath}`);

  // Check pack directory exists
  if (!pathExists(packPath)) {
    throw new PackNotFoundError(packId);
  }

  if (!isDirectory(packPath)) {
    throw new PackLoadError(packId, 'Pack path is not a directory');
  }

  // Load pack.json
  const packJsonPath = path.join(packPath, 'pack.json');
  if (!pathExists(packJsonPath)) {
    throw new PackLoadError(packId, 'pack.json not found');
  }

  let metadata: PackMetadata;
  try {
    const packJsonContent = readFileString(packJsonPath);
    metadata = JSON.parse(packJsonContent) as PackMetadata;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new PackLoadError(packId, `Failed to parse pack.json: ${message}`);
  }

  // Validate metadata
  if (!metadata.id || !metadata.version || !metadata.name) {
    throw new PackLoadError(packId, 'pack.json missing required fields (id, version, name)');
  }

  if (metadata.id !== packId) {
    throw new PackLoadError(
      packId,
      `pack.json id '${metadata.id}' does not match directory name '${packId}'`
    );
  }

  // Check templates directory exists
  const templatesPath = path.join(packPath, 'templates');
  if (!pathExists(templatesPath) || !isDirectory(templatesPath)) {
    throw new PackLoadError(packId, 'templates directory not found');
  }

  logger.info(`Loaded pack '${metadata.name}' v${metadata.version}`);

  return {
    metadata,
    rootPath: packPath,
    templatesPath,
  };
}

/**
 * Load all template files from a pack
 */
export function loadTemplateFiles(pack: Pack): TemplateFile[] {
  const templates: TemplateFile[] = [];

  function scanDirectory(dirPath: string, relativeTo: string): void {
    const entries = listFiles(dirPath);

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const relativePath = path.relative(relativeTo, fullPath);

      if (isDirectory(fullPath)) {
        // Recursively scan subdirectories
        scanDirectory(fullPath, relativeTo);
      } else if (entry.endsWith('.hbs')) {
        // Load template file
        const content = readFileString(fullPath);
        templates.push({
          relativePath,
          absolutePath: fullPath,
          content,
        });
      }
    }
  }

  scanDirectory(pack.templatesPath, pack.templatesPath);
  return templates;
}

/**
 * List available packs
 */
export function listAvailablePacks(): string[] {
  const packsDir = getPacksDir();

  if (!pathExists(packsDir)) {
    return [];
  }

  const entries = listFiles(packsDir);
  return entries.filter((entry) => {
    const packPath = path.join(packsDir, entry);
    return isDirectory(packPath) && pathExists(path.join(packPath, 'pack.json'));
  });
}
