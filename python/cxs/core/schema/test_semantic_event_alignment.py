import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple

from python.cxs.core.schema.semantic_event import (
    SemanticEvent,
    SemanticEventCH,
    Device,
    Context,
    EntityLinking,
    Commerce,
    Product,
    UserAgentData, # Though not directly tested as top-level, it's part of UserAgent
    SourceInfo,
    EventType,
    Location as SemanticEventLocation, # Renaming to avoid conflict with entity.Location if used elsewhere
    Campaign, App, OS, UserAgent, Page, Referrer, Screen, Library, Network, Traits # For completeness if needed
)

def get_sample_semantic_event_data() -> Dict[str, Any]:
    """Creates sample raw data for a SemanticEvent instance."""
    event_time = datetime.now(timezone.utc)
    test_event_gid = uuid.uuid4()
    test_entity_gid = uuid.uuid4()
    test_user_gid = uuid.uuid4()
    test_product1_gid = uuid.uuid4()
    test_product2_gid = uuid.uuid4()
    test_linked_entity_gid = uuid.uuid4()
    test_source_gid = uuid.uuid4()

    data = {
        "entity_gid": test_entity_gid,
        "timestamp": event_time,
        "type": EventType.track,
        "event": "Test Event Occurred",
        "event_gid": test_event_gid,
        "partition": "test_partition",

        # New top-level fields
        "anonymous_id": "anon-123",
        "user_gid": test_user_gid,
        "importance": 4,
        "root_event_gid": uuid.uuid4(), # Made non-optional

        # Context Object: Device
        "device": {
            "id": "device-id-001",
            "manufacturer": "TestManu",
            "model": "TestModelX",
            "name": "MyTestDevice",
            "type": "mobile",
            "version": "1.0",
            "brand": "TestBrand",       # New field in Device
            "variant": "Pro",           # New field in Device
            "advertising_id": "ad-id-xyz" # New field in Device
        },
        # Context Object: Context
        "context": {
            "ip": "192.168.1.10",
            "locale": "en-US",
            "location": (-73.985130, 40.758896), # (longitude, latitude) tuple
            "extras": "some extra context info"    # New field in Context
        },
        # New Nested List: EntityLinking
        "entity_linking": [
            {
                "content_key": "body_text",
                "label": "Linked Company A",
                "starts_at": 10,
                "ends_at": 25,
                "entity_type": "Organization",
                "entity_gid": test_linked_entity_gid,
                "certainty": 0.85
            }
        ],
        # Context Object: Commerce with Products
        "commerce": {
            "order_id": "order-789",
            "revenue": 120.50,
            "currency": "USD",
            "products": [
                {
                    "product_id": "prod-001",
                    "entity_gid": test_product1_gid,
                    "product": "Awesome Gadget",
                    "sku": "AG-001",
                    "price_bracket": "100-200", # Example existing field
                    "income_category": "Electronics Sales" # New field in Product
                },
                {
                    "product_id": "prod-002",
                    "entity_gid": test_product2_gid,
                    "product": "Mega Widget",
                    "sku": "MW-002",
                    "unit_price": 60.25,
                    "units": 2.0,
                }
            ]
        },
        # Context Object: SourceInfo
        "source_info": { # Populated via alias 'source'
            "type": "TestSourceType",
            "label": "TestSourceLabel",
            "source_gid": test_source_gid
        },
        # Minimal other required context objects if any (based on model defaults, most are optional)
        # Example, if UserAgentData was part of UserAgent and UserAgent was required:
        # "user_agent": {
        #     "signature": "Mozilla/5.0...",
        #     "data": {"brand": "Chrome", "version": "100"}
        # }
    }
    return data

