import unittest
import json
import os
import tempfile
from pathlib import Path

from cxs.tools.converter.schema_converter import (
    SchemaConverter,
    json_schema_to_avro_schema,
    avro_schema_to_json_schema,
    convert_schema_file
)

class TestSchemaConverter(unittest.TestCase):
    def setUp(self):
        # Create test schemas
        self.json_schema = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "TestPerson",
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Person's name"},
                "age": {"type": "integer", "description": "Person's age"},
                "email": {"type": "string", "format": "email"},
                "is_active": {"type": "boolean"},
                "tags": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            },
            "required": ["name", "age"]
        }
        
        self.avro_schema = {
            "type": "record",
            "name": "TestPerson",
            "namespace": "com.contextsuite.schema",
            "fields": [
                {"name": "name", "type": "string", "doc": "Person's name"},
                {"name": "age", "type": "int", "doc": "Person's age"},
                {"name": "email", "type": ["null", "string"], "default": None},
                {"name": "is_active", "type": ["null", "boolean"], "default": None},
                {"name": "tags", "type": ["null", {"type": "array", "items": "string"}], "default": None}
            ]
        }
        
        # Create temp directory for schema files
        self.temp_dir = tempfile.TemporaryDirectory()
        self.schema_dir = Path(self.temp_dir.name)
        self.json_schema_dir = self.schema_dir / "json-schema"
        self.avro_schema_dir = self.schema_dir / "avro"
        
        self.json_schema_dir.mkdir(parents=True)
        self.avro_schema_dir.mkdir(parents=True)
        
        # Save test schema files
        with open(self.json_schema_dir / "test_person.json", "w") as f:
            json.dump(self.json_schema, f, indent=2)
            
        with open(self.avro_schema_dir / "test_person.avsc", "w") as f:
            json.dump(self.avro_schema, f, indent=2)
        
        # Initialize converter
        self.converter = SchemaConverter(str(self.schema_dir))
    
    def tearDown(self):
        self.temp_dir.cleanup()
    
    def test_json_to_avro_conversion(self):
        """Test JSON Schema to Avro Schema conversion"""
        avro = self.converter.json_schema_to_avro(self.json_schema)
        
        # Check basic structure
        self.assertEqual(avro["type"], "record")
        self.assertEqual(avro["name"], "TestPerson")
        self.assertEqual(avro["namespace"], "com.contextsuite.schema")
        
        # Check fields
        fields = {f["name"]: f for f in avro["fields"]}
        self.assertIn("name", fields)
        self.assertIn("age", fields)
        self.assertEqual(fields["name"]["type"], "string")
        self.assertEqual(fields["age"]["type"], "int")
        
        # Check optional fields are represented as unions
        self.assertEqual(fields["email"]["type"][0], "null")
        # Email might be converted to an object with type and doc fields
        if isinstance(fields["email"]["type"][1], dict) and "type" in fields["email"]["type"][1]:
            self.assertEqual(fields["email"]["type"][1]["type"], "string")
        else:
            self.assertEqual(fields["email"]["type"][1], "string")
        
        # Check array type
        self.assertEqual(fields["tags"]["type"][1]["type"], "array")
    
    def test_avro_to_json_conversion(self):
        """Test Avro Schema to JSON Schema conversion"""
        json_schema = self.converter.avro_to_json_schema(self.avro_schema)
        
        # Check basic structure
        self.assertEqual(json_schema["type"], "object")
        self.assertEqual(json_schema["title"], "TestPerson")
        
        # Check properties
        properties = json_schema["properties"]
        self.assertIn("name", properties)
        self.assertIn("age", properties)
        self.assertEqual(properties["name"]["type"], "string")
        self.assertEqual(properties["age"]["type"], "integer")
        
        # Check required fields
        required = json_schema["required"]
        self.assertIn("name", required)
        self.assertIn("age", required)
        self.assertNotIn("email", required)
    
    def test_file_conversion(self):
        """Test file-based schema conversion"""
        # JSON to Avro
        json_file = self.json_schema_dir / "test_person.json"
        output_avro = self.converter.convert_file(str(json_file))
        
        self.assertTrue(os.path.exists(output_avro))
        with open(output_avro, "r") as f:
            converted_avro = json.load(f)
            
        self.assertEqual(converted_avro["type"], "record")
        self.assertEqual(converted_avro["name"], "TestPerson")
        
        # Avro to JSON
        avro_file = self.avro_schema_dir / "test_person.avsc"
        output_json = self.converter.convert_file(str(avro_file))
        
        self.assertTrue(os.path.exists(output_json))
        with open(output_json, "r") as f:
            converted_json = json.load(f)
            
        self.assertEqual(converted_json["type"], "object")
        self.assertEqual(converted_json["title"], "TestPerson")
    
    def test_convenience_functions(self):
        """Test convenience functions"""
        # JSON to Avro
        avro = json_schema_to_avro_schema(self.json_schema)
        self.assertEqual(avro["type"], "record")
        self.assertEqual(avro["name"], "TestPerson")
        
        # Avro to JSON
        json_schema = avro_schema_to_json_schema(self.avro_schema)
        self.assertEqual(json_schema["type"], "object")
        self.assertEqual(json_schema["title"], "TestPerson")
        
        # File conversion
        json_file = self.json_schema_dir / "test_person.json"
        output_avro = convert_schema_file(str(json_file))
        self.assertTrue(os.path.exists(output_avro))

if __name__ == '__main__':
    unittest.main()
