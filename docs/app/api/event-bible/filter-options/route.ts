/**
 * API route for fetching filter options
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
      if (localData && localData.filterOptions) {
        console.log('API: Serving filter options from local JSON file');
        return NextResponse.json({
          success: true,
          ...localData.filterOptions,
          source: 'local',
        });
      }
    }

    // Fall back to Airtable if no local data
    console.log('API: No local data available, fetching filter options from Airtable...');
    const airtableService = createAirtableService();
    const filterOptions = await airtableService.getFilterOptions();

    return NextResponse.json({
      success: true,
      ...filterOptions,
      source: 'airtable',
    });
  } catch (error: any) {
    console.error('API: Failed to fetch filter options:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch filter options',
        categories: [],
        domains: [],
        verticals: [],
        source: 'error',
      },
      { status: 500 }
    );
  }
}