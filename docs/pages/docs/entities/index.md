---
title: Understanding Entities
---

# Understanding Entities in the Semantic Schema

## Introduction

In the context of the Semantic Event Schema, an **Entity** is a distinct, identifiable actor or object that is involved in or affected by a semantic event. Examples include customers, products, orders, or any other item that plays a role in a business activity. Entities provide crucial context to events by specifying *who* or *what* was part of the occurrence.

The primary purpose of defining Entities is to contextualize Semantic Events and enable robust, entity-centric analysis. By understanding the entities involved, you can gain deeper insights into event data, track entity behavior over time, and build a more comprehensive view of your business operations.

## Key Characteristics of Entities

Entities are typically defined by several key characteristics:

- **Unique Identifier**: This is essential for distinguishing one entity from another. It could be a specific field like an entity ID (e.g., `gid`), user ID, or a composite key, depending on the entity type and system design. The concept of a unique ID is more important than the specific field name.
- **Entity Type**: This is a classification that defines the nature of the entity (e.g., "user", "product", "session", "order"). It helps in categorizing and filtering entities.
- **Properties/Attributes**: These are key-value pairs that describe the characteristics of the entity. For example, a "product" entity might have properties like `name`, `category`, `brand`, and `price`.
- **(Optional) Relationships**: Entities can also have relationships with other entities. For instance, an "order" entity might be related to a "user" entity and multiple "product" entities. While not always explicitly part of the core entity definition within an event, these relationships are often modeled in the broader data ecosystem.

{% .callout type="note" %}
While specific field names for identifiers and types might vary based on implementation, the conceptual roles of these characteristics remain consistent.
{% / .callout %}

## Entity Schema Fields

This section details the standard fields available in the entity schema, as defined in the ClickHouse SQL schema.

### Core Identification Fields

| Name      | Required | Data Type | Description                                                                              |
|-----------|----------|-----------|------------------------------------------------------------------------------------------|
| `gid`     |          | `UUID`    | The Graph UUID of the entity. This serves as the primary, unique identifier for the entity. |
| `gid_url` |          | `String`  | The URL representation of the entity's `gid`.                                              |

### Descriptive & Categorization Fields

| Name         | Required | Data Type        | Description                                                                                                                                                                                                                            |
|--------------|----------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `label`      |          | `String`         | The primary human-readable label for the entity (e.g., "Eiffel Tower", "John Doe Concert").                                                                                                                                              |
| `labels`     |          | `Array(String)`  | Additional labels for the entity, often with language prefixes to support multilingual representations (e.g., `["en:Eiffel Tower", "fr:Tour Eiffel"]`).                                                                                 |
| `type`       |          | `String`         | The primary type of the entity (e.g., "Event", "Place", "Person", "Organization").<br/>{% .callout type="note" %}The `type` field should always be in English, singular form, and capitalized (e.g., "Event", not "events").{% / .callout %} |
| `variant`    |          | `String`         | A more specific variant or sub-type of the entity (e.g., for `type: "Event"`, `variant` could be "Concert", "Exhibition", "Match").<br/>{% .callout type="note" %}The `variant` field should always be in English, singular form, and capitalized.{% / .callout %} |
| `icon`       |          | `String`         | An icon identifier associated with the entity, often used for UI purposes (e.g., "concert", "exhibition", "match").<br/>{% .callout type="note" %}The `icon` field should always be in English, singular form, and capitalized.{% / .callout %} |
| `colour`     |          | `String`         | A colour associated with the entity, often used for UI categorization or visual cues (e.g., "Red", "Blue", "Green").<br/>{% .callout type="note" %}The `colour` field should always be in English, singular form, and capitalized.{% / .callout %} |
| `dimensions` |          | `Map(String, String)` | Generic additional dimensions for the entity, allowing for flexible key-value pair characterization (e.g., `{"product_line": "premium", "target_audience": "young_adults"}`).                                                    |
| `tags`       |          | `Array(String)`  | Additional tags for the entity, used for categorization, filtering, or grouping (e.g., `["outdoor", "summer_event", "family_friendly"]`).                                                                                             |
| `flags`      |          | `Map(String, Boolean)` | Additional boolean flags for the entity, representing specific characteristics or states (e.g., `{"isFeatured": true, "hasAccessibility": false}`).                                                                                |
| `metrics`    |          | `Map(String, Float64)` | Additional numerical metrics associated with the entity (e.g., `{"satisfaction_score": 4.5, "completion_rate": 0.85}`).                                                                                                          |
| `properties` |          | `Map(String, String)` | Additional descriptive key-value properties for the entity. Similar to `dimensions`, but can be used for more varied or less structured data.                                                                                    |
| `names`      |          | `Map(String, String)` | Additional names or translations for the entity, often used to map internal names to display names or provide alternative identifiers (e.g., `{"internal_sku": "PROD123XYZ", "french_name": "Tour Eiffel"}`).                       |

