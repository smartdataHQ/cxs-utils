/**
 * Basic tests for Airtable service functionality
 */

import { AirtableService } from '../airtable-service';
import { EventBibleConfig } from '../types/event-bible';

// Mock configuration for testing
const mockConfig: EventBibleConfig = {
  apiKey: 'test-api-key',
  baseId: 'test-base-id',
  eventsTableId: 'test-events-table',
  aliasesTableId: 'test-aliases-table',
  rateLimitDelay: 0.1,
  maxRetries: 2,
  timeoutSeconds: 10,
};

describe('AirtableService', () => {
  let service: AirtableService;

  beforeEach(() => {
    service = new AirtableService(mockConfig);
  });

  test('should create service instance with config', () => {
    expect(service).toBeInstanceOf(AirtableService);
  });

  test('should handle missing configuration gracefully', () => {
    expect(() => {
      const invalidConfig = { ...mockConfig, apiKey: '' };
      new AirtableService(invalidConfig);
    }).not.toThrow();
  });
});

// Note: Full integration tests would require actual Airtable API access
// These are basic structural tests to ensure the service can be instantiated