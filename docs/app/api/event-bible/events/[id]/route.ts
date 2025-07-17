/**
 * API route for fetching a specific event by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAirtableService } from '@/lib/airtable-service';
import { localEventBibleService } from '@/lib/local-event-bible-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    let event = null;

    // Try to load from local JSON file first
    const hasLocalData = await localEventBibleService.hasLocalData();
    
    if (hasLocalData) {
      const localData = await localEventBibleService.loadLocalData();
      if (localData && localData.events.length > 0) {
        event = localData.events.find(e => e.airtable_id === id || e.airtableId === id);
        if (event) {
          console.log(`API: Serving event ${id} from local JSON file`);
          return NextResponse.json({
            success: true,
            event,
            source: 'local',
          });
        }
      }
    }

    // Fall back to Airtable if not found in local data
    console.log(`API: Event ${id} not found in local data, fetching from Airtable...`);
    const airtableService = createAirtableService();
    event = await airtableService.fetchEventById(id);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found',
          event: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
      source: 'airtable',
    });
  } catch (error: any) {
    console.error('API: Failed to fetch event by ID:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch event',
        event: null,
      },
      { status: 500 }
    );
  }
}