### Content Fields (Nested Structure)

| Name      | Required | Data Type | Description                                                                 |
|-----------|----------|-----------|-----------------------------------------------------------------------------|
| `content` |          | `Nested`  | Describes textual content related to the entity. See sub-fields below:        |

**`content` Sub-Fields:**

| Name               | Required | Data Type | Description                                                                                                                               |
|--------------------|----------|-----------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `label`            |          | `String`  | The label identifying this piece of content (e.g., "Prologue", "Synopsis", "Description", "Summary", "Terms and Conditions", "ArtistBiography"). |
| `type`             |          | `String`  | Enumerated type classification for the content. Examples from schema: `Description` (1), `Summary` (2), `Conditions` (3), `History` (4), or `Other` (0). |
| `sub_type`         |          | `String`  | Enumerated sub-type for the content. Examples from schema: `short` (1), `long` (2), or `other` (0).                                       |
| `value`            |          | `String`  | The actual textual content itself.                                                                                                          |
| `meta_description` |          | `String`  | A description of this content's purpose, context, or questions it might answer.                                                           |
| `language`         |          | `String`  | The primary language of the `value`.<br/>{% .callout type="note" %}The `language` field should be a 2-letter ISO language code (e.g., "en", "fr", "es").{% / .callout %} |

### Media Fields (Nested Structure)

| Name    | Required | Data Type | Description                                                                              |
|---------|----------|-----------|------------------------------------------------------------------------------------------|
| `media` |          | `Nested`  | Associates various media files (images, videos, audio) with the entity. See sub-fields below: |

**`media` Sub-Fields:**

| Name           | Required | Data Type | Description                                                                                                                                                         |
|----------------|----------|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `media_type`   |          | `String`  | The general type of media (e.g., "Image", "Video", "Audio").                                                                                                        |
| `type`         |          | `String`  | A more specific type for the media, indicating its purpose (e.g., "Poster", "Thumbnail", "Banner", "Trailer").                                                      |
| `sub_type`     |          | `String`  | An even more specific sub-type, often related to hierarchical content or usage context (e.g., "ProgramImage", "SeasonPoster", "EpisodeThumbnail").                   |
| `url`          |          | `String`  | The fully qualified URL where the media file can be accessed.                                                                                                       |
| `language`     |          | `String`  | The primary language of the media content (e.g., for subtitles in a video, or language-specific imagery).<br/>{% .callout type="note" %}The `language` field, when applicable, should be a 2-letter ISO language code.{% / .callout %} |
| `aspect_ratio` |          | `String`  | The aspect ratio of the media (e.g., "16:9", "4:3", "1:1").                                                                                                         |

### Embedding Fields (Nested Structure)

| Name         | Required | Data Type | Description                                                                                                                        |
|--------------|----------|-----------|------------------------------------------------------------------------------------------------------------------------------------|
| `embeddings` |          | `Nested`  | Stores vector embeddings of the entity's content, crucial for similarity searches and machine learning applications. See sub-fields below: |

**`embeddings` Sub-Fields:**

| Name             | Required | Data Type        | Description                                                                                                                                                              |
|------------------|----------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `label`          |          | `String`         | A label for the embedding, typically matching a `content.label` from which the embedding was derived (e.g., "SynopsisEmbedding", "DescriptionVector").                   |
| `content_starts` |          | `String`         | Optional text prefix used during the embedding generation process (e.g., "Title: ", "Description: "). This helps in providing context to the embedding model.          |
| `content_ends`   |          | `String`         | Optional text suffix used during embedding generation (e.g., " ", ".", " - ").                                                                                           |
| `opening_phrase` |          | `String`         | An optional opening phrase used to frame the content for the embedding model (e.g., "This text describes: ").                                                            |
| `closing_phrase` |          | `String`         | An optional closing phrase used to frame the content for the embedding model (e.g., " End of content.").                                                                 |
| `vectors`        |          | `Array(Float64)` | The actual embedding vectors, represented as an array of floating-point numbers (e.g., typically 1024 or 1536 dimensions depending on the model).                       |
| `model`          |          | `String`         | The name or identifier of the machine learning model used to generate these embeddings (e.g., "text-embedding-3-small", "openai-clip-base").                             |

