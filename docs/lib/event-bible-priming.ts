/**
 * Event Bible Priming Service
 * Ensures Bible Events are loaded and cached, preferring local JSON file over Airtable
 */

import { createAirtableService } from './airtable-service';
import { createClientAirtableService } from './client-airtable-service';
import { localEventBibleService, LocalEventBibleData } from './local-event-bible-service';
import { cacheService, CACHE_KEYS } from './cache-service';
import { SemanticEvent } from './types/event-bible';

export interface PrimingResult {
  success: boolean;
  eventsCount: number;
  error?: string;
  timestamp: Date;
  duration: number;
  source: 'local' | 'airtable';
}

export class EventBiblePrimingService {
  private static instance: EventBiblePrimingService;
  private isPriming = false;
  private lastPrimingResult: PrimingResult | null = null;

  private constructor() {}

  static getInstance(): EventBiblePrimingService {
    if (!EventBiblePrimingService.instance) {
      EventBiblePrimingService.instance = new EventBiblePrimingService();
    }
    return EventBiblePrimingService.instance;
  }

  /**
   * Prime the cache with Bible Events, preferring local JSON file over Airtable
   */
  async primeCache(forceAirtable = false): Promise<PrimingResult> {
    if (this.isPriming) {
      console.log('Priming already in progress, skipping...');
      return this.lastPrimingResult || {
        success: false,
        eventsCount: 0,
        error: 'Priming already in progress',
        timestamp: new Date(),
        duration: 0,
        source: 'local',
      };
    }

    const startTime = Date.now();
    this.isPriming = true;

    try {
      console.log('Starting Event Bible cache priming...');
      
      let events: SemanticEvent[];
      let filterOptions: { categories: string[]; domains: string[]; verticals: string[] };
      let source: 'local' | 'airtable' = 'local';

      // Try to load from local file first (server-side only)
      const isClientSide = typeof window !== 'undefined';
      let localData: LocalEventBibleData | null = null;

      if (!isClientSide && !forceAirtable) {
        try {
          const hasLocal = await localEventBibleService.hasLocalData();
          if (hasLocal) {
            localData = await localEventBibleService.loadLocalData();
          }
        } catch (error: any) {
          console.warn('Failed to load local data, falling back to Airtable:', error.message);
        }
      }

      if (localData && localData.events.length > 0) {
        // Use local data
        events = localData.events;
        filterOptions = localData.filterOptions;
        source = 'local';
        console.log(`Loaded ${events.length} events from local JSON file (last updated: ${localData.metadata.lastUpdated})`);
      } else {
        // Load from Airtable
        source = 'airtable';
        
        if (isClientSide) {
          // Client-side: use API endpoints
          const clientService = createClientAirtableService();
          if (forceAirtable) {
            const result = await clientService.reloadFromAirtable();
            if (!result.success) {
              throw new Error(result.error || 'Failed to reload from Airtable');
            }
            // After successful reload, fetch the data
            events = await clientService.fetchAllEvents();
            filterOptions = await clientService.getFilterOptions();
          } else {
            events = await clientService.fetchAllEvents();
            filterOptions = await clientService.getFilterOptions();
          }
        } else {
          // Server-side: use direct Airtable service
          const airtableService = createAirtableService();
          events = await airtableService.fetchAllEvents();
          filterOptions = await airtableService.getFilterOptions();
          
          // Save to local file for future use
          try {
            const eventBibleData = localEventBibleService.createEventBibleData(events);
            await localEventBibleService.saveLocalData(eventBibleData);
            console.log('Saved Event Bible data to local JSON file for future use');
          } catch (error: any) {
            console.warn('Failed to save data to local file:', error.message);
          }
        }
        
        console.log(`Loaded ${events.length} events from Airtable (${isClientSide ? 'client' : 'server'} side)`);
      }
      
      console.log(`Loaded filter options: ${filterOptions.categories.length} categories, ${filterOptions.domains.length} domains, ${filterOptions.verticals.length} verticals`);
      
      // Cache the data
      cacheService.set(CACHE_KEYS.ALL_EVENTS, events, 5 * 60 * 1000); // 5 minutes TTL
      cacheService.set(CACHE_KEYS.FILTER_OPTIONS, filterOptions, 10 * 60 * 1000); // 10 minutes TTL
      
      // Prime individual event caches for better performance
      await this.primeIndividualEvents(events);
      
      const duration = Date.now() - startTime;
      
      this.lastPrimingResult = {
        success: true,
        eventsCount: events.length,
        timestamp: new Date(),
        duration,
        source,
      };

      console.log(`Event Bible cache priming completed successfully in ${duration}ms from ${source}`);
      return this.lastPrimingResult;

    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.lastPrimingResult = {
        success: false,
        eventsCount: 0,
        error: error.message || 'Unknown error during priming',
        timestamp: new Date(),
        duration,
        source: 'local',
      };

      console.error('Event Bible cache priming failed:', error);
      return this.lastPrimingResult;

    } finally {
      this.isPriming = false;
    }
  }

