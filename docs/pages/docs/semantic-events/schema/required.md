---
title: Required & Automatic Event Properties
---

# Required & Automatic Event Properties

This document outlines the properties that are either strictly required when sending a semantic event, or are automatically generated and added by the Context Suite platform during ingestion and processing.

## Required Properties
The following properties are considered essential for most semantic events:

| Name        | Required | Data Type | Description                                                                                                                                                    |
|-------------|----------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`      |          | `String`  | The primary type of event. Standard Segment types include `"track"`, `"page"`, `"identify"`, `"group"`, `"alias"`, `"screen"`.                                      |
| `event`     |          | `String`  | Name of the event. This field is mandatory if `type` is `"track"`. It should be capitalized, and typically the last word is a verb in the past tense (e.g., "Order Completed"). |
| `timestamp` |          | `Timestamp` | The timestamp when the event occurred, in UTC. If not explicitly provided, it defaults to the time of ingestion. Example: `"2025-05-18T15:45:30Z"`.                   |

- **Note:**\
  The `event` property is mandatory when the `type` is set to "track". For other event types like "page" or "identify", it's typically omitted as the type itself is sufficiently descriptive.

## Automatic Properties
While sending an event or upon receiving it, the Context Suite automatically enriches the event with additional internal metadata. These internal properties help manage event storage, access, partitioning, and linking events to specific entities within the system. Clients do not need to send these.

| Name           | Required | Data Type | Description                                                                                                             |
|----------------|----------|-----------|-------------------------------------------------------------------------------------------------------------------------|
| `entity_gid`   |          | `UUID`    | A Context Suite-native identifier linking the event to a specific entity (account or sub-entity). Created by: Server.     |
| `partition`    |          | `String`  | Internal identifier for data partitioning and optimized storage. Created by: Server.                                      |
| `message_id`   |          | `String`  | Unique ID generated to identify and deduplicate event messages. Created by: Client/Server.                                |
| `event_gid`    |          | `UUID`    | Globally unique identifier assigned to each semantic event upon ingestion. Created by: Server.                            |

These properties are **not required** from the client-side event sender, as they are automatically managed by the receiving server or the SDKs.

## Minimum Example Event
```json
{
  "type": "track",
  "event": "Something Happened",
  "timestamp": "2025-05-18T15:45:30Z"
}
```
If the `timestamp` property is omitted, the event-receiving server automatically sets it to the current UTC timestamp (time of ingestion).

## Auto-filled and Enriched Properties
Most additional properties in the semantic events schema are either:

- **Auto-filled by the client-side library (e.g., Jitsu, Segment Analytics.js, or mobile SDKs):**\
  These include device information, browser details, network, and locale data. Clients do not explicitly send these; the analytics libraries collect and attach them automatically.

- **Enriched on the server-side upon reception:**\
  The Context Suite middleware enriches each event with contextually relevant information, such as geolocation, IP address, internal identifiers (`entity_gid`, `event_gid`), access control properties, and event partitioning details. This automatic enrichment simplifies client-side implementation and ensures robust, accurate analytics without additional overhead.
