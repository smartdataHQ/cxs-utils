import unittest
from unittest.mock import patch, MagicMock
import uuid
from datetime import datetime, timezone # Added timezone
import platform

from pydantic import ValidationError
from segment_client import SegmentClient
from python.cxs.core.schema.semantic_event import (
    EventType,
    # Context as CXSContext, # Not directly asserted by type, but its structure is
    # Library as CXSLibrary,
    # OS as CXSOS,
    # Traits as CXSTraits,
    # Page as CXSPage,
)


class TestSegmentClient(unittest.TestCase):

    def setUp(self):
        self.default_entity_gid = uuid.uuid4()
        self.default_partition = "test_partition"
        self.default_root_event_gid = uuid.uuid4()

        self.client = SegmentClient(
            write_key="test_write_key",
            entity_gid=self.default_entity_gid,
            partition=self.default_partition
        )

        self.fixed_timestamp = datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        self.fixed_uuid = uuid.UUID('12345678-1234-5678-1234-567812345678')

        # Mock datetime and uuid used directly by the client before SemanticEvent construction
        self.mock_client_datetime_patch = patch('segment_client.datetime', wraps=datetime)
        self.mock_client_uuid_patch = patch('segment_client.uuid', wraps=uuid)

        self.mock_client_datetime = self.mock_client_datetime_patch.start()
        self.mock_client_uuid = self.mock_client_uuid_patch.start()

        self.mock_client_datetime.utcnow.return_value = self.fixed_timestamp
        self.mock_client_uuid.uuid4.return_value = self.fixed_uuid

        # Mock datetime and uuid used by SemanticEvent schema (e.g., for default_factory if client passes None)
        # SemanticEvent might use datetime.now() or uuid.uuid5() in pre_init or defaults.
        # For this example, we assume client provides most critical fields like timestamp, messageId, event_gid.
        # If SemanticEvent truly has complex internal defaults using these, more specific patching on
        # 'python.cxs.core.schema.semantic_event.datetime' or '.uuid' might be needed.
        # For now, client-level mocks are primary.


    def tearDown(self):
        self.mock_client_datetime_patch.stop()
        self.mock_client_uuid_patch.stop()
        patch.stopall() # Stops any other patches that might have been started manually

    @patch('segment_client.requests.post')
    def test_identify_event(self, mock_post):
        mock_post.return_value.status_code = 200
        test_traits = {"email": "test@example.com", "plan": "basic", "age": 30}

        self.client.identify(
            root_event_gid=self.default_root_event_gid,
            user_id="user123",
            traits=test_traits
        )
        mock_post.assert_called_once()
        _, kwargs = mock_post.call_args
        sent_payload = kwargs['json']

        self.assertEqual(sent_payload['type'], EventType.identify.value)
        self.assertEqual(sent_payload['user_id'], "user123")
        self.assertEqual(sent_payload['entity_gid'], str(self.default_entity_gid))
        self.assertEqual(sent_payload['partition'], self.default_partition)
        self.assertEqual(sent_payload['root_event_gid'], str(self.default_root_event_gid))
        self.assertEqual(sent_payload['event_gid'], str(self.default_root_event_gid))
        self.assertEqual(sent_payload['event'], "Identify") # Default name

        self.assertEqual(sent_payload['library']['name'], 'python-segment-client')
        self.assertEqual(sent_payload['library']['version'], '0.3.0')
        self.assertIsNotNone(sent_payload['os']['name']) # Default from platform.system()
        self.assertIsNotNone(sent_payload['os']['version']) # Default from platform.release()
        self.assertEqual(sent_payload['context']['ip'], '0.0.0.0')

        retrieved_traits = sent_payload['traits'] # CXSTraits model fields are typed
        self.assertEqual(retrieved_traits['email'], test_traits['email'])
        self.assertEqual(retrieved_traits['plan'], test_traits['plan'])
        self.assertEqual(retrieved_traits['age'], test_traits['age']) # Pydantic handles int

        self.assertEqual(sent_payload['timestamp'], self.fixed_timestamp.isoformat())
        self.assertEqual(sent_payload['message_id'], str(self.fixed_uuid)) # Alias for messageId

    @patch('segment_client.platform') # Mock platform used by client for CXSOS
    @patch('segment_client.requests.post')
    def test_track_event(self, mock_post, mock_client_platform):
        mock_client_platform.system.return_value = "TestOS"
        mock_client_platform.release.return_value = "1.0"
        mock_post.return_value.status_code = 200

        test_properties = {"prop_str": "value1", "prop_int": 123, "prop_bool": True}
        expected_properties_in_payload = {"prop_str": "value1", "prop_int": "123", "prop_bool": "True"}
        test_integrations = {"Salesforce": True, "HubSpot": False}

        self.client.track(
            root_event_gid=self.default_root_event_gid,
            user_id="user456",
            anonymous_id="anon123",
            event_name="Test Event",
            properties=test_properties,
            integrations=test_integrations
        )
        mock_post.assert_called_once()
        _, kwargs = mock_post.call_args
        sent_payload = kwargs['json']

        self.assertEqual(sent_payload['type'], EventType.track.value)
        self.assertEqual(sent_payload['user_id'], "user456")
        self.assertEqual(sent_payload['anonymous_id'], "anon123")
        self.assertEqual(sent_payload['event'], "Test Event")
        self.assertEqual(sent_payload['entity_gid'], str(self.default_entity_gid))
        self.assertEqual(sent_payload['root_event_gid'], str(self.default_root_event_gid))
        self.assertEqual(sent_payload['event_gid'], str(self.default_root_event_gid))

        self.assertEqual(sent_payload['os']['name'], "TestOS")
        self.assertEqual(sent_payload['os']['version'], "1.0")
        self.assertEqual(sent_payload['properties'], expected_properties_in_payload)
        self.assertEqual(sent_payload['integrations'], test_integrations)
        self.assertEqual(sent_payload['timestamp'], self.fixed_timestamp.isoformat())
        self.assertEqual(sent_payload['message_id'], str(self.fixed_uuid))


    @patch('segment_client.platform')
    @patch('segment_client.requests.post')
    def test_page_event(self, mock_post, mock_client_platform):
        mock_client_platform.system.return_value = "TestOSPage"
        mock_client_platform.release.return_value = "2.0"
        mock_post.return_value.status_code = 200

        page_name = "Sample Page"
        page_props = {"url": "http://example.com", "path": "/test", "load_time_ms": 150}
        expected_page_obj_props = {"url": "http://example.com", "path": "/test", "referrer": None, "search": None, "title": None} # Matched by CXSPage
        expected_semantic_event_props = {"load_time_ms": "150"} # Remaining, stringified

        self.client.page(
            root_event_gid=self.default_root_event_gid,
            user_id="user789",
            name=page_name,
            properties=page_props
        )
        mock_post.assert_called_once()
        _, kwargs = mock_post.call_args
        sent_payload = kwargs['json']

        self.assertEqual(sent_payload['type'], EventType.page.value)
        self.assertEqual(sent_payload['user_id'], "user789")
        self.assertEqual(sent_payload['event'], "Page Viewed") # Default name
        self.assertEqual(sent_payload['entity_gid'], str(self.default_entity_gid))

        page_payload = sent_payload['page']
        self.assertEqual(page_payload['name'], page_name)
        for k,v in expected_page_obj_props.items():
            self.assertEqual(page_payload.get(k),v)

        self.assertEqual(sent_payload['properties'], expected_semantic_event_props)
        self.assertEqual(sent_payload['os']['name'], "TestOSPage")
        self.assertEqual(sent_payload['timestamp'], self.fixed_timestamp.isoformat())
        self.assertEqual(sent_payload['message_id'], str(self.fixed_uuid))


    # --- Validation Error Tests (client-side primarily) ---
    @patch('segment_client.requests.post')
    def test_track_missing_event_name_raises_value_error(self, mock_post):
        with self.assertRaisesRegex(ValueError, "event_name must be provided"):
            self.client.track(root_event_gid=self.default_root_event_gid, user_id="test_user")
        mock_post.assert_not_called()

    @patch('segment_client.requests.post')
    def test_identify_missing_ids_raises_value_error(self, mock_post):
        with self.assertRaisesRegex(ValueError, "Either user_id or anonymous_id must be provided"):
            self.client.identify(root_event_gid=self.default_root_event_gid, traits={"email": "test@example.com"})
        mock_post.assert_not_called()

    @patch('segment_client.requests.post')
    def test_invalid_timestamp_string_raises_value_error(self, mock_post):
        with self.assertRaisesRegex(ValueError, "Invalid timestamp string"):
            self.client.track(root_event_gid=self.default_root_event_gid, user_id="test_user", event_name="BadDate", timestamp="invalid-date-string")
        mock_post.assert_not_called()

    @patch('segment_client.requests.post')
    def test_track_integrations_non_bool_value_raises_value_error(self, mock_post):
        with self.assertRaisesRegex(ValueError, "Integration value for 'TestInt' must be boolean"):
            self.client.track(
                root_event_gid=self.default_root_event_gid,
                user_id="user_int_fail",
                event_name="Event Integrations",
                integrations={"TestInt": "not-a-bool"}
            )
        mock_post.assert_not_called()

    @patch('segment_client.requests.post')
    def test_track_missing_root_event_gid_raises_type_error(self, mock_post):
        with self.assertRaises(TypeError): # Missing positional argument
            self.client.track(event_name="Test Event", user_id="user1")
        mock_post.assert_not_called()

    # --- Pydantic ValidationError (example for context) ---
    @patch('segment_client.requests.post')
    def test_invalid_context_extra_type_raises_validation_error(self, mock_post):
        # Example: If CXSContext.extras had stricter typing that client doesn't pre-validate
        # This specific test might pass if extras=Dict[str,Any], but shows the pattern
        # For a real error, imagine CXSContext.locale must be specific format client doesn't check
        with self.assertRaises(ValidationError):
             self.client.track(
                root_event_gid=self.default_root_event_gid,
                user_id="test_user",
                event_name="BadContextExtras",
                # This context structure is valid for CXSContext extras: Dict[str, Any]
                # To make this fail, CXSContext.extras would need a specific model type
                # For now, let's test a field that *is* typed in CXSContext, e.g. ip.
                context={"ip": {"this should be a string not dict": True}}
            )
        mock_post.assert_not_called()


if __name__ == '__main__':
    unittest.main()
