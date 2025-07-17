/**
 * Tests for Local Event Bible Service
 */

import { localEventBibleService, LocalEventBibleData } from '../local-event-bible-service';
import { SemanticEvent } from '../types/event-bible';

// Mock fs promises
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
    unlink: jest.fn(),
  },
}));

const mockFs = require('fs').promises;

describe('LocalEventBibleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasLocalData', () => {
    it('should return true when file exists and has content', async () => {
      mockFs.stat.mockResolvedValue({ size: 1000 });
      
      const result = await localEventBibleService.hasLocalData();
      
      expect(result).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      mockFs.stat.mockRejectedValue(new Error('File not found'));
      
      const result = await localEventBibleService.hasLocalData();
      
      expect(result).toBe(false);
    });

    it('should return false when file is empty', async () => {
      mockFs.stat.mockResolvedValue({ size: 0 });
      
      const result = await localEventBibleService.hasLocalData();
      
      expect(result).toBe(false);
    });
  });

  describe('loadLocalData', () => {
    it('should load and parse valid JSON data', async () => {
      const mockData: LocalEventBibleData = {
        events: [
          {
            airtable_id: 'rec123',
            airtableId: 'rec123',
            name: 'Test Event',
            description: 'Test Description',
            category: 'Test Category',
            domain: 'test',
            topic: 'Test Topic',
            topicSlug: 'test-topic',
            aliases: [],
            lastUpdated: '2025-01-17T10:00:00.000Z',
            deprecated: false,
          } as SemanticEvent,
        ],
        filterOptions: {
          categories: ['Test Category'],
          domains: ['test'],
          verticals: [],
        },
        metadata: {
          lastUpdated: '2025-01-17T10:00:00.000Z',
          source: 'airtable',
          eventsCount: 1,
          version: '1.0.0',
        },
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockData));
      
      const result = await localEventBibleService.loadLocalData();
      
      expect(result).toEqual(mockData);
    });

    it('should return null for invalid JSON', async () => {
      mockFs.readFile.mockResolvedValue('invalid json');
      
      const result = await localEventBibleService.loadLocalData();
      
      expect(result).toBeNull();
    });

    it('should return null when file read fails', async () => {
      mockFs.readFile.mockRejectedValue(new Error('Read error'));
      
      const result = await localEventBibleService.loadLocalData();
      
      expect(result).toBeNull();
    });
  });

  describe('createEventBibleData', () => {
    it('should create proper data structure from events', () => {
      const events: SemanticEvent[] = [
        {
          airtable_id: 'rec123',
          airtableId: 'rec123',
          name: 'Test Event',
          description: 'Test Description',
          category: 'Category A',
          domain: 'domain1',
          topic: 'Test Topic',
          topicSlug: 'test-topic',
          aliases: [
            {
              name: 'Test Alias',
              vertical: 'Vertical A',
              topic: 'Test Topic',
            },
          ],
          lastUpdated: '2025-01-17T10:00:00.000Z',
          deprecated: false,
        },
        {
          airtable_id: 'rec456',
          airtableId: 'rec456',
          name: 'Another Event',
          description: 'Another Description',
          category: 'Category B',
          domain: 'domain2',
          topic: 'Another Topic',
          topicSlug: 'another-topic',
          aliases: [
            {
              name: 'Another Alias',
              vertical: 'Vertical B',
              topic: 'Another Topic',
            },
          ],
          lastUpdated: '2025-01-17T11:00:00.000Z',
          deprecated: false,
        },
      ];

      const result = localEventBibleService.createEventBibleData(events);

      expect(result.events).toEqual(events);
      expect(result.filterOptions.categories).toEqual(['Category A', 'Category B']);
      expect(result.filterOptions.domains).toEqual(['domain1', 'domain2']);
      expect(result.filterOptions.verticals).toEqual(['Vertical A', 'Vertical B']);
      expect(result.metadata.eventsCount).toBe(2);
      expect(result.metadata.source).toBe('airtable');
      expect(result.metadata.version).toBe('1.0.0');
    });

    it('should handle empty events array', () => {
      const events: SemanticEvent[] = [];

      const result = localEventBibleService.createEventBibleData(events);

      expect(result.events).toEqual([]);
      expect(result.filterOptions.categories).toEqual([]);
      expect(result.filterOptions.domains).toEqual([]);
      expect(result.filterOptions.verticals).toEqual([]);
      expect(result.metadata.eventsCount).toBe(0);
    });
  });

  describe('saveLocalData', () => {
    it('should save data and create backup', async () => {
      const mockData: LocalEventBibleData = {
        events: [],
        filterOptions: { categories: [], domains: [], verticals: [] },
        metadata: {
          lastUpdated: '2025-01-17T10:00:00.000Z',
          source: 'airtable',
          eventsCount: 0,
          version: '1.0.0',
        },
      };

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({ size: 100 }); // File exists for backup
      mockFs.readFile.mockResolvedValue('existing data');
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([]);

      await localEventBibleService.saveLocalData(mockData);

      expect(mockFs.mkdir).toHaveBeenCalledTimes(2); // data dir and backup dir
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('events.json'),
        JSON.stringify(mockData, null, 2),
        'utf-8'
      );
    });
  });
});