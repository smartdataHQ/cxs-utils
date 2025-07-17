/**
 * Local Event Bible Service
 * Manages local JSON file storage for Event Bible data
 * SERVER-SIDE ONLY - Uses Node.js fs module
 */

import { SemanticEvent } from './types/event-bible';

// Dynamic imports for server-side only modules
let fs: typeof import('fs').promises;
let path: typeof import('path');

// Initialize server-side modules only when running on server
if (typeof window === 'undefined') {
  fs = require('fs').promises;
  path = require('path');
}

export interface LocalEventBibleData {
  events: SemanticEvent[];
  filterOptions: {
    categories: string[];
    domains: string[];
    verticals: string[];
  };
  metadata: {
    lastUpdated: string;
    source: 'airtable' | 'manual';
    eventsCount: number;
    version: string;
  };
}

export class LocalEventBibleService {
  private static instance: LocalEventBibleService;
  private readonly dataPath: string;
  private readonly backupPath: string;

  private constructor() {
    if (typeof window !== 'undefined') {
      throw new Error('LocalEventBibleService can only be used on the server side');
    }
    this.dataPath = path.join(process.cwd(), 'data', 'event-bible', 'events.json');
    this.backupPath = path.join(process.cwd(), 'data', 'event-bible', 'backups');
  }

  static getInstance(): LocalEventBibleService {
    if (!LocalEventBibleService.instance) {
      LocalEventBibleService.instance = new LocalEventBibleService();
    }
    return LocalEventBibleService.instance;
  }

  /**
   * Check if local data file exists and is not empty
   */
  async hasLocalData(): Promise<boolean> {
    try {
      const stats = await fs.stat(this.dataPath);
      return stats.size > 0;
    } catch {
      return false;
    }
  }

  /**
   * Load data from local JSON file
   */
  async loadLocalData(): Promise<LocalEventBibleData | null> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const parsed = JSON.parse(data) as LocalEventBibleData;
      
      // Validate the structure
      if (!this.validateLocalData(parsed)) {
        console.warn('Local event bible data is invalid, will need to reload from Airtable');
        return null;
      }

      console.log(`Loaded ${parsed.events.length} events from local file (last updated: ${parsed.metadata.lastUpdated})`);
      return parsed;
    } catch (error: any) {
      console.warn('Failed to load local event bible data:', error.message);
      return null;
    }
  }

  /**
   * Save data to local JSON file with backup
   */
  async saveLocalData(data: LocalEventBibleData): Promise<void> {
    try {
      // Ensure directories exist
      await this.ensureDirectories();

      // Create backup if file exists
      if (await this.hasLocalData()) {
        await this.createBackup();
      }

      // Save new data
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(this.dataPath, jsonData, 'utf-8');

      console.log(`Saved ${data.events.length} events to local file`);
    } catch (error: any) {
      console.error('Failed to save local event bible data:', error);
      throw new Error(`Failed to save local data: ${error.message}`);
    }
  }

  /**
   * Create Event Bible data from events array
   */
  createEventBibleData(events: SemanticEvent[]): LocalEventBibleData {
    // Generate filter options from events
    const categories = Array.from(new Set(events.map(e => e.category).filter(Boolean))).sort();
    const domains = Array.from(new Set(events.map(e => e.domain).filter(Boolean))).sort();
    const verticals = Array.from(new Set(
      events.flatMap(e => e.aliases.map(a => a.vertical)).filter(Boolean)
    )).sort();

    return {
      events,
      filterOptions: {
        categories,
        domains,
        verticals,
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: 'airtable',
        eventsCount: events.length,
        version: '1.0.0',
      },
    };
  }

  /**
   * Get metadata about local data file
   */
  async getLocalDataMetadata(): Promise<{
    exists: boolean;
    size?: number;
    lastModified?: Date;
    metadata?: LocalEventBibleData['metadata'];
  }> {
    try {
      const stats = await fs.stat(this.dataPath);
      const data = await this.loadLocalData();
      
      return {
        exists: true,
        size: stats.size,
        lastModified: stats.mtime,
        metadata: data?.metadata,
      };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Clear local data file
   */
  async clearLocalData(): Promise<void> {
    try {
      await fs.unlink(this.dataPath);
      console.log('Local event bible data cleared');
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<Array<{
    filename: string;
    timestamp: Date;
    size: number;
  }>> {
    try {
      const files = await fs.readdir(this.backupPath);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.backupPath, file);
          const stats = await fs.stat(filePath);
          backups.push({
            filename: file,
            timestamp: stats.mtime,
            size: stats.size,
          });
        }
      }

      return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch {
      return [];
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(filename: string): Promise<void> {
    try {
      const backupPath = path.join(this.backupPath, filename);
      const data = await fs.readFile(backupPath, 'utf-8');
      await fs.writeFile(this.dataPath, data, 'utf-8');
      console.log(`Restored event bible data from backup: ${filename}`);
    } catch (error: any) {
      throw new Error(`Failed to restore from backup: ${error.message}`);
    }
  }

  /**
   * Validate local data structure
   */
  private validateLocalData(data: any): data is LocalEventBibleData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.events) &&
      data.filterOptions &&
      Array.isArray(data.filterOptions.categories) &&
      Array.isArray(data.filterOptions.domains) &&
      Array.isArray(data.filterOptions.verticals) &&
      data.metadata &&
      typeof data.metadata.lastUpdated === 'string' &&
      typeof data.metadata.eventsCount === 'number'
    );
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    const dataDir = path.dirname(this.dataPath);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(this.backupPath, { recursive: true });
  }

  /**
   * Create backup of current data
   */
  private async createBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `events-backup-${timestamp}.json`;
      const backupFilePath = path.join(this.backupPath, backupFilename);
      
      const currentData = await fs.readFile(this.dataPath, 'utf-8');
      await fs.writeFile(backupFilePath, currentData, 'utf-8');
      
      // Keep only the last 10 backups
      await this.cleanupOldBackups();
    } catch (error: any) {
      console.warn('Failed to create backup:', error.message);
    }
  }

  /**
   * Clean up old backups, keeping only the most recent 10
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      if (backups.length > 10) {
        const toDelete = backups.slice(10);
        for (const backup of toDelete) {
          const filePath = path.join(this.backupPath, backup.filename);
          await fs.unlink(filePath);
        }
      }
    } catch (error: any) {
      console.warn('Failed to cleanup old backups:', error.message);
    }
  }
}

// Export singleton instance (server-side only)
export const localEventBibleService = typeof window === 'undefined' 
  ? LocalEventBibleService.getInstance() 
  : null as any;