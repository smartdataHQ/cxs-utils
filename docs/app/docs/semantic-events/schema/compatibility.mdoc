---
title: Schema Compatibility & Evolution
---

# Schema Compatibility & Evolution

The design philosophy behind this Semantic Event Schema aims to provide a robust, comprehensive framework for capturing event data while also aligning with established industry patterns where appropriate. This approach facilitates both broad utility and specialized analytical capabilities.

A key aspect of this philosophy is its relationship with the widely adopted Segment.com semantic event specification. As noted in the schema's underlying definitions, this schema "Extends segment.com semantic event schema" and is "based on the Segment semantic events schema and extended with additional properties."

## Relationship with Segment.com Schema

Understanding this relationship is important for users, especially those familiar with Segment's tracking plans or event structures.

*   **Foundation and Alignment:** Core fields and concepts such as `user_id`, `anonymous_id`, `event` (name), `timestamp`, common `context.*` fields (e.g., `context.ip`, `context.locale`, `context.user_agent`), and standard `traits.*` (e.g., `traits.email`, `traits.name`, `traits.address`) are generally aligned with or inspired by the Segment.com specification. This alignment promotes:
    *   **Interoperability:** For these common data points, data can be more easily understood and potentially processed by tools or systems familiar with Segment's structure.
    *   **Ease of Adoption:** Teams already using Segment or similar event structures will find many familiar elements.
    *   **Leveraging Existing Knowledge:** The wealth of documentation and best practices around Segment's schema can be partially applicable.

*   **Significant Extensions:** This schema significantly extends beyond the basic Segment specification to cater to advanced analytical needs, data governance requirements, and functionalities specific to the Context Suite. These extensions include:
    *   Numerous specialized top-level fields (e.g., `entity_gid`, `event_gid`, `importance`, `access`, `source`, `retention.ttl_days`).
    *   Rich nested structures for detailed contextual information like `sentiment`, `classification`, `entity_linking`, `commerce.products`, `location`, `analysis`, `contextual_awareness`, and more.
    *   Flexible map fields for custom data: `properties`, `dimensions`, `metrics`, `content`.

The benefit of this approach is a schema that is both grounded in common patterns and highly adaptable to complex, domain-specific requirements.

## Extensibility and Schema Evolution

No schema is static; it must evolve to meet new requirements and changing business needs. This schema is designed with extensibility in mind:

*   **Adding New Fields:** New optional fields can be added to the top level of the event or within existing nested objects. As long as these new fields are optional, their addition is generally backward-compatible (older data simply won't have them).
*   **Flexible Map Fields:** Fields like `properties`, `dimensions`, and `metrics` provide built-in flexibility for adding custom key-value data without formal schema changes, useful for experimentation or highly specific attributes.
*   **Enumerated Values:** For fields defined with a set of allowed values (Enums), new values can often be added, though consuming systems must be updated to recognize them.

**General Principles of Schema Evolution:**

While this document doesn't define a specific versioning strategy for every instance of this schema, general principles apply:

*   **Backward-Compatible Changes:**
    *   Adding new *optional* fields.
    *   Adding new values to an existing Enum list (consumers should be tolerant of unrecognized Enum values).
*   **Potentially Breaking Changes (Require Careful Management):**
    *   Renaming existing fields.
    *   Changing the data type of an existing field (e.g., String to Integer).
    *   Removing existing fields.
    *   Making a previously optional field mandatory.
    *   Adding a new mandatory field (if existing data cannot provide a default).
    *   Removing values from an Enum list.

Breaking changes typically require more comprehensive strategies, such as versioning the schema, providing transformation logic for older data, or coordinated updates across producers and consumers.

## Multi-Format Representation

This Semantic Event Schema is conceptualized and documented here in a human-readable, implementation-independent format (Markdoc). However, for practical application, it is defined and maintained in various technical formats tailored to different systems and use cases. These formats may include:

*   **ClickHouse SQL:** For definition within the ClickHouse database, including data types, codecs, and table structures.
*   **Pydantic Models:** For use in Python applications, providing data validation and serialization/deserialization.
*   **Avro Schemas:** For data serialization and use in streaming platforms like Kafka.
*   **JSON Schemas:** For validating JSON event payloads.

This Markdoc documentation serves as the **central source of truth** for the meaning, purpose, and conceptual structure of each field. The specific data type mappings (e.g., how a conceptual `DateTime (UTC)` is represented as `DateTime64(3, 'UTC')` in ClickHouse, or `datetime` in Pydantic with timezone awareness) are handled within the respective schema definition files for each format. Consistency across these formats is a key maintenance goal.

By understanding these principles of compatibility, extensibility, and representation, users and developers can more effectively work with and evolve the Semantic Event Schema.
