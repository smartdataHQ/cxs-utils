## Required Properties
The following three properties are required for all semantic events:

{% table %}
- Property {% align="left" width="10%" %}
- Type {% align="left" width="10%" %}
- Description {% align="left" width="50%" %}
- Example {% align="left" width="20%" %}
---
- type
- String
- The primary type of event. Standard Segment types include `"track"`, `"page"`, `"identify"`, `"group"`, `"alias"`, `"screen"`.
- `"track"`                |
---
- event
- String (Cond.)
- Name of the event, mandatory if type is `"track"`. Should be capitalized where the last word is a verb in past tense.
- `"Order Completed"`
---
- `timestamp`
- DateTime
- The timestamp when the event occurred, in UTC. Defaults to the current timestamp (`now`) if not explicitly provided.
- `"2025-05-18T15:45:30Z"`
{% /table %}


- **Note:**\
  The event property is mandatory when the type is set to "track". For other event types like "page" or "identify", it's typically omitted.

## Automatic Properties
While sending an event or upon receiving it, the Context Suite automatically enriches the event with additional internal metadata. These internal properties help manage event storage, access, partitioning, and linking events to specific entities within the system:

{% table %}
- Property {% align="left" width="10%" %}
- Type {% align="left" width="10%" %}
- Description {% align="left" width="50%" %}
- Created by {% align="left" width="20%" %}
---
- `entity_gid`
- UUID
- A Context Suite-native identifier linking the event to a specific entity (account or sub-entity).
- Server
---
- `partition`
- String
- Internal identifier for data partitioning and optimized storage.
- Server
---
- `message_id`
- String
- Unique ID generated to identify and deduplicate event messages.
- Client/Server
---
- `event_gid`
- UUID
- Globally unique identifier assigned to each semantic event.
- Server
{% /table %}



These properties are **not required** from the client-side event sender, as they are automatically managed by the receiving server.

## Minimum Example Event
```
{
  "type": "track",
  "event": "Something Happened",
  "timestamp": "2025-05-18T15:45:30Z"
}
```
If the timestamp property is omitted, the event-receiving server automatically sets it to the current UTC timestamp (now).

## Auto-filled and Enriched Properties
Most additional properties in the semantic events schema are either:

- **Auto-filled by the client-side library (e.g., Jitsu, Segment Analytics.js, or mobile SDKs):**\
  These include device information, browser details, network, and locale data. Clients do not explicitly send these; the analytics libraries collect and attach them automatically.

- **Enriched on the server-side upon reception:**\
  The Context Suite middleware enriches each event with contextually relevant information, such as geolocation, IP address, internal identifiers (entity_gid, event_gid), access control properties, and event partitioning details. This automatic enrichment simplifies client-side implementation and ensures robust, accurate analytics without additional overhead.


