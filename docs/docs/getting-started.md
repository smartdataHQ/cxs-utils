---
title: Getting Started with Semantic Events
description: Learn how to implement semantic event tracking in your application
---

# Getting Started with Semantic Events

Welcome to ContextSuite's Semantic Events platform! This guide will help you understand and implement standardized event tracking that captures meaningful business interactions with rich context and metadata.

## What are Semantic Events?

Semantic events are standardized, structured data points that capture meaningful business interactions in your application. Unlike traditional analytics events, semantic events include rich context, standardized schemas, and industry-specific properties that make your data more valuable for analytics, personalization, and machine learning.

{% callout type="info" title="Why Semantic Events?" %}
Traditional event tracking often results in inconsistent data structures and missing context. Semantic events solve this by providing standardized schemas that capture the full meaning of user interactions.
{% /callout %}

## Key Benefits

### Standardized Data Structure
- **Consistent Schema**: All events follow standardized property names and structures
- **Rich Context**: Events include comprehensive metadata about users, products, and interactions
- **Industry Standards**: Pre-built schemas for eCommerce, travel, real estate, and more

### Analytics Ready
- **Built-in Dimensions**: Events include pre-defined dimensions for segmentation
- **Metric Calculations**: Automatic calculation of key business metrics
- **ML-Friendly**: Structured data perfect for machine learning models

## Core Concepts

### Event Structure
Every semantic event follows a consistent structure:

```json
{
  "event": "product_viewed",
  "timestamp": "2024-01-15T10:30:00Z",
  "user_id": "user_12345",
  "session_id": "session_67890",
  "properties": {
    "product_id": "SKU-12345",
    "product_name": "Wireless Headphones",
    "category": "Electronics",
    "price": 199.99,
    "currency": "USD"
  },
  "context": {
    "page": {
      "url": "https://example.com/products/wireless-headphones",
      "title": "Wireless Headphones - Premium Audio"
    },
    "device": {
      "type": "desktop",
      "os": "macOS"
    }
  }
}
```

### Entity Management
Semantic events track relationships between entities:

```javascript title="entity-example.js"
// Example: Tracking entities in a purchase event
const purchaseEvent = {
  event: 'order_completed',
  involves: {
    user: 'user_12345',
    products: ['SKU-12345', 'SKU-67890'],
    merchant: 'store_001'
  },
  properties: {
    order_id: 'ORDER-789',
    total: 299.98,
    currency: 'USD',
    payment_method: 'credit_card'
  }
};
```

## Implementation Steps

### 1. Choose Your Events
Start by identifying the key business interactions you want to track:

- **eCommerce**: Product views, cart actions, purchases
- **Content**: Article reads, video plays, downloads
- **Travel**: Search queries, bookings, reviews
- **Real Estate**: Property views, inquiries, applications

### 2. Install the SDK
```bash
npm install @contextsuite/semantic-events
```

### 3. Initialize Tracking
```javascript title="initialization.js"
import { SemanticEvents } from '@contextsuite/semantic-events';

const tracker = new SemanticEvents({
  apiKey: 'your-api-key',
  environment: 'production'
});
```

### 4. Track Your First Event
```javascript title="first-event.js"
// Track a product view
tracker.track('product_viewed', {
  product_id: 'SKU-12345',
  product_name: 'Wireless Headphones',
  category: 'Electronics',
  price: 199.99,
  currency: 'USD'
});
```

## Event Validation

All events are automatically validated against our schemas:

{% callout type="success" title="Automatic Validation" %}
The SDK automatically validates events against standardized schemas, ensuring data quality and consistency across your application.
{% /callout %}

```javascript title="validation-example.js"
// This will be validated automatically
tracker.track('product_viewed', {
  product_id: 'SKU-12345',  // Required
  price: 199.99,            // Must be a number
  currency: 'USD'           // Must be valid ISO currency code
});
```

## Industry-Specific Examples

### eCommerce Events
```javascript title="ecommerce-events.js"
// Product interaction
tracker.track('product_viewed', {
  product_id: 'SKU-12345',
  category: 'Electronics',
  price: 199.99
});

// Cart action
tracker.track('product_added_to_cart', {
  product_id: 'SKU-12345',
  quantity: 1,
  cart_total: 199.99
});

// Purchase
tracker.track('order_completed', {
  order_id: 'ORDER-789',
  total: 199.99,
  products: [{ id: 'SKU-12345', quantity: 1 }]
});
```

### Travel Events
```javascript title="travel-events.js"
// Hotel search
tracker.track('hotel_search_performed', {
  destination: 'New York',
  check_in: '2024-03-15',
  check_out: '2024-03-18',
  guests: 2
});

// Booking
tracker.track('hotel_booking_completed', {
  hotel_id: 'HOTEL-123',
  room_type: 'deluxe',
  total_price: 450.00,
  nights: 3
});
```

## Best Practices

### 1. Use Standardized Event Names
Follow our event naming conventions from the [Event Bible](/docs/semantic-events/bible):

```javascript
// Good
tracker.track('product_viewed', { ... });
tracker.track('order_completed', { ... });

// Avoid
tracker.track('productView', { ... });
tracker.track('purchase', { ... });
```

### 2. Include Rich Context
Always include relevant context properties:

```javascript title="rich-context.js"
tracker.track('product_viewed', {
  product_id: 'SKU-12345',
  product_name: 'Wireless Headphones',
  category: 'Electronics',
  brand: 'AudioTech',
  price: 199.99,
  currency: 'USD',
  availability: 'in_stock',
  rating: 4.5,
  review_count: 128
});
```

### 3. Track User Journey
Connect events to understand the complete user journey:

```javascript title="user-journey.js"
// Search
tracker.track('products_searched', {
  query: 'wireless headphones',
  results_count: 24
});

// View
tracker.track('product_viewed', {
  product_id: 'SKU-12345',
  source: 'search_results'
});

// Purchase
tracker.track('order_completed', {
  order_id: 'ORDER-789',
  source: 'product_page'
});
```

## What's Next?

1. **[Event Bible](/docs/semantic-events/bible)** - Browse all available events
2. **[Schema Reference](/docs/semantic-events/schema/all)** - Complete property documentation
3. **[Validation](/docs/semantic-events/validation)** - Learn about event validation
4. **[Best Practices](/docs/semantic-events/best-practices)** - Advanced implementation tips

{% callout type="warning" title="Data Quality" %}
Remember that consistent, high-quality event data is crucial for meaningful analytics. Always validate your events and follow our schema guidelines.
{% /callout %}

## Getting Help

- **[Event Bible](/docs/semantic-events/bible)** - Find the right events for your use case
- **[Schema Documentation](/docs/semantic-events/schema/all)** - Detailed property references
- **[Best Practices](/docs/semantic-events/best-practices)** - Implementation guidelines
- **[Integrations](/docs/integrations)** - Connect with your existing tools

{% callout type="success" title="Ready to Start Tracking?" %}
You now have everything you need to implement semantic events. Start with a few core events and gradually expand your tracking as you see the value of rich, standardized data.
{% /callout %}