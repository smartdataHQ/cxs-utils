import os
import sys
import argparse
import logging
import json
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

try:
    from deepdiff import DeepDiff
    HAS_DEEPDIFF = True
except ImportError:
    HAS_DEEPDIFF = False

from .schema_converter import SchemaConverter, convert_schema_file, __version__

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("schema-converter-cli")


def normalize_name(name: str) -> str:
    name = name.replace('-', '_').lower()
    if name.endswith('.json'):
        name = name[:-5]
    elif name.endswith('.avsc'):
        name = name[:-5]
    return name


def clean_for_comparison(schema: Dict[str, Any]) -> Dict[str, Any]:
    cleaned = json.loads(json.dumps(schema))
    
    if "_conversion" in cleaned:
        del cleaned["_conversion"]
    
    if "fields" in cleaned and isinstance(cleaned["fields"], list):
        for field in cleaned["fields"]:
            if "name" in field:
                field["name"] = field["name"].lower()
    
    return cleaned


def are_schemas_equivalent(schema1: Dict[str, Any], schema2: Dict[str, Any]) -> Tuple[bool, Dict]:
    if not HAS_DEEPDIFF:
        logger.warning("DeepDiff library not found. Using simple comparison.")
        clean1 = clean_for_comparison(schema1)
        clean2 = clean_for_comparison(schema2)
        return (clean1 == clean2, {"message": "DeepDiff not available for detailed comparison"})
        
    cleaned1 = clean_for_comparison(schema1)
    cleaned2 = clean_for_comparison(schema2)
    
    exclude_diff_types = {
        "properties",
        "values_changed",
        "type_changes"
    }
    
    exclude_paths = {
        "root['doc']",
        "root['namespace']",
        "root['_conversion']"
    }
    
    if "fields" in cleaned1 and "properties" in cleaned2:
        props = {}
        for field in cleaned1.get("fields", []):
            if "name" in field and "type" in field:
                props[field["name"]] = {"type": field["type"]}
        cleaned1["properties"] = props
    
    if "fields" in cleaned2 and "properties" in cleaned1:
        props = {}
        for field in cleaned2.get("fields", []):
            if "name" in field and "type" in field:
                props[field["name"]] = {"type": field["type"]}
        cleaned2["properties"] = props
    
    diff = DeepDiff(cleaned1, cleaned2, ignore_order=True)
    
    serializable_diff = {}
    
    for diff_type, changes in diff.items():
        if diff_type in exclude_diff_types:
            continue
        
        if diff_type == 'dictionary_item_added':
            items = [item for item in list(changes) if not any(path in item for path in exclude_paths)]
            if items:
                serializable_diff['added_items'] = items
        elif diff_type == 'dictionary_item_removed': 
            items = [item for item in list(changes) if not any(path in item for path in exclude_paths)]
            if items:
                serializable_diff['removed_items'] = items
        elif diff_type == 'iterable_item_added':
            values_dict = {k: v for k, v in changes.items() 
                         if not any(path in k for path in exclude_paths)}
            if values_dict:
                serializable_diff['added_values'] = [str(v) for v in values_dict.values()]
        elif diff_type == 'iterable_item_removed':
            values_dict = {k: v for k, v in changes.items() 
                         if not any(path in k for path in exclude_paths)}
            if values_dict:
                serializable_diff['removed_values'] = [str(v) for v in values_dict.values()]
        elif diff_type == 'type_changes':
            significant_changes = {}
            for path, change in changes.items():
                if any(exclude in path for exclude in exclude_paths):
                    continue
                    
                old_type = type(change.old_value).__name__
                new_type = type(change.new_value).__name__
                if not ((old_type == 'int' and new_type == 'float') or 
                        (old_type == 'float' and new_type == 'int')):
                    significant_changes[path] = {
                        'old_type': old_type,
                        'new_type': new_type,
                        'old_value': str(change.old_value),
                        'new_value': str(change.new_value)
                    }
            if significant_changes:
                serializable_diff['type_changes'] = significant_changes
    
    return (len(serializable_diff) == 0, serializable_diff)