def test_semantic_event_serialization():
    print("--- Testing SemanticEvent Serialization ---")
    raw_data = get_sample_semantic_event_data()
    pydantic_event = SemanticEvent(**raw_data)

    # Ensure GIDs are UUID objects before passing to SemanticEventCH
    if isinstance(pydantic_event.root_event_gid, str):
         pydantic_event.root_event_gid = uuid.UUID(pydantic_event.root_event_gid)

    ch_event = SemanticEventCH(**pydantic_event.model_dump())

    # model_dump_json uses by_alias=True, exclude_none=True by default
    # but for direct dict comparison, we specify them.
    serialized_data = ch_event.model_dump(by_alias=True, exclude_none=True)

    # Define expected ClickHouse structure (flattened)
    expected_ch_data = {
        "entity_gid": raw_data["entity_gid"],
        "timestamp": raw_data["timestamp"],
        "type": raw_data["type"].value, # Enum value
        "event": raw_data["event"],
        "event_gid": raw_data["event_gid"],
        "partition": raw_data["partition"],
        "anonymous_id": raw_data["anonymous_id"],
        "user_gid": raw_data["user_gid"],
        "importance": raw_data["importance"],
        "root_event_gid": raw_data["root_event_gid"],

        # Device context flattened
        "device.id": raw_data["device"]["id"],
        "device.manufacturer": raw_data["device"]["manufacturer"],
        "device.model": raw_data["device"]["model"],
        "device.name": raw_data["device"]["name"],
        "device.type": raw_data["device"]["type"],
        "device.version": raw_data["device"]["version"],
        "device.brand": raw_data["device"]["brand"],
        "device.variant": raw_data["device"]["variant"],
        "device.advertising_id": raw_data["device"]["advertising_id"],

        # Context context flattened
        "context.ip": raw_data["context"]["ip"],
        "context.locale": raw_data["context"]["locale"],
        "context.location": raw_data["context"]["location"], # Tuple (lon, lat)
        "context.extras": raw_data["context"]["extras"],

        # EntityLinking nested list
        "entity_linking.content_key": [raw_data["entity_linking"][0]["content_key"]],
        "entity_linking.label": [raw_data["entity_linking"][0]["label"]],
        "entity_linking.starts_at": [raw_data["entity_linking"][0]["starts_at"]],
        "entity_linking.ends_at": [raw_data["entity_linking"][0]["ends_at"]],
        "entity_linking.entity_type": [raw_data["entity_linking"][0]["entity_type"]],
        "entity_linking.entity_gid": [raw_data["entity_linking"][0]["entity_gid"]],
        "entity_linking.certainty": [raw_data["entity_linking"][0]["certainty"]],

        # Commerce context flattened
        "commerce.order_id": raw_data["commerce"]["order_id"],
        "commerce.revenue": raw_data["commerce"]["revenue"],
        "commerce.currency": raw_data["commerce"]["currency"],
        # Commerce products nested list
        "commerce.products.product_id": [
            raw_data["commerce"]["products"][0]["product_id"],
            raw_data["commerce"]["products"][1]["product_id"]
        ],
        "commerce.products.entity_gid": [
            raw_data["commerce"]["products"][0]["entity_gid"],
            raw_data["commerce"]["products"][1]["entity_gid"]
        ],
        "commerce.products.product": [
            raw_data["commerce"]["products"][0]["product"],
            raw_data["commerce"]["products"][1]["product"]
        ],
        "commerce.products.sku": [
            raw_data["commerce"]["products"][0]["sku"],
            raw_data["commerce"]["products"][1]["sku"]
        ],
         "commerce.products.price_bracket": [ # Only in first product
            raw_data["commerce"]["products"][0]["price_bracket"], None
        ],
        "commerce.products.income_category": [ # Only in first product
            raw_data["commerce"]["products"][0]["income_category"], None
        ],
        "commerce.products.unit_price": [ # Only in second product
            None, raw_data["commerce"]["products"][1]["unit_price"]
        ],
         "commerce.products.units": [ # Only in second product
            None, raw_data["commerce"]["products"][1]["units"]
        ],
        # SourceInfo context flattened (alias 'source' used for fields)
        "source.type": raw_data["source_info"]["type"],
        "source.label": raw_data["source_info"]["label"],
        "source.source_gid": raw_data["source_info"]["source_gid"],
    }

    # Assertions for key fields
    for key, expected_value in expected_ch_data.items():
        assert key in serialized_data, f"Key {key} missing in serialized output"
        if isinstance(expected_value, float) and isinstance(serialized_data[key], float):
            assert abs(serialized_data[key] - expected_value) < 1e-9, f"Float mismatch for {key}: {serialized_data[key]} vs {expected_value}"
        else:
            assert serialized_data[key] == expected_value, f"Value mismatch for {key}: {serialized_data[key]} vs {expected_value}"

    # Check that all products fields are present (even if some items are None)
    # This is tricky because model_dump(exclude_none=True) will remove them if all list items are None for that key
    # For now, we are checking specific fields above where we know values exist or should be None.
    # A more robust check would involve comparing field by field for products, handling None padding.

    print("Serialization test passed for key fields.")


