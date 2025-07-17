/**
 * Test API route to verify pagination and field mapping
 */

import { NextResponse } from 'next/server';
import { createAirtableService } from '@/lib/airtable-service';

export async function GET() {
  try {
    console.log('🧪 Testing Event Bible pagination and field mapping...');
    
    const airtableService = createAirtableService();
    const events = await airtableService.fetchAllEvents();
    
    // Analyze the results
    const analysis = {
      totalEvents: events.length,
      eventsWithNames: events.filter(e => e.name && e.name.trim() !== '').length,
      eventsWithoutNames: events.filter(e => !e.name || e.name.trim() === '').length,
      sampleEvents: events.slice(0, 5).map(event => ({
        id: event.airtable_id,
        name: event.name,
        hasName: !!(event.name && event.name.trim()),
        category: event.category,
        domain: event.domain,
        aliasCount: event.aliases.length,
      })),
      fieldAnalysis: {
        categories: [...new Set(events.map(e => e.category).filter(Boolean))].length,
        domains: [...new Set(events.map(e => e.domain).filter(Boolean))].length,
        totalAliases: events.reduce((sum, e) => sum + e.aliases.length, 0),
      }
    };

    console.log('📊 Analysis results:', analysis);

    return NextResponse.json({
      success: true,
      message: 'Pagination and field mapping test completed',
      analysis,
      recommendations: analysis.eventsWithoutNames > 0 ? [
        `Found ${analysis.eventsWithoutNames} events without names - these may be incomplete records in Airtable`,
        'Check the sample events to see if the Name field is being read correctly',
        'Verify that the Name field in Airtable contains actual values'
      ] : [
        'All events have names - field mapping is working correctly!',
        `Successfully loaded ${analysis.totalEvents} events with pagination`
      ]
    });
  } catch (error: any) {
    console.error('🚨 Test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Test failed',
        analysis: null,
      },
      { status: 500 }
    );
  }
}