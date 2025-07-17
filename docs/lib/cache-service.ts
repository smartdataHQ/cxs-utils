/**
 * Client-side caching service with TTL support and persistent storage
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  persistent?: boolean; // Whether to use localStorage for persistence
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL: number;
  private maxSize: number;
  private persistent: boolean;
  private storageKey = 'event-bible-cache';

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default for persistent storage
    this.maxSize = options.maxSize || 100;
    this.persistent = options.persistent ?? true;
    
    // Load from localStorage if persistent
    if (this.persistent && typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, entry]) => {
          this.cache.set(key, entry as CacheEntry<any>);
        });
        // Clean up expired entries after loading
        this.cleanup();
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (!this.persistent || typeof window === 'undefined') return;
    
    try {
      const data: Record<string, CacheEntry<any>> = {};
      this.cache.forEach((entry, key) => {
        data[key] = entry;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Clean up expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    // If still at max size after cleanup, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, entry);
    
    // Save to localStorage if persistent
    if (this.persistent) {
      this.saveToStorage();
    }
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result && this.persistent) {
      this.saveToStorage();
    }
    return result;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    if (this.persistent && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (error) {
        console.warn('Failed to clear cache from localStorage:', error);
      }
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Get or set pattern - fetch data if not in cache
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

// Create singleton instance with persistent storage
export const cacheService = new CacheService({
  ttl: 24 * 60 * 60 * 1000, // 24 hours for persistent storage
  maxSize: 200,
  persistent: true,
});

// Cache keys
export const CACHE_KEYS = {
  ALL_EVENTS: 'airtable:all_events',
  EVENT_BY_ID: (id: string) => `airtable:event:${id}`,
  EVENT_BY_SLUG: (slug: string) => `airtable:event:slug:${slug}`,
  EVENTS_BY_CATEGORY: (category: string) => `airtable:events:category:${category}`,
  FILTER_OPTIONS: 'airtable:filter_options',
} as const;