/**
 * Airtable service for Event Bible data fetching
 */

import {
  SemanticEvent,
  Alias,
  AirtableRecord,
  AirtableEventFields,
  AirtableAliasFields,
  AirtableResponse,
  EventBibleConfig,
  EventBibleError,
  ValidationError,
  DataValidationResult,
} from './types/event-bible';
import { cacheService, CACHE_KEYS } from './cache-service';

export class AirtableService {
  private config: EventBibleConfig;
  private baseUrl: string;

  constructor(config: EventBibleConfig) {
    this.config = config;
    this.baseUrl = `https://api.airtable.com/v0/${config.baseId}`;
  }

  /**
   * Fetch all semantic events from Airtable with caching
   */
  async fetchAllEvents(): Promise<SemanticEvent[]> {
    return cacheService.getOrSet(
      CACHE_KEYS.ALL_EVENTS,
      async () => {
        try {
          const eventsResponse = await this.fetchRecords<AirtableEventFields>(
            this.config.eventsTableId
          );

          const aliasesResponse = await this.fetchRecords<AirtableAliasFields>(
            this.config.aliasesTableId
          );

          return this.transformEventsData(eventsResponse.records, aliasesResponse.records);
        } catch (error) {
          throw this.handleError(error, 'Failed to fetch all events');
        }
      },
      5 * 60 * 1000 // 5 minutes TTL
    );
  }

  /**
   * Fetch a specific event by ID with caching
   */
  async fetchEventById(id: string): Promise<SemanticEvent | null> {
    return cacheService.getOrSet(
      CACHE_KEYS.EVENT_BY_ID(id),
      async () => {
        try {
          const eventResponse = await this.fetchRecord<AirtableEventFields>(
            this.config.eventsTableId,
            id
          );

          if (!eventResponse) {
            return null;
          }

          const aliasesResponse = await this.fetchRecords<AirtableAliasFields>(
            this.config.aliasesTableId
          );

          const events = this.transformEventsData([eventResponse], aliasesResponse.records);
          return events[0] || null;
        } catch (error) {
          throw this.handleError(error, `Failed to fetch event with ID: ${id}`);
        }
      },
      10 * 60 * 1000 // 10 minutes TTL for individual events
    );
  }

  /**
   * Fetch a specific event by topic slug with caching
   */
  async fetchEventBySlug(slug: string): Promise<SemanticEvent | null> {
    return cacheService.getOrSet(
      CACHE_KEYS.EVENT_BY_SLUG(slug),
      async () => {
        try {
          // Get all events and find the one with matching slug
          const allEvents = await this.fetchAllEvents();
          return allEvents.find(event => event.topicSlug === slug) || null;
        } catch (error) {
          throw this.handleError(error, `Failed to fetch event with slug: ${slug}`);
        }
      },
      10 * 60 * 1000 // 10 minutes TTL for individual events
    );
  }

  /**
   * Fetch events by category with caching
   */
  async fetchEventsByCategory(category: string): Promise<SemanticEvent[]> {
    return cacheService.getOrSet(
      CACHE_KEYS.EVENTS_BY_CATEGORY(category),
      async () => {
        try {
          const filterFormula = `{Category} = "${category}"`;
          const eventsResponse = await this.fetchRecords<AirtableEventFields>(
            this.config.eventsTableId,
            { filterByFormula: filterFormula }
          );

          const aliasesResponse = await this.fetchRecords<AirtableAliasFields>(
            this.config.aliasesTableId
          );

          return this.transformEventsData(eventsResponse.records, aliasesResponse.records);
        } catch (error) {
          throw this.handleError(error, `Failed to fetch events for category: ${category}`);
        }
      },
      7 * 60 * 1000 // 7 minutes TTL for category queries
    );
  }

  /**
   * Generic method to fetch records from a table
   */
  private async fetchRecords<T>(
    tableId: string,
    params?: { filterByFormula?: string; sort?: Array<{ field: string; direction: 'asc' | 'desc' }> }
  ): Promise<AirtableResponse<T>> {
    const allRecords: AirtableRecord<T>[] = [];
    let offset: string | undefined;

    do {
      const url = new URL(`${this.baseUrl}/${tableId}`);
      
      // Set page size to maximum (100 records per request)
      url.searchParams.append('pageSize', '100');
      
      if (offset) {
        url.searchParams.append('offset', offset);
      }
      
      if (params?.filterByFormula) {
        url.searchParams.append('filterByFormula', params.filterByFormula);
      }
      
      if (params?.sort) {
        params.sort.forEach((sortItem, index) => {
          url.searchParams.append(`sort[${index}][field]`, sortItem.field);
          url.searchParams.append(`sort[${index}][direction]`, sortItem.direction);
        });
      }

      const response = await this.makeRequest(url.toString());
      const data = await response.json();
      
      if (data.records) {
        allRecords.push(...data.records);
      }
      
      offset = data.offset;
      
      // Log pagination progress
      console.log(`Fetched ${allRecords.length} records from ${tableId}${offset ? ' (more pages available)' : ' (complete)'}`);
      
    } while (offset);

    return {
      records: allRecords,
    };
  }

