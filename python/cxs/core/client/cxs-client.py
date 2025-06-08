import os
import requests
import platform
from datetime import datetime
from typing import Any # For timestamp type hint
import uuid
import json # For potential stringification if needed for debugging

from pydantic import ValidationError

from cxs.core.schema.semantic_event import (
    SemanticEvent,
    EventType,
    Context as CXSContext,
    Library as CXSLibrary,
    BaseEventInfo,
    App as CXSApp,
    OS as CXSOS,
    Traits as CXSTraits,
)

class SegmentClient:

    def __init__(self, write_key: str, endpoint: str = "https://inbox.contextsuite.com/v1", application: str = None, **kwargs: Any):
        self.write_key = write_key
        self.endpoint = endpoint
        self.client_version = "0.1.0"

        self.pod_ip = os.getenv('MY_POD_IP', kwargs.get('pod_ip', ''))
        self.pod_name = os.getenv('MY_POD_NAME', kwargs.get('pod_name', ''))
        self.node_name = os.getenv('MY_NODE_NAME', kwargs.get('node_name', ''))
        self.pod_namespace = os.getenv('MY_POD_NAMESPACE', kwargs.get('pod_namespace', ''))
        self.pod_hostname = os.getenv('MY_POD_HOSTNAME', kwargs.get('pod_hostname', ''))

        self.app_name = application or "undefined"
        self.app_namespace = os.getenv('MY_APP_NAMESPACE', kwargs.get('app_namespace', ''))
        self.app_name = os.getenv('MY_APP_NAME', kwargs.get('app_name', ''))
        self.app_version = os.getenv('MY_APP_VERSION', kwargs.get('app_version', ''))
        self.app_build = os.getenv('MY_APP_BUILD', kwargs.get('app_build', ''))

        self.library_info = CXSLibrary(
            name="python-cxs-client",
            version=self.client_version
        )

    def _send_event(self, event_type_enum: EventType, event_data: dict, root_event: SemanticEvent = None, **kwargs) -> SemanticEvent | None:

        try:
            semantic_event = SemanticEvent(**{**event_data, **kwargs}) # Allow kwargs to override event_data
            semantic_event.type = event_type_enum.value
            semantic_event.library = self.library_info
            semantic_event.timestamp = datetime.now() # this is automatically set, always.
            semantic_event.write_key = self.write_key

            if not semantic_event.messageId:
                semantic_event.messageId = str(uuid.uuid4())

            if root_event:
                semantic_event.base_events = [
                    BaseEventInfo(
                        event_gid=root_event.event_gid,
                        type=root_event.type,
                        event=root_event.event,
                        timestamp=root_event.timestamp,
                        message_id=root_event.messageId,
                        entity_gid=root_event.entity_gid,
                    )
                ] # Link to the root event if one is provided

            semantic_event.os = CXSOS(
                name=platform.system(),
                version=platform.release()
            ) # Basic OS info

            # Only get the CXSContext values from typical kubernetes environment variables, not from parameters or kwargs
            semantic_event.context = CXSContext(
                hostname=self.pod_hostname,
                pod_ip=self.pod_ip,
                pod_name=self.pod_name,
                pod_namespace=self.pod_namespace,
                application=self.app_name,
                library=self.library_info
            )
            semantic_event.app = CXSApp(
                name=self.app_name,
                namespace=self.app_namespace,
                version=self.app_version,
                build=self.app_build
            )

            if event_type_enum == EventType.identify:
                user_traits = event_data.pop('traits', {})
                semantic_event.traits = CXSTraits(**user_traits) if isinstance(user_traits, dict) else user_traits
                semantic_event.event = "User Identified"

            if event_type_enum == EventType.page:
                semantic_event.event = "Page Viewed"
                # warning this is a server-side client, page is not a server-side event, so this should hardly be used.

            if event_type_enum == EventType.screen:
                semantic_event.event = "Screen Viewed"
                # warning this is a server-side client, screen is not a server-side event, so this should hardly be used.

        except ValidationError as e:
            raise e
        except Exception as e:
            print(f"Error creating SemanticEvent: {e}")
            return None

        try:
            response = requests.post(
                self.endpoint,
                json=semantic_event.model_dump(by_alias=True, exclude_none=True),
                auth=(self.write_key, self.write_key),
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            return semantic_event
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
