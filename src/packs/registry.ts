/**
 * Template pack registry
 */

import { Pack, PackMetadata } from './types.js';
import { loadPack, listAvailablePacks } from './loader.js';
import { logger } from '../core/logger.js';

/**
 * Pack registry - manages available template packs
 */
export class PackRegistry {
  private packs: Map<string, Pack>;
  private metadataCache: Map<string, PackMetadata>;

  constructor() {
    this.packs = new Map();
    this.metadataCache = new Map();
  }

  /**
   * Get a pack by ID
   */
  async getPack(packId: string): Promise<Pack> {
    if (this.packs.has(packId)) {
      return this.packs.get(packId)!;
    }

    const pack = await loadPack(packId);
    this.packs.set(packId, pack);
    return pack;
  }

  /**
   * Get pack metadata without loading full pack
   */
  async getPackMetadata(packId: string): Promise<PackMetadata> {
    if (this.metadataCache.has(packId)) {
      return this.metadataCache.get(packId)!;
    }

    const pack = await this.getPack(packId);
    this.metadataCache.set(packId, pack.metadata);
    return pack.metadata;
  }

  /**
   * List all available packs
   */
  listPacks(): string[] {
    return listAvailablePacks();
  }

  /**
   * List all available packs with metadata
   */
  async listPacksWithMetadata(): Promise<PackMetadata[]> {
    const packIds = this.listPacks();
    const packsWithMetadata: PackMetadata[] = [];

    for (const packId of packIds) {
      try {
        const metadata = await this.getPackMetadata(packId);
        packsWithMetadata.push(metadata);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`Failed to load metadata for pack ${packId}: ${errorMessage}`);
      }
    }

    return packsWithMetadata;
  }

  /**
   * Check if a pack exists
   */
  async hasPack(packId: string): Promise<boolean> {
    const availablePacks = this.listPacks();
    return availablePacks.includes(packId);
  }

  /**
   * Clear the registry cache
   */
  clearCache(): void {
    this.packs.clear();
    this.metadataCache.clear();
    logger.info('Pack registry cache cleared');
  }

  /**
   * Get pack by language/framework
   */
  async getPackByLanguage(language: string, framework?: string): Promise<Pack | null> {
    const packs = await this.listPacksWithMetadata();
    
    for (const pack of packs) {
      if (pack.language === language && (!framework || pack.framework === framework)) {
        return this.getPack(pack.id);
      }
    }
    
    return null;
  }

  /**
   * Get all packs for a specific language
   */
  async getPacksByLanguage(language: string): Promise<Pack[]> {
    const packs = await this.listPacksWithMetadata();
    const result: Pack[] = [];
    
    for (const pack of packs) {
      if (pack.language === language) {
        result.push(await this.getPack(pack.id));
      }
    }
    
    return result;
  }
}

/**
 * Global pack registry instance
 */
export const registry = new PackRegistry();