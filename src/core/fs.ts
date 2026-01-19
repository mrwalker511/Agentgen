/**
 * File system utility functions
 */

import * as fs from 'fs';
import * as path from 'path';
import { FileWriteError } from './errors.js';

/**
 * Ensure directory exists, create if it doesn't
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write file with parent directory creation
 */
export function writeFileSafe(filePath: string, content: string): void {
  try {
    const dir = path.dirname(filePath);
    ensureDir(dir);
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FileWriteError(filePath, message);
  }
}

/**
 * Read file as string
 */
export function readFileString(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Check if path exists
 */
export function pathExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Check if path is a directory
 */
export function isDirectory(filePath: string): boolean {
  return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
}

/**
 * List files in directory
 */
export function listFiles(dirPath: string): string[] {
  if (!isDirectory(dirPath)) {
    return [];
  }
  return fs.readdirSync(dirPath);
}

/**
 * Resolve path relative to current working directory
 */
export function resolvePath(...pathSegments: string[]): string {
  return path.resolve(process.cwd(), ...pathSegments);
}

/**
 * Resolve a path within a base directory.
 *
 * Prevents writing/reading outside the base directory via `..` segments or absolute paths.
 */
export function resolveInside(baseDir: string, relativePath: string): string {
  const base = path.resolve(baseDir);
  const target = path.resolve(baseDir, relativePath);

  if (target === base || target.startsWith(base + path.sep)) {
    return target;
  }

  throw new FileWriteError(target, 'Path traversal detected');
}
