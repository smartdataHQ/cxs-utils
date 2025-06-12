import os
import unittest
from pathlib import Path

import sys
import os
from pathlib import Path

project_root = Path(os.path.abspath(__file__)).parents[2]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from cxs_schema.event_validator import (
    EventStructureValidator,
    validate_event,
)


class TestEventValidator(unittest.TestCase):
    
    def setUp(self):
        self.validator = EventStructureValidator()
        self.valid_event = {
            "type": "track",
            "event": "Product Updated",
            "timestamp": "2025-06-06T17:32:46-04:00",
            "entity_gid": "ede9ed75-dd83-519b-89c2-aa20966962cd",
            "event_gid": "ede9ed75-dd83-519b-89c2-aa20966962cd",
            "content": {
                "Description": "This is test snowboard",
                "Title": "The test snowboard"
            },
            "context": {
                "ip": "127.0.0.1",
                "locale": "en-US",
                "timezone": "America/Los_Angeles"
            },
            "involves": [
                {
                    "entity_type": "Product",
                    "id": "15100602155333",
                    "id_type": "Shopify",
                    "label": "The test snowboard",
                    "role": "Source"
                }
            ],
            "properties": {},
            "source_info": {
                "label": "Shopify",
                "type": "eCommerce"
            }
        }
    
    def test_valid_event(self):
        is_valid = self.validator.validate_event(self.valid_event)
        self.assertTrue(is_valid)
        self.assertEqual(len(self.validator.errors), 0)
    
    def test_field_order(self):
        reordered_event = {
            "event_gid": "ede9ed75-dd83-519b-89c2-aa20966962cd",
            "entity_gid": "ede9ed75-dd83-519b-89c2-aa20966962cd",
            "timestamp": "2025-06-06T17:32:46-04:00",
            "event": "Product Updated",
            "type": "track",
            "content": self.valid_event["content"],
            "context": self.valid_event["context"],
            "involves": self.valid_event["involves"],
            "properties": self.valid_event["properties"],
            "source_info": self.valid_event["source_info"]
        }
        
        is_valid = self.validator.validate_event(reordered_event)
        self.assertTrue(is_valid)
        self.assertEqual(len(self.validator.errors), 0)
        self.assertGreater(len(self.validator.warnings), 0)
        
    def test_event_name(self):
        invalid_event = self.valid_event.copy()
        invalid_event["event"] = "product updated"
        
        is_valid = self.validator.validate_event(invalid_event)
        self.assertFalse(is_valid)
        self.assertIn("Event name must be capitalized", self.validator.errors)
        
        invalid_event = self.valid_event.copy()
        invalid_event["event"] = "Product Update"
        
        is_valid = self.validator.validate_event(invalid_event)
        self.assertTrue(is_valid)
        self.assertIn("Event name 'Product Update' should end with a past-tense verb", self.validator.warnings)
    
    def test_involves_validation(self):
        invalid_event = self.valid_event.copy()
        invalid_event["involves"] = [
            {
                "entity_type": "Product",
                "id": "15100602155333",
                "id_type": "Shopify",
                "label": "The test snowboard",
                "role": "Target"
            }
        ]
        
        is_valid = self.validator.validate_event(invalid_event)
        self.assertTrue(is_valid)
        self.assertIn("No 'Source' role found in involves array", self.validator.warnings)
        
        invalid_event = self.valid_event.copy()
        invalid_event["involves"] = [
            {
                "entity_type": "Product",
                "id": "15100602155333",
                "id_type": "Shopify",
                "label": "The test snowboard",
                "role": "Product"
            }
        ]
        
        is_valid = self.validator.validate_event(invalid_event)
        self.assertTrue(is_valid)
        self.assertIn("Role (Product) should not duplicate entity_type", self.validator.warnings)
    
    def test_commerce_products(self):
        invalid_event = self.valid_event.copy()
        invalid_event["commerce"] = {
            "products": [
                {
                    "id": "15100602155333",
                    "name": "The test snowboard",
                    "category": "Snowboards",
                    "path": "Sporting Goods > Outdoor Recreation > Winter Sports & Activities > Skiing & Snowboarding > Snowboards"  # Shouldn't use path
                }
            ]
        }
        
        is_valid = self.validator.validate_event(invalid_event)
        self.assertFalse(is_valid)
        self.assertIn("Product #1: Use 'product_id' instead of 'id'", self.validator.errors)
        self.assertIn("Product #1: Use 'product' instead of 'name'", self.validator.errors)
        self.assertIn("Product #1: 'path' field is not in schema", self.validator.errors)
    
    def test_nested_structures(self):
        invalid_event = self.valid_event.copy()
        del invalid_event["source_info"]
        invalid_event["source.label"] = "Shopify"
        invalid_event["source.type"] = "eCommerce"
        
        is_valid = self.validator.validate_event(invalid_event)
        self.assertFalse(is_valid)
        self.assertIn("'source.label' should be in 'source_info' object, not flat", self.validator.errors)
        self.assertIn("'source.type' should be in 'source_info' object, not flat", self.validator.errors)


def test_validate_event_helper():
    """Test the helper function."""
    valid_event = {
        "type": "track",
        "event": "Product Updated",
        "timestamp": "2025-06-06T17:32:46-04:00",
        "entity_gid": "ede9ed75-dd83-519b-89c2-aa20966962cd",
        "event_gid": "ede9ed75-dd83-519b-89c2-aa20966962cd",
        "involves": [{"entity_type": "Product", "id": "123", "role": "Source"}],
        "source_info": {"label": "Test", "type": "Test"}
    }
    
    is_valid, errors, warnings = validate_event(valid_event)
    assert is_valid is True
    assert len(errors) == 0


def test_invalid_json():
    is_valid, errors, warnings = validate_event("{invalid json")
    assert is_valid is False
    assert any("Invalid JSON" in error for error in errors)


if __name__ == '__main__':
    unittest.main()