### ID Fields (Nested Structure)

| Name  | Required | Data Type | Description                                                                                                                       |
|-------|----------|-----------|-----------------------------------------------------------------------------------------------------------------------------------|
| `ids` |          | `Nested`  | Stores various external or alternative identifiers related to the entity or other entities involved in an event. See sub-fields below: |

**`ids` Sub-Fields:**

| Name         | Required | Data Type | Description                                                                                                                                                              |
|--------------|----------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `label`      |          | `String`  | A descriptive label for this identifier (e.g., "TicketingSystemID", "OrganizerRef", "ISAN").                                                                               |
| `role`       |          | `String`  | The role this identifier plays, especially in the context of an event or relationship (e.g., "PrimaryContact", "VenueProvider").                                         |
| `entity_type`|          | `String`  | The type of the entity that this ID refers to (e.g., "User", "Venue", "Promoter").                                                                                         |
| `entity_gid` |          | `UUID`    | If this ID refers to another entity tracked within the same system, its `gid` can be stored here.                                                                          |
| `id`         |          | `String`  | The actual identifier string (e.g., "XF-12345", "user_789", "venue_abc").                                                                                                  |
| `id_type`    |          | `String`  | The type or source system of the `id` (e.g., "CRM_ID", "LegacySystemID", "ISBN").                                                                                           |
| `capacity`   |          | `Float`   | Represents a capacity associated with this ID, if applicable (e.g., number of tickets allocated to a distributor, seating capacity of a referenced venue section).         |

### Classification Fields (Nested Structure)

| Name             | Required | Data Type | Description                                                                               |
|------------------|----------|-----------|-------------------------------------------------------------------------------------------|
| `classification` |          | `Nested`  | Applies formal or informal categorizations to the entity. See sub-fields below:             |

**`classification` Sub-Fields:**

| Name          | Required | Data Type | Description                                                                                                                                                              |
|---------------|----------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`        |          | `String`  | The classification scheme or category type (e.g., "Genre", "AudienceRating", "ContentWarning").                                                                          |
| `value`       |          | `String`  | The specific value within the classification scheme (e.g., "Sports->Football", "Concert->Pop", "AgeRating->18+").                                                       |
| `babelnet_id` |          | `String`  | The BabelNet concept ID for the classification term. This aids in semantic understanding, translation, and linking to external knowledge bases.                           |
| `weight`      |          | `Float`   | The relevance, confidence, or applicability score of this classification to the entity (e.g., a value between 0.0 and 1.0).                                                |

### Location Fields (Nested Structure)

| Name       | Required | Data Type | Description                                                                                                                              |
|------------|----------|-----------|------------------------------------------------------------------------------------------------------------------------------------------|
| `location` |          | `Nested`  | Details geographical information pertinent to the entity, such as its own location or the location of an event. See sub-fields below: |

**`location` Sub-Fields:**

| Name           | Required | Data Type   | Description                                                                                                                                                                |
|----------------|----------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`         |          | `String`    | The type of location (e.g., "PrimaryAddress", "Venue", "RegisteredOffice", "AreaOfOperation").                                                                             |
| `label`        |          | `String`    | A human-readable label for this location entry (e.g., "Event Venue", "Artist's Studio").                                                                                   |
| `country`      |          | `String`    | The country of the location.<br/>{% .callout type="note" %}Should be in English, singular form, and capitalized (e.g., "France", "United States").{% / .callout %}            |
| `country_code` |          | `String`    | The 3-letter ISO country code.<br/>{% .callout type="note" %}Should be in uppercase (e.g., "FRA", "USA").{% / .callout %}                                                    |
| `code`         |          | `String`    | A specific administrative or location code (e.g., a state code, district code, or custom internal code).<br/>{% .callout type="note" %}Typically in uppercase.{% / .callout %} |
| `region`       |          | `String`    | The region or state.<br/>{% .callout type="note" %}Should be in English, singular form, and capitalized.{% / .callout %}                                                       |
| `division`     |          | `String`    | A sub-division like a county, province, or department.<br/>{% .callout type="note" %}Should be in English, singular form, and capitalized.{% / .callout %}                   |
| `municipality` |          | `String`    | The city, town, or municipality.<br/>{% .callout type="note" %}Should be in English, singular form, and capitalized.{% / .callout %}                                           |
| `locality`     |          | `String`    | A more specific locality, district, or neighborhood.<br/>{% .callout type="note" %}Should be in English, singular form, and capitalized.{% / .callout %}                      |
| `postal_code`  |          | `String`    | The postal or ZIP code.<br/>{% .callout type="note" %}Typically in uppercase.{% / .callout %}                                                                                |
| `postal_name`  |          | `String`    | The name of the postal code area or district.<br/>{% .callout type="note" %}Should be in English, singular form, and capitalized.{% / .callout %}                             |
| `street`       |          | `String`    | The street name.<br/>{% .callout type="note" %}Should be in English, singular form, and capitalized.{% / .callout %}                                                          |
| `street_nr`    |          | `String`    | The street number.<br/>{% .callout type="note" %}Typically in uppercase.{% / .callout %}                                                                                     |
| `address`      |          | `String`    | The full, formatted address string.<br/>{% .callout type="note" %}Should be in English, singular form, and capitalized if it represents a formal address line.{% / .callout %} |
| `longitude`    |          | `Float64`   | The geographical longitude in decimal degrees.                                                                                                                             |
| `latitude`     |          | `Float64`   | The geographical latitude in decimal degrees.                                                                                                                              |
| `geohash`      |          | `String`    | The geohash representation of the location's coordinates.<br/>{% .callout type="note" %}Should be in lowercase.{% / .callout %}                                               |
| `duration_from`|          | `DateTime64`| The start date and time for which this location information is valid or relevant.                                                                                          |
| `duration_until`|          | `DateTime64`| The end date and time for which this location information is valid or relevant.                                                                                            |

