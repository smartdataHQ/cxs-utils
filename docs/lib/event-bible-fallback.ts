/**
 * Fallback content for Event Bible when Airtable is unavailable
 */

import { SemanticEvent } from './types/event-bible';

export const FALLBACK_EVENTS: SemanticEvent[] = [
  {
    airtable_id: 'fallback-1',
    airtableId: 'fallback-1',
    name: 'Page Viewed',
    description: 'Triggered when a user views a page or screen in your application',
    category: 'Navigation',
    domain: 'Web',
    topic: 'page_interaction',
    aliases: [
      { name: 'screen_view', vertical: 'Mobile', topic: 'page_interaction' },
      { name: 'page_load', vertical: 'Web', topic: 'page_interaction' }
    ],
    lastUpdated: '2024-01-15T10:00:00Z',
    deprecated: false
  },
  {
    airtable_id: 'fallback-2',
    airtableId: 'fallback-2',
    name: 'Button Clicked',
    description: 'Triggered when a user clicks on a button or interactive element',
    category: 'Interaction',
    domain: 'Web',
    topic: 'user_interaction',
    aliases: [
      { name: 'click_event', vertical: 'Web', topic: 'user_interaction' },
      { name: 'tap_event', vertical: 'Mobile', topic: 'user_interaction' }
    ],
    lastUpdated: '2024-01-15T10:00:00Z',
    deprecated: false
  },
  {
    airtable_id: 'fallback-3',
    airtableId: 'fallback-3',
    name: 'Form Submitted',
    description: 'Triggered when a user successfully submits a form',
    category: 'Conversion',
    domain: 'Web',
    topic: 'form_interaction',
    aliases: [
      { name: 'form_complete', vertical: 'Web', topic: 'form_interaction' },
      { name: 'submission_success', vertical: 'Web', topic: 'form_interaction' }
    ],
    lastUpdated: '2024-01-15T10:00:00Z',
    deprecated: false
  },
  {
    airtable_id: 'fallback-4',
    airtableId: 'fallback-4',
    name: 'Product Viewed',
    description: 'Triggered when a user views a product detail page',
    category: 'Commerce',
    domain: 'Ecommerce',
    topic: 'product_interaction',
    aliases: [
      { name: 'item_view', vertical: 'Retail', topic: 'product_interaction' },
      { name: 'product_detail_view', vertical: 'Ecommerce', topic: 'product_interaction' }
    ],
    lastUpdated: '2024-01-15T10:00:00Z',
    deprecated: false
  },
  {
    airtable_id: 'fallback-5',
    airtableId: 'fallback-5',
    name: 'Legacy Event',
    description: 'An example of a deprecated event that should no longer be used',
    category: 'Legacy',
    domain: 'Web',
    topic: 'deprecated_interaction',
    aliases: [
      { name: 'old_event', vertical: 'Web', topic: 'deprecated_interaction' }
    ],
    lastUpdated: '2023-06-01T10:00:00Z',
    deprecated: true,
    deprecationReason: 'This event has been replaced with more specific tracking events that provide better data granularity.',
    deprecationDate: '2023-12-01T00:00:00Z',
    replacementEvent: 'Button Clicked'
  }
];

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