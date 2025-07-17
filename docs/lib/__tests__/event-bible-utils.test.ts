/**
 * Tests for Event Bible utility functions
 */

import {
  filterEventsBySearch,
  filterEventsByCategory,
  getUniqueCategories,
  sortEvents,
  validateSemanticEvent,
  generateEventSlug,
  formatDate,
} from '../event-bible-utils';
import { SemanticEvent } from '../types/event-bible';

const mockEvents: SemanticEvent[] = [
  {
    airtable_id: '1',
    airtableId: '1',
    name: 'User Login',
    description: 'User authentication event',
    category: 'Authentication',
    domain: 'User Management',
    topic: 'auth',
    aliases: [{ name: 'login', vertical: 'web', topic: 'auth' }],
    lastUpdated: '2024-01-01T00:00:00Z',
  },
  {
    airtable_id: '2',
    airtableId: '2',
    name: 'Product View',
    description: 'Product page viewed',
    category: 'Commerce',
    domain: 'E-commerce',
    topic: 'product',
    aliases: [{ name: 'view_product', vertical: 'retail', topic: 'product' }],
    lastUpdated: '2024-01-02T00:00:00Z',
  },
];

describe('Event Bible Utils', () => {
  describe('filterEventsBySearch', () => {
    test('should filter events by search term', () => {
      const result = filterEventsBySearch(mockEvents, 'login');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('User Login');
    });

    test('should return all events for empty search', () => {
      const result = filterEventsBySearch(mockEvents, '');
      expect(result).toHaveLength(2);
    });
  });

  describe('filterEventsByCategory', () => {
    test('should filter events by category', () => {
      const result = filterEventsByCategory(mockEvents, 'Commerce');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Commerce');
    });
  });

  describe('getUniqueCategories', () => {
    test('should return unique categories', () => {
      const categories = getUniqueCategories(mockEvents);
      expect(categories).toEqual(['Authentication', 'Commerce']);
    });
  });

  describe('sortEvents', () => {
    test('should sort events by name', () => {
      const sorted = sortEvents(mockEvents, 'name', 'asc');
      expect(sorted[0].name).toBe('Product View');
      expect(sorted[1].name).toBe('User Login');
    });
  });

  describe('validateSemanticEvent', () => {
    test('should validate correct event structure', () => {
      expect(validateSemanticEvent(mockEvents[0])).toBe(true);
    });

    test('should reject invalid event structure', () => {
      const invalid = { name: 'test' };
      expect(validateSemanticEvent(invalid)).toBe(false);
    });
  });

  describe('generateEventSlug', () => {
    test('should generate URL-friendly slug', () => {
      expect(generateEventSlug('User Login Event')).toBe('user-login-event');
      expect(generateEventSlug('Product View & Purchase')).toBe('product-view-purchase');
    });
  });

  describe('formatDate', () => {
    test('should format date string', () => {
      const formatted = formatDate('2024-01-01T00:00:00Z');
      expect(formatted).toMatch(/Jan 1, 2024/);
    });
  });
});