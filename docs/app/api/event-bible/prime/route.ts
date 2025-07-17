/**
 * API route for priming Event Bible cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { eventBiblePrimingService } from '@/lib/event-bible-priming';

export async function POST(request: NextRequest) {
  try {
    const { force, forceAirtable } = await request.json().catch(() => ({}));
    
    let result;
    if (forceAirtable) {
      result = await eventBiblePrimingService.reloadFromAirtable();
    } else if (force) {
      result = await eventBiblePrimingService.refreshCache();
    } else {
      result = await eventBiblePrimingService.primeCache();
    }

    return NextResponse.json({
      success: result.success,
      eventsCount: result.eventsCount,
      duration: result.duration,
      timestamp: result.timestamp,
      source: result.source,
      error: result.error,
    });
  } catch (error: any) {
    console.error('API: Failed to prime Event Bible cache:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to prime cache',
        eventsCount: 0,
        duration: 0,
        timestamp: new Date(),
        source: 'local',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const status = eventBiblePrimingService.getCacheStatus();
    const lastPriming = eventBiblePrimingService.getLastPrimingResult();
    
    return NextResponse.json({
      cacheStatus: status,
      lastPriming,
      shouldPrime: eventBiblePrimingService.shouldPrime(),
    });
  } catch (error: any) {
    console.error('API: Failed to get Event Bible cache status:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to get cache status',
      },
      { status: 500 }
    );
  }
}