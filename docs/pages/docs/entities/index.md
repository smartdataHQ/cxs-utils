---
title: Understanding Entities
---

# Understanding Entities in the Semantic Schema

## Introduction

In the context of the Semantic Event Schema, an **Entity** is a distinct, identifiable actor or object that is involved in or affected by a semantic event. Examples include customers, products, orders, or any other item that plays a role in a business activity. Entities provide crucial context to events by specifying *who* or *what* was part of the occurrence.

The primary purpose of defining Entities is to contextualize Semantic Events and enable robust, entity-centric analysis. By understanding the entities involved, you can gain deeper insights into event data, track entity behavior over time, and build a more comprehensive view of your business operations.

## Key Characteristics of Entities

Entities are typically defined by several key characteristics:

- **Unique Identifier**: This is essential for distinguishing one entity from another. It could be a specific field like `entity_id`, `user_id`, or a composite key, depending on the entity type and system design. The concept of a unique ID is more important than the specific field name.
- **Entity Type**: This is a classification that defines the nature of the entity (e.g., "user", "product", "session", "order"). It helps in categorizing and filtering entities.
- **Properties/Attributes**: These are key-value pairs that describe the characteristics of the entity. For example, a "product" entity might have properties like `name`, `category`, `brand`, and `price`.
- **(Optional) Relationships**: Entities can also have relationships with other entities. For instance, an "order" entity might be related to a "user" entity and multiple "product" entities. While not always explicitly part of the core entity definition within an event, these relationships are often modeled in the broader data ecosystem.

{% .callout type="note" %}
While specific field names for identifiers and types might vary based on implementation, the conceptual roles of these characteristics remain consistent.
{% / .callout %}

## Common Entity Examples

Here are some common types of entities encountered in semantic event data:

- **User/Customer**: Represents an individual interacting with a system or service (e.g., `entity_type: "user"`). Attributes might include `email`, `name`, `loyalty_status`.
- **Product**: Represents an item or service offered (e.g., `entity_type: "product"`). Attributes could be `sku`, `name`, `description`, `price`.
- **Order/Transaction**: Represents a specific transaction or engagement (e.g., `entity_type: "order"`). Attributes might include `order_id`, `total_amount`, `status`.
- **Organization**: Represents a company, business unit, or group (e.g., `entity_type: "organization"`). Attributes could include `name`, `industry`, `location`.
- **Device**: Represents a physical or virtual device used (e.g., `entity_type: "device"`). Attributes might include `device_id`, `model`, `os_version`.

## How Entities Relate to Semantic Events

Semantic Events typically link to one or more entities to provide full context. The event data itself will often contain identifiers for the involved entities. For example:

- A **'Product Purchased'** event would link to a 'user' entity (who made the purchase) and one or more 'product' entities (what was purchased).
- A **'Support Ticket Created'** event might link to a 'user' entity (who created the ticket) and potentially an 'agent' entity (if assigned).

Sometimes, the role of an entity within an event is also specified, particularly if an event involves multiple entities of the same type (e.g., a 'funds_transferred' event might involve a 'sender_user' and a 'receiver_user').

## Generic Entity Structure Example

While the exact structure and field names can vary, here is a conceptual example of what a "product" entity might look like, represented in JSON:

```json
{
  "entity_id": "prod_12345",
  "entity_type": "product",
  "properties": {
    "name": "Wireless Noise-Cancelling Headphones",
    "category": "Electronics",
    "brand": "SoundWave",
    "price": 199.99,
    "currency": "USD",
    "attributes": {
      "color": "Black",
      "weight_grams": 250
    }
  }
}
```

{% .callout type="info" %}
**Note:** This is a conceptual illustration. Specific field names (e.g., `entity_id`, `properties`) and the overall structure may differ based on the chosen schema implementation or platform. The key is the ability to uniquely identify, type, and describe the entity.
{% / .callout %}

## Benefits of Well-Defined Entities

Clearly defining and utilizing entities within your semantic event framework offers several advantages:

- **Deeper Event Understanding**: Entities provide the "who" and "what" for events, making them much richer and more interpretable.
- **Robust Entity-Centric Analytics**: Allows for tracking behavior, trends, and patterns related to specific users, products, etc., over time.
- **Building a Connected Data View**: Enables the creation of a graph or network of interconnected entities and events, reflecting complex business processes.
- **Personalization and Targeting**: Well-defined user entities are fundamental for delivering personalized experiences.
- **Improved Data Governance**: Clear entity definitions aid in managing data quality, consistency, and compliance.

By consistently identifying and describing entities, organizations can unlock more profound insights from their event data and build more intelligent systems.
