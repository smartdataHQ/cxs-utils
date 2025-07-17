/**
 * API route for fetching all events
 */

import { NextResponse } from 'next/server';
import { createAirtableService } from '@/lib/airtable-service';
import { localEventBibleService } from '@/lib/local-event-bible-service';

export async function GET() {
  try {
    // Try to load from local JSON file first
    const hasLocalData = await localEventBibleService.hasLocalData();
    
    if (hasLocalData) {
      const localData = await localEventBibleService.loadLocalData();
      if (localData && localData.events.length > 0) {
        console.log(`API: Serving ${localData.events.length} events from local JSON file`);
        return NextResponse.json({
          success: true,
          events: localData.events,
          count: localData.events.length,
          source: 'local',
        });
      }
    }

    // Fall back to Airtable if no local data
    console.log('API: No local data available, fetching from Airtable...');
    const airtableService = createAirtableService();
    const events = await airtableService.fetchAllEvents();

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
      source: 'airtable',
    });
  } catch (error: any) {
    console.error('API: Failed to fetch events:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch events',
        events: [],
        count: 0,
        source: 'error',
      },
      { status: 500 }
    );
  }
}