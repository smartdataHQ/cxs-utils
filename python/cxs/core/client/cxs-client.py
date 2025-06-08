import os
import requests
import platform
import asyncio
import aiohttp
import logging
import json # Main import for JSON operations
import sys # For stderr fallback
from datetime import datetime
from typing import Any # For timestamp type hint
import uuid
# Removed duplicate json import from original list

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

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
        }
        if hasattr(record, 'event_data') and record.event_data:
            log_record['event_data'] = record.event_data
        if hasattr(record, 'reason') and record.reason:
            log_record['reason'] = record.reason
        return json.dumps(log_record)

class CXSClient:

    def __init__(self, write_key: str, endpoint: str = "https://inbox.contextsuite.com/v1", application: str = None,
                 max_batch_size: int = 100, send_interval: float = 10.0,
                 log_file_path: str = "cxs_unsent_events.log", **kwargs: Any):

        # General logger for operational messages
        # Use a more unique suffix based on object ID if multiple clients can exist, or fixed if singleton.
        # For this example, using a short UUID suffix.
        logger_name_suffix = uuid.uuid4().hex[:6]
        self.logger = logging.getLogger(f"CXSClient_{logger_name_suffix}")
        self.logger.setLevel(kwargs.get('log_level', logging.INFO)) # Allow configuring log level

        # Basic console handler for self.logger if no other config is set by user (e.g. root logger)
        if not self.logger.handlers and not logging.getLogger().handlers: # Check root handlers too
            ch = logging.StreamHandler(sys.stdout) # Use stdout for info, stderr for errors generally
            ch.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
            self.logger.addHandler(ch)
            # Prevent propagation if we add a handler, to avoid duplicate messages if root logger also has handlers
            self.logger.propagate = False

        try:
            self.write_key = write_key
            self.endpoint = endpoint
            self.client_version = "0.1.0"
            self.max_batch_size = max_batch_size
            self.send_interval = send_interval

            self.event_queue = asyncio.Queue() # Unbounded queue
            self._shutdown_event = asyncio.Event()

            # Setup logger for unsent events
            self.unsent_events_logger = logging.getLogger(f"CXSClientUnsentEvents_{logger_name_suffix}")
            self.unsent_events_logger.setLevel(logging.WARNING)

            if log_file_path: # Only configure file handler if path is provided
                # Check if a handler for this specific file path already exists
                handler_exists = any(
                    isinstance(h, logging.FileHandler) and
                    hasattr(h, 'baseFilename') and
                    os.path.abspath(h.baseFilename) == os.path.abspath(log_file_path)
                    for h in self.unsent_events_logger.handlers
                )
                if not handler_exists:
                    try:
                        fh = logging.FileHandler(log_file_path, mode='a') # Append mode
                        fh.setFormatter(JsonFormatter())
                        self.unsent_events_logger.addHandler(fh)
                    except (IOError, OSError) as e:
                        self.logger.error(f"Failed to initialize file handler for unsent events log at {log_file_path}: {e}", exc_info=True)
                        # Fallback to console for unsent_events_logger if file handler fails and no other handler exists
                        if not self.unsent_events_logger.handlers:
                            sh = logging.StreamHandler(sys.stderr)
                            sh.setFormatter(JsonFormatter()) # Use JsonFormatter for stderr fallback too for consistency
                            self.unsent_events_logger.addHandler(sh)
                            self.logger.warning(f"Logging unsent events to stderr as file logger setup failed for {log_file_path}.")

            self.unsent_events_logger.propagate = False # Isolate this logger

            self.queue_processor_task = asyncio.create_task(self._process_event_queue())
            self.logger.info(f"CXSClient initialized. Max batch: {self.max_batch_size}, Interval: {self.send_interval}s. Unsent events log: '{log_file_path if log_file_path else 'Disabled/Default'}'.")

            self.pod_ip = os.getenv('MY_POD_IP', kwargs.get('pod_ip', ''))
            self.pod_name = os.getenv('MY_POD_NAME', kwargs.get('pod_name', ''))
        except Exception as e:
            self.logger.error(f"CXSClient critical initialization failed: {e}", exc_info=True)
            # Depending on desired behavior, either raise to prevent client usage or handle more gracefully.
            # For now, re-raising as a failed init is usually critical.
            raise
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

    def _log_unsent_event(self, level: int, message: str, event_data_dict: dict | None, reason: str):
        """
        Wrapper to safely log an event to the unsent_events_logger.
        Falls back to stderr if the primary unsent event logger fails.
        """
        try:
            # Ensure event_data_dict is serializable or handle appropriately
            if not isinstance(event_data_dict, dict) and event_data_dict is not None:
                 event_data_serializable = {'raw_event_data': str(event_data_dict)}
            else:
                 event_data_serializable = event_data_dict

            self.unsent_events_logger.log(level, message, extra={'event_data': event_data_serializable, 'reason': reason})
        except Exception as log_err:
            # Fallback to print if logging to unsent_events_logger fails catastrophically
            try:
                err_msg = (
                    f"CRITICAL LOGGING FAILURE: Could not log to unsent_events_logger. Error: {log_err}.\n"
                    f"Original Log Message: {message}\n"
                    f"Reason: {reason}\n"
                    f"Event Data: {json.dumps(event_data_serializable) if event_data_serializable else 'N/A'}\n"
                )
                print(err_msg, file=sys.stderr)
            except Exception as fallback_err:
                print(f"ULTIMATE FALLBACK PRINT FAILED: {fallback_err}. Original message was: {message}", file=sys.stderr)


    async def _send_event(self, event_type_enum: EventType, event_data: dict, root_event: SemanticEvent = None, **kwargs) -> SemanticEvent | None:
        semantic_event = None # Ensure semantic_event is defined for the final except block
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
            self.logger.error(f"Event data validation failed for event type {event_type_enum.value if event_type_enum else 'unknown'}: {e}", exc_info=True)
            raise # Propagate error to caller, as it's a usage error
        except Exception as e: # Catch any other error during event creation
            self.logger.error(f"Unexpected error creating SemanticEvent object for type {event_type_enum.value if event_type_enum else 'unknown'}: {e}", exc_info=True)
            # semantic_event is None here, so it won't be queued or sent.
            return None # Cannot proceed with this event

        # Ensure semantic_event is not None before proceeding to send
        if not semantic_event:
            # This case should ideally be caught by the specific exceptions above,
            # but as a safeguard:
            self.logger.error("SemanticEvent object is None before attempting to send, cannot proceed.")
            return None

        try:
            async with aiohttp.ClientSession(auth=aiohttp.BasicAuth(self.write_key, self.write_key)) as session:
                async with session.post(
                    self.endpoint,
                    json=semantic_event.model_dump(by_alias=True, exclude_none=True),
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    response.raise_for_status() # Raises ClientResponseError for 4xx/5xx
                    self.logger.info(f"Event {semantic_event.messageId} sent directly.")
                    return semantic_event
        except aiohttp.ClientResponseError as http_err: # Raised by response.raise_for_status()
            retryable_statuses = {500, 502, 503, 504, 429} # 429 Too Many Requests is often retryable
            if http_err.status in retryable_statuses:
                self.logger.warning(f"Retryable HTTP error {http_err.status} for event {semantic_event.messageId} ('{http_err.message}'). Queuing event.")
                await self.event_queue.put(semantic_event)
                return semantic_event
            else:
                error_details_text = "No response body"
                if http_err.response: # Check if response object exists
                    try:
                        error_details_text = await http_err.response.text()
                    except Exception as texterr:
                        self.logger.debug(f"Could not get text from error response for event {semantic_event.messageId}: {texterr}")

                log_message = f"Non-retryable HTTP error for event {semantic_event.messageId}: {http_err.status} - Message: {http_err.message} - Details: {error_details_text}"
                self.logger.error(log_message)
                self._log_unsent_event(logging.WARNING, log_message, semantic_event.model_dump(exclude_none=True), 'NonRetryableHTTPError')
                return None
        except aiohttp.ClientConnectorError as conn_err: # More specific network error, subclass of ClientError
            self.logger.warning(f"Network connector error for event {semantic_event.messageId} ('{conn_err}'). Queuing event.")
            await self.event_queue.put(semantic_event)
            return semantic_event
        except aiohttp.ClientError as client_err: # Broader client errors (e.g., timeout, invalid URL, etc.)
            self.logger.warning(f"AIOHTTP client error for event {semantic_event.messageId} ('{client_err}'). Queuing event.")
            await self.event_queue.put(semantic_event)
            return semantic_event
        except Exception as err: # Other unexpected errors during sending
            log_message = f"Unexpected error sending event {semantic_event.messageId}: {err}"
            self.logger.error(log_message, exc_info=True)
            # semantic_event should be defined here if this block is reached after its creation
            self._log_unsent_event(logging.ERROR, log_message, semantic_event.model_dump(exclude_none=True), 'UnexpectedSendError')
            return None

    async def _send_batch_events(self, batch: list[SemanticEvent]) -> bool:
        """
        Sends a batch of events to the endpoint.
        Returns True if successful, False otherwise.
        """
        if not batch:
            return True

        # Assuming the endpoint can handle a list of event objects directly.
        # If the endpoint expects a different structure for batches (e.g., a JSON object with an "events" key),
        # this part will need to be adjusted.
        payload = [event.model_dump(by_alias=True, exclude_none=True) for event in batch]
        batch_event_ids = [event.messageId for event in batch] # For logging

        try:
            async with aiohttp.ClientSession(auth=aiohttp.BasicAuth(self.write_key, self.write_key)) as session:
                async with session.post(
                    self.endpoint, # Or a specific batch endpoint if available
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    response.raise_for_status() # Raises ClientResponseError for 4xx/5xx
                    self.logger.info(f"Successfully sent batch of {len(batch)} events. IDs: {batch_event_ids}")
                    return True
        except aiohttp.ClientResponseError as http_err: # Raised by response.raise_for_status()
            error_details_text = "No response body"
            if http_err.response:
                try:
                    error_details_text = await http_err.response.text()
                except Exception as texterr:
                    self.logger.debug(f"Could not get text from error response for batch (IDs: {batch_event_ids}): {texterr}")

            self.logger.error(f"HTTP error sending batch (IDs: {batch_event_ids}): {http_err.status} - Message: {http_err.message} - Details: {error_details_text}", exc_info=True)
            # Specific event logging for this failure is handled in _process_event_queue before re-queueing
            return False
        except aiohttp.ClientError as client_err: # Includes ClientConnectorError, ClientTimeoutError etc.
            self.logger.error(f"AIOHTTP client error sending batch (IDs: {batch_event_ids}): {client_err}", exc_info=True)
            return False
        except Exception as err: # Other unexpected errors
            self.logger.error(f"Unexpected error sending batch (IDs: {batch_event_ids}): {err}", exc_info=True)
            return False

    async def _process_event_queue(self):
        self.logger.info("Event queue processor started.")
        try:
            while not self._shutdown_event.is_set():
                batch = []
                try:
                    # Wait for the first event or until shutdown is signaled or timeout
                    first_event = await asyncio.wait_for(self.event_queue.get(), timeout=self.send_interval)
                    if first_event: # Should always be true if no exception
                        batch.append(first_event)
                        self.event_queue.task_done()
                except asyncio.TimeoutError:
                    # No event received within the send_interval.
                    # This is normal, allows checking _shutdown_event.
                    if self._shutdown_event.is_set():
                        self.logger.debug("Shutdown signaled, no new events in interval, proceeding to stop.")
                        break
                    continue # Continue to next iteration of while loop to check shutdown_event again
                except asyncio.CancelledError:
                    self.logger.info("Event queue processor task cancelled while waiting for event.")
                    break # Exit loop if task is cancelled
                except Exception as e_get:
                    self.logger.error(f"Error getting from event queue: {e_get}", exc_info=True)
                    await asyncio.sleep(0.1) # Prevent tight loop on continuous error from queue.get()
                    continue # Try to continue processing

                # If we got an event, try to fill the rest of the batch without waiting longer
                if batch:
                    while len(batch) < self.max_batch_size:
                        try:
                            event = self.event_queue.get_nowait()
                            batch.append(event)
                            self.event_queue.task_done()
                        except asyncio.QueueEmpty:
                            break # Queue is empty, proceed with current batch
                        except Exception as e_get_nowait:
                            self.logger.error(f"Error during non-blocking get from event queue: {e_get_nowait}", exc_info=True)
                            break # Stop filling batch on unexpected error

                if batch:
                    self.logger.info(f"Processing batch of {len(batch)} events.")
                    success = await self._send_batch_events(batch)
                    if not success:
                        self.logger.warning(f"Failed to send batch (first event ID: {batch[0].messageId if batch else 'N/A'}). Re-queueing {len(batch)} events.")
                        for event_item in reversed(batch):
                            self._log_unsent_event(logging.WARNING, f"Event from failed batch being re-queued: {event_item.messageId}",
                                                   event_item.model_dump(exclude_none=True), 'BatchSendFailed_ReQueued')
                            await self.event_queue.put(event_item) # Re-queueing
                elif self._shutdown_event.is_set(): # if batch is empty and shutdown is set
                    break # Exit if shutdown and no batch formed (e.g. from timeout)
                else: # No batch and not shutting down (should be rare if timeout leads to continue)
                    await asyncio.sleep(0.01) # Small sleep to prevent tight loop if logic error

        except asyncio.CancelledError: # Catch cancellation of the task itself (e.g. from close method timeout)
            self.logger.info("Event queue processor task was explicitly cancelled.")
        except Exception as e: # Catch-all for unexpected errors in the main loop
            self.logger.error(f"Unhandled exception in event queue processor main loop: {e}", exc_info=True)
            # This task might exit, which could be problematic. Consider if it should attempt to restart or signal critical failure.

        # Shutdown processing: try to process any remaining events from the queue
        self.logger.info("Event queue processor shutting down. Processing any remaining events...")
        final_events_processed_count = 0
        final_events_logged_count = 0
        # Attempt to process in batches as long as there are items and shutdown is active
        while not self.event_queue.empty() and self._shutdown_event.is_set(): # Ensure we only process if shutdown is indeed active
            final_batch = []
            while not self.event_queue.empty() and len(final_batch) < self.max_batch_size:
                try:
                    event = self.event_queue.get_nowait()
                    final_batch.append(event)
                    self.event_queue.task_done()
                except asyncio.QueueEmpty:
                    break
                except Exception as e_final_get:
                    self.logger.error(f"Error getting event from queue during final shutdown processing: {e_final_get}", exc_info=True)
                    break

            if final_batch:
                self.logger.info(f"Sending final batch of {len(final_batch)} events during shutdown.")
                success = await self._send_batch_events(final_batch)
                if success:
                    final_events_processed_count += len(final_batch)
                else:
                    self.logger.error(f"Failed to send final batch (first ID: {final_batch[0].messageId}) during shutdown. Logging {len(final_batch)} events.")
                    for event_item in final_batch:
                        self._log_unsent_event(logging.ERROR, f"Event not sent during shutdown (final batch failure): {event_item.messageId}",
                                               event_item.model_dump(exclude_none=True), 'NotSent_Shutdown_FinalBatchFailed')
                        final_events_logged_count +=1
            else: # No more items could be batched
                break

        # Log any events that were still in the queue but not processed by the loop above (e.g. if queue.get failed)
        # This is a fallback if the above loop exits prematurely.
        while not self.event_queue.empty():
            try:
                event = self.event_queue.get_nowait()
                self._log_unsent_event(logging.ERROR, f"Event found in queue post final processing, logging: {event.messageId}",
                                       event.model_dump(exclude_none=True), 'NotSent_Shutdown_Orphaned')
                self.event_queue.task_done()
                final_events_logged_count +=1
            except asyncio.QueueEmpty:
                break
            except Exception as e_orphan_get:
                 self.logger.error(f"Error getting orphaned event from queue during shutdown: {e_orphan_get}", exc_info=True)
                 break


        self.logger.info(f"Event queue processor stopped. Processed {final_events_processed_count} events in final batches. Logged {final_events_logged_count} unsent events during shutdown.")

    async def close(self):
        """
        Gracefully shuts down the CXSClient, processing any remaining queued events and logging unsent ones.
        """
        self.logger.info("Initiating CXSClient shutdown sequence...")
        try:
            if self.queue_processor_task and not self.queue_processor_task.done() and not self._shutdown_event.is_set():
                self._shutdown_event.set() # Signal the processor to stop
                self.logger.info("Shutdown event set for queue processor. Waiting for completion...")

                try:
                    # Wait for the queue processor to finish its current work and shutdown sequence
                    await asyncio.wait_for(self.queue_processor_task, timeout=self.send_interval + 5.0)
                    self.logger.info("Queue processor task completed.")
                except asyncio.TimeoutError:
                    self.logger.warning("Timeout waiting for queue processor to finish. Attempting to cancel task.")
                    self.queue_processor_task.cancel()
                    try:
                        await self.queue_processor_task # Await the cancellation
                    except asyncio.CancelledError:
                        self.logger.info("Queue processor task was successfully cancelled after timeout.")
                    except Exception as e_task_await_cancel:
                        self.logger.error(f"Error awaiting cancelled queue_processor_task: {e_task_await_cancel}", exc_info=True)
                except asyncio.CancelledError: # If close() itself is cancelled
                     self.logger.info("Client close() operation cancelled while waiting for queue processor. Ensuring processor is also cancelled.")
                     if not self.queue_processor_task.done():
                        self.queue_processor_task.cancel()
                        try:
                            await self.queue_processor_task
                        except asyncio.CancelledError:
                            self.logger.info("Queue processor task cancelled due to close() cancellation.")
                        except Exception as e_task_await_close_cancel:
                             self.logger.error(f"Error awaiting queue processor task after close() cancellation: {e_task_await_close_cancel}", exc_info=True)
                except Exception as e_wait_task:
                    self.logger.error(f"Unexpected error while waiting for queue processor task: {e_wait_task}", exc_info=True)

            elif self.queue_processor_task and self.queue_processor_task.done():
                 self.logger.info("Queue processor task was already completed.")
            elif self._shutdown_event.is_set():
                self.logger.info("Shutdown already in progress or completed. Ensuring queue processor is awaited if task exists.")
                if self.queue_processor_task and not self.queue_processor_task.done():
                     try: await asyncio.wait_for(self.queue_processor_task, timeout=1.0) # Brief wait
                     except Exception: pass # Ignore errors, just ensuring it's not pending forever
            else:
                 self.logger.info("No active queue processor task found or shutdown not applicable.")

            # Fallback logging for any events missed by queue processor's own shutdown sequence (should be rare)
            self.logger.debug("Performing fallback check for any remaining events in queue post-shutdown...")
            missed_events_count = 0
            while not self.event_queue.empty():
                try:
                    event = self.event_queue.get_nowait()
                    self._log_unsent_event(logging.ERROR, f"Event found in queue after shutdown sequence, logging: {event.messageId}",
                                           event.model_dump(exclude_none=True), 'NotSent_PostShutdownCleanup')
                    self.event_queue.task_done()
                    missed_events_count += 1
                except asyncio.QueueEmpty:
                    break # Should not happen if not self.event_queue.empty() check passes
                except Exception as e_fallback_get:
                    self.logger.error(f"Error getting event from queue during post-shutdown fallback cleanup: {e_fallback_get}", exc_info=True)
                    break # Stop if queue is behaving unexpectedly
            if missed_events_count > 0:
                self.logger.warning(f"Logged {missed_events_count} events during post-shutdown fallback cleanup.")

            # Close file handlers for the unsent_events_logger
            self.logger.info("Closing unsent event log file handlers...")
            closed_handlers = 0
            for handler in list(self.unsent_events_logger.handlers): # Iterate over a copy
                if isinstance(handler, logging.FileHandler):
                    try:
                        handler.close()
                        self.unsent_events_logger.removeHandler(handler) # Remove to prevent future use
                        closed_handlers +=1
                    except Exception as e_handler_close:
                        self.logger.error(f"Error closing file handler {handler}: {e_handler_close}", exc_info=True)
            if closed_handlers > 0:
                 self.logger.info(f"Successfully closed {closed_handlers} file handler(s).")
            else:
                 self.logger.info("No file handlers found for unsent_events_logger to close or already closed.")

        except Exception as e_close_main:
            self.logger.error(f"Unexpected error during CXSClient close sequence: {e_close_main}", exc_info=True)

        self.logger.info("CXSClient shutdown sequence complete.")
