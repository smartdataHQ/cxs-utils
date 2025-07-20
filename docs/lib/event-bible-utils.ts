/**
 * Utility functions for Event Bible data transformation and processing
 */

import {
  SemanticEvent,
  Alias,
  AirtableRecord,
  AirtableEventFields,
  AirtableAliasFields,
} from './types/event-bible';

/**
 * Transform raw Airtable event record to SemanticEvent
 */
export function transformEventRecord(
  eventRecord: AirtableRecord<AirtableEventFields>,
  aliasMap: Map<string, Alias>
): SemanticEvent {
  const fields = eventRecord.fields;
  
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
    airtable_id: eventRecord.id,
    name: sanitizeString(fields['Name']),
    description: sanitizeString(fields.Description),
    category: sanitizeString(fields.Category),
    domain: sanitizeString(fields.Domain),
    topic: sanitizeString(fields.Topic),
    extraCategoryAttributes: sanitizeString(fields['Extra Category Attributes']),
    extraDomainAttributes: sanitizeString(fields['Extra Domain Attributes']),
    aliases,
    lastUpdated: fields['Last Updated'] || eventRecord.createdTime,
  };
}

/**
 * Transform raw Airtable alias record to Alias
 */
export function transformAliasRecord(
  aliasRecord: AirtableRecord<AirtableAliasFields>
): Alias {
  const fields = aliasRecord.fields;
  
  return {
    name: sanitizeString(fields.Alias),
    vertical: sanitizeString(fields.Vertical),
    topic: sanitizeString(fields.Topic),
    description: sanitizeString(fields.Description || ''),
    extraVerticalAttributes: sanitizeString(fields["Extra Vertical Attributes"])
  };
}

/**
 * Create a map of alias IDs to Alias objects for quick lookup
 */
export function createAliasMap(
  aliasRecords: AirtableRecord<AirtableAliasFields>[]
): Map<string, Alias> {
  const aliasMap = new Map<string, Alias>();
  
  aliasRecords.forEach(record => {
    const alias = transformAliasRecord(record);
    aliasMap.set(record.id, alias);
  });
  
  return aliasMap;
}

/**
 * Filter events by search term
 */
export function filterEventsBySearch(
  events: SemanticEvent[],
  searchTerm: string
): SemanticEvent[] {
  if (!searchTerm.trim()) {
    return events;
  }

  const term = searchTerm.toLowerCase().trim();
  
  return events.filter(event => {
    // Search in event name, description, category, domain, and topic
    const searchableText = [
      event.name,
      event.description,
      event.category,
      event.domain,
      event.topic,
      ...event.aliases.map(alias => alias.name),
      ...event.aliases.map(alias => alias.vertical),
    ].join(' ').toLowerCase();
    
    return searchableText.includes(term);
  });
}

/**
 * Filter events by category
 */
export function filterEventsByCategory(
  events: SemanticEvent[],
  category: string
): SemanticEvent[] {
  if (!category) {
    return events;
  }
  
  return events.filter(event => 
    event.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Filter events by domain
 */
export function filterEventsByDomain(
  events: SemanticEvent[],
  domain: string
): SemanticEvent[] {
  if (!domain) {
    return events;
  }
  
  return events.filter(event => 
    event.domain === domain.toLowerCase()
  );
}

/**
 * Filter events by vertical (from aliases)
 */
export function filterEventsByVertical(
  events: SemanticEvent[],
  vertical: string
): SemanticEvent[] {
  if (!vertical) {
    return events;
  }
  
  return events.filter(event => 
    event.aliases.some(alias => 
      alias.vertical.toLowerCase() === vertical.toLowerCase()
    )
  );
}

/**
 * Get unique categories from events
 */
export function getUniqueCategories(events: SemanticEvent[]): string[] {
  const categories = new Set<string>();
  events.forEach(event => {
    if (event.category) {
      categories.add(event.category);
    }
  });
  return Array.from(categories).sort();
}

/**
 * Get unique domains from events
 */
export function getUniqueDomains(events: SemanticEvent[]): string[] {
  const domains = new Set<string>();
  events.forEach(event => {
    if (event.domain) {
      domains.add(event.domain);
    }
  });
  return Array.from(domains).sort();
}

/**
 * Get unique verticals from event aliases
 */
export function getUniqueVerticals(events: SemanticEvent[]): string[] {
  const verticals = new Set<string>();
  events.forEach(event => {
    event.aliases.forEach(alias => {
      if (alias.vertical) {
        verticals.add(alias.vertical);
      }
    });
  });
  return Array.from(verticals).sort();
}

/**
 * Sort events by specified field
 */
export function sortEvents(
  events: SemanticEvent[],
  sortBy: 'name' | 'category' | 'domain' | 'lastUpdated',
  direction: 'asc' | 'desc' = 'asc'
): SemanticEvent[] {
  return [...events].sort((a, b) => {
    let aValue: string | Date;
    let bValue: string | Date;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case 'domain':
        aValue = a.domain.toLowerCase();
        bValue = b.domain.toLowerCase();
        break;
      case 'lastUpdated':
        aValue = new Date(a.lastUpdated);
        bValue = new Date(b.lastUpdated);
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Find related events based on category, domain, or aliases
 */
export function findRelatedEvents(
  targetEvent: SemanticEvent,
  allEvents: SemanticEvent[],
  maxResults: number = 5
): SemanticEvent[] {
  const related = allEvents
    .filter(event => event.airtable_id !== targetEvent.airtable_id)
    .map(event => {
      let score = 0;
      
      // Same category gets highest score
      if (event.category === targetEvent.category) {
        score += 10;
      }
      
      // Same domain gets medium score
      if (event.domain === targetEvent.domain) {
        score += 5;
      }
      
      // Shared aliases get lower score
      const sharedAliases = event.aliases.filter(alias =>
        targetEvent.aliases.some(targetAlias => 
          targetAlias.vertical === alias.vertical
        )
      );
      score += sharedAliases.length * 2;
      
      return { event, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.event);
    
  return related;
}

/**
 * Validate SemanticEvent data structure
 */
export function validateSemanticEvent(event: any): event is SemanticEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    typeof event.airtable_id === 'string' &&
    typeof event.name === 'string' &&
    typeof event.description === 'string' &&
    typeof event.category === 'string' &&
    typeof event.domain === 'string' &&
    typeof event.topic === 'string' &&
    typeof event.lastUpdated === 'string' &&
    typeof event.lastUpdated === 'string' &&
    Array.isArray(event.aliases) &&
    event.aliases.every(validateAlias)
  );
}

/**
 * Validate Alias data structure
 */
export function validateAlias(alias: any): alias is Alias {
  return (
    typeof alias === 'object' &&
    alias !== null &&
    typeof alias.name === 'string' &&
    typeof alias.vertical === 'string' &&
    typeof alias.topic === 'string'
  );
}

/**
 * Sanitize string values from Airtable
 */
function sanitizeString(value: any): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

/**
 * Generate a URL-friendly slug from event name
 */
export function generateEventSlug(eventName: string): string {
  return eventName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}