/**
 * File writer - write rendered files to disk
 */

import * as path from 'path';
import { RenderedFile } from './types.js';
import { writeFileSafe, ensureDir } from '../core/fs.js';
import { logger } from '../core/logger.js';

/**
 * Write rendered files to output directory
 */
export async function writeFiles(files: RenderedFile[], outputDir: string): Promise<void> {
  logger.info(`Writing ${files.length} files to ${outputDir}`);

  // Ensure output directory exists
  ensureDir(outputDir);

  for (const file of files) {
    const fullPath = path.join(outputDir, file.path);
    writeFileSafe(fullPath, file.content);
    logger.debug(`Wrote file: ${file.path}`);
  }

  logger.info(`Successfully wrote ${files.length} files`);
}

/**
 * Write a single file
 */
export function writeFile(file: RenderedFile, outputDir: string): void {
  const fullPath = path.join(outputDir, file.path);
  writeFileSafe(fullPath, file.content);
  logger.debug(`Wrote file: ${file.path}`);
}
