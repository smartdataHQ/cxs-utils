/**
 * Client-side Airtable service that uses server-side API endpoints
 * This avoids exposing the API key to the client
 */

import { SemanticEvent } from './types/event-bible';
import { cacheService, CACHE_KEYS } from './cache-service';

export interface ClientAirtableConfig {
  baseId: string;
  eventsTableId: string;
  aliasesTableId: string;
}

export class ClientAirtableService {
  private config: ClientAirtableConfig;

  constructor(config: ClientAirtableConfig) {
    this.config = config;
  }

  /**
   * Fetch all events via server-side API with caching
   */
  async fetchAllEvents(): Promise<SemanticEvent[]> {
    // Check cache first
    const cachedEvents = cacheService.get<SemanticEvent[]>(CACHE_KEYS.ALL_EVENTS);
    if (cachedEvents) {
      console.log(`Using cached events: ${cachedEvents.length} events`);
      return cachedEvents;
    }

    try {
      console.log('Cache miss, fetching events from API...');
      const response = await fetch('/api/event-bible/events');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const events = data.events || [];

      // Cache the results for future use
      if (events.length > 0) {
        cacheService.set(CACHE_KEYS.ALL_EVENTS, events, 5 * 60 * 1000); // 5 minutes TTL
        console.log(`Cached ${events.length} events for future use`);
      }

      return events;
    } catch (error: any) {
      console.error('Failed to fetch events via API:', error);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  /**
   * Fetch event by ID via server-side API with caching
   */
  async fetchEventById(id: string): Promise<SemanticEvent | null> {
    // Check cache first
    const cachedEvent = cacheService.get<SemanticEvent>(CACHE_KEYS.EVENT_BY_ID(id));
    if (cachedEvent) {
      console.log(`Using cached event: ${id}`);
      return cachedEvent;
    }

    try {
      console.log(`Cache miss, fetching event ${id} from API...`);
      const response = await fetch(`/api/event-bible/events/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const event = data.event || null;

      // Cache the result for future use
      if (event) {
        cacheService.set(CACHE_KEYS.EVENT_BY_ID(id), event, 10 * 60 * 1000); // 10 minutes TTL
        console.log(`Cached event ${id} for future use`);
      }

      return event;
    } catch (error: any) {
      console.error('Failed to fetch event by ID via API:', error);
      throw new Error(`Failed to fetch event: ${error.message}`);
    }
  }

  /**
   * Fetch event by topic slug via server-side API with caching
   */
  async fetchEventBySlug(slug: string): Promise<SemanticEvent | null> {
    // Check cache first
    const cachedEvent = cacheService.get<SemanticEvent>(CACHE_KEYS.EVENT_BY_SLUG(slug));
    if (cachedEvent) {
      console.log(`Using cached event by slug: ${slug}`);
      return cachedEvent;
    }

    try {
      console.log(`Cache miss, fetching event by slug ${slug} from API...`);
      const response = await fetch(`/api/event-bible/events/slug/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const event = data.event || null;

      // Cache the result for future use
      if (event) {
        cacheService.set(CACHE_KEYS.EVENT_BY_SLUG(slug), event, 10 * 60 * 1000); // 10 minutes TTL
        console.log(`Cached event by slug ${slug} for future use`);
      }

      return event;
    } catch (error: any) {
      console.error('Failed to fetch event by slug via API:', error);
      throw new Error(`Failed to fetch event: ${error.message}`);
    }
  }

  /**
   * Get filter options via server-side API
   */
  async getFilterOptions(): Promise<{
    categories: string[];
    domains: string[];
    verticals: string[];
  }> {
    try {
      const response = await fetch('/api/event-bible/filter-options');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return {
        categories: data.categories || [],
        domains: data.domains || [],
        verticals: data.verticals || [],
      };
    } catch (error: any) {
      console.error('Failed to fetch filter options via API:', error);
      throw new Error(`Failed to fetch filter options: ${error.message}`);
    }
  }

  /**
   * Prime cache via server-side API
   */
  async primeCache(force = false): Promise<{
    success: boolean;
    eventsCount: number;
    duration: number;
    source?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/event-bible/prime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to prime cache via API:', error);
      return {
        success: false,
        eventsCount: 0,
        duration: 0,
        source: 'local',
        error: error.message,
      };
    }
  }

  /**
   * Reload from Airtable via server-side API
   */
  async reloadFromAirtable(): Promise<{
    success: boolean;
    eventsCount: number;
    duration: number;
    source?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/event-bible/prime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceAirtable: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to reload from Airtable via API:', error);
      return {
        success: false,
        eventsCount: 0,
        duration: 0,
        source: 'airtable',
        error: error.message,
      };
    }
  }

  /**
   * Get cache status via server-side API
   */
  async getCacheStatus(): Promise<any> {
    try {
      const response = await fetch('/api/event-bible/prime');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error('Failed to get cache status via API:', error);
      throw new Error(`Failed to get cache status: ${error.message}`);
    }
  }
}

/**
 * Create client-side Airtable service instance
 */
export function createClientAirtableService(): ClientAirtableService {
  const config: ClientAirtableConfig = {
    baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '',
    eventsTableId: process.env.NEXT_PUBLIC_AIRTABLE_EVENTS_TABLE_ID || '',
    aliasesTableId: process.env.NEXT_PUBLIC_AIRTABLE_ALIASES_TABLE_ID || '',
  };

  if (!config.baseId || !config.eventsTableId || !config.aliasesTableId) {
    console.warn('Client-side Airtable configuration is incomplete. Some features may not work.');
  }

  return new ClientAirtableService(config);
}