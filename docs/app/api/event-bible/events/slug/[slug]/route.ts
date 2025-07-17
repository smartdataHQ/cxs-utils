import { NextRequest, NextResponse } from 'next/server';
import { createAirtableService } from '@/lib/airtable-service';
import { localEventBibleService } from '@/lib/local-event-bible-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    let event = null;

    // Try to load from local JSON file first
    const hasLocalData = await localEventBibleService.hasLocalData();
    
    if (hasLocalData) {
      const localData = await localEventBibleService.loadLocalData();
      if (localData && localData.events.length > 0) {
        event = localData.events.find((e: { topic: string; }) => e.topic === slug);
        if (event) {
          console.log(`API: Serving event with slug ${slug} from local JSON file`);
          return NextResponse.json({ 
            event,
            source: 'local'
          });
        }
      }
    }

    // Fall back to Airtable if not found in local data
    console.log(`API: Event with slug ${slug} not found in local data, fetching from Airtable...`);
    const airtableService = createAirtableService();
    event = await airtableService.fetchEventBySlug(slug);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      event,
      source: 'airtable'
    });
  } catch (error: any) {
    console.error('API Error - Fetch event by slug:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch event',
        details: error.message 
      },
      { status: 500 }
    );
  }
}