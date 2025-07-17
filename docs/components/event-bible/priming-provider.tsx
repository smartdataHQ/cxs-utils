/**
 * Event Bible Priming Provider
 * Client-side component to handle Event Bible cache priming
 */

'use client';

import { useEffect } from 'react';
import { initializeEventBible } from '@/lib/startup-priming';

export function EventBiblePrimingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Event Bible priming on client-side mount
    initializeEventBible().catch(error => {
      console.warn('Failed to initialize Event Bible:', error);
    });
  }, []);

  return <>{children}</>;
}