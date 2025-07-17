/**
 * Debug API route to inspect raw Airtable data
 */

import { NextResponse } from 'next/server';
import { createAirtableService } from '@/lib/airtable-service';

export async function GET() {
  try {
    // First, let's verify the configuration
    const config = {
      baseId: process.env.AIRTABLE_BASE_ID,
      eventsTableId: process.env.AIRTABLE_EVENTS_TABLE_ID,
      aliasesTableId: process.env.AIRTABLE_ALIASES_TABLE_ID,
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
    };

    console.log('Debug: Using configuration:', config);

    // Get raw response from Events table
    const eventsResponse = await fetch(`https://api.airtable.com/v0/${config.baseId}/${config.eventsTableId}?maxRecords=5`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!eventsResponse.ok) {
      throw new Error(`Events table HTTP ${eventsResponse.status}: ${eventsResponse.statusText}`);
    }

    const eventsData = await eventsResponse.json();

    // Get raw response from Aliases table
    const aliasesResponse = await fetch(`https://api.airtable.com/v0/${config.baseId}/${config.aliasesTableId}?maxRecords=5`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!aliasesResponse.ok) {
      throw new Error(`Aliases table HTTP ${aliasesResponse.status}: ${aliasesResponse.statusText}`);
    }

    const aliasesData = await aliasesResponse.json();
    
    // Analyze Events table
    const eventsFieldAnalysis = {
      tableName: 'Events',
      tableId: config.eventsTableId,
      totalRecords: eventsData.records?.length || 0,
      sampleRecords: eventsData.records?.slice(0, 3).map((record: any) => ({
        id: record.id,
        fieldNames: Object.keys(record.fields || {}),
        fields: record.fields,
      })) || [],
      allFieldNames: new Set(),
    };

    // Collect all unique field names from Events table
    eventsData.records?.forEach((record: any) => {
      Object.keys(record.fields || {}).forEach(fieldName => {
        eventsFieldAnalysis.allFieldNames.add(fieldName);
      });
    });

    // Analyze Aliases table
    const aliasesFieldAnalysis = {
      tableName: 'Aliases',
      tableId: config.aliasesTableId,
      totalRecords: aliasesData.records?.length || 0,
      sampleRecords: aliasesData.records?.slice(0, 3).map((record: any) => ({
        id: record.id,
        fieldNames: Object.keys(record.fields || {}),
        fields: record.fields,
      })) || [],
      allFieldNames: new Set(),
    };

    // Collect all unique field names from Aliases table
    aliasesData.records?.forEach((record: any) => {
      Object.keys(record.fields || {}).forEach(fieldName => {
        aliasesFieldAnalysis.allFieldNames.add(fieldName);
      });
    });

    return NextResponse.json({
      success: true,
      config,
      debug: {
        events: {
          ...eventsFieldAnalysis,
          allFieldNames: Array.from(eventsFieldAnalysis.allFieldNames),
          expectedFields: [
            'Name',  // Changed from 'Event Name' to 'Name'
            'Category', 
            'Domain',
            'Description',
            'Topic',
            'Aliases',
            'Last Updated',
            'Deprecated',
            'Deprecation Reason',
            'Deprecation Date',
            'Replacement Event'
          ],
        },
        aliases: {
          ...aliasesFieldAnalysis,
          allFieldNames: Array.from(aliasesFieldAnalysis.allFieldNames),
          expectedFields: [
            'Alias',
            'Vertical',
            'Topic'
          ],
        }
      }
    });
  } catch (error: any) {
    console.error('Debug API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to debug Airtable data',
        config: {
          baseId: process.env.AIRTABLE_BASE_ID,
          eventsTableId: process.env.AIRTABLE_EVENTS_TABLE_ID,
          aliasesTableId: process.env.AIRTABLE_ALIASES_TABLE_ID,
          hasApiKey: !!process.env.AIRTABLE_API_KEY,
        },
        debug: null,
      },
      { status: 500 }
    );
  }
}