---
title: Entity Identification System
---

# Entity Identification in Context Suite

Context Suite uses a semantic web inspired approach for entity identification across our data model.

## Concepts

- **GID_URL**: Represents the authoritative location where an entity "resides" - inspired by RDF and semantic web principles. These are preferably real URLs that serve as the canonical identifier for an entity.

- **Entity_GID**: A UUID derived from the GID_URL using a named UUID algorithm. This provides a compact, database-friendly identifier that's consistently generated from the same URL.

## Benefits

1. **Semantic Meaning**: GID_URLs carry semantic meaning about what the entity is and where it's defined
2. **Size Efficiency**: Entity_GIDs are more compact than full URLs (just 16 bytes)
3. **Performance**: UUIDs are optimized for database operations like indexing and joining
4. **Consistency**: The same GID_URL will always generate the same Entity_GID

## How It Works

- Every `_gid` suffixed field is always a calculated value from "something meaningful"
- When you see a `_gid` field, you can know it represents a constant ID for some URL
- We sometimes have the `gid_url` explicitly, other times we create it from known unique data
- A `gid_url` always contains more semantic meaning than just timestamps or random values

## Examples

### Shopify Product Example

For a Shopify product with ID 15100602155333:

```json
{
  "entity_gid": "550e8400-e29b-41d4-a716-446655440000", 
  "properties": {
    "gid_url": "https://shop.example.com/products/15100602155333",
    "admin_graphql_api_id": "gid://shopify/Product/15100602155333"
  }
}
```

## Implementation Notes

1. Always generate Entity_GIDs consistently from the same input GID_URL
2. When creating a new entity, establish a meaningful GID_URL that uniquely identifies it
3. For external entities, incorporate the source system and ID into the GID_URL
4. GID_URLs should follow URI format but don't necessarily need to be resolvable web URLs

## Technical Implementation

Entity_GIDs are generated using UUID version 5 (name-based) with a fixed namespace UUID and the GID_URL as input:

```python
import uuid

# Use the standard DNS namespace or a custom namespace for your organization
NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')  # DNS namespace

# Generate a deterministic UUID from a GID_URL
def generate_entity_gid(gid_url):
    return uuid.uuid5(NAMESPACE, gid_url)

# Example usage
gid_url = "https://shop.example.com/products/15100602155333"
entity_gid = generate_entity_gid(gid_url)
print(entity_gid)  # Will always produce the same UUID for the same input URL
```

This approach ensures that any system processing the same entity will generate identical identifiers, enabling seamless data integration across your entire ecosystem.