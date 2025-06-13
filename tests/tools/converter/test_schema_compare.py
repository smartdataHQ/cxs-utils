import unittest
import json
import os
import tempfile
from pathlib import Path

from cxs.tools.converter.schema_compare import (
    normalize_name,
    clean_for_comparison,
    are_schemas_equivalent,
    compare_schemas
)


class TestSchemaCompare(unittest.TestCase):
    def setUp(self):
        # Create test schemas
        self.equal_schema1 = {
            "type": "record",
            "name": "TestPerson",
            "namespace": "com.contextsuite.schema",
            "fields": [
                {"name": "name", "type": "string"},
                {"name": "age", "type": "int"}
            ]
        }
        
        # Functionally equivalent schema with different formatting/casing
        self.equal_schema2 = {
            "type": "record",
            "name": "TestPerson",
            "namespace": "com.contextsuite.schema",
            "fields": [
                {"name": "Name", "type": "string"},  # Case difference
                {"name": "age", "type": "int"}
            ]
        }
        
        # Schema with actual differences
        self.different_schema = {
            "type": "record",
            "name": "TestPerson",
            "namespace": "com.contextsuite.schema",
            "fields": [
                {"name": "name", "type": "string"},
                {"name": "age", "type": "int"},
                {"name": "email", "type": "string"}  # Extra field
            ]
        }
        
        # Create temp directory for schema files
        self.temp_dir = tempfile.TemporaryDirectory()
        self.schema_dir = Path(self.temp_dir.name)
        self.json_schema_dir = self.schema_dir / "json-schema"
        self.avro_schema_dir = self.schema_dir / "avro"
        
        self.json_schema_dir.mkdir(parents=True)
        self.avro_schema_dir.mkdir(parents=True)
        
        # Create test files for comparison
        with open(self.json_schema_dir / "test_person.json", "w") as f:
            json.dump({
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "title": "TestPerson",
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"}
                },
                "required": ["name", "age"]
            }, f, indent=2)
        
        with open(self.avro_schema_dir / "test_person.avsc", "w") as f:
            json.dump(self.equal_schema1, f, indent=2)
            
        with open(self.avro_schema_dir / "different_person.avsc", "w") as f:
            json.dump(self.different_schema, f, indent=2)
    
    def tearDown(self):
        self.temp_dir.cleanup()
        
    def test_normalize_name(self):
        """Test name normalization for schema comparison"""
        self.assertEqual(normalize_name("test-person.json"), "test_person")
        self.assertEqual(normalize_name("TEST_PERSON.avsc"), "test_person")
        self.assertEqual(normalize_name("test_person"), "test_person")
        
    def test_clean_for_comparison(self):
        """Test schema cleaning for comparison"""
        schema = {
            "fields": [
                {"name": "Name", "type": "string"},
                {"name": "Age", "type": "int"}
            ],
            "_conversion": {
                "source": "json-schema",
                "converter": "SchemaConverter"
            }
        }
        
        cleaned = clean_for_comparison(schema)
        
        # Check conversion metadata removed
        self.assertNotIn("_conversion", cleaned)
        
        # Check field names normalized
        self.assertEqual(cleaned["fields"][0]["name"], "name")
        self.assertEqual(cleaned["fields"][1]["name"], "age")
        
    def test_schema_equivalence(self):
        """Test schema equivalence checking"""
        # Test equal schemas
        is_equivalent, diff = are_schemas_equivalent(self.equal_schema1, self.equal_schema2)
        self.assertTrue(is_equivalent)
        
        # Test different schemas
        is_equivalent, diff = are_schemas_equivalent(self.equal_schema1, self.different_schema)
        self.assertFalse(is_equivalent)
        
    def test_schema_comparison(self):
        """Test batch schema comparison"""
        results = compare_schemas(
            str(self.json_schema_dir),
            str(self.avro_schema_dir)
        )
        
        # Check results structure
        self.assertEqual(results["total"], 1)
        self.assertIn("test_person", results["details"])
        
        # Check that test_person schemas are equivalent
        self.assertEqual(results["details"]["test_person"]["status"], "equivalent")


if __name__ == '__main__':
    unittest.main()
