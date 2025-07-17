/**
 * Next.js middleware for Event Bible priming
 */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is a request to the Event Bible pages
  if (request.nextUrl.pathname.startsWith('/docs/semantic-events/bible')) {
    // Add a header to indicate this is a Bible page request
    const response = NextResponse.next();
    response.headers.set('x-event-bible-page', 'true');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/docs/semantic-events/bible/:path*',
  ],
};