### Internal/System Fields

These fields are primarily used internally by the data storage system (e.g., ClickHouse) for data management, versioning, and integrity.

| Name        | Required | Data Type | Description                                                                                                                                                                                                                            |
|-------------|----------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `partition` |          | `String`  | The storage partition for the entity.<br/>{% .callout type="info" %}This is an internal field and is not typically submitted by users. It's used to partition data for performance and scalability.{% / .callout %}                  |
| `sign`      |          | `Int8`    | An internal field used by ClickHouse's `ReplacingMergeTree` engine. Default is `1`.<br/>{% .callout type="info" %}This field helps manage updates and ensure data consistency by marking the latest version of an entity.{% / .callout %} |

## Generic Entity Structure Example

Here is a conceptual example of what a "MusicFestival" entity might look like, represented in JSON, showcasing various fields:

```json
{
  "gid": "evt_2a7d9f8b-c1e3-4b5f-8a6d-0e2f1c9a7b4d",
  "gid_url": "nova://entities/evt_2a7d9f8b-c1e3-4b5f-8a6d-0e2f1c9a7b4d",
  "label": "Nova Summer Fest 2024",
  "labels": ["en:Nova Summer Fest 2024", "fr:Festival d'été Nova 2024"],
  "type": "Event",
  "variant": "MusicFestival",
  "icon": "MusicFestival",
  "colour": "Blue",
  "dimensions": {
    "expected_attendance": "50000",
    "duration_days": "3",
    "event_genre": "MultiGenre"
  },
  "tags": ["music", "festival", "summer", "outdoor", "live_acts"],
  "flags": {
    "isFamilyFriendly": true,
    "isSoldOut": false,
    "allowsCamping": true
  },
  "metrics": {
    "artist_count": 150,
    "stage_count": 5
  },
  "names": {
    "short_name": "NSF24",
    "promotional_name": "The Ultimate Nova Summer Festival Experience"
  },
  "content": [
    {
      "label": "MainDescription",
      "type": "Description",
      "sub_type": "long",
      "value": "Join us for the 10th anniversary of Nova Summer Fest! Three days of incredible music, art installations, and gourmet food under the summer sky.",
      "meta_description": "Official long description of the Nova Summer Fest 2024, highlighting key features and attractions.",
      "language": "en"
    },
    {
      "label": "LineupHighlights",
      "type": "Summary",
      "sub_type": "short",
      "value": "Featuring headliners: The Cosmic Keys, Digital Dreams, Acoustic Echoes, and many more across 5 stages.",
      "meta_description": "Short summary of headlining acts.",
      "language": "en"
    }
  ],
  "media": [
    {
      "media_type": "Image",
      "type": "Poster",
      "sub_type": "OfficialEventPoster",
      "url": "https://example.com/media/nsf2024_poster.jpg",
      "language": "en",
      "aspect_ratio": "2:3"
    },
    {
      "media_type": "Video",
      "type": "Trailer",
      "sub_type": "OfficialTrailer",
      "url": "https://youtube.com/watch?v=nsf2024_trailer",
      "language": "en",
      "aspect_ratio": "16:9"
    }
  ],
  "ids": [
    {
      "label": "TicketingPartnerID",
      "role": "TicketingProvider",
      "entity_type": "Organization",
      "id": "TICKETMASTER_EVT_NSF2024",
      "id_type": "PartnerEventID"
    },
    {
      "label": "MainOrganizerGID",
      "role": "Organizer",
      "entity_type": "Organization",
      "entity_gid": "org_f1c0a0d0-b0e0-40d0-80c0-00b0a0d0e0f0",
      "id_type": "NovaGID"
    }
  ],
  "classification": [
    {
      "type": "EventGenre",
      "value": "Music->Electronic",
      "babelnet_id": "bn:00030922n",
      "weight": 0.8
    },
    {
      "type": "EventGenre",
      "value": "Music->Rock",
      "babelnet_id": "bn:00069047n",
      "weight": 0.6
    }
  ],
  "location": [
    {
      "type": "PrimaryVenue",
      "label": "Sunshine Park Festival Grounds",
      "country": "United States",
      "country_code": "USA",
      "region": "California",
      "municipality": "Meadowville",
      "postal_code": "90210",
      "street": "123 Festival Lane",
      "address": "123 Festival Lane, Meadowville, CA 90210, USA",
      "longitude": -118.4000,
      "latitude": 34.0500,
      "geohash": "9q5cs",
      "duration_from": "2024-07-19T09:00:00Z",
      "duration_until": "2024-07-21T23:59:59Z"
    }
  ],
  "partition": "2024-07",
  "sign": 1
}
```

