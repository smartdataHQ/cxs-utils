import requests
import platform
from datetime import datetime
from typing import Any # For timestamp type hint
import uuid
import json # For potential stringification if needed for debugging

from pydantic import ValidationError
from python.cxs.core.schema.semantic_event import (
    SemanticEvent,
    EventType,
    Context as CXSContext,
    Library as CXSLibrary,
    OS as CXSOS,
    Traits as CXSTraits,
    Page as CXSPage,
)

class SegmentClient:
    def __init__(self, write_key: str, entity_gid: uuid.UUID, partition: str, endpoint: str = "https://api.segment.io/v1"):
        self.write_key = write_key
        self.endpoint = endpoint
        self.entity_gid = entity_gid
        self.partition = partition
        self.client_version = "0.3.0"
        self.library_info = CXSLibrary(name="python-segment-client", version=self.client_version)

    def _send_event(self, event_type_enum: EventType, root_event_gid: uuid.UUID, event_data: dict):
        # Make a copy to avoid modifying the original dict passed by the caller
        event_data_copy = event_data.copy()

        payload = {
            "entity_gid": self.entity_gid,
            "timestamp": datetime.utcnow(), # Default, can be overridden
            "type": event_type_enum,
            "event": event_data_copy.pop('event_name', ''), # Default event name, specific for track
            "event_gid": root_event_gid, # Explicitly set, pre_init in SemanticEvent might refine/validate
            "messageId": str(event_data_copy.pop('messageId', uuid.uuid4())), # Ensure string
            "partition": self.partition,
            "root_event_gid": root_event_gid,
            "user_id": event_data_copy.pop('userId', None),
            "anonymous_id": event_data_copy.pop('anonymousId', None),
            "integrations": event_data_copy.pop('integrations', {}), # Schema expects Dict[str, bool]
            "library": self.library_info,
            "os": CXSOS(name=platform.system(), version=platform.release()), # Basic OS info
        }

        # Handle timestamp from event_data if provided
        user_timestamp = event_data_copy.pop('timestamp', None)
        if user_timestamp:
            if isinstance(user_timestamp, str):
                try:
                    payload['timestamp'] = datetime.fromisoformat(user_timestamp.replace('Z', '+00:00'))
                except ValueError:
                    raise ValueError(f"Invalid timestamp format: {user_timestamp}. Please use ISO 8601 format.")
            elif isinstance(user_timestamp, datetime):
                payload['timestamp'] = user_timestamp
            else:
                raise ValueError("Timestamp must be a datetime object or an ISO 8601 string.")

        # Context (CXSContext is for ip, locale etc.)
        cxs_context_data = event_data_copy.pop('context', {}) # User provided context
        payload['context'] = CXSContext(
            ip=cxs_context_data.pop('ip', '0.0.0.0'), # Default IP
            locale=cxs_context_data.pop('locale', None),
            timezone=cxs_context_data.pop('timezone', None),
            extras=cxs_context_data # Remaining user context goes into extras
        )

        # Event-specific fields
        if event_type_enum == EventType.identify:
            user_traits = event_data_copy.pop('traits', {})
            payload['traits'] = CXSTraits(**user_traits) # CXSTraits validates structure
            if not payload['event']: # Set default event name for identify if not already set
                 payload['event'] = "Identify"

        elif event_type_enum == EventType.track:
            if not payload['event']: # Should have been set by track() from event_name
                raise ValueError("Event name (payload.event) must be provided for track events.")

            raw_properties = event_data_copy.pop('properties', {})
            processed_properties = {}
            for k, v in raw_properties.items():
                processed_properties[k] = str(v) # Enforce Dict[str, str]
            payload['properties'] = processed_properties

        elif event_type_enum == EventType.page:
            if not payload['event']: # Set default event name for page if not already set
                 payload['event'] = "Page Viewed"

            page_specific_properties = event_data_copy.pop('properties', {}) # Properties of the page event

            payload['page'] = CXSPage(
                name=event_data_copy.pop('name', None), # Page name from page() method args
                url=page_specific_properties.pop('url', None),
                path=page_specific_properties.pop('path', None),
                referrer=page_specific_properties.pop('referrer', None),
                title=page_specific_properties.pop('title', None),
                search=page_specific_properties.pop('search', None)
            )
            # Remaining page_specific_properties go into SemanticEvent.properties (as str:str)
            processed_page_props = {}
            for k,v in page_specific_properties.items():
                processed_page_props[k] = str(v)
            payload['properties'] = processed_page_props


        # Any remaining items in event_data_copy are currently ignored.
        # Consider logging them or adding to a general extras field if SemanticEvent supports it.

        try:
            semantic_event_obj = SemanticEvent(**payload)
        except ValidationError as e:
            # For debugging:
            # print(f"Pydantic Validation Error creating SemanticEvent: {e.errors()}")
            # print(f"Payload given to SemanticEvent: {json.dumps(payload, indent=2, default=str)}")
            raise e

        # Use model_dump. Assuming SemanticEvent's aliases and structure match Segment's expectations
        # or that the endpoint is compatible with the CXS schema's output.
        # Segment expects `messageId`, `userId`, `anonymousId`.
        # If SemanticEvent uses `message_id` as the field name (with alias `messageId`),
        # model_dump(by_alias=False) would give `{"message_id": ...}`.
        # model_dump(by_alias=True) would give `{"messageId": ...}` if alias is `messageId`.
        # Current SemanticEvent: `messageId: Optional[str] = Field(default="", alias="message_id",...)`
        # This means by_alias=True -> "message_id". by_alias=False -> "messageId".
        # Segment API typically expects camelCase (e.g. messageId). So, by_alias=False might be better.
        # However, the prompt mentioned assuming "message_id" (alias) is fine. Let's stick to by_alias=True for now.
        final_payload_for_request = semantic_event_obj.model_dump(by_alias=True, exclude_none=True)

        try:
            response = requests.post(
                self.endpoint,
                json=final_payload_for_request,
                auth=(self.write_key, ''),
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            return response
        except requests.exceptions.HTTPError as http_err:
            # Log more details from response if possible
            error_details = http_err.response.text if http_err.response else "No response body"
            print(f"HTTP error occurred: {http_err} - Details: {error_details}")
            return None # Or re-raise as a custom client exception
        except requests.exceptions.RequestException as req_err: # Broader network errors
            print(f"Request exception occurred: {req_err}")
            return None
        except Exception as err: # Other unexpected errors
            print(f"An unexpected error occurred during sending: {err}")
            return None


    def _process_integrations(self, integrations: dict = None) -> dict:
        if integrations is None:
            return {}
        processed_integrations = {}
        for k, v in integrations.items():
            if not isinstance(v, bool):
                raise ValueError(f"Integration value for '{k}' must be boolean. Got: {v}")
            processed_integrations[k] = v
        return processed_integrations

    def identify(self, root_event_gid: uuid.UUID, user_id: str = None, anonymous_id: str = None, traits: dict = None, context: dict = None, timestamp: Any = None, integrations: dict = None):
        if not user_id and not anonymous_id:
            raise ValueError("Either user_id or anonymous_id must be provided for identify.")

        event_data = {
            'userId': user_id,
            'anonymousId': anonymous_id,
            'traits': traits or {},
            'context': context or {}, # User-provided parts of CXSContext (e.g. ip, locale) or extras
            'timestamp': timestamp,
            'integrations': self._process_integrations(integrations)
        }
        return self._send_event(EventType.identify, root_event_gid, event_data)

    def track(self, root_event_gid: uuid.UUID, event_name: str, user_id: str = None, anonymous_id: str = None, properties: dict = None, context: dict = None, timestamp: Any = None, integrations: dict = None):
        if not user_id and not anonymous_id:
            raise ValueError("Either user_id or anonymous_id must be provided for track.")
        if not event_name:
            raise ValueError("event_name must be provided for track events.")

        event_data = {
            'userId': user_id,
            'anonymousId': anonymous_id,
            'event_name': event_name, # This becomes SemanticEvent.event
            'properties': properties or {}, # Becomes SemanticEvent.properties (Dict[str,str])
            'context': context or {},
            'timestamp': timestamp,
            'integrations': self._process_integrations(integrations)
        }
        return self._send_event(EventType.track, root_event_gid, event_data)

    def page(self, root_event_gid: uuid.UUID, name: str = None, user_id: str = None, anonymous_id: str = None, properties: dict = None, context: dict = None, timestamp: Any = None, integrations: dict = None):
        if not user_id and not anonymous_id:
            raise ValueError("Either user_id or anonymous_id must be provided for page.")

        event_data = {
            'userId': user_id,
            'anonymousId': anonymous_id,
            'name': name, # For SemanticEvent.page.name
            'properties': properties or {}, # For SemanticEvent.page fields and remaining for SemanticEvent.properties
            'context': context or {},
            'timestamp': timestamp,
            'integrations': self._process_integrations(integrations)
        }
        return self._send_event(EventType.page, root_event_gid, event_data)
