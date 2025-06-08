# Python Segment Client

A Python client compatible with Segment.com's HTTP tracking API. It allows you to send `identify`, `page`, and `track` events to a Segment-compatible endpoint, structured according to an authoritative `SemanticEvent` schema.

## Features

-   Sends `identify`, `page`, and `track` events.
-   Automatically populates context information like `library`, `os` (Operating System details into `SemanticEvent.os`), and `ip` (into `SemanticEvent.context.ip`).
-   `library`: Information about this client (`python-segment-client` and version, e.g., "0.3.0") is automatically included in `SemanticEvent.library`.
-   Configurable endpoint.
-   Allows custom `timestamp` and `context` (specifically `CXSContext.extras` and other `CXSContext` fields) for each event.
-   Built-in event validation against the project's authoritative `SemanticEvent` schema (from `python.cxs.core.schema.semantic_event`) to ensure data integrity.

## Installation

To use this client, ensure `segment_client.py` is in your Python path. The client also depends on the project's internal schema module: `python.cxs.core.schema.semantic_event`.

You will also need `requests` and `pydantic`:
```bash
pip install requests pydantic
```

## Schema Validation

This client uses Pydantic models, primarily `SemanticEvent` from `python.cxs.core.schema.semantic_event`, to validate events before they are sent. This ensures that the events conform to the expected structure.

Key aspects of validation:
-   **Automatic Fields**: `messageId` (stringified UUID v4), `timestamp` (current UTC time), `event_gid`, `library`, `os`, and default `context.ip` are automatically generated or structured if not explicitly provided.
-   **Required Fields**: Core fields like `event_name` for track events, or `userId`/`anonymousId` (at least one must be provided for client methods), and `root_event_gid` for all event calls are enforced by the client. `entity_gid` and `partition` are required at client initialization.
-   **Type Checking**: Data types for all fields are checked by the `SemanticEvent` model.
-   **Track/Page Properties**: The `properties` field for `track` and `page` events are ultimately stored as `Dict[str, str]` in the `SemanticEvent`. The client will convert non-string property values to strings.
-   **Integrations**: The `integrations` field must be a `Dict[str, bool]`.

If an event fails Pydantic model validation (e.g. due to incorrect types for fields in `CXSContext` or `Traits`), a `pydantic.ValidationError` will be raised. If a client-side check fails before Pydantic validation (e.g. missing `user_id` AND `anonymous_id`, or missing `event_name` for track events, non-boolean integration values), a `ValueError` or `TypeError` might be raised. You should wrap event sending calls in `try...except` blocks to handle these potential errors.

See `examples.py` for demonstrations of how validation errors are caught.

## Usage

### Initialization

Import and initialize the `SegmentClient` with your Segment write key, your organization's `entity_gid` (a UUID), an event `partition` string, and an optional endpoint.

```python
from segment_client import SegmentClient
import uuid # For generating GIDs

# Replace with your actual Segment write key, CXS entity_gid, and partition
write_key = 'YOUR_SEGMENT_WRITE_KEY'
entity_g = uuid.uuid4() # Example: typically a fixed GID for your organization/entity
event_partition = 'your_event_partition' # Example: 'production' or 'staging'

client = SegmentClient(
    write_key=write_key,
    entity_gid=entity_g,
    partition=event_partition
    # For custom endpoints (e.g., Jitsu or other Segment-compatible services):
    # endpoint='https://your.custom.endpoint/v1/event'
)
```

### Sending Events

All event methods (`identify`, `track`, `page`) require a `root_event_gid` (UUID) as their first parameter. They also support optional `anonymous_id` (string) and `integrations` (dictionary `Dict[str, bool]`) parameters.

#### Identify

Associate a user with their actions and record traits about them.

```python
# Define an example root_event_gid (in a real scenario, this might be unique per logical event flow or a new UUID per call)
example_root_gid = uuid.uuid4()

# Example identify call
client.identify(
    root_event_gid=example_root_gid,
    user_id="user123",
    traits={
        "email": "john.doe@example.com",
        "name": "John Doe",
        "company": "Example Inc.",
        "plan": "premium",
        "age": 30 # CXSTraits model can handle various types
    }
    # You can also pass anonymous_id="anon-id" and integrations={"Mixpanel": False}
)
```

#### Track

Record actions your users perform. `properties` values will be stringified.

```python
# Example track call
client.track(
    root_event_gid=example_root_gid, # New required parameter
    user_id="user123",
    anonymous_id="anon_abc_xyz", # Optional anonymous ID
    event_name="Article Completed",
    properties={
        "article_id": "article_789",
        "title": "How to Use Semantic Events", # Values will be stringified if not already
        "word_count": 350, # Will be converted to "350"
        "published": True   # Will be converted to "True"
    },
    integrations={ # Must be Dict[str, bool]
        "Salesforce": True,
        "Mixpanel": False
    }
)
```

#### Page

Record whenever a user sees a page of your website. Page-specific `properties` (like URL, path) populate the `SemanticEvent.page` object, while others are stringified into `SemanticEvent.properties`.

```python
# Example page call
client.page(
    root_event_gid=example_root_gid,
    user_id="user123",
    name="Docs Home", # Populates SemanticEvent.page.name
    properties={
        "url": "https://example.com/docs", # Populates SemanticEvent.page.url
        "path": "/docs",                   # Populates SemanticEvent.page.path
        "referrer": "https://example.com/",# Populates SemanticEvent.page.referrer
        "load_time_ms": 250                # Becomes "250" in SemanticEvent.properties
    }
)

# Page call without a specific page name
client.page(
    root_event_gid=example_root_gid,
    user_id="user123",
    properties={
        "url": "https://example.com/settings",
        "path": "/settings"
    }
)
```

### Custom Timestamp and Context

You can provide a custom `timestamp` (as an ISO 8601 string or Python `datetime` object) and a `context` dictionary for any event. The `context` dictionary is used to populate fields in `SemanticEvent.context` (like `ip`, `locale`, `timezone`) and any remaining items go into `SemanticEvent.context.extras`.

```python
from datetime import datetime, timezone

custom_ts = datetime.now(timezone.utc).isoformat()
custom_ctx = {"active_experiments": ["exp_A", "exp_B"], "locale": "en-US"}

client.track(
    user_id="user456",
    event_name="Feature Flag Evaluated",
    properties={"flag_name": "new_dashboard", "value": True},
    timestamp=custom_ts,
    context=custom_ctx
)
```
The provided `context` will override the default generated context.

## Running Examples

The `examples.py` file shows basic usage:

```bash
python examples.py
```
Remember to replace `'YOUR_WRITE_KEY'` in `examples.py` if you want to send data to an actual endpoint.

## Running Tests

Unit tests are located in `test_segment_client.py` and use the standard `unittest` library.

To run the tests:
```bash
python -m unittest test_segment_client.py
```

## Contributing

Feel free to fork the repository, make changes, and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.
```
