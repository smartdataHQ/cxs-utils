---
title: Event Dimensions & Ad-hoc Metrics
---

# Event Dimensions & Ad-hoc Metrics (`dimensions` and `metrics` fields)

Semantic events can be enriched with flexible, ad-hoc key-value pairs for both descriptive and quantitative information that may not fit into other strongly-typed schema structures. This is achieved through two primary map properties: `dimensions` for categorical data and `metrics` for numerical data.

These fields are particularly useful for:
*   Adding custom attributes for quick dashboarding or specific analytical queries.
*   Tracking experimental data or A/B test variations.
*   Capturing supplementary details that are highly specific to certain event types.

## Dimensions (`dimensions` field)

The `dimensions` field allows you to attach arbitrary string-based key-value pairs to an event. These are typically used for low-cardinality attributes that help in segmenting, categorizing, or filtering events.

| Name           | Required | Data Type             | Description                                                                                                                                                                                   |
|----------------|----------|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `dimensions`   |          | `Map(String, String)` | Allows attaching arbitrary string-based key-value pairs to an event. Used for low-cardinality attributes for segmenting, categorizing, or filtering events. Keys and values are originally `LowCardinality(String)`. |

*   **Structure (conceptual):** `Map<String, String>`
    *   Keys are `String` (from SQL `LowCardinality(String)`).
    *   Values are `String` (from SQL `LowCardinality(String)`).
*   **Purpose:** To add descriptive attributes that can be used for grouping or breaking down analyses. Dimensions are typically non-numerical and represent categories or labels.

**Examples:**

```json
{
  "event": "Page Viewed",
  "dimensions": {
    "experiment_group": "B",
    "user_segment": "returning_high_value",
    "content_version": "v2.1",
    "campaign_variant": "BlueButton"
  }
}
```

```json
{
  "event": "Feature Used",
  "properties": {
    "feature_name": "AdvancedSearch"
  },
  "dimensions": {
    "feature_flag_status": "enabled_for_user",
    "access_level": "premium_tier",
    "ui_theme": "dark_mode"
  }
}
```

## Ad-hoc Metrics (`metrics` field)

The `metrics` field allows you to attach arbitrary numerical key-value pairs to an event. These are used for quantitative measurements or counts that provide specific numerical insights about the event.

| Name        | Required | Data Type             | Description                                                                                                                                                                |
|-------------|----------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `metrics`   |          | `Map(String, Float)`  | Allows attaching arbitrary numerical key-value pairs to an event. Used for quantitative measurements or counts. Keys are originally `LowCardinality(String)`, values are `Float32`. |

*   **Structure (conceptual):** `Map<String, Float>`
    *   Keys are `String` (from SQL `LowCardinality(String)`).
    *   Values are `Float` (from SQL `Float32`).
*   **Purpose:** To add quantitative data points that can be aggregated (e.g., summed, averaged) or used in numerical analyses.

**Examples:**

```json
{
  "event": "Video Watched",
  "properties": {
    "video_id": "vid123"
  },
  "metrics": {
    "watch_time_seconds": 185.5,
    "percent_viewed": 75.0,
    "buffer_count": 2,
    "ad_impressions_during_video": 1
  }
}
```

```json
{
  "event": "API Call Processed",
  "properties": {
    "endpoint": "/api/v1/data"
  },
  "metrics": {
    "response_time_ms": 230.75,
    "payload_size_kb": 15.2,
    "retry_attempts": 0
  }
}
```

## Purpose and Best Practices

**When to Use `dimensions` and `metrics`:**

*   **Flexibility:** When you need to add custom data points quickly without modifying the core, strongly-typed schema.
*   **Exploratory Analysis:** For new types of data or hypotheses you want to test before formalizing them.
*   **Highly Specific Attributes:** For details that are only relevant to a small subset of events or have high variability in structure.
*   **Dashboarding:** These fields are often directly usable in analytics platforms for creating custom charts and reports.

**Important Distinctions:**

It's crucial to understand how `dimensions` and `metrics` differ from other data structures within a comprehensive semantic event system:

*   **Entity Properties:** Core attributes that define an entity (e.g., a user's `email` or a product's `name`) should be part of the entity's own dedicated schema, not typically in the event's `dimensions` or `metrics` unless they are being captured as a snapshot specific to that event's context.
*   **`datapoints` Structure:** The `datapoints` field (if available in your schema) is generally intended for more structured, potentially multi-dimensional or time-series observations that have their own well-defined schema. While simple numerical values can go into `metrics`, complex measurements with their own attributes might fit better into `datapoints`.
*   **`ql.metrics` Table (or similar Metric Registry):** Some systems have a separate registry (like a `ql.metrics` table) for defining *standardized metric types* (e.g., defining what "Active Users" means globally). The `metrics` map on an individual event, by contrast, is for attaching *ad-hoc instances* of numerical data to that specific event, which may or may not correspond to a globally defined metric type.

**Best Practices:**

*   **Naming Conventions:** Use clear, consistent naming for keys in both `dimensions` and `metrics` (e.g., `snake_case` or `camelCase`).
*   **Cardinality for Dimensions:** Be mindful of cardinality for `dimensions` keys and values. High cardinality (many unique values) can sometimes impact query performance in certain analytics systems. The schema enforces `LowCardinality(String)` to help with this.
*   **Avoid Overuse:** While flexible, avoid using these fields as a dumping ground for all data. If an attribute is consistently present and important, consider adding it as a formal, strongly-typed field in the relevant part of your event schema.
*   **Documentation:** Internally document any commonly used custom dimensions or metrics to ensure understanding across your team.

By using `dimensions` and `metrics` judiciously, you can greatly enhance the analytical value of your semantic events, providing avenues for deeper, more customized insights.
