"""
Basic tests for the Pydantic schema models
"""
import unittest
import pytest
from datetime import datetime, timezone

from cxs.schema.pydantic.semantic_event import SemanticEvent, EventType, SourceInfo
from cxs.schema.pydantic.entity import Entity

class TestPydanticModels(unittest.TestCase):
    
    def test_semantic_event_basic(self):
        """Test creating a basic semantic event"""
        timestamp = datetime.now(timezone.utc)
        event = SemanticEvent(
            anonymous_id="anon123",
            type=EventType.track,
            event="Test Event",
            timestamp=timestamp,
            original_timestamp=timestamp
        )
        # Verify event was created correctly
        self.assertEqual(event.type, EventType.track)
        self.assertEqual(event.event, "Test Event")
    
    def test_entity_basic(self):
        """Test creating a basic entity"""
        entity = Entity(
            gid_url="https://example.com/entities/test-entity-id",
            label="Test Entity",
            type="test-type"
        )
        # Verify entity was created correctly
        self.assertEqual(entity.gid_url, "https://example.com/entities/test-entity-id")
        self.assertEqual(entity.label, "Test Entity")
        self.assertEqual(entity.type, "test-type")


if __name__ == '__main__':
    unittest.main()
