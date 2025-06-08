---
title: Event Location Properties
---

# Event Location Properties

The `location` nested structure within the Semantic Event Schema is used to describe a geographical place relevant to the event itself. This is distinct from an entity's primary or canonical address (which might be stored with the entity's own properties). Instead, the event location specifies where the event occurred, where its impact is felt, or a location it pertains to (e.g., a venue for a ticketed event).

When an event includes location details, the `location` field typically holds a single object with the properties detailed below. This allows for a rich, structured description of the place.

## Location Object Properties

The following table details the fields found within the `location` object of a semantic event.

| Property Name     | Type                             | Description                                                                                                | Optional |
|-------------------|----------------------------------|------------------------------------------------------------------------------------------------------------|----------|
| `location_of`     | `String`                         | Describes what the location information pertains to in the context of this event (e.g., "event_occurrence", "user_device", "service_area", "venue"). From `LowCardinality(String)`. | No       |
| `label`           | `String (Optional)`              | A human-readable label or name for the location (e.g., "Main Street Store", "User's Home"). From `LowCardinality(String)`. | Yes      |
| `country`         | `String (Optional)`              | The full name of the country (e.g., "United States", "Germany"). From `LowCardinality(String)`.            | Yes      |
| `country_code`    | `String (Optional)`              | ISO 3166-1 alpha-2 country code (e.g., "US", "DE"). From `LowCardinality(String)`.                         | Yes      |
| `code`            | `String (Optional)`              | Other relevant code for the location, could be specific to a system (e.g. UN/LOCODE). From `LowCardinality(String)`. | Yes      |
| `region`          | `String (Optional)`              | State, province, or region name (e.g., "California", "Bavaria"). From `LowCardinality(String)`.             | Yes      |
| `division`        | `String (Optional)`              | A smaller administrative division, like a county or district. From `LowCardinality(String)`.              | Yes      |
| `municipality`    | `String (Optional)`              | City, town, or village name (e.g., "San Francisco", "Munich"). From `LowCardinality(String)`.               | Yes      |
| `locality`        | `String (Optional)`              | A more specific locality, neighborhood, or area within the municipality. From `LowCardinality(String)`.     | Yes      |
| `postal_code`     | `String (Optional)`              | Postal or ZIP code (e.g., "94107", "80331"). From `LowCardinality(String)`.                               | Yes      |
| `postal_name`     | `String (Optional)`              | The name associated with the postal code, if different from municipality/locality. From `LowCardinality(String)`. | Yes      |
| `street`          | `String (Optional)`              | Street name (e.g., "Market Street", "Marienplatz").                                                        | Yes      |
| `street_nr`       | `String (Optional)`              | Street number or house number.                                                                             | Yes      |
| `address`         | `String (Optional)`              | Full, unstructured address, if a structured breakdown isn't available or for display purposes.             | Yes      |
| `longitude`       | `Float (Optional)`               | Geographic longitude in decimal degrees.                                                                   | Yes      |
| `latitude`        | `Float (Optional)`               | Geographic latitude in decimal degrees.                                                                    | Yes      |
| `geohash`         | `String (Optional)`              | Geohash representing the longitude and latitude.                                                           | Yes      |
| `duration_from`   | `DateTime (UTC, Optional)`       | If the location is relevant for a specific period, this marks the start of that period.                    | Yes      |
| `duration_until`  | `DateTime (UTC, Optional)`       | If the location is relevant for a specific period, this marks the end of that period.                      | Yes      |

## Use Cases and Explanations

The `location` properties provide context crucial for various types of analysis and operational logic:

*   **Point of Sale Transactions:** For an "Order Completed" event, the `location` could specify the store where the purchase was made. `location_of` might be "store_transaction".
*   **Mobile App Usage:** An event triggered from a mobile app could include the user's current geographical coordinates (`latitude`, `longitude`) at the time of the event. `location_of` could be "user_device_approximate".
*   **Service Delivery:** For an event like "Service Technician Dispatched", the `location` could be the customer's address where the service will occur. `location_of` might be "service_destination".
*   **Event Ticketing:** If a "Ticket Purchased" event occurs, the `location` object could describe the venue of the show or game. `location_of` could be "event_venue".
*   **Geofencing:** Events like "Geofence Entered" or "Geofence Exited" would use these fields to specify the geofence's defined area or the point of crossing.

**Key Fields:**

*   `location_of`: This field is particularly important as it clarifies *what aspect of the event* the location data refers to. Without it, ambiguity can arise. For example, is it the user's location, the business's location, or a location mentioned in the event's content?
*   `latitude`, `longitude`, `geohash`: Provide precise geographic coordinates, enabling map-based visualizations and spatial queries.
*   `duration_from`, `duration_until`: Useful for events where a location is relevant only for a specific time window (e.g., a temporary pop-up shop location, or the duration a user was in a specific area).

By capturing event-specific location data, businesses can perform geo-spatial analysis, understand regional trends, personalize user experiences based on location, and enhance logistical operations.
