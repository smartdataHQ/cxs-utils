/**
 * Tests for the cache service
 */

import { CacheService } from '../cache-service';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService({ ttl: 1000, maxSize: 3 });
  });

  test('should set and get values', () => {
    cacheService.set('key1', 'value1');
    expect(cacheService.get('key1')).toBe('value1');
  });

  test('should return null for non-existent keys', () => {
    expect(cacheService.get('nonexistent')).toBeNull();
  });

  test('should expire entries after TTL', async () => {
    cacheService.set('key1', 'value1', 100); // 100ms TTL
    expect(cacheService.get('key1')).toBe('value1');
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(cacheService.get('key1')).toBeNull();
  });

  test('should respect max size limit', () => {
    cacheService.set('key1', 'value1');
    cacheService.set('key2', 'value2');
    cacheService.set('key3', 'value3');
    cacheService.set('key4', 'value4'); // Should evict oldest

    expect(cacheService.get('key1')).toBeNull(); // Evicted
    expect(cacheService.get('key2')).toBe('value2');
    expect(cacheService.get('key3')).toBe('value3');
    expect(cacheService.get('key4')).toBe('value4');
  });

  test('should clear all entries', () => {
    cacheService.set('key1', 'value1');
    cacheService.set('key2', 'value2');
    
    cacheService.clear();
    
    expect(cacheService.get('key1')).toBeNull();
    expect(cacheService.get('key2')).toBeNull();
  });

  test('should cleanup expired entries', async () => {
    cacheService.set('key1', 'value1', 100); // 100ms TTL
    cacheService.set('key2', 'value2', 1000); // 1000ms TTL
    
    // Wait for first key to expire
    await new Promise(resolve => setTimeout(resolve, 150));
    
    cacheService.cleanup();
    
    expect(cacheService.get('key1')).toBeNull();
    expect(cacheService.get('key2')).toBe('value2');
  });

  test('should use getOrSet pattern', async () => {
    const fetcher = jest.fn().mockResolvedValue('fetched-value');
    
    // First call should fetch
    const result1 = await cacheService.getOrSet('key1', fetcher);
    expect(result1).toBe('fetched-value');
    expect(fetcher).toHaveBeenCalledTimes(1);
    
    // Second call should use cache
    const result2 = await cacheService.getOrSet('key1', fetcher);
    expect(result2).toBe('fetched-value');
    expect(fetcher).toHaveBeenCalledTimes(1); // Not called again
  });

  test('should provide cache statistics', () => {
    cacheService.set('key1', 'value1');
    cacheService.set('key2', 'value2');
    
    const stats = cacheService.getStats();
    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBe(3);
  });
});