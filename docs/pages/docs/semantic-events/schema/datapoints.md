---
title: Understanding Datapoints
---

# Understanding Datapoints in the Semantic Schema

## Introduction

A **Datapoint** within the Semantic Event Schema is a specific, granular piece of information, a measurement, or an attribute that provides detailed context about a Semantic Event or an Entity. Think of datapoints as the lowest-level, quantifiable or descriptive details that enrich the understanding of what happened or what an entity is like.

The primary purpose of Datapoints is to offer precise, low-level details necessary for quantification, detailed description, and in-depth analysis. They are the raw facts that, when aggregated and analyzed, lead to meaningful insights.

## Key Characteristics of Datapoints

Datapoints are typically defined by the following characteristics:

- **Name/Key**: A unique identifier or label for the datapoint (e.g., `page_load_time`, `product_price`, `error_code`). This describes what the datapoint represents.
- **Value**: The actual recorded data for that datapoint (e.g., `150` for `page_load_time`, `49.99` for `product_price`).
- **Data Type**: The nature of the value, such as number, string, boolean, array, or object. This dictates how the datapoint can be processed and analyzed.
- **Units (Optional, but Recommended for Numerical Data)**: For numerical data, specifying units is crucial for correct interpretation (e.g., `ms` for time, `USD` for currency, `pixels` for screen dimensions).
- **Timestamp (Optional)**: In some cases, a datapoint might have its own timestamp indicating when it was recorded or measured, especially if this differs from the overall event timestamp.

{% .callout type="note" %}
Consistency in naming conventions (e.g., using `snake_case` for keys) and clear definitions for each datapoint are vital for a maintainable and understandable schema.
{% / .callout %}

## Common Datapoint Examples

Datapoints can be broadly categorized, and here are some illustrative examples:

- **Quantitative Datapoints** (representing measurements):
    - `order_value: 120.50` (with unit "USD")
    - `response_time_ms: 300` (with unit "milliseconds")
    - `items_in_cart: 3`
    - `temperature_celsius: 22.5`
    - `session_duration_seconds: 1800`

- **Descriptive Datapoints** (providing textual or qualitative information):
    - `button_color: "blue"`
    - `user_feedback_text: "The interface is very intuitive!"`
    - `product_name: "Organic Green Tea"`
    - `error_message: "Invalid input provided"`

- **Categorical Datapoints** (representing a selection from a predefined set of options):
    - `payment_method: "credit_card"`
    - `content_category: "news"`
    - `ui_theme: "dark_mode"`
    - `user_segment: "premium_tier"`

## How Datapoints Relate to Events and Entities

Datapoints are typically found as:

1.  **Properties within a Semantic Event's payload**: They provide specific details about the occurrence itself. For example, an `item_viewed` event might include datapoints like `view_duration`, `scroll_depth_percentage`, and `item_price`.
2.  **Attributes of an Entity**: They describe the characteristics of an entity. For instance, a `user` entity might have datapoints like `total_purchase_count`, `last_login_date`, or `account_status`.

Essentially, datapoints are the fine-grained pieces of information that populate the attributes of events and entities, making them rich with detail.

## Generic Datapoint Structure Example

Datapoints often reside within a properties object of an event or an entity. Here’s a conceptual JSON example showing datapoints within an "Item Added to Cart" event:

```json
{
  "event": "Item Added to Cart",
  "entity_id": "user_789", // Related entity (User)
  "timestamp": "2023-10-27T10:30:00Z",
  // ... other event-level fields
  "properties": { // Datapoints often reside here, detailing the event
    "item_id": "product_xyz", // Identifier for related product entity
    "item_name": "Super Widget", // Descriptive datapoint
    "quantity": 2, // Quantitative datapoint
    "price_per_item": 25.99, // Quantitative datapoint
    "currency": "USD", // Categorical/Descriptive datapoint (context for price)
    "cart_total_items": 5, // Quantitative datapoint (state after event)
    "added_from_page": "/products/category/widgets" // Descriptive datapoint
  }
}
```

{% .callout type="info" %}
**Note:** This is a conceptual illustration. The specific field names (e.g., `properties`) and the location of datapoints can vary based on the schema implementation. The core idea is that events and entities carry these granular pieces of information.
{% / .callout %}

## Benefits of Well-Defined Datapoints

Incorporating well-defined datapoints into your semantic event and entity structures offers significant benefits:

- **Precision in Data**: Datapoints capture the exact, low-level details, avoiding ambiguity.
- **Detailed Analysis**: They enable granular analysis, allowing you to drill down into specific aspects of events and entity behaviors.
- **Tracking Specific Metrics**: Key Performance Indicators (KPIs) and other metrics are often derived directly from specific datapoints.
- **Foundation for Rich Insights**: Aggregated and correlated datapoints form the basis for discovering trends, patterns, and actionable insights.
- **Enhanced Machine Learning**: Datapoints serve as critical features for training machine learning models for prediction, classification, or personalization.

By carefully defining and collecting relevant datapoints, organizations can ensure their data is not just voluminous but also rich in detail and value, powering more sophisticated analytics and data-driven actions.
