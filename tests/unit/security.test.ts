/**
 * Security regression tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { writeFile } from '../../src/renderer/writer.js';
import { loadPack } from '../../src/packs/loader.js';
import { FileWriteError, PackLoadError } from '../../src/core/errors.js';

describe('Security regressions', () => {
  const tmpDir = path.join(process.cwd(), 'tests', 'tmp-security');

  beforeEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('prevents path traversal when writing rendered files', () => {
    expect(() => {
      writeFile({ path: '../evil.txt', content: 'nope' }, tmpDir);
    }).toThrow(FileWriteError);

    expect(fs.existsSync(path.join(tmpDir, '..', 'evil.txt'))).toBe(false);
  });

  it('rejects invalid pack ids', async () => {
    await expect(loadPack('../evil')).rejects.toBeInstanceOf(PackLoadError);
  });
});
