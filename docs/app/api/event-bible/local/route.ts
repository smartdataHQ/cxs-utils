/**
 * API route for managing local Event Bible JSON file
 */

import { NextRequest, NextResponse } from 'next/server';
import { localEventBibleService } from '@/lib/local-event-bible-service';

export async function GET() {
  try {
    const metadata = await localEventBibleService.getLocalDataMetadata();
    const backups = await localEventBibleService.listBackups();
    
    return NextResponse.json({
      success: true,
      metadata,
      backups,
    });
  } catch (error: any) {
    console.error('API: Failed to get local data metadata:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get local data metadata',
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await localEventBibleService.clearLocalData();
    
    return NextResponse.json({
      success: true,
      message: 'Local Event Bible data cleared successfully',
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

export async function POST(request: NextRequest) {
  try {
    const { action, filename } = await request.json();
    
    if (action === 'restore' && filename) {
      await localEventBibleService.restoreFromBackup(filename);
      
      return NextResponse.json({
        success: true,
        message: `Successfully restored from backup: ${filename}`,
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action or missing parameters',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('API: Failed to perform local data action:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to perform action',
      },
      { status: 500 }
    );
  }
}