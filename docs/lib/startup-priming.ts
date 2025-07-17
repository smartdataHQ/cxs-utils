/**
 * Startup priming service to ensure Event Bible is ready on application start
 */

import { eventBiblePrimingService } from './event-bible-priming';

let primingPromise: Promise<void> | null = null;

/**
 * Initialize Event Bible priming on application startup
 * This should be called once when the application starts
 */
export async function initializeEventBible(): Promise<void> {
  if (primingPromise) {
    return primingPromise;
  }

  primingPromise = (async () => {
    try {
      console.log('🚀 Initializing Event Bible...');
      
      // Check if priming is needed
      if (eventBiblePrimingService.shouldPrime()) {
        console.log('📚 Priming Event Bible cache from Airtable...');
        const result = await eventBiblePrimingService.primeCache();
        
        if (result.success) {
          console.log(`✅ Event Bible ready with ${result.eventsCount} events (${result.duration}ms)`);
        } else {
          console.warn(`⚠️ Event Bible priming failed: ${result.error}`);
        }
      } else {
        console.log('✅ Event Bible cache already primed');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Event Bible:', error);
    }
  })();

  return primingPromise;
}

/**
 * Get the current priming status
 */
export function getPrimingStatus() {
  return {
    isInitialized: primingPromise !== null,
    cacheStatus: eventBiblePrimingService.getCacheStatus(),
    lastPriming: eventBiblePrimingService.getLastPrimingResult(),
  };
}

// Auto-initialize on server startup (Node.js environment)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  // Delay initialization to avoid blocking startup
  setTimeout(() => {
    initializeEventBible().catch(error => {
      console.error('Failed to auto-initialize Event Bible:', error);
    });
  }, 1000);
}