  /**
   * Fetch a single record by ID
   */
  private async fetchRecord<T>(
    tableId: string,
    recordId: string
  ): Promise<AirtableRecord<T> | null> {
    try {
      const url = `${this.baseUrl}/${tableId}/${recordId}`;
      const response = await this.makeRequest(url);
      return response.json();
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Make HTTP request with error handling and retries
   */
  private async makeRequest(url: string, retryCount = 0): Promise<Response> {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout((this.config.timeoutSeconds || 30) * 1000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Rate limiting delay
      if (this.config.rateLimitDelay) {
        await this.delay(this.config.rateLimitDelay * 1000);
      }

      return response;
    } catch (error: any) {
      const maxRetries = this.config.maxRetries || 3;

      if (retryCount < maxRetries && this.isRetryableError(error)) {
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.makeRequest(url, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Transform Airtable records into SemanticEvent objects with validation
   */
  private transformEventsData(
    eventRecords: AirtableRecord<AirtableEventFields>[],
    aliasRecords: AirtableRecord<AirtableAliasFields>[]
  ): SemanticEvent[] {
    // Create a map of alias IDs to alias objects for quick lookup
    const aliasMap = new Map<string, Alias>();
    aliasRecords.forEach(record => {
      aliasMap.set(record.id, {
        name: record.fields.Alias || '',
        vertical: record.fields.Vertical || '',
        topic: record.fields.Topic || '',
      });
    });

    // First pass: create events without slugs
    const eventsWithoutSlugs = eventRecords.map(record => {
      const fields = record.fields;

      // Validate required fields
      const validation = this.validateEventRecord(record);
      if (!validation.isValid) {
        console.warn(`Event validation failed for ${record.id}:`, validation.errors);
      }

      // Resolve aliases from IDs
      const aliases: Alias[] = [];
      if (fields.Aliases && Array.isArray(fields.Aliases)) {
        fields.Aliases.forEach(aliasId => {
          const alias = aliasMap.get(aliasId);
          if (alias) {
            aliases.push(alias);
          }
        });
      }

      return {
        airtable_id: record.id,
        airtableId: record.id,
        name: fields['Name'] || '',
        description: fields.Description || '',
        category: fields.Category || '',
        domain: fields.Domain || '',
        topic: fields.Topic || '',
        topicSlug: '', // Will be set in second pass
        aliases,
        lastUpdated: fields['Last Updated'] || record.createdTime,
        deprecated: fields.Deprecated || false,
        deprecationReason: fields['Deprecation Reason'] || undefined,
        deprecationDate: fields['Deprecation Date'] || undefined,
        replacementEvent: fields['Replacement Event'] || undefined,
      };
    });

    // Second pass: generate unique slugs
    const slugCounts = new Map<string, number>();
    return eventsWithoutSlugs.map(event => {
      const baseSlug = this.generateSlug(event.topic || event.name);
      let finalSlug = baseSlug;
      
      // Handle slug collisions by appending a number
      if (slugCounts.has(baseSlug)) {
        const count = slugCounts.get(baseSlug)! + 1;
        slugCounts.set(baseSlug, count);
        finalSlug = `${baseSlug}-${count}`;
      } else {
        slugCounts.set(baseSlug, 0);
      }

      return {
        ...event,
        topicSlug: finalSlug,
      };
    });
  }

  /**
   * Validate an event record from Airtable
   */
  private validateEventRecord(record: AirtableRecord<AirtableEventFields>): DataValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    const fields = record.fields;

    // Required field validation with proper type checking
    if (!fields['Name'] || (typeof fields['Name'] === 'string' && fields['Name'].trim() === '')) {
      errors.push({
        field: 'Name',
        message: 'Name is required',
        value: fields['Name']
      });
    }

    if (!fields.Category || (typeof fields.Category === 'string' && fields.Category.trim() === '')) {
      errors.push({
        field: 'Category',
        message: 'Category is required',
        value: fields.Category
      });
    }

    if (!fields.Domain || (typeof fields.Domain === 'string' && fields.Domain.trim() === '')) {
      errors.push({
        field: 'Domain',
        message: 'Domain is required',
        value: fields.Domain
      });
    }

    if (!fields.Description || (typeof fields.Description === 'string' && fields.Description.trim() === '')) {
      errors.push({
        field: 'Description',
        message: 'Description is required',
        value: fields.Description
      });
    }

    if (!fields.Topic || (typeof fields.Topic === 'string' && fields.Topic.trim() === '')) {
      errors.push({
        field: 'Topic',
        message: 'Topic is required',
        value: fields.Topic
      });
    }

    // Deprecation validation
    if (fields.Deprecated) {
      if (!fields['Deprecation Reason'] || (typeof fields['Deprecation Reason'] === 'string' && fields['Deprecation Reason'].trim() === '')) {
        warnings.push('Deprecated event should have a deprecation reason');
      }

      if (!fields['Deprecation Date'] || (typeof fields['Deprecation Date'] === 'string' && fields['Deprecation Date'].trim() === '')) {
        warnings.push('Deprecated event should have a deprecation date');
      }

      if (!fields['Replacement Event'] || (typeof fields['Replacement Event'] === 'string' && fields['Replacement Event'].trim() === '')) {
        warnings.push('Deprecated event should specify a replacement event');
      }
    }

    // Date validation
    if (fields['Deprecation Date']) {
      const deprecationDate = new Date(fields['Deprecation Date']);
      if (isNaN(deprecationDate.getTime())) {
        errors.push({
          field: 'Deprecation Date',
          message: 'Invalid deprecation date format',
          value: fields['Deprecation Date']
        });
      }
    }

    if (fields['Last Updated']) {
      const lastUpdated = new Date(fields['Last Updated']);
      if (isNaN(lastUpdated.getTime())) {
        warnings.push('Invalid last updated date format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any, context: string): EventBibleError {
    const message = error.message || 'Unknown error occurred';
    const status = error.status || error.response?.status;

    return {
      message: `${context}: ${message}`,
      code: error.code,
      status,
    };
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableStatuses = [429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status) ||
      error.name === 'TimeoutError' ||
      error.code === 'NETWORK_ERROR';
  }

  /**
   * Get filter options (categories, domains, verticals) with caching
   */
  async getFilterOptions(): Promise<{
    categories: string[];
    domains: string[];
    verticals: string[];
  }> {
    return cacheService.getOrSet(
      CACHE_KEYS.FILTER_OPTIONS,
      async () => {
        try {
          const events = await this.fetchAllEvents();

          const categories = Array.from(new Set(events.map(e => e.category).filter(Boolean))).sort();
          
          // Handle domains (might be string or array)
          const domainSet = new Set<string>();
          events.forEach(event => {
            domainSet.add(event.domain);
          });
          const domains = Array.from(domainSet).sort();
          
          const verticals = Array.from(new Set(
            events.flatMap(e => e.aliases.map(a => a.vertical)).filter(Boolean)
          )).sort();

          return { categories, domains, verticals };
        } catch (error) {
          throw this.handleError(error, 'Failed to fetch filter options');
        }
      },
      10 * 60 * 1000 // 10 minutes TTL for filter options
    );
  }

  /**
   * Clear cache for all or specific keys
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      cacheService.clear();
      return;
    }

    // Clear specific cache entries
    if (pattern === 'events') {
      cacheService.delete(CACHE_KEYS.ALL_EVENTS);
      cacheService.delete(CACHE_KEYS.FILTER_OPTIONS);
    }
  }

  /**
   * Generate URL-friendly slug from text
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create AirtableService instance from environment variables
 * Handles both server-side and client-side environment variables
 */
export function createAirtableService(): AirtableService {
  // Try server-side environment variables first, then client-side
  const config: EventBibleConfig = {
    apiKey: process.env.AIRTABLE_API_KEY || '',
    baseId: process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '',
    eventsTableId: process.env.AIRTABLE_EVENTS_TABLE_ID || process.env.NEXT_PUBLIC_AIRTABLE_EVENTS_TABLE_ID || '',
    aliasesTableId: process.env.AIRTABLE_ALIASES_TABLE_ID || process.env.NEXT_PUBLIC_AIRTABLE_ALIASES_TABLE_ID || '',
    rateLimitDelay: parseFloat(process.env.AIRTABLE_RATE_LIMIT_DELAY || '0.2'),
    maxRetries: parseInt(process.env.AIRTABLE_MAX_RETRIES || '3'),
    timeoutSeconds: parseInt(process.env.AIRTABLE_TIMEOUT_SECONDS || '30'),
  };

  if (!config.apiKey || !config.baseId || !config.eventsTableId || !config.aliasesTableId) {
    const missingVars = [];
    if (!config.apiKey) missingVars.push('AIRTABLE_API_KEY');
    if (!config.baseId) missingVars.push('AIRTABLE_BASE_ID');
    if (!config.eventsTableId) missingVars.push('AIRTABLE_EVENTS_TABLE_ID');
    if (!config.aliasesTableId) missingVars.push('AIRTABLE_ALIASES_TABLE_ID');

    throw new Error(`Missing required Airtable configuration: ${missingVars.join(', ')}. Please check your environment variables.`);
  }

  return new AirtableService(config);
}

/**
 * Get Airtable configuration status for debugging
 */
export function getAirtableConfigStatus() {
  return {
    hasApiKey: !!(process.env.AIRTABLE_API_KEY),
    hasBaseId: !!(process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID),
    hasEventsTableId: !!(process.env.AIRTABLE_EVENTS_TABLE_ID || process.env.NEXT_PUBLIC_AIRTABLE_EVENTS_TABLE_ID),
    hasAliasesTableId: !!(process.env.AIRTABLE_ALIASES_TABLE_ID || process.env.NEXT_PUBLIC_AIRTABLE_ALIASES_TABLE_ID),
    environment: typeof window === 'undefined' ? 'server' : 'client',
  };
}