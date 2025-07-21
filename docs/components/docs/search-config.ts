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
    title: 'What are Semantic Events?',
    href: '/docs/semantic-events/understanding-semantic-events',
    content: 'Introduction to the concept of semantic events and their purpose.',
    section: 'Semantic Events',
    type: 'page'
  },
  {
    title: 'Quick Start',
    href: '/docs/semantic-events/getting-started',
    content: 'Quick start guide for implementing semantic events.',
    section: 'Semantic Events',
    type: 'page'
  },
  {
    title: 'Installation',
    href: '/docs/semantic-events/installation',
    content: 'How to install and set up semantic events.',
    section: 'Quick Start',
    type: 'page'
  },
  {
    title: 'Event Types',
    href: '/docs/semantic-events/event-types',
    content: 'Overview of different types of semantic events.',
    section: 'Semantic Events',
    type: 'page'
  },
  {
    title: 'Advanced Concepts',
    href: '/docs/semantic-events/advanced-concepts',
    content: 'Deep dive into advanced semantic event concepts.',
    section: 'Semantic Events',
    type: 'page'
  },
  {
    title: 'Core Principles',
    href: '/docs/semantic-events/core-principles',
    content: 'Core principles behind semantic event tracking.',
    section: 'Semantic Events',
    type: 'page'
  },

  {
    title: 'The shortcut to insights',
    href: '/docs/semantic-events/the-event-bible',
    content: 'How the Event Bible accelerates insights.',
    section: 'Examples',
    type: 'page'
  },
  {
    title: 'Event Bible',
    href: '/docs/semantic-events/bible',
    content: 'Interactive Event Bible for discovering and understanding events.',
    section: 'Examples',
    type: 'page'
  },

  {
    title: 'Semantic Events Schema',
    href: '/docs/semantic-events/schema',
    content: 'Top-level schema documentation for semantic events.',
    section: 'Schema Reference',
    type: 'page'
  },
  {
    title: 'Analysis Cost',
    href: '/docs/semantic-events/schema/analysis-cost',
    content: 'Schema details for analysis cost.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Classification',
    href: '/docs/semantic-events/schema/classification',
    content: 'Schema details for classification.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Commerce',
    href: '/docs/semantic-events/schema/commerce',
    content: 'Schema details for commerce.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Content & Properties',
    href: '/docs/semantic-events/schema/content-and-properties',
    content: 'Schema details for content and properties.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Context',
    href: '/docs/semantic-events/schema/context',
    content: 'Schema details for context.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Dimensions & Metrics (BI)',
    href: '/docs/semantic-events/schema/dimensions-and-metrics',
    content: 'Schema details for dimensions and metrics.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Entity Sentiment',
    href: '/docs/semantic-events/schema/sentiment',
    content: 'Schema details for entity sentiment.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Governance',
    href: '/docs/semantic-events/schema/governance',
    content: 'Schema details for governance.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Involves',
    href: '/docs/semantic-events/schema/involves',
    content: 'Schema details for involved entities.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Location',
    href: '/docs/semantic-events/schema/location',
    content: 'Schema details for location.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Processing Controls',
    href: '/docs/semantic-events/schema/processing',
    content: 'Schema details for event processing.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Products',
    href: '/docs/semantic-events/schema/products',
    content: 'Schema details for products.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Root Event',
    href: '/docs/semantic-events/schema/root',
    content: 'Schema details for the root event.',
    section: 'Semantic Events Schema',
    type: 'page'
  },
  {
    title: 'Traits',
    href: '/docs/semantic-events/schema/traits',
    content: 'Schema details for user traits.',
    section: 'Semantic Events Schema',
    type: 'page'
  }
];


export const recentSearches = [
  'What are Semantic Events',
  'Semantic Events Schema',
  'Content & Properties',
  'Analysis Cost',
  'Traits'
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