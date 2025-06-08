---
title: Involved Entities & Roles (involves field)
---

# Involved Entities & Roles (`involves` field)

The `involves` field in the Semantic Event Schema provides a structured way to explicitly list multiple entities that participate in an event. For each involved entity, it details their specific role in the event, their type, unique identifiers, and optionally, the capacity or extent of their involvement.

As highlighted by the schema's design ("Used to explicitly define entities involved in the event, rather than implicitly through other fields"), the `involves` structure is key for making the participation of various entities clear, unambiguous, and directly associated with the event. This is particularly useful for events where multiple entities interact in different capacities.

The `involves` field is typically an array (list) of objects, where each object represents one involved entity and its context within the event.

## Involved Entity Object Properties

The following table details the fields found within each object in the `involves` list:

| Property Name | Type                             | Description                                                                                                                                  | Optional |
|---------------|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `label`       | `String (Optional)`              | A human-readable name or label for the involved entity instance (e.g., "Primary User", "Product X123"). From `Nullable(String)`.                 | Yes      |
| `role`        | `String`                         | The function or role of the entity in the context of this specific event. Conventionally, this value is **always capitalized** (e.g., "Buyer", "Seller", "Author", "Recipient", "Participant"). From `LowCardinality(String)`. | No       |
| `entity_type` | `String`                         | The type of the involved entity. Conventionally, this value is **always capitalized** (e.g., "User", "Product", "Organization", "Document"). From `LowCardinality(String)`. | No       |
| `entity_gid`  | `UUID (String, Optional)`        | The Global ID (GID) of the involved entity, if resolved to a canonical entity. From `Nullable(UUID)`.                                         | Yes      |
| `id`          | `String (Optional)`              | An alternative or external identifier for the involved entity. From `Nullable(String)`.                                                        | Yes      |
| `id_type`     | `String (Optional)`              | The type of the identifier provided in the `id` field (e.g., "Sku", "Email", "ExternalContractId"). From `LowCardinality(String)`.               | Yes      |
| `capacity`    | `Float (Optional)`               | A numeric value indicating the extent, share, or capacity of involvement for this entity in this event (e.g., 0.5 for 50% involvement, 1.0 for full involvement). From `Nullable(Float)`. | Yes      |

## Understanding and Using `involves`

The `involves` structure is powerful for detailing complex interactions where multiple actors or objects play distinct parts.

**Purpose of Key Fields:**

*   **`role`**: This is a crucial field that defines *how* an entity participated in the event. It provides semantic clarity beyond just knowing an entity was present.
*   **`entity_type`**: Specifies the kind of entity involved, which, combined with `role`, gives a rich description (e.g., a "User" in the "Author" role, or a "Product" in the "ReviewedItem" role).
*   **`entity_gid`, `id`, `id_type`**: These are standard fields for uniquely identifying the involved entity, linking it back to canonical entity records or external system IDs.
*   **`capacity`**: This field allows for specifying non-binary involvement. For example, if multiple consultants contribute to a single "Consultation Provided" event, `capacity` could represent the proportion of work each contributed (e.g., Consultant A: 0.6, Consultant B: 0.4). It can also represent quantities if the role implies it (e.g., "Attendee" role with `capacity: 2` for two tickets).
*   **`label`**: Provides a quick, human-readable identifier for the entity in the context of the event, which can be useful for logging or display purposes.

**Use-Case Examples:**

1.  **E-commerce "Order Placed" Event:**
    ```json
    "involves": [
      {
        "role": "Buyer",
        "entity_type": "User",
        "entity_gid": "user-uuid-buyer-123",
        "label": "John Doe"
      },
      {
        "role": "Seller",
        "entity_type": "Organization",
        "entity_gid": "org-uuid-seller-456",
        "label": "MegaMart Inc."
      },
      {
        "role": "PaymentMethod",
        "entity_type": "Instrument", // Assuming a generic entity type for payment instruments
        "id": "card_xxxxxxxxxxxx4242",
        "id_type": "CreditCardToken",
        "label": "Visa ending in 4242"
      }
    ]
    ```

2.  **"Document Shared" Event:**
    ```json
    "involves": [
      {
        "role": "Owner",
        "entity_type": "User",
        "entity_gid": "user-uuid-owner-789"
      },
      {
        "role": "Editor",
        "entity_type": "User",
        "entity_gid": "user-uuid-editor-abc"
      },
      {
        "role": "Viewer",
        "entity_type": "User",
        "entity_gid": "user-uuid-viewer-def"
      },
      {
        "role": "SharedDocument",
        "entity_type": "Document",
        "entity_gid": "doc-uuid-xyz789"
      }
    ]
    ```

3.  **"Medical Consultation Provided" Event with Capacity:**
    Two doctors collaborated on a consultation.
    ```json
    "involves": [
      {
        "role": "Patient",
        "entity_type": "User",
        "entity_gid": "user-uuid-patient-444"
      },
      {
        "role": "Consultant",
        "entity_type": "User",
        "entity_gid": "user-uuid-dr-smith",
        "label": "Dr. Smith",
        "capacity": 0.6
      },
      {
        "role": "Consultant",
        "entity_type": "User",
        "entity_gid": "user-uuid-dr-jones",
        "label": "Dr. Jones",
        "capacity": 0.4
      }
    ]
    ```

By using the `involves` array, events can accurately represent complex scenarios with multiple participating entities, each playing a distinct role and having a measurable capacity of involvement. This leads to richer data for analytics, auditing, and understanding interconnected processes.