def parse_arguments():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Convert between JSON Schema and Avro Schema formats",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert a JSON Schema to Avro Schema
  schema_cli.py convert semantic_event.json
  
  # Convert an Avro Schema to JSON Schema with specified output
  schema_cli.py convert semantic_event.avsc -o semantic_event_json.json
  
  # Convert all JSON Schema files in a directory
  schema_cli.py convert-dir ./json-schema --pattern "*.json"
  
  # Compare schemas (finds differences)
  schema_cli.py compare semantic_event.json semantic_event.avsc
""")

    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    convert_parser = subparsers.add_parser("convert", help="Convert a single schema file")
    convert_parser.add_argument("input_file", help="Path to input schema file (.json or .avsc)")
    convert_parser.add_argument("--output", "-o", help="Path for output schema file (automatically determined if not provided)")
    convert_parser.add_argument("--schema-dir", "-d", help="Directory containing schema files for reference resolution")
    
    convert_dir_parser = subparsers.add_parser("convert-dir", help="Convert all schema files in a directory")
    convert_dir_parser.add_argument("directory", help="Directory containing schema files to convert")
    convert_dir_parser.add_argument("--schema-dir", "-d", help="Directory containing schema files for reference resolution")
    convert_dir_parser.add_argument("--pattern", "-p", default="*.json", help="File pattern to match (e.g., '*.json')")
    convert_dir_parser.add_argument("--recursive", "-r", action="store_true", help="Process directories recursively")
    convert_dir_parser.add_argument("--output-dir", "-o", help="Output directory (defaults to same as input)")
    
    compare_parser = subparsers.add_parser("compare", help="Compare two schemas")
    compare_parser.add_argument("schema1", help="First schema file")
    compare_parser.add_argument("schema2", help="Second schema file")
    compare_parser.add_argument("--output", "-o", help="Output file for comparison report (prints to console if not specified)")
    
    batch_compare_parser = subparsers.add_parser("batch-compare", help="Compare all schemas between two directories")
    batch_compare_parser.add_argument("--json-dir", default="json-schema", help="Directory with JSON Schema files")
    batch_compare_parser.add_argument("--avro-dir", default="avro", help="Directory with Avro Schema files")
    batch_compare_parser.add_argument("--schema-dir", "-d", help="Base directory containing schema directories (default: cxs-schema)")
    batch_compare_parser.add_argument("--output", "-o", help="Output file for comparison report (prints to console if not specified)")
    batch_compare_parser.add_argument("--convert-missing", "-c", action="store_true", help="Convert and save schemas that are missing in target directory")
    
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
        
    return args


def convert_single_file(args):
    """Convert a single schema file."""
    try:
        logger.info(f"Converting {args.input_file}...")
        
        output_file = convert_schema_file(
            input_file=args.input_file,
            output_file=args.output,
            schema_dir=args.schema_dir
        )
        
        logger.info(f"Successfully converted schema to {output_file}")
        logger.info(f"Conversion metadata added to output file")
        
        return True
        
    except Exception as e:
        logger.error(f"Error converting {args.input_file}: {str(e)}")
        if args.verbose:
            import traceback
            logger.error(traceback.format_exc())
        return False


def convert_directory(args):
    """Convert all schema files in a directory matching a pattern."""
    try:
        directory = Path(args.directory)
        if not directory.exists() or not directory.is_dir():
            logger.error(f"Directory not found: {args.directory}")
            return False
        
        output_dir = args.output_dir
        if output_dir:
            Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        if args.recursive:
            pattern = f"**/{args.pattern}"
        else:
            pattern = args.pattern
            
        files = list(directory.glob(pattern))
        if not files:
            logger.warning(f"No files found matching pattern '{args.pattern}' in {args.directory}")
            return False
        
        logger.info(f"Found {len(files)} files to convert")
        
        converter = SchemaConverter(args.schema_dir)
        
        success_count = 0
        for file_path in files:
            if file_path.is_file():
                if output_dir:
                    rel_path = file_path.relative_to(directory)
                    input_format = converter.detect_file_format(str(file_path))
                    
                    if input_format == 'json-schema':
                        output_ext = '.avsc'
                    else:
                        output_ext = '.json'
                        
                    output_file = Path(output_dir) / rel_path.with_suffix(output_ext)
                    
                    output_file.parent.mkdir(parents=True, exist_ok=True)
                else:
                    output_file = None
                
                try:
                    result = converter.convert_file(
                        input_file=str(file_path),
                        output_file=str(output_file) if output_file else None
                    )
                    logger.info(f"Converted {file_path} to {result}")
                    success_count += 1
                except Exception as e:
                    logger.error(f"Error converting {file_path}: {str(e)}")
                    if args.verbose:
                        import traceback
                        logger.error(traceback.format_exc())
        
        logger.info(f"Successfully converted {success_count} of {len(files)} schemas")
        return success_count > 0
        
    except Exception as e:
        logger.error(f"Error converting directory: {str(e)}")
        if args.verbose:
            import traceback
            logger.error(traceback.format_exc())
        return False


def compare_schemas(args):
    """Compare two schemas and report differences."""
    try:
        with open(args.schema1, 'r') as f:
            schema1 = json.load(f)
        
        with open(args.schema2, 'r') as f:
            schema2 = json.load(f)
        
        converter = SchemaConverter()
        format1 = converter.detect_file_format(args.schema1)
        format2 = converter.detect_file_format(args.schema2)
        
        if format1 != format2:
            logger.info(f"Converting schemas to same format for comparison...")
            if format1 == 'json-schema':
                schema1_converted = converter.json_schema_to_avro(schema1)
                schema2_converted = schema2
                compare_format = 'avro-schema'
            else:
                schema1_converted = schema1
                schema2_converted = converter.json_schema_to_avro(schema2)
                compare_format = 'avro-schema'
        else:
            schema1_converted = schema1
            schema2_converted = schema2
            compare_format = format1
            
        is_equivalent, diff = are_schemas_equivalent(schema1_converted, schema2_converted)
        
        if is_equivalent:
            result = {
                "equal": True,
                "message": "Schemas are equivalent"
            }
        else:
            result = {
                "equal": False,
                "message": "Schemas are different",
                "format": compare_format,
                "differences": diff
            }
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(result, f, indent=2)
            logger.info(f"Comparison results written to {args.output}")
        else:
            if result["equal"]:
                logger.info("✅ Schemas are equivalent")
            else:
                logger.info("❌ Schemas are different")
                if not HAS_DEEPDIFF:
                    logger.info("Install 'deepdiff' package for more detailed comparison")
                logger.info("Run with --output option for detailed comparison report")
        
        return True
    except Exception as e:
        logger.error(f"Error comparing schemas: {str(e)}")
        if hasattr(args, 'verbose') and args.verbose:
            import traceback
            logger.error(traceback.format_exc())
        return False


def batch_compare_schemas(args):
    """Compare all schemas between two directories."""
    try:
        schema_dir = args.schema_dir if args.schema_dir else "cxs-schema"
        json_schema_dir = os.path.join(schema_dir, args.json_dir)
        avro_schema_dir = os.path.join(schema_dir, args.avro_dir)
        
        for dir_path, dir_name in [(json_schema_dir, "JSON Schema"), (avro_schema_dir, "Avro Schema")]:
            if not os.path.exists(dir_path) or not os.path.isdir(dir_path):
                logger.error(f"{dir_name} directory not found: {dir_path}")
                return False
        
        converter = SchemaConverter(schema_dir)
        
        json_schemas = {}
        for file_name in os.listdir(json_schema_dir):
            if file_name.endswith('.json'):
                try:
                    file_path = os.path.join(json_schema_dir, file_name)
                    with open(file_path, 'r') as f:
                        schema = json.load(f)
                    name = normalize_name(file_name)
                    json_schemas[name] = {
                        "schema": schema,
                        "path": file_path
                    }
                except Exception as e:
                    logger.warning(f"Failed to load JSON Schema {file_name}: {str(e)}")
        
        avro_schemas = {}
        for file_name in os.listdir(avro_schema_dir):
            if file_name.endswith('.avsc'):
                try:
                    file_path = os.path.join(avro_schema_dir, file_name)
                    with open(file_path, 'r') as f:
                        schema = json.load(f)
                    name = normalize_name(file_name)
                    avro_schemas[name] = {
                        "schema": schema,
                        "path": file_path
                    }
                except Exception as e:
                    logger.warning(f"Failed to load Avro Schema {file_name}: {str(e)}")
        
        results = {
            "total": 0,
            "equivalent": 0,
            "different": 0,
            "missing_avro": 0,
            "missing_json": 0,
            "details": {}
        }
        
        logger.info(f"Comparing {len(json_schemas)} JSON schemas with {len(avro_schemas)} Avro schemas...")
        
        for name, json_data in json_schemas.items():
            results["total"] += 1
            json_schema = json_data["schema"]
            
            if name in avro_schemas:
                try:
                    converted_avro = converter.json_schema_to_avro(json_schema)
                    existing_avro = avro_schemas[name]["schema"]
                    
                    is_equivalent, diff = are_schemas_equivalent(converted_avro, existing_avro)
                    
                    if is_equivalent:
                        results["equivalent"] += 1
                        results["details"][name] = {
                            "status": "equivalent",
                            "message": "Converted schema matches existing schema",
                            "json_path": json_data["path"],
                            "avro_path": avro_schemas[name]["path"]
                        }
                    else:
                        results["different"] += 1
                        results["details"][name] = {
                            "status": "different",
                            "message": "Converted schema differs from existing schema",
                            "json_path": json_data["path"],
                            "avro_path": avro_schemas[name]["path"],
                            "differences": diff
                        }
                except Exception as e:
                    logger.error(f"Error comparing {name}: {str(e)}")
                    results["details"][name] = {
                        "status": "error",
                        "message": f"Error: {str(e)}",
                        "json_path": json_data["path"],
                        "avro_path": avro_schemas[name]["path"]
                    }
            else:
                results["missing_avro"] += 1
                
                if args.convert_missing:
                    try:
                        converted_avro = converter.json_schema_to_avro(json_schema)
                        output_path = os.path.join(avro_schema_dir, f"{name}.avsc")
                        with open(output_path, 'w') as f:
                            json.dump(converted_avro, f, indent=2)
                        
                        results["details"][name] = {
                            "status": "created",
                            "message": f"Created missing Avro schema at {output_path}",
                            "json_path": json_data["path"],
                            "avro_path": output_path
                        }
                    except Exception as e:
                        logger.error(f"Error creating missing schema for {name}: {str(e)}")
                        results["details"][name] = {
                            "status": "error",
                            "message": f"Error creating missing schema: {str(e)}",
                            "json_path": json_data["path"]
                        }
                else:
                    results["details"][name] = {
                        "status": "missing_avro",
                        "message": "No corresponding Avro schema found",
                        "json_path": json_data["path"]
                    }
        
        for name, avro_data in avro_schemas.items():
            if name not in json_schemas:
                results["total"] += 1
                results["missing_json"] += 1
                results["details"][name] = {
                    "status": "missing_json",
                    "message": "No corresponding JSON schema found",
                    "avro_path": avro_data["path"]
                }
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(results, f, indent=2)
            logger.info(f"Detailed comparison results written to {args.output}")
        
        logger.info("Comparison Summary:")
        logger.info(f"  Total schemas processed: {results['total']}")
        logger.info(f"  Equivalent schemas: {results['equivalent']}")
        logger.info(f"  Different schemas: {results['different']}")
        logger.info(f"  JSON schemas with no Avro counterpart: {results['missing_avro']}")
        logger.info(f"  Avro schemas with no JSON counterpart: {results['missing_json']}")
        
        return True
    except Exception as e:
        logger.error(f"Error in batch comparison: {str(e)}")
        if hasattr(args, 'verbose') and args.verbose:
            import traceback
            logger.error(traceback.format_exc())
        return False
        

def main():
    """Main entry point for the CLI."""
    args = parse_arguments()
    
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    if args.command == "convert":
        success = convert_single_file(args)
    elif args.command == "convert-dir":
        success = convert_directory(args)
    elif args.command == "compare":
        success = compare_schemas(args)
    elif args.command == "batch-compare":
        success = batch_compare_schemas(args)
    else:
        logger.error(f"Unknown command: {args.command}")
        success = False
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
