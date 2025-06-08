import asyncio
import unittest
from unittest.mock import patch, AsyncMock, MagicMock, call
import os
import tempfile
import logging
from datetime import datetime, timezone

from aioresponses import aioresponses

from cxs.core.client.cxs_client import CXSClient, JsonFormatter
from cxs.core.schema.semantic_event import SemanticEvent, EventType, Context, Library, OS, App, BaseEventInfo, Traits

# Ensure CXSClient's general logger does not propagate to root during tests to keep test output clean.
# This might need adjustment based on how CXSClient's logger is named/configured.
# For now, we assume it might create a logger like "CXSClient_*"
# logging.getLogger("CXSClient").propagate = False # Example, adjust if needed

class TestCXSClient(unittest.IsolatedAsyncioTestCase):

    def MinimalSemanticEvent(self, event_id="test-event-id", event_type=EventType.track, timestamp=None):
        """Helper to create a minimal, valid SemanticEvent for testing."""
        return SemanticEvent(
            messageId=event_id,
            type=event_type,
            event="Test Event",
            timestamp=timestamp or datetime.now(timezone.utc),
            write_key="test-write-key"
        )

    async def asyncSetUp(self):
        """Set up for each test."""
        self.test_dir = tempfile.TemporaryDirectory()
        self.mock_log_file_path = os.path.join(self.test_dir.name, "unsent_events.log")

        # Default client parameters for most tests
        self.default_params = {
            "write_key": "test-write-key",
            "endpoint": "http://test-endpoint.com/v1",
            "application": "TestApp",
            "log_file_path": self.mock_log_file_path,
            "log_level": logging.DEBUG # So we can see client's internal logging if needed
        }
        self.client = CXSClient(**self.default_params)

        # It's good practice to disable external logging from libraries if they are noisy
        # For CXSClient, we might want its logs during test development/debugging.
        # If CXSClient's logger is named consistently, we can get it.
        # For now, assuming self.client.logger is available after init.
        if hasattr(self.client, 'logger'):
            self.client.logger.setLevel(logging.CRITICAL) # Supress general client logs during tests
        if hasattr(self.client, 'unsent_events_logger'):
             self.client.unsent_events_logger.setLevel(logging.CRITICAL) # Supress unsent logs unless specifically tested


    async def asyncTearDown(self):
        """Clean up after each test."""
        if self.client:
            # Ensure queue processor is properly shut down
            # Mock aiohttp calls during close if any are made by _send_batch_events during final flush
            with aioresponses() as m:
                m.post(self.client.endpoint, status=200) # Mock success for any final batch send
                await self.client.close()

        self.test_dir.cleanup()
        # Reset any global logging changes if necessary, though typically not needed with instance loggers.

    # --- Test Cases Will Go Here ---

    async def test_initialization_default_and_custom_params(self):
        """Test client initialization with default and custom parameters."""
        # Default client is already initialized in self.setUp
        self.assertIsInstance(self.client, CXSClient)
        self.assertEqual(self.client.write_key, "test-write-key")
        self.assertEqual(self.client.endpoint, "http://test-endpoint.com/v1")
        self.assertEqual(self.client.max_batch_size, 100) # Default
        self.assertEqual(self.client.send_interval, 10.0) # Default
        self.assertIsNotNone(self.client.queue_processor_task)
        self.assertFalse(self.client.queue_processor_task.done())

        # Verify unsent_events_logger (default path used in setUp)
        self.assertTrue(any(isinstance(h, logging.FileHandler) for h in self.client.unsent_events_logger.handlers))
        file_handler = next(h for h in self.client.unsent_events_logger.handlers if isinstance(h, logging.FileHandler))
        self.assertEqual(os.path.abspath(file_handler.baseFilename), os.path.abspath(self.mock_log_file_path))
        self.assertIsInstance(file_handler.formatter, JsonFormatter)

        # Clean up default client before creating a new one for custom params
        await self.client.close()

        # Test with custom parameters
        custom_log_path = os.path.join(self.test_dir.name, "custom_unsent.log")
        custom_params = {
            "write_key": "custom-key",
            "endpoint": "http://custom-endpoint.com/v2",
            "application": "CustomApp",
            "max_batch_size": 50,
            "send_interval": 5.0,
            "log_file_path": custom_log_path,
            "log_level": logging.DEBUG
        }
        custom_client = CXSClient(**custom_params)
        self.assertEqual(custom_client.write_key, "custom-key")
        self.assertEqual(custom_client.endpoint, "http://custom-endpoint.com/v2")
        self.assertEqual(custom_client.max_batch_size, 50)
        self.assertEqual(custom_client.send_interval, 5.0)
        self.assertIsNotNone(custom_client.queue_processor_task)
        self.assertFalse(custom_client.queue_processor_task.done())

        # Verify unsent_events_logger for custom client
        self.assertTrue(any(isinstance(h, logging.FileHandler) for h in custom_client.unsent_events_logger.handlers))
        custom_file_handler = next(h for h in custom_client.unsent_events_logger.handlers if isinstance(h, logging.FileHandler))
        self.assertEqual(os.path.abspath(custom_file_handler.baseFilename), os.path.abspath(custom_log_path))
        self.assertIsInstance(custom_file_handler.formatter, JsonFormatter)

        await custom_client.close() # Ensure this client is also closed

        # Test initialization with log_file_path=None (no file handler for unsent events)
        no_file_log_params = self.default_params.copy()
        no_file_log_params["log_file_path"] = None
        # Need to manage the client created in setUp if we are testing variations like this
        # For this specific test, we'll shadow self.client
        no_file_log_client = CXSClient(**no_file_log_params)

        # Check that no FileHandler was added to unsent_events_logger
        # It might have a StreamHandler to stderr as fallback if implemented in CXSClient
        found_file_handler = False
        for handler in no_file_log_client.unsent_events_logger.handlers:
            if isinstance(handler, logging.FileHandler):
                found_file_handler = True
                break
        self.assertFalse(found_file_handler, "FileHandler should not be present when log_file_path is None.")
        # Check if fallback StreamHandler to stderr is present (if this is the expected behavior)
        # This depends on the CXSClient implementation detail for log_file_path=None
        if not any(isinstance(h, logging.StreamHandler) for h in no_file_log_client.unsent_events_logger.handlers):
             self.client.logger.warning("CXSClient with log_file_path=None did not add a fallback StreamHandler to unsent_events_logger.")


        await no_file_log_client.close()
        # self.client was closed at the start of this test, re-init for other tests via setUp
        # No, setUp will run for the next test. But we need to make sure self.client is the default one
        # or handle it in tearDown. Current tearDown handles self.client.
        # For this test, we've completed with custom_client and no_file_log_client.
        # The self.client from setUp was closed. We need to assign the last client to self.client
        # or ensure tearDown can handle a missing/closed self.client gracefully if it was one of these.
        # Simpler: let setUp/tearDown handle their own self.client. This test manages its own clients.
        self.client = None # Prevent tearDown from trying to close the already closed default client.

    async def test_send_event_direct_success(self):
        """Test _send_event for successful direct send."""
        event_to_send = self.MinimalSemanticEvent(event_id="direct-success-id")
        event_data_dict = event_to_send.model_dump(exclude_none=True)

        with aioresponses() as m:
            m.post(self.client.endpoint, status=200, payload={"status": "ok"}) # Mock successful response

            # We call _send_event directly for this unit test.
            # In practice, users might call a public method.
            returned_event = await self.client._send_event(
                event_type_enum=EventType.track,
                event_data=event_data_dict # Pass the dict, _send_event constructs SemanticEvent
            )

        self.assertIsNotNone(returned_event)
        self.assertEqual(returned_event.messageId, "direct-success-id")
        self.assertEqual(self.client.event_queue.qsize(), 0)
        m.assert_called_once_with(self.client.endpoint, method='POST', json=returned_event.model_dump(by_alias=True, exclude_none=True))

    async def test_send_event_retryable_error_and_queuing(self):
        """Test _send_event queues event on retryable HTTP error."""
        event_to_send = self.MinimalSemanticEvent(event_id="retryable-error-id")
        # _send_event expects a dict, it will construct the SemanticEvent internally
        event_data_dict = event_to_send.model_dump(exclude_none=True)


        with aioresponses() as m:
            m.post(self.client.endpoint, status=500) # Mock server error

            returned_event = await self.client._send_event(
                event_type_enum=EventType.track,
                event_data=event_data_dict
            )

        self.assertIsNotNone(returned_event)
        self.assertEqual(returned_event.messageId, "retryable-error-id")
        self.assertEqual(self.client.event_queue.qsize(), 1)
        queued_event = await self.client.event_queue.get()
        self.assertEqual(queued_event.messageId, "retryable-error-id")

    async def test_send_event_non_retryable_error_and_logging(self):
        """Test _send_event logs event on non-retryable HTTP error and does not queue."""
        event_to_send = self.MinimalSemanticEvent(event_id="non-retryable-error-id")
        event_data_dict = event_to_send.model_dump(exclude_none=True)

        # Mock the _log_unsent_event method
        self.client._log_unsent_event = AsyncMock()

        with aioresponses() as m:
            m.post(self.client.endpoint, status=400, body="Bad Request") # Mock non-retryable client error

            returned_event = await self.client._send_event(
                event_type_enum=EventType.track,
                event_data=event_data_dict
            )

        self.assertIsNone(returned_event) # Should return None on non-retryable failure
        self.assertEqual(self.client.event_queue.qsize(), 0)

        self.client._log_unsent_event.assert_called_once()
        args, kwargs = self.client._log_unsent_event.call_args
        self.assertEqual(kwargs['reason'], 'NonRetryableHTTPError')
        self.assertEqual(kwargs['event_data_dict']['messageId'], "non-retryable-error-id")

    async def test_event_batching_success(self):
        """Test successful event batching and sending."""
        # Re-initialize client with a very short send interval for faster testing
        await self.client.close() # Close the one from setUp
        self.client = CXSClient(
            **self.default_params,
            send_interval=0.05,
            max_batch_size=2 # Small batch size for testing
        )
        # Suppress logs for this specific test run if needed, or manage globally
        self.client.logger.setLevel(logging.CRITICAL)
        self.client.unsent_events_logger.setLevel(logging.CRITICAL)


        event1 = self.MinimalSemanticEvent(event_id="batch-evt-1")
        event2 = self.MinimalSemanticEvent(event_id="batch-evt-2")

        # Manually put events onto the queue (as SemanticEvent objects)
        await self.client.event_queue.put(event1)
        await self.client.event_queue.put(event2)
        self.assertEqual(self.client.event_queue.qsize(), 2)

        with aioresponses() as m:
            # Mock the batch send endpoint
            m.post(self.client.endpoint, status=200, payload={"status": "batch ok"})

            await asyncio.sleep(self.client.send_interval * 2 + 0.1) # Wait for batch processor to run

            self.assertEqual(self.client.event_queue.qsize(), 0)

            # Check that the endpoint was called. aioresponses tracks calls.
            # We expect one call for the batch of 2 events.
            payload_event1 = event1.model_dump(by_alias=True, exclude_none=True)
            payload_event2 = event2.model_dump(by_alias=True, exclude_none=True)

            # The actual call's data will be a list of these two event payloads
            # Need to ensure the mock was called with a list containing these items
            # aioresponses' assert_called_once_with is strict about payload matching.
            # We can grab the call arguments and inspect the JSON.
            self.assertTrue(len(m.requests) == 1, "Should have made one call for the batch")
            request_key = ('POST', self.client.endpoint)
            args, kwargs = m.requests[request_key][0].kwargs # Get the kwargs of the first call
            sent_json = kwargs['json']
            self.assertIsInstance(sent_json, list)
            self.assertEqual(len(sent_json), 2)
            # Check if the sent JSON objects match our event payloads
            # Order might matter depending on server, but for client test, presence is key
            self.assertTrue(payload_event1 in sent_json)
            self.assertTrue(payload_event2 in sent_json)


    async def test_event_batching_failure_and_requeue_log(self):
        """Test batch send failure, re-queueing, and logging."""
        await self.client.close() # Close the one from setUp
        self.client = CXSClient(
            **self.default_params,
            send_interval=0.05,
            max_batch_size=1 # Send events one by one in "batches"
        )
        self.client.logger.setLevel(logging.CRITICAL)
        self.client.unsent_events_logger.setLevel(logging.CRITICAL) # Keep this quiet unless testing its output

        event_to_batch = self.MinimalSemanticEvent(event_id="batch-fail-id")
        await self.client.event_queue.put(event_to_batch)
        self.assertEqual(self.client.event_queue.qsize(), 1)

        # Mock _log_unsent_event for checking if it's called during re-queue
        self.client._log_unsent_event = AsyncMock()

        with aioresponses() as m:
            m.post(self.client.endpoint, status=500) # Mock server error for batch send

            await asyncio.sleep(self.client.send_interval * 2 + 0.1) # Wait for batch processor

            # Endpoint should have been called
            m.assert_called_once_with(self.client.endpoint, method='POST', json=[event_to_batch.model_dump(by_alias=True, exclude_none=True)])

            # Event should be re-queued
            self.assertEqual(self.client.event_queue.qsize(), 1)

            # _log_unsent_event should have been called with reason 'BatchSendFailed_ReQueued'
            self.client._log_unsent_event.assert_called_once()
            args, kwargs = self.client._log_unsent_event.call_args
            self.assertEqual(kwargs['reason'], 'BatchSendFailed_ReQueued')
            self.assertEqual(kwargs['event_data_dict']['messageId'], "batch-fail-id")

            # Verify the event is still in the queue (optional, qsize check is good)
            requeued_event = await self.client.event_queue.get()
            self.assertEqual(requeued_event.messageId, "batch-fail-id")

    async def test_file_logging_on_shutdown(self):
        """Test that unsent events are logged to file on shutdown."""
        # Use a unique log file for this test to avoid interference
        temp_log_file = tempfile.NamedTemporaryFile(delete=False, mode="w+", suffix=".log", dir=self.test_dir.name)
        temp_log_file_path = temp_log_file.name
        temp_log_file.close() # Close it so client can open/write

        await self.client.close() # Close client from setUp
        self.client = CXSClient(
            **self.default_params,
            log_file_path=temp_log_file_path,
            send_interval=0.05,
            max_batch_size=1
        )
        # We want to see the unsent_events_logger output for this test
        self.client.unsent_events_logger.setLevel(logging.WARNING)
        # Ensure file handler is attached correctly for unsent_events_logger
        fh = None
        for h in self.client.unsent_events_logger.handlers:
            if isinstance(h, logging.FileHandler) and os.path.abspath(h.baseFilename) == os.path.abspath(temp_log_file_path):
                fh = h
                break
        self.assertIsNotNone(fh, "FileHandler for unsent events not found on client.")
        # Temporarily remove other handlers from unsent_events_logger to ensure only file output
        # Or ensure its level is high enough. For this test, we only care about the file.

        event_to_log = self.MinimalSemanticEvent(event_id="shutdown-log-id")
        await self.client.event_queue.put(event_to_log)

        with aioresponses() as m:
            # Mock persistent failure for the batch endpoint
            m.post(self.client.endpoint, status=503, repeat=True) # Repeat True for multiple attempts

            await self.client.close() # This should trigger logging of the unsent event

        # Read the log file
        with open(temp_log_file_path, 'r') as f:
            log_content = f.read()

        os.remove(temp_log_file_path) # Clean up

        self.assertIn("shutdown-log-id", log_content)
        # Check for one of the expected reasons. During shutdown, events from failed batches
        # might be re-queued and then caught by the final shutdown logic.
        # 'BatchSendFailed_ReQueued' then 'NotSent_Shutdown_FinalBatchFailed' or 'NotSent_Shutdown_Orphaned'
        # For this test, we mainly care that it's logged as unsent during the shutdown process.
        # A more precise check might look for 'NotSent_Shutdown_FinalBatchFailed' or 'NotSent_Shutdown_Orphaned'.
        self.assertTrue("BatchSendFailed_ReQueued" in log_content or
                        "NotSent_Shutdown_FinalBatchFailed" in log_content or
                        "NotSent_Shutdown_Orphaned" in log_content,
                        f"Log content did not contain expected shutdown reason. Content: {log_content}")

    async def test_graceful_shutdown(self):
        """Test graceful shutdown processes events and cleans up."""
        await self.client.close() # Close client from setUp
        # Initialize with a slightly longer interval to ensure event is in queue when close is called
        self.client = CXSClient(**self.default_params, send_interval=0.1, max_batch_size=1)
        self.client.logger.setLevel(logging.CRITICAL)
        self.client.unsent_events_logger.setLevel(logging.CRITICAL)

        event_in_queue = self.MinimalSemanticEvent(event_id="shutdown-process-id")
        await self.client.event_queue.put(event_in_queue)
        self.assertEqual(self.client.event_queue.qsize(), 1)

        # Mock the FileHandler's close method on the unsent_events_logger to verify it's called
        # Find the file handler first
        file_handler = None
        for handler in self.client.unsent_events_logger.handlers:
            if isinstance(handler, logging.FileHandler):
                file_handler = handler
                break
        self.assertIsNotNone(file_handler, "File handler not found for unsent_events_logger")

        original_fh_close = file_handler.close # Store original
        file_handler.close = MagicMock()


        with aioresponses() as m:
            m.post(self.client.endpoint, status=200, payload={"status": "batch ok"}) # Successful send

            await self.client.close() # Initiate graceful shutdown

        self.assertTrue(self.client._shutdown_event.is_set())
        self.assertTrue(self.client.queue_processor_task.done())
        self.assertEqual(self.client.event_queue.qsize(), 0, "Queue should be empty after graceful shutdown.")

        # Check that the batch endpoint was called for the event
        m.assert_called_once_with(self.client.endpoint, method='POST', json=[event_in_queue.model_dump(by_alias=True, exclude_none=True)])

        # Verify that the file handler's close method was called
        file_handler.close.assert_called_once()

        # Restore original close method to allow proper cleanup by test_dir in tearDown if handler is reused
        # (though client is typically new each test)
        if file_handler: # Check if found
             file_handler.close = original_fh_close

        # Also check that handlers are removed (as per current CXSClient.close() impl)
        self.assertFalse(any(isinstance(h, logging.FileHandler) for h in self.client.unsent_events_logger.handlers),
                         "FileHandler should be removed from unsent_events_logger after close.")


if __name__ == '__main__':
    unittest.main()
