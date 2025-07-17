import { Activity, Database, Users, Book, Shield, FileText, Hash } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SearchResult {
  title: string;
  href: string;
  content: string;
  section?: string;
  type: 'page' | 'section' | 'heading';
}

/**
 * Centralized search results configuration
 * This eliminates hardcoded search data in docs-search.tsx
 */
export const searchResults: SearchResult[] = [
  {
    title: 'Introduction to Semantic Events',
    href: '/docs',
    content: 'Learn about semantic event tracking and how it captures meaningful business interactions.',
    type: 'page'
  },
  {
    title: 'Getting Started',
    href: '/docs/semantic-events/getting-started',
    content: 'Quick start guide to implementing semantic events in your application.',
    section: 'Semantic Events',
    type: 'page'
  },
  {
    title: 'Event Bible',
    href: '/docs/semantic-events/bible',
    content: 'Interactive catalog of semantic events from Airtable with search, filtering, and detailed documentation for each event type.',
    section: 'Semantic Events',
    type: 'page'
  },
  {
    title: 'Browse All Events',
    href: '/docs/semantic-events/bible',
    content: 'Search and filter through all available semantic events by category, domain, and vertical.',
    section: 'Event Bible',
    type: 'section'
  },
  {
    title: 'Event Documentation',
    href: '/docs/semantic-events/bible',
    content: 'Detailed event schemas, code examples, and implementation guides for each semantic event.',
    section: 'Event Bible',
    type: 'section'
  },
  {
    title: 'Event Validation',
    href: '/docs/semantic-events/validation',
    content: 'Learn how to validate semantic events and ensure data quality.',
    section: 'Semantic Events',
    type: 'page'
  },
  {
    title: 'Schema Reference',
    href: '/docs/semantic-events/schema/all',
    content: 'Complete schema documentation with all properties, types, and examples.',
    section: 'Schema',
    type: 'page'
  },
  {
    title: 'Entity Identification',
    href: '/docs/entities/identification',
    content: 'Advanced entity identification system for tracking users, products, and business objects.',
    section: 'Entities',
    type: 'page'
  },
  {
    title: 'Travel & Hospitality Events',
    href: '/docs/semantic-events/bible/travel-and-hospitality',
    content: 'Hotel bookings, flight searches, reviews, and travel-specific event schemas.',
    section: 'Industry Events',
    type: 'page'
  },
  {
    title: 'Commerce Event Properties',
    href: '/docs/semantic-events/schema/commerce',
    content: 'Properties specific to eCommerce events including pricing, products, and transactions.',
    section: 'Schema',
    type: 'page'
  },
  {
    title: 'Best Practices',
    href: '/docs/semantic-events/best-practices',
    content: 'Best practices for implementing and maintaining semantic event tracking.',
    section: 'Semantic Events',
    type: 'page'
  }
];

export const recentSearches = [
  'event bible',
  'core events',
  'schema reference',
  'validation',
  'entity identification'
];

/**
 * Get icon for search result based on content type
 */
export function getSearchResultIcon(result: SearchResult): LucideIcon {
  if (result.title.includes('Schema') || result.title.includes('Reference')) return Database;
  if (result.title.includes('Entity') || result.title.includes('Entities')) return Users;
  if (result.title.includes('Bible') || result.title.includes('Events')) return Book;
  if (result.title.includes('Validation') || result.title.includes('Best Practices')) return Shield;
  if (result.title.includes('Getting Started') || result.title.includes('Introduction')) return Activity;
  if (result.type === 'section') return Hash;
  return FileText;
}