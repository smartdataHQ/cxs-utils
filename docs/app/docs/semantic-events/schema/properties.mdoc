---
title: Custom Event Properties (properties field)
---

# Custom Event Properties (`properties` field)

The `properties` field in the Semantic Event Schema is a flexible key-value map designed to hold custom or extended data that doesn't fit into the standard, strongly-typed fields of the event schema. It serves as an extensibility point, allowing for the inclusion of arbitrary details specific to certain events, integrations, or experimental tracking needs.

## `properties` Field Definition

| Name           | Required | Data Type             | Description                                                                                                                                                                                             |
|----------------|----------|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `properties`   |          | `Map(String, String)` | A flexible key-value map for custom or extended string data that doesn't fit into standard schema fields. Keys are originally `LowCardinality(String)`. Values are strings; non-string data should be stringified. |

**Structure Detail:**
*   **Keys:** Are strings, typically of low cardinality (from SQL `LowCardinality(String)`).
*   **Values:** Are strings. Any non-string data (numbers, booleans, objects, arrays) should be stringified (e.g., as JSON) before being stored as a value in this map if it needs to be preserved with structure.

## Intended Use and Best Practices

The guiding principle for the `properties` field, as noted in the underlying SQL schema comment, is: *"Properties are all moved into dedicated columns, if possible. If not, they are stored in properties."* This highlights its role as a fallback mechanism.

**When to Use `properties`:**

*   **Truly Custom Data:** For information that is highly specific to a particular use case, a custom application, or a third-party integration and doesn't have a corresponding standard field.
*   **Experimental or Temporary Data:** When you're exploring new data points or running short-term experiments and aren't yet ready to formalize them into the main schema.
*   **Variable or Unforeseen Attributes:** If an event source might include a wide range of attributes that are not known in advance or vary significantly between event instances.
*   **Bridging External Schemas:** When ingesting events from external systems that have their own set of custom attributes, `properties` can be a place to store them initially.

**When *Not* to Use `properties` (or Use with Caution):**

*   **Commonly Used Data:** If a piece of data is present in many events, is frequently used for querying (especially for filtering or aggregation), or requires strong data typing (e.g., numbers for calculations, booleans for true/false logic, specific date formats), it's generally better to add it as a dedicated, typed field in the main event schema or within an appropriate nested object. This improves query performance, data integrity, and analytical clarity.
*   **As a "Dumping Ground":** Avoid using `properties` to store all unstructured or semi-structured data if other, more semantically appropriate fields exist:
    *   For large blocks of text (email bodies, article content, logs), use the [`content`](./content.md) map.
    *   For low-cardinality strings primarily used for segmentation or filtering in analytics, use the [`dimensions`](./dimensions.md) map.
    *   For ad-hoc numerical values (measurements, counts), use the [`metrics`](./dimensions.md) map.
*   **Complex Nested Objects:** While you can store stringified JSON in a `properties` value, if you frequently need to query based on the internal structure of that JSON, it's a strong indicator that those nested attributes might deserve their own schema definition.

**Key Naming Conventions:**

*   Use clear, descriptive, and consistent names for your custom property keys.
*   Adopt a standard naming convention (e.g., `snake_case` or `camelCase`).
*   Consider using prefixes for keys that come from a specific source or integration to avoid naming collisions (e.g., `integration_x_user_level`, `custom_app_feature_toggle`).
*   Document your commonly used custom property keys internally.

## Example Usage

Here’s an example of an event that utilizes the `properties` field to store custom attributes related to a specific feature usage and an integration:

```json
{
  "event": "File Exported",
  "user_id": "user_789",
  "timestamp": "2023-12-01T14:22:00Z",
  // ... other standard event fields (like type, event_gid, etc.)
  "properties": {
    "export_format": "CSV",
    "file_size_bytes": "102400", // Stored as string
    "export_source_module": "ReportingDashboard",
    "user_role_at_export": "Administrator",
    "third_party_tracker_id": "ext_trk_abc123",
    "experimental_feature_X_status": "active_variant_B"
  }
}
```
In this example:
*   `export_format`, `file_size_bytes`, `export_source_module`, and `user_role_at_export` are custom details specific to the "File Exported" event.
*   `third_party_tracker_id` might be an ID from an external system.
*   `experimental_feature_X_status` is used for tracking an experimental feature.

## Differentiating `properties` from Other Flexible Fields

The semantic event schema provides several map-like fields for flexibility. It's important to choose the most appropriate one:

*   **`properties` (Map<String, String>):** The most generic fallback for *any* custom key-value string data that doesn't fit other categories. Values are simple strings.
*   **[`content`](./content.md) (Map<String, String>):** Intended for larger blocks of textual content or unstructured/semi-structured text associated with standard keys like "Body", "Subject", "Description".
*   **[`dimensions`](./dimensions.md) (Map<String, String>):** Specifically for low-cardinality string values used as dimensions for segmentation, filtering, and grouping in analytics (e.g., `{"user_segment": "New", "region": "North America"}`).
*   **[`metrics`](./dimensions.md) (Map<String, Float>):** For attaching ad-hoc *numerical* values, counts, or measurements to an event (e.g., `{"load_time_ms": 150.5, "items_in_cart": 3}`).

Choosing the correct field based on the nature and intended use of the data ensures better schema organization and more effective downstream processing and analysis.