{% .callout type="info" %}
**Note:** This is a conceptual illustration. The `partition` and `sign` fields are typically system-managed. Specific field names (e.g., `entity_id` vs `gid`) and the overall structure may differ based on the chosen schema implementation or platform. The key is the ability to uniquely identify, type, and describe the entity with rich contextual information.
{% / .callout %}

## How Entities Relate to Semantic Events

Semantic Events typically link to one or more entities to provide full context. The event data itself will often contain identifiers (like `gid`) for the involved entities. For example:

- A **'Product Purchased'** event would link to a 'User' entity (who made the purchase) and one or more 'Product' entities (what was purchased).
- A **'Support Ticket Created'** event might link to a 'User' entity (who created the ticket) and potentially an 'Agent' entity (if assigned).

Sometimes, the role of an entity within an event is also specified, particularly if an event involves multiple entities of the same type (e.g., a 'Funds Transferred' event might involve a 'SenderUser' and a 'ReceiverUser', both being 'User' entity types but with different roles in the event). The `ids` nested structure within an entity can also be used to model relationships or roles with other entities.

## Benefits of Well-Defined Entities

Clearly defining and utilizing entities within your semantic event framework offers several advantages:

- **Deeper Event Understanding**: Entities provide the "who" and "what" for events, making them much richer and more interpretable.
- **Robust Entity-Centric Analytics**: Allows for tracking behavior, trends, and patterns related to specific users, products, organizations, etc., over time.
- **Building a Connected Data View**: Enables the creation of a graph or network of interconnected entities and events, reflecting complex business processes and relationships.
- **Personalization and Targeting**: Well-defined user and product entities are fundamental for delivering personalized experiences and targeted campaigns.
- **Improved Data Governance**: Clear entity definitions aid in managing data quality, consistency, compliance, and understanding data lineage.
- **Enhanced Machine Learning Capabilities**: Rich entity features and embeddings power more accurate recommendations, predictions, and insights.

By consistently identifying and describing entities with a comprehensive schema, organizations can unlock more profound insights from their event data and build more intelligent, data-driven systems.
