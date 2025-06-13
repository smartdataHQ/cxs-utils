import unittest
import json
import os
import sys
import tempfile
import subprocess
from pathlib import Path

from cxs.tools.converter.schema_cli import (
    convert_single_file,
    convert_directory,
    compare_schemas,
    batch_compare_schemas
)


class TestSchemaCLI(unittest.TestCase):
    def setUp(self):
        # Create temp directory for test files
        self.temp_dir = tempfile.TemporaryDirectory()
        self.test_dir = Path(self.temp_dir.name)
        
        # Create schema directories
        self.json_dir = self.test_dir / "json-schema"
        self.avro_dir = self.test_dir / "avro"
        self.output_dir = self.test_dir / "output"
        
        self.json_dir.mkdir(parents=True)
        self.avro_dir.mkdir(parents=True)
        self.output_dir.mkdir(parents=True)
        
        # Create test schemas
        self.json_schema = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "TestPerson",
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "integer"}
            },
            "required": ["name", "age"]
        }
        
        self.avro_schema = {
            "type": "record",
            "name": "TestPerson",
            "namespace": "com.contextsuite.schema",
            "fields": [
                {"name": "name", "type": "string"},
                {"name": "age", "type": "int"}
            ]
        }
        
        # Save test schemas
        with open(self.json_dir / "test_person.json", "w") as f:
            json.dump(self.json_schema, f, indent=2)
            
        with open(self.avro_dir / "test_person.avsc", "w") as f:
            json.dump(self.avro_schema, f, indent=2)
        
        # Create an args mock class
        class Args:
            pass
            
        self.args = Args()
    
    def tearDown(self):
        self.temp_dir.cleanup()
    
    def test_convert_schema_command(self):
        """Test the convert schema command"""
        self.args.input_file = str(self.json_dir / "test_person.json")
        self.args.output = str(self.output_dir / "converted.avsc")
        self.args.schema_dir = str(self.test_dir)
        self.args.verbose = False
        
        # Run conversion
        result = convert_single_file(self.args)
        
        # Check output file exists
        self.assertTrue(os.path.exists(self.args.output))
        
        # Load and validate the converted schema
        with open(self.args.output, "r") as f:
            converted = json.load(f)
            
        self.assertEqual(converted["type"], "record")
        self.assertEqual(converted["name"], "TestPerson")
    
    def test_convert_directory_command(self):
        """Test the convert-dir command"""
        self.args.directory = str(self.json_dir)
        self.args.output_dir = str(self.output_dir)
        self.args.schema_dir = str(self.test_dir)
        self.args.recursive = False
        self.args.pattern = "*.json"
        self.args.verbose = False
        
        # Run directory conversion
        convert_directory(self.args)
        
        # Check output file exists with correct extension
        expected_output = self.output_dir / "test_person.avsc"
        self.assertTrue(expected_output.exists())
        
        # Load and validate converted schema
        with open(expected_output, "r") as f:
            converted = json.load(f)
            
        self.assertEqual(converted["type"], "record")
        
    def test_compare_schemas_command(self):
        """Test the compare command with two schema files"""
        self.args.schema1 = str(self.json_dir / "test_person.json")
        self.args.schema2 = str(self.avro_dir / "test_person.avsc")
        self.args.schema_dir = str(self.test_dir)
        self.args.output = str(self.output_dir / "comparison.json")
        
        # Run comparison
        compare_schemas(self.args)
        
        # Check output file exists
        self.assertTrue(os.path.exists(self.args.output))
        
        # Load and check comparison results
        with open(self.args.output, "r") as f:
            result = json.load(f)
            
        self.assertIn("equal", result)
    
    def test_batch_compare_command(self):
        """Test the batch-compare command"""
        self.args.schema_dir = str(self.test_dir)
        self.args.json_dir = "json-schema"
        self.args.avro_dir = "avro"
        self.args.output = str(self.output_dir / "batch_comparison.json")
        self.args.convert_missing = False
        self.args.verbose = False
        
        # Run batch comparison
        batch_compare_schemas(self.args)
        
        # Check output file exists
        self.assertTrue(os.path.exists(self.args.output))
        
        # Load and check batch comparison results
        with open(self.args.output, "r") as f:
            results = json.load(f)
            
        self.assertIn("total", results)
        self.assertIn("details", results)
        self.assertIn("test_person", results["details"])


class TestCLIScriptExecution(unittest.TestCase):
    def setUp(self):
        # Create temp directory for test files
        self.temp_dir = tempfile.TemporaryDirectory()
        self.test_dir = Path(self.temp_dir.name)
        
        # Create schema directories
        self.schema_dir = self.test_dir / "cxs-schema"
        self.json_dir = self.schema_dir / "json-schema"
        self.avro_dir = self.schema_dir / "avro"
        
        self.json_dir.mkdir(parents=True)
        self.avro_dir.mkdir(parents=True)
        
        # Create simple test schemas
        json_schema = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "TestSchema",
            "type": "object",
            "properties": {"test": {"type": "string"}}
        }
        
        avro_schema = {
            "type": "record",
            "name": "TestSchema",
            "fields": [{"name": "test", "type": ["null", "string"], "default": None}]
        }
        
        # Save test schemas
        with open(self.json_dir / "test.json", "w") as f:
            json.dump(json_schema, f)
            
        with open(self.avro_dir / "test.avsc", "w") as f:
            json.dump(avro_schema, f)
    
    def tearDown(self):
        self.temp_dir.cleanup()
    
    def test_script_execution(self):
        """Test direct script execution through subprocess"""
        try:
            # Test convert command
            result = subprocess.run(
                [sys.executable, "-m", "cxs.tools.converter.schema_cli", 
                 "convert", 
                 str(self.json_dir / "test.json"),
                 "--output", str(self.test_dir / "converted.avsc")],
                capture_output=True,
                text=True,
                check=True
            )
            
            # Check the output file exists
            self.assertTrue(os.path.exists(str(self.test_dir / "converted.avsc")))
            
            # Test batch-compare command
            result = subprocess.run(
                [sys.executable, "-m", "cxs.tools.converter.schema_cli", 
                 "batch-compare", 
                 "--schema-dir", str(self.schema_dir),
                 "--output", str(self.test_dir / "batch_result.json")],
                capture_output=True,
                text=True
            )
            
            # The process might fail due to DeepDiff not being available, but the file should still be created
            self.assertTrue(os.path.exists(str(self.test_dir / "batch_result.json")))
            
        except subprocess.CalledProcessError as e:
            self.fail(f"CLI script execution failed: {e.output}")


if __name__ == '__main__':
    unittest.main()