  /**
   * Prime individual event caches for better performance
   */
  private async primeIndividualEvents(events: SemanticEvent[]): Promise<void> {
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < events.length; i += batchSize) {
      batches.push(events.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map(event => {
          // Cache individual events
          cacheService.set(
            CACHE_KEYS.EVENT_BY_ID(event.airtable_id),
            event,
            10 * 60 * 1000 // 10 minutes TTL
          );
          
          // Cache events by category
          const categoryKey = CACHE_KEYS.EVENTS_BY_CATEGORY(event.category);
          const existingCategoryEvents = cacheService.get<SemanticEvent[]>(categoryKey) || [];
          const updatedCategoryEvents = [...existingCategoryEvents, event];
          cacheService.set(categoryKey, updatedCategoryEvents, 7 * 60 * 1000);
        })
      );
    }
  }

  /**
   * Check if cache needs priming (empty or expired)
   */
  shouldPrime(): boolean {
    const hasAllEvents = cacheService.has(CACHE_KEYS.ALL_EVENTS);
    const hasFilterOptions = cacheService.has(CACHE_KEYS.FILTER_OPTIONS);
    
    return !hasAllEvents || !hasFilterOptions;
  }

  /**
   * Get the last priming result
   */
  getLastPrimingResult(): PrimingResult | null {
    return this.lastPrimingResult;
  }

  /**
   * Force cache refresh by clearing and re-priming
   */
  async refreshCache(): Promise<PrimingResult> {
    console.log('Forcing cache refresh...');
    cacheService.clear();
    return this.primeCache();
  }

  /**
   * Reload data from Airtable and update local file
   */
  async reloadFromAirtable(): Promise<PrimingResult> {
    console.log('Forcing reload from Airtable...');
    cacheService.clear();
    return this.primeCache(true);
  }

  /**
   * Get cache status information
   */
  getCacheStatus(): {
    hasAllEvents: boolean;
    hasFilterOptions: boolean;
    cacheStats: { size: number; maxSize: number; hitRate?: number };
    lastPriming: PrimingResult | null;
  } {
    return {
      hasAllEvents: cacheService.has(CACHE_KEYS.ALL_EVENTS),
      hasFilterOptions: cacheService.has(CACHE_KEYS.FILTER_OPTIONS),
      cacheStats: cacheService.getStats(),
      lastPriming: this.lastPrimingResult,
    };
  }
}

// Export singleton instance
export const eventBiblePrimingService = EventBiblePrimingService.getInstance();

/**
 * Auto-prime cache on module load if needed
 * Only primes if there's no local data and cache is empty
 */
export async function autoPrimeIfNeeded(): Promise<void> {
  if (typeof window !== 'undefined' && eventBiblePrimingService.shouldPrime()) {
    // Check if we have local data first
    try {
      const response = await fetch('/api/event-bible/local');
      const localInfo = await response.json();
      
      if (localInfo.success && localInfo.metadata.exists && localInfo.metadata.metadata?.eventsCount > 0) {
        console.log('Local Event Bible data exists, skipping auto-prime');
        return;
      }
    } catch (error) {
      console.warn('Failed to check local data status:', error);
    }

    console.log('Auto-priming Event Bible cache...');
    try {
      await eventBiblePrimingService.primeCache();
    } catch (error) {
      console.warn('Auto-priming failed, will retry on demand:', error);
    }
  }
}

// Auto-prime on import (client-side only) - but only if no local data exists
if (typeof window !== 'undefined') {
  // Delay auto-priming to avoid blocking initial page load
  setTimeout(autoPrimeIfNeeded, 1000);
}