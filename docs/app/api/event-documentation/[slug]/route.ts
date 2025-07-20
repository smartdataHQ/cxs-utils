import { NextRequest, NextResponse } from 'next/server';
import { getEventDocumentationWithStatus } from '@/lib/server-event-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { content, isGenerating, error } = await getEventDocumentationWithStatus(params.slug);
    
    if (error) {
      return NextResponse.json(
        { error, isGenerating: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content,
      isGenerating,
      slug: params.slug
    });
  } catch (error) {
    console.error('Error in event documentation API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error while fetching documentation',
        isGenerating: false 
      },
      { status: 500 }
    );
  }
}