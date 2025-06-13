import os
import sys
import json
import argparse
import logging
from pathlib import Path
from typing import Dict, Any, List, Set, Tuple
from deepdiff import DeepDiff

from .schema_converter import SchemaConverter

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("schema-compare")


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
    cleaned1 = clean_for_comparison(schema1)
    cleaned2 = clean_for_comparison(schema2)
    
    exclude_paths = {
        "root['doc']",
        "root['namespace']",
        "root['_conversion']",
        "type_changes",
    }
    
    diff = DeepDiff(cleaned1, cleaned2, ignore_order=True)
    
    filtered_diff = {}
    for diff_type, changes in diff.items():
        if diff_type in exclude_paths:
            continue
            
        if isinstance(changes, dict):
            filtered_changes = {k: v for k, v in changes.items() 
                              if not any(k.startswith(path) for path in exclude_paths)}
            if filtered_changes:
                filtered_diff[diff_type] = filtered_changes
        else:
            filtered_diff[diff_type] = changes
    
    return (len(filtered_diff) == 0, filtered_diff)


def compare_schemas(json_schema_dir: str, avro_schema_dir: str, output_file: str = None) -> Dict:
    converter = SchemaConverter()
    
    json_schemas = {}
    avro_schemas = {}
    
    for file_name in os.listdir(json_schema_dir):
        if file_name.endswith('.json'):
            try:
                with open(os.path.join(json_schema_dir, file_name), 'r') as f:
                    schema = json.load(f)
                    name = normalize_name(file_name)
                    json_schemas[name] = schema
            except Exception as e:
                logger.warning(f"Failed to load JSON Schema {file_name}: {str(e)}")
    
    for file_name in os.listdir(avro_schema_dir):
        if file_name.endswith('.avsc'):
            try:
                with open(os.path.join(avro_schema_dir, file_name), 'r') as f:
                    schema = json.load(f)
                    name = normalize_name(file_name)
                    avro_schemas[name] = schema
            except Exception as e:
                logger.warning(f"Failed to load Avro Schema {file_name}: {str(e)}")
    
    results = {
        "total": 0,
        "equivalent": 0,
        "different": 0,
        "missing": 0,
        "details": {}
    }
    
    for name, json_schema in json_schemas.items():
        results["total"] += 1
        
        try:
            converted_avro = converter.json_schema_to_avro(json_schema)
            
            if name in avro_schemas:
                existing_avro = avro_schemas[name]
                
                is_equivalent, diff = are_schemas_equivalent(converted_avro, existing_avro)
                
                if is_equivalent:
                    results["equivalent"] += 1
                    results["details"][name] = {
                        "status": "equivalent",
                        "message": "Schemas are functionally equivalent"
                    }
                else:
                    results["different"] += 1
                    results["details"][name] = {
                        "status": "different",
                        "message": "Schemas have functional differences",
                        "differences": diff
                    }
            else:
                results["missing"] += 1
                results["details"][name] = {
                    "status": "missing",
                    "message": f"No corresponding Avro schema found for {name}"
                }
        except Exception as e:
            logger.error(f"Error converting {name}: {str(e)}")
            results["details"][name] = {
                "status": "error",
                "message": f"Error: {str(e)}"
            }
    
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
    
    return results


def main():
    parser = argparse.ArgumentParser(
        description="Compare JSON schemas with their corresponding Avro schemas",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument("--schema-dir", "-d", default="cxs-schema",
                        help="Directory containing schema files (default: cxs-schema)")
    parser.add_argument("--output", "-o",
                        help="Output file for comparison results (prints to console if not specified)")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Enable verbose output")
    
    args = parser.parse_args()
    
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    json_schema_dir = os.path.join(args.schema_dir, "json-schema")
    avro_schema_dir = os.path.join(args.schema_dir, "avro")
    
    if not os.path.exists(json_schema_dir):
        logger.error(f"JSON Schema directory not found: {json_schema_dir}")
        return 1
        
    if not os.path.exists(avro_schema_dir):
        logger.error(f"Avro Schema directory not found: {avro_schema_dir}")
        return 1
    
    logger.info(f"Comparing JSON schemas in {json_schema_dir} with Avro schemas in {avro_schema_dir}...")
    results = compare_schemas(json_schema_dir, avro_schema_dir, args.output)
    
    logger.info(f"Comparison complete. Summary:")
    logger.info(f"  Total schemas: {results['total']}")
    logger.info(f"  Equivalent: {results['equivalent']}")
    logger.info(f"  Different: {results['different']}")
    logger.info(f"  Missing: {results['missing']}")
    
    if results["output_file"]:
        logger.info(f"Detailed results written to {results['output_file']}")
    
    return 0 if results["different"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