def test_semantic_event_deserialization():
    print("\n--- Testing SemanticEvent Deserialization ---")
    event_time = datetime.now(timezone.utc)
    test_event_gid = uuid.uuid4()
    test_entity_gid = uuid.uuid4()
    test_user_gid = uuid.uuid4()
    test_product1_gid = uuid.uuid4()
    test_product2_gid = uuid.uuid4()
    test_linked_entity_gid = uuid.uuid4()
    test_source_gid = uuid.uuid4()
    root_gid_for_deser = uuid.uuid4()


    # ClickHouse-like flattened data (some fields might be missing if they were None)
    # This structure is what SemanticEvent.pre_init expects
    clickhouse_data = {
        "entity_gid": str(test_entity_gid), # GIDs often come as strings
        "timestamp": event_time.isoformat(),
        "type": "track",
        "event": "Test Event Occurred From CH",
        "event_gid": str(test_event_gid),
        "partition": "ch_partition",
        "anonymous_id": "ch-anon-456",
        "user_gid": str(test_user_gid),
        "importance": 5,
        "root_event_gid": str(root_gid_for_deser),

        # Device context fields
        "device.id": "ch-device-002",
        "device.brand": "CHBrand",
        "device.variant": "Ultra",
        "device.advertising_id": "ch-ad-id",
        "device.manufacturer": "CHManu",
        "device.model": "CHModelY",
        "device.name": "MyCHTestDevice",
        "device.type": "tablet",
        "device.version": "2.0",


        # Context context fields
        "context.ip": "10.0.0.1",
        "context.locale": "fr-FR",
        "context.location": [-70.0, 40.0], # CH Point might come as [lon, lat] list
        "context.extras": "extra CH context",

        # EntityLinking nested list fields
        "entity_linking.content_key": ["ch_body"],
        "entity_linking.label": ["CH Linked Inc."],
        "entity_linking.starts_at": [5],
        "entity_linking.ends_at": [20],
        "entity_linking.entity_type": ["Organization"],
        "entity_linking.entity_gid": [str(test_linked_entity_gid)],
        "entity_linking.certainty": [0.92],

        # Commerce context fields
        "commerce.order_id": "ch-order-123",
        "commerce.revenue": 250.75,
        "commerce.currency": "EUR",
        # Commerce products nested list fields
        "commerce.products.product_id": ["ch-p1", "ch-p2"],
        "commerce.products.entity_gid": [str(test_product1_gid), str(test_product2_gid)],
        "commerce.products.product": ["CH Product Alpha", "CH Product Beta"],
        "commerce.products.sku": ["CH-A", "CH-B"],
        "commerce.products.income_category": ["CH Sales", None], # Example with one None
        "commerce.products.unit_price": [None, 125.375], # Example with one None

        # SourceInfo fields (note: SemanticEvent uses alias 'source' for source_info object)
        "source.type": "CHSource",
        "source.label": "CHLabel",
        "source.source_gid": str(test_source_gid),
        # "_type": "clickhouse" # This is sometimes used to trigger from_clickhouse logic, but pre_init handles it
    }

    # Add empty arrays for other product fields to simulate CH behavior
    # where all arrays in a Nested structure have the same length
    num_ch_products = len(clickhouse_data["commerce.products.product_id"])
    for field_key in Product.__fields__.keys():
        ch_product_key = f"commerce.products.{field_key}"
        if ch_product_key not in clickhouse_data:
            clickhouse_data[ch_product_key] = [None] * num_ch_products


    pydantic_event = SemanticEvent(**clickhouse_data)

    # Assertions
    assert pydantic_event.entity_gid == test_entity_gid
    assert pydantic_event.timestamp == datetime.fromisoformat(clickhouse_data["timestamp"])
    assert pydantic_event.type == EventType.track
    assert pydantic_event.anonymous_id == "ch-anon-456"
    assert pydantic_event.user_gid == test_user_gid
    assert pydantic_event.importance == 5
    assert pydantic_event.root_event_gid == root_gid_for_deser


    assert pydantic_event.device is not None
    assert pydantic_event.device.id == "ch-device-002"
    assert pydantic_event.device.brand == "CHBrand"
    assert pydantic_event.device.variant == "Ultra"

    assert pydantic_event.context is not None
    assert pydantic_event.context.ip == "10.0.0.1"
    assert pydantic_event.context.location == (-70.0, 40.0) # Tuple
    assert pydantic_event.context.extras == "extra CH context"

    assert pydantic_event.entity_linking is not None
    assert len(pydantic_event.entity_linking) == 1
    assert pydantic_event.entity_linking[0].label == "CH Linked Inc."
    assert pydantic_event.entity_linking[0].entity_gid == test_linked_entity_gid
    assert pydantic_event.entity_linking[0].certainty == 0.92

    assert pydantic_event.commerce is not None
    assert pydantic_event.commerce.order_id == "ch-order-123"
    assert abs(pydantic_event.commerce.revenue - 250.75) < 1e-9
    assert pydantic_event.commerce.products is not None
    assert len(pydantic_event.commerce.products) == 2
    assert pydantic_event.commerce.products[0].product_id == "ch-p1"
    assert pydantic_event.commerce.products[0].income_category == "CH Sales"
    assert pydantic_event.commerce.products[1].product_id == "ch-p2"
    assert abs(pydantic_event.commerce.products[1].unit_price - 125.375) < 1e-9

    assert pydantic_event.source_info is not None
    assert pydantic_event.source_info.type == "CHSource"
    assert pydantic_event.source_info.source_gid == test_source_gid

    print("Deserialization test passed for key fields.")


if __name__ == "__main__":
    test_semantic_event_serialization()
    test_semantic_event_deserialization()

    print("\nAll SemanticEvent alignment tests completed.")
    # For actual testing, one would use pytest or unittest framework
    # and more specific assertions.
    # This script provides a basic runnable check.
