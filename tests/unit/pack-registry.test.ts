/**
 * Unit tests for pack registry
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { registry } from '../../src/packs/registry.js';
import { listAvailablePacks } from '../../src/packs/loader.js';

describe('Pack Registry', () => {
  beforeEach(() => {
    // Clear cache before each test
    registry.clearCache();
  });

  describe('Pack Discovery', () => {
    it('should list available packs', () => {
      const packs = listAvailablePacks();

      expect(Array.isArray(packs)).toBe(true);
      expect(packs.length).toBeGreaterThan(0);

      // Should include built-in packs
      expect(packs).toContain('python-api');
      expect(packs).toContain('node-api');
    });

    it('should list packs from registry', () => {
      const packs = registry.listPacks();

      expect(Array.isArray(packs)).toBe(true);
      expect(packs).toContain('python-api');
      expect(packs).toContain('node-api');
    });
  });

  describe('Pack Loading', () => {
    it('should load python-api pack', async () => {
      const pack = await registry.getPack('python-api');

      expect(pack).toBeDefined();
      expect(pack.metadata.id).toBe('python-api');
      expect(pack.metadata.name).toBe('Python API (FastAPI)');
      expect(pack.metadata.language).toBe('python');
      expect(pack.metadata.framework).toBe('fastapi');
    });

    it('should load node-api pack', async () => {
      const pack = await registry.getPack('node-api');

      expect(pack).toBeDefined();
      expect(pack.metadata.id).toBe('node-api');
      expect(pack.metadata.name).toBe('Node API (Express + TypeScript)');
      expect(pack.metadata.language).toBe('typescript');
      expect(pack.metadata.framework).toBe('express');
    });

    it('should throw error for non-existent pack', async () => {
      await expect(registry.getPack('non-existent-pack')).rejects.toThrow();
    });

    it('should cache loaded packs', async () => {
      const pack1 = await registry.getPack('python-api');
      const pack2 = await registry.getPack('python-api');

      // Should return the same instance from cache
      expect(pack1).toBe(pack2);
    });

    it('should clear cache', async () => {
      await registry.getPack('python-api');

      registry.clearCache();

      const pack = await registry.getPack('python-api');
      expect(pack).toBeDefined();
    });
  });

  describe('Pack Metadata', () => {
    it('should get pack metadata', async () => {
      const metadata = await registry.getPackMetadata('python-api');

      expect(metadata.id).toBe('python-api');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.name).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should list all packs with metadata', async () => {
      const packs = await registry.listPacksWithMetadata();

      expect(Array.isArray(packs)).toBe(true);
      expect(packs.length).toBeGreaterThanOrEqual(2);

      const pythonPack = packs.find(p => p.id === 'python-api');
      expect(pythonPack).toBeDefined();
      expect(pythonPack?.language).toBe('python');

      const nodePack = packs.find(p => p.id === 'node-api');
      expect(nodePack).toBeDefined();
      expect(nodePack?.language).toBe('typescript');
    });
  });

  describe('Pack Queries', () => {
    it('should check if pack exists', async () => {
      const exists = await registry.hasPack('python-api');
      expect(exists).toBe(true);

      const notExists = await registry.hasPack('fake-pack');
      expect(notExists).toBe(false);
    });

    it('should get pack by language', async () => {
      const pack = await registry.getPackByLanguage('python');

      expect(pack).toBeDefined();
      expect(pack?.metadata.language).toBe('python');
    });

    it('should get pack by language and framework', async () => {
      const pack = await registry.getPackByLanguage('python', 'fastapi');

      expect(pack).toBeDefined();
      expect(pack?.metadata.language).toBe('python');
      expect(pack?.metadata.framework).toBe('fastapi');
    });

    it('should return null for non-existent language', async () => {
      const pack = await registry.getPackByLanguage('ruby');
      expect(pack).toBeNull();
    });

    it('should get all packs for a language', async () => {
      const packs = await registry.getPacksByLanguage('python');

      expect(Array.isArray(packs)).toBe(true);
      expect(packs.length).toBeGreaterThanOrEqual(1);
      expect(packs[0].metadata.language).toBe('python');
    });
  });
});
