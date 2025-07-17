/**
 * API route for clearing local Event Bible JSON file
 */

import { NextResponse } from 'next/server';
import { localEventBibleService } from '@/lib/local-event-bible-service';
import { cacheService } from '@/lib/cache-service';

export async function POST() {
  try {
    // Clear local file
    await localEventBibleService.clearLocalData();
    
    // Clear cache as well
    cacheService.clear();
    
    return NextResponse.json({
      success: true,
      message: 'Local Event Bible data and cache cleared successfully',
    });
  } catch (error: any) {
    console.error('API: Failed to clear local data:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to clear local data',
      },
      { status: 500 }
    );
  }
}