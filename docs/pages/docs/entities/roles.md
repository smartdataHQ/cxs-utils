---
title: Entity Roles
---

# Understanding Entity Roles

## Introduction to Roles

In Context Suite, the `role` field within the `involves` structure is a crucial concept that is often misunderstood. While it may seem similar to the `entity_type` field, they serve distinct purposes in the system:

- **Entity Type**: Describes what the entity *is* (e.g., "Person", "Product", "ProductVariant")
- **Role**: Describes how the entity is *involved* in a specific event (its function or purpose in that context)

The role field rarely repeats the entity type. Instead, it explains the entity's specific involvement or relationship to the event.

## Key Characteristics of Roles

1. **Context-Specific**: Roles are specific to the context of the event and may change from event to event
2. **Function-Based**: Roles describe the function or purpose of the entity in the event
3. **Abstract When Possible**: Roles should be abstract enough to be reusable across different scenarios

## Examples of Roles

### Car Crash Event Example

In a car crash event, multiple entities might be of type "Person" but have different roles:

| Entity Type | Role | Description |
|-------------|------|-------------|
| Person | Driver | The person operating the vehicle |
| Person | Pedestrian | A person on foot involved in the incident |
| Person | Witness | A person who observed the incident |
| Vehicle | Involved | The primary vehicle in the crash |
| Vehicle | Secondary | Another vehicle indirectly involved |

### E-Commerce Example

In an order-related event:

| Entity Type | Role | Description |
|-------------|------|-------------|
| User | Purchaser | The person making the purchase |
| User | Recipient | The person receiving the items (may be different) |
| Product | Item | The product being purchased |
| Order | Transaction | The order transaction itself |

## Special Roles

Some roles have specific meanings in the Context Suite system:

### Source Role

- **Definition**: The entity that triggered or initiated the event
- **Example**: When a Product Variant is updated, the Variant is the "Source" of the "Product Variant Updated" event
- **Usage**: Use "Source" to indicate the primary entity responsible for the event occurring

```json
"involves": [
  {
    "label": "Default Title",
    "role": "Source",
    "entity_type": "ProductVariant",
    "id": "54880761119045",
    "id_type": "Shopify"
  }
]
```

### Parent Role

- **Definition**: Indicates a hierarchical relationship between entities
- **Example**: When a Product Variant event occurs, the associated Product is the "Parent"
- **Usage**: Use "Parent" to establish entity hierarchies and relationships

```json
"involves": [
  {
    "label": "Default Title",
    "role": "Source",
    "entity_type": "ProductVariant",
    "id": "54880761119045",
    "id_type": "Shopify"
  },
  {
    "label": "The test snowboard",
    "role": "Parent",
    "entity_type": "Product",
    "id": "15100602155333",
    "id_type": "Shopify"
  }
]
```

## Best Practices for Roles

1. **Be Specific**: Choose roles that clearly communicate the entity's function in the event
2. **Be Consistent**: Use the same role names for similar functions across different event types
3. **Avoid Entity Types as Roles**: Don't simply repeat the entity type as the role
4. **Consider Context**: Adapt roles based on the event context rather than using generic labels
5. **Document Special Roles**: Maintain documentation for any special/common roles used in your system

## Benefits of Well-Defined Roles

- **Better Analysis**: Properly defined roles enable more nuanced analysis of events
- **Clear Relationships**: Roles clearly establish the relationships between entities
- **Improved Filtering**: Events can be filtered based on entity roles, not just types
- **Enhanced Context**: Events carry more semantic meaning about entity involvement

By using roles effectively, you can create a richer semantic model of your business events and enable more sophisticated analysis and understanding of your data.
