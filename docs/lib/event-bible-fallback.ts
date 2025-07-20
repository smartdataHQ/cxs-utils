/**
 * Fallback content for Event Bible when Airtable is unavailable
 */

import { SemanticEvent } from './types/event-bible';

export const FALLBACK_EVENTS: SemanticEvent[] = [];

export const FALLBACK_ERROR_MESSAGE = `
Event Bible is currently running in offline mode. The events shown below are examples to demonstrate the interface and functionality.

To access your actual event data, please:
• Configure your Airtable API credentials
• Ensure network connectivity
• Verify Airtable service availability
`;

export function getFallbackEvents(): SemanticEvent[] {
  return FALLBACK_EVENTS;
}

export function getFallbackEventById(id: string): SemanticEvent | null {
  return FALLBACK_EVENTS.find(event => event.airtable_id === id) || null;
}