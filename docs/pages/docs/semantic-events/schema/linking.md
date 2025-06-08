---
title: Entity Linking in Events
---

# Entity Linking (`entity_linking` field)

The `entity_linking` structure within a semantic event provides detailed information about entities that have been automatically identified and linked from the textual or string-based content associated with the event. This is often performed by Natural Language Processing (NLP) or Named Entity Recognition (NER) models.

For example, if an event captures an email, the `entity_linking` structure might pinpoint mentions of companies, people, or products within the email's subject or body and link them to their canonical representations in an entity directory.

The `entity_linking` field is typically a list (array) of objects, where each object describes a single identified and linked entity.

## Entity Linking Object Properties

The following table details the fields found within each object in the `entity_linking` list:

| Property Name | Type                             | Description                                                                                                   | Optional |
|---------------|----------------------------------|---------------------------------------------------------------------------------------------------------------|----------|
| `content_key` | `String`                         | The key from the event's `content` map where the linked entity was found (e.g., "Body", "Subject", "Description"). From `LowCardinality(String)`. | No       |
| `label`       | `String (Optional)`              | The actual text span (mention) that was identified in the content and linked to an entity (e.g., "Acme Corp", "ProductX"). | Yes      |
| `starts_at`   | `Integer (Optional)`             | The starting character offset of the `label` within the specified `content` field's value.                    | Yes      |
| `ends_at`     | `Integer (Optional)`             | The ending character offset (exclusive) of the `label` within the specified `content` field's value.          | Yes      |
| `entity_type` | `String (Optional)`              | The resolved type of the linked entity (e.g., "organization", "product", "person", "location").               | Yes      |
| `entity_gid`  | `UUID (String, Optional)`        | The Global ID (GID) of the canonical entity to which the `label` was linked.                                  | Yes      |
| `entity_wid`  | `String (Optional)`              | Workspace ID or a similar namespaced identifier for the resolved entity, if applicable.                         | Yes      |
| `certainty`   | `Float (Optional)`               | A confidence score (e.g., 0.0 to 1.0) from the linking model, indicating the certainty of the match.          | Yes      |

## Understanding and Using Entity Linking Data

The `entity_linking` data enriches events by making explicit connections between unstructured text content and structured entity data.

**Purpose of Key Fields:**

*   **`content_key`**: Specifies *where* in the event's content the entity was found. This is crucial if an event has multiple textual parts (e.g., an email's subject and body, stored in `content: {"Subject": "...", "Body": "..."}`).
*   **`label`**: Shows the exact text that triggered the link. This is useful for verification and understanding the context of the mention.
*   **`starts_at` / `ends_at`**: These character offsets allow applications to highlight the identified entity in the original text or to extract a more precise textual context around the mention.
*   **`entity_type`, `entity_gid`, `entity_wid`**: These are the most critical fields for downstream use, as they provide the resolved, canonical identifiers for the recognized entity. This enables joining event data with other datasets about that entity (e.g., CRM data, product catalogs).
*   **`certainty`**: Helps in filtering or weighting links. For example, automated processes might only act on links with a certainty above a certain threshold (e.g., > 0.85).

**Use-Case Examples:**

1.  **Linking a company name in an email body:**
    *   Event `content`: `{"Subject": "Meeting Request", "Body": "Looking forward to our meeting with MegaCorp Inc. next week."}`
    *   An `entity_linking` object might be:
        ```json
        {
          "content_key": "Body",
          "label": "MegaCorp Inc.",
          "starts_at": 35,
          "ends_at": 48,
          "entity_type": "organization",
          "entity_gid": "org-uuid-megacorp",
          "certainty": 0.92
        }
        ```

2.  **Identifying a product mentioned in a customer review:**
    *   Event `content`: `{"ReviewText": "The new SuperWidget is amazing, but the BatteryWidget needs improvement."}`
    *   Two `entity_linking` objects could be generated:
        ```json
        [
          {
            "content_key": "ReviewText",
            "label": "SuperWidget",
            "starts_at": 8,
            "ends_at": 19,
            "entity_type": "product",
            "entity_gid": "prod-uuid-superwidget",
            "certainty": 0.98
          },
          {
            "content_key": "ReviewText",
            "label": "BatteryWidget",
            "starts_at": 34,
            "ends_at": 47,
            "entity_type": "product",
            "entity_gid": "prod-uuid-batterywidget",
            "certainty": 0.95
          }
        ]
        ```

By leveraging the `entity_linking` structure, you can build knowledge graphs, improve search and discovery, enable more sophisticated analytics based on entity relationships, and automate workflows that depend on recognizing specific entities within event content.
