---
title: User Traits in Event Context
---

# User Traits in Event Context (`traits.*` fields)

The `traits.*` prefixed properties within the Semantic Event Schema are designed to capture attributes of the user involved in an event, as those attributes are known or recorded *at the time and in the context of that specific event*.

An important consideration, highlighted by the SQL schema comment "Trait Properties that should be stores separately for GDPR reasons," is that these fields often contain Personally Identifiable Information (PII). Their grouping under the `traits.*` prefix can facilitate special handling for data privacy and compliance.

It's also important to understand that these traits within an event are often a snapshot or a relevant subset of a user's overall profile. A more comprehensive, canonical, or historically complete user profile might exist in a separate system (e.g., a dedicated `entities` table for users or a user profile service). This documentation page focuses on how user traits appear directly within the event stream, providing immediate context.

## Standard User Trait Properties

The following table details commonly predefined `traits.*` fields. Most of these are conceptually optional, as they may not be available or relevant for every event or user.

| Property Name        | Type                | Description                                                                                                | Optional |
|----------------------|---------------------|------------------------------------------------------------------------------------------------------------|----------|
| `traits.id`          | `String (Optional)` | Unique identifier for the user from an external system (e.g., CRM ID, database ID). Often distinct from `user_id` or `user_gid`. | Yes      |
| `traits.name`        | `String (Optional)` | Full name of the user.                                                                                     | Yes      |
| `traits.first_name`  | `String (Optional)` | First name of the user.                                                                                    | Yes      |
| `traits.last_name`   | `String (Optional)` | Last name of the user.                                                                                     | Yes      |
| `traits.middle_name` | `String (Optional)` | Middle name of the user.                                                                                   | Yes      |
| `traits.email`       | `String (Optional)` | Email address of the user.                                                                                 | Yes      |
| `traits.phone`       | `String (Optional)` | Phone number of the user.                                                                                  | Yes      |
| `traits.username`    | `String (Optional)` | Username or screen name of the user.                                                                       | Yes      |
| `traits.website`     | `String (Optional)` | URL of the user's personal or professional website.                                                        | Yes      |
| `traits.title`       | `String (Optional)` | Job title of the user (e.g., "Software Engineer", "Product Manager").                                      | Yes      |
| `traits.gender`      | `String (Optional)` | Gender of the user. Common values include 'male', 'female', 'other', 'unknown'. From `LowCardinality(String)`. | Yes      |
| `traits.birthday`    | `Date (Optional)`   | User's date of birth (e.g., "YYYY-MM-DD"). From `Nullable(Date)`.                                          | Yes      |
| `traits.age`         | `Integer (Optional)`| Age of the user. From `Nullable(Int8)`.                                                                    | Yes      |
| `traits.description` | `String (Optional)` | A brief description or bio of the user.                                                                    | Yes      |
| `traits.company_name`| `String (Optional)` | Name of the company the user is associated with.                                                           | Yes      |
| `traits.company_gid` | `UUID (String, Optional)`| Global ID (GID) of the company the user is associated with.                                              | Yes      |
| `traits.company_id`  | `String (Optional)` | External ID of the company the user is associated with.                                                    | Yes      |

## User Address Traits (`traits.address` map)

The `traits.address` field provides a flexible way to store various address-related details for the user. It is structured as a `Map<String, String>`.

*   **Structure:** `Map<String, String>`
    *   Keys are strings identifying address components (e.g., "street", "city").
    *   Values are strings representing the value for that component.

**Common Keys within `traits.address`:**

While flexible, common keys you might find or use within the `traits.address` map include:
*   `street`: Street address line (e.g., "123 Main St").
*   `city`: City name (e.g., "San Francisco").
*   `state`: State, region, or province (e.g., "CA", "Bavaria").
*   `postal_code` or `zip_code`: Postal or ZIP code (e.g., "94107").
*   `country`: Country name or code (e.g., "USA", "DE").
*   `address_type`: Type of address (e.g., "home", "work", "shipping", "billing").
*   Custom fields like `apartment_suite_nr`, `delivery_instructions`, etc., can also be included.

**Example of `traits.address`:**
```json
{
  "traits.address": {
    "street": "1 Infinite Loop",
    "city": "Cupertino",
    "state": "CA",
    "postal_code": "95014",
    "country": "USA",
    "address_type": "work"
  }
}
```

## Purpose and Usage

Attaching user traits directly to events serves several key purposes:

*   **Immediate Personalization:** Allows systems to personalize user experiences in real-time based on information available at the moment of the event, without needing to query a separate user profile store. For example, greeting a user by `traits.first_name` or showing content relevant to their `traits.title`.
*   **Contextual Analysis:** Provides rich dimensions for segmenting event data during analysis. For instance, analyzing feature adoption rates based on `traits.company_name` or `traits.age`.
*   **Snapshot of User State:** Captures the user's attributes as they were when the event occurred, which can be useful for historical analysis if user profiles change over time.
*   **Simplified Event Processing:** For some downstream systems, having relevant user traits embedded in the event can simplify processing by reducing the need for immediate lookups or joins.

**Data Privacy (GDPR) Considerations:**
As noted, `traits.*` fields often contain PII. Their distinct grouping helps in applying appropriate data handling, masking, or anonymization techniques as required by privacy regulations like GDPR. Organizations must ensure that the collection, storage, and use of these traits comply with all applicable privacy laws and policies.

By including relevant `traits.*` in events, you enrich the data with user-specific context, enabling more insightful analytics and more personalized user interactions, while also being mindful of data privacy obligations.
