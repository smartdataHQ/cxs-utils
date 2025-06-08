import uuid
from pydantic import ValidationError
from segment_client import SegmentClient

# Initialize the client
# IMPORTANT: Replace "YOUR_WRITE_KEY_HERE", entity_gid, and partition with your actual values.
# The endpoint defaults to 'https://api.segment.io/v1'.
# For testing, you might use a local mock server or a service like RequestBin.
# For unit testing, the `requests` library itself would typically be mocked.

try:
    entity_g = uuid.uuid4()  # Example entity_gid
    part = "your_test_partition"  # Example partition
    client = SegmentClient(
        write_key="YOUR_WRITE_KEY_HERE",
        entity_gid=entity_g,
        partition=part
        # Example with a custom endpoint:
        # endpoint="http://localhost:8080/v1/batch"
    )
    print(f"Client initialized with entity_gid: {entity_g}, partition: {part}")

    example_root_gid = uuid.uuid4()
    print(f"Using example_root_gid for events: {example_root_gid}")

    # 1. Demonstrate the identify method
    print("\nSending identify event...")
    try:
        response_identify = client.identify(
            root_event_gid=example_root_gid,
            user_id="user123",
            traits={
                "email": "user123@example.com",
                "name": "John Doe",
                "plan": "premium",
                "age": 30, # Will be validated by CXSTraits
                "address": { # This will go into CXSTraits.extras if not a defined field
                    "street": "123 Main St",
                    "city": "San Francisco"
                }
            }
        )
        if response_identify:
            print(f"Identify event response: {response_identify.status_code}")
        else:
            print("Identify event potentially failed to send (see error above if any, or check server logs).")
    except Exception as e:
        print(f"Error sending identify event: {e}")
    print("Identify event processing finished.")


    # 2. Demonstrate the track method
    # Properties values will be stringified by the client if not already strings.
    print("\nSending track event...")
    try:
        response_track = client.track(
            root_event_gid=example_root_gid,
            user_id="user123",
            event_name="Item Purchased",
            properties={
                "item_id": "item789",
                "item_name": "My Awesome Product",
                "price": 19.99, # Will be stringified to "19.99"
                "quantity": 2,    # Will be stringified to "2"
                "is_member": True # Will be stringified to "True"
            }
        )
        if response_track:
            print(f"Track event response: {response_track.status_code}")
        else:
            print("Track event potentially failed to send.")
    except Exception as e:
        print(f"Error sending track event: {e}")
    print("Track event processing finished.")

    # 3. Demonstrate track event with anonymousId and integrations
    # Integrations must be Dict[str, bool]
    print("\nSending track event with anonymousId and integrations...")
    try:
        response_track_anon = client.track(
            root_event_gid=example_root_gid,
            anonymous_id="anon-abc-123",
            event_name="Content Viewed",
            properties={
                "content_id": "content-456",
                "type": "video"
            },
            integrations={
                "Amplitude": True,
                "Mixpanel": False
            }
        )
        if response_track_anon:
            print(f"Track event (anon) response: {response_track_anon.status_code}")
        else:
            print("Track event (anon) potentially failed to send.")
    except Exception as e:
        print(f"Error sending track event (anon): {e}")
    print("Track event (anon) processing finished.")


    # 4. Demonstrate the page method
    # Page properties like 'url', 'path' are extracted for SemanticEvent.page object.
    # Other properties are stringified and go into SemanticEvent.properties.
    print("\nSending page event...")
    try:
        response_page = client.page(
            root_event_gid=example_root_gid,
            user_id="user123",
            name="Homepage", # Goes into SemanticEvent.page.name
            properties={
                "url": "http://example.com", # Goes into SemanticEvent.page.url
                "path": "/",                 # Goes into SemanticEvent.page.path
                "referrer": "http://google.com", # SemanticEvent.page.referrer
                "load_time": 0.75            # Becomes "0.75" in SemanticEvent.properties
            }
        )
        if response_page:
            print(f"Page event response: {response_page.status_code}")
        else:
            print("Page event potentially failed to send.")
    except Exception as e:
        print(f"Error sending page event: {e}")
    print("Page event processing finished.")

    print("\nNote: These calls attempt to send HTTP requests.")
    print("Ensure you have a valid write_key, entity_gid, partition and that the endpoint is reachable.")
    print("If you used placeholders, these calls will likely fail.")
    print("For local testing without sending actual data, mock `requests.post` or use a local test server.")


    print("\n--- Demonstrating Validation Errors ---")

    # Example 1: Track event missing event_name
    print("\nAttempting track event missing event_name (should fail client-side)...")
    try:
        client.track(root_event_gid=example_root_gid, user_id="user_vt_1", properties={"prop": "value"})
    except ValueError as e:
        print(f"ValueError Caught (as expected): {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

    # Example 2: Identify event with no userId or anonymousId
    print("\nAttempting identify event missing userId and anonymousId (should fail client-side)...")
    try:
        client.identify(root_event_gid=example_root_gid, traits={"email": "invalid@example.com"})
    except ValueError as e:
        print(f"ValueError Caught (as expected): {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

    # Example 3: Track event with invalid timestamp format
    print("\nAttempting track event with invalid timestamp format (should fail client-side)...")
    try:
        client.track(
            root_event_gid=example_root_gid,
            user_id="user_vt_2",
            event_name="Event With Bad Timestamp",
            timestamp="not-a-valid-date-or-datetime-object"
        )
    except ValueError as e:
        print(f"ValueError Caught (for timestamp, as expected): {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

    # Example 4: Track event with invalid context (e.g. IP address not a string)
    print("\nAttempting track event with invalid context (ip not a string, should fail Pydantic validation)...")
    try:
        client.track(
            root_event_gid=example_root_gid,
            user_id="user_vt_3",
            event_name="Event With Bad Context IP",
            context={"ip": 12345} # IP should be a string for CXSContext
        )
    except ValidationError as e:
        print(f"ValidationError Caught (for context.ip, as expected):")
        print(e)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

    # Example 5: Track event with non-boolean value in integrations
    print("\nAttempting track event with non-boolean integrations value (should fail client-side)...")
    try:
        client.track(
            root_event_gid=example_root_gid,
            user_id="user_vt_4",
            event_name="Event With Bad Integrations",
            integrations={"Amplitude": "not-a-boolean"}
        )
    except ValueError as e: # Client's _process_integrations raises ValueError
        print(f"ValueError Caught (for integrations, as expected): {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

except NameError:
    print("SegmentClient or other necessary import not found. Ensure segment_client.py and CXS schemas are accessible.")
except Exception as general_e:
    print(f"A general error occurred during example script execution: {general_e}")
