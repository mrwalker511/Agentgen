/**
 * Template pack loading
 */

import * as fs from 'fs';
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

const PACK_ID_PATTERN = /^[a-z0-9][a-z0-9-_]*$/;

/**
 * Load a pack by ID
 */
export async function loadPack(packId: string): Promise<Pack> {
  const safePackId = packId.trim();
  if (!PACK_ID_PATTERN.test(safePackId)) {
    throw new PackLoadError(packId, 'Invalid pack id');
  }

  await Promise.resolve();

  const packsDir = getPacksDir();
  const resolvedPacksDir = path.resolve(packsDir);
  const packPath = path.resolve(packsDir, safePackId);

  if (!(packPath === resolvedPacksDir || packPath.startsWith(resolvedPacksDir + path.sep))) {
    throw new PackLoadError(safePackId, 'Invalid pack path');
  }

  logger.debug(`Loading pack '${safePackId}' from ${packPath}`);

  // Check pack directory exists
  if (!pathExists(packPath)) {
    throw new PackNotFoundError(safePackId);
  }

  if (!isDirectory(packPath)) {
    throw new PackLoadError(safePackId, 'Pack path is not a directory');
  }

  // Load pack.json
  const packJsonPath = path.join(packPath, 'pack.json');
  if (!pathExists(packJsonPath)) {
    throw new PackLoadError(safePackId, 'pack.json not found');
  }

  let metadata: PackMetadata;
  try {
    const packJsonContent = readFileString(packJsonPath);
    metadata = JSON.parse(packJsonContent) as PackMetadata;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new PackLoadError(safePackId, `Failed to parse pack.json: ${message}`);
  }

  // Validate metadata
  if (!metadata.id || !metadata.version || !metadata.name) {
    throw new PackLoadError(safePackId, 'pack.json missing required fields (id, version, name)');
  }

  if (metadata.id !== safePackId) {
    throw new PackLoadError(
      safePackId,
      `pack.json id '${metadata.id}' does not match directory name '${safePackId}'`
    );
  }

  // Check templates directory exists
  const templatesPath = path.join(packPath, 'templates');
  if (!pathExists(templatesPath) || !isDirectory(templatesPath)) {
    throw new PackLoadError(safePackId, 'templates directory not found');
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

      let stats: fs.Stats;
      try {
        stats = fs.lstatSync(fullPath);
      } catch {
        continue;
      }

      if (stats.isSymbolicLink()) {
        logger.warn(`Skipping symlink in templates: ${relativePath}`);
        continue;
      }

      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        scanDirectory(fullPath, relativeTo);
        continue;
      }

      if (entry.endsWith('.hbs')) {
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
