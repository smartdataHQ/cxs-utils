import json
import os
import logging
import re
from typing import Dict, Any, List, Union, Optional, Tuple
from pathlib import Path
from datetime import datetime

__version__ = "0.1.0"

logger = logging.getLogger(__name__)

class SchemaConverter:
    def __init__(self, schema_dir: Optional[str] = None):
        self.schema_dir = schema_dir
        self.json_schema_refs = {}
        self.avro_schema_refs = {}
        
        if schema_dir:
            self._load_schema_refs(schema_dir)
    
    def _load_schema_refs(self, schema_dir: str) -> None:
        """
        Load all schema references from the given directory.
        
        Args:
            schema_dir: Directory containing schema files
        """
        json_schema_path = os.path.join(schema_dir, 'json-schema')
        if os.path.exists(json_schema_path):
            for file_name in os.listdir(json_schema_path):
                if file_name.endswith('.json'):
                    full_path = os.path.join(json_schema_path, file_name)
                    try:
                        with open(full_path, 'r') as f:
                            schema = json.load(f)
                            name = file_name.replace('.json', '')
                            self.json_schema_refs[name] = schema
                    except Exception as e:
                        logger.warning(f"Failed to load JSON Schema {file_name}: {str(e)}")
        
        avro_schema_path = os.path.join(schema_dir, 'avro')
        if os.path.exists(avro_schema_path):
            for file_name in os.listdir(avro_schema_path):
                if file_name.endswith('.avsc'):
                    full_path = os.path.join(avro_schema_path, file_name)
                    try:
                        with open(full_path, 'r') as f:
                            schema = json.load(f)
                            name = file_name.replace('.avsc', '')
                            self.avro_schema_refs[name] = schema
                    except Exception as e:
                        logger.warning(f"Failed to load Avro Schema {file_name}: {str(e)}")
    
    def json_schema_to_avro(self, json_schema: Dict[str, Any], namespace: str = "com.contextsuite.schema") -> Dict[str, Any]:
        schema_name = json_schema.get("title", "ConvertedSchema")
        schema_name = self._make_valid_avro_name(schema_name)
        
        avro_schema = {
            "type": "record",
            "name": schema_name,
            "namespace": namespace,
        }
        
        if "description" in json_schema:
            avro_schema["doc"] = json_schema["description"]
        
        avro_schema["_conversion"] = {
            "source": "json-schema",
            "converter": f"SchemaConverter v{__version__}",
            "convertedAt": datetime.now().isoformat()
        }
        
        fields = []
        
        if "properties" in json_schema:
            required_props = json_schema.get("required", [])
            
            for prop_name, prop_schema in json_schema["properties"].items():
                field = {
                    "name": self._make_valid_avro_name(prop_name)
                }
                
                if prop_name in required_props:
                    field_type = self._convert_json_type_to_avro(prop_schema)
                else:
                    field_type = ["null", self._convert_json_type_to_avro(prop_schema)]
                
                field["type"] = field_type
                
                if "description" in prop_schema:
                    field["doc"] = prop_schema["description"]
                
                if "default" in prop_schema:
                    field["default"] = prop_schema["default"]
                elif prop_name not in required_props:
                    field["default"] = None
                    
                fields.append(field)
        
        avro_schema["fields"] = fields
        
        return avro_schema
    
    def _convert_json_type_to_avro(self, json_prop: Dict[str, Any]) -> Union[str, Dict, List]:
        json_type = json_prop.get("type")
        
        if "$ref" in json_prop:
            ref = json_prop["$ref"]
            if ref.startswith("#/definitions/"):
                ref_name = ref.split("/")[-1]
                return {"type": "record", "name": ref_name, "fields": []}
            elif "json-schema" in ref:
                ref_parts = ref.split("/")
                ref_name = ref_parts[-1].replace(".json", "")
                return ref_name
            else:
                return {"type": "string", "doc": f"Unresolved reference: {ref}"}
        
        if "enum" in json_prop:
            return {
                "type": "enum",
                "name": "Enum" + str(hash(str(json_prop["enum"])))[1:8],
                "symbols": json_prop["enum"]
            }
        
        if "oneOf" in json_prop or "anyOf" in json_prop:
            types = json_prop.get("oneOf", json_prop.get("anyOf", []))
            return [self._convert_json_type_to_avro(t) for t in types]
        
        if "allOf" in json_prop:
            return {
                "type": "record",
                "name": "AllOf" + str(hash(str(json_prop["allOf"])))[1:8],
                "fields": [],
                "doc": "This represents a merged schema from allOf in JSON Schema"
            }
            
        if not json_type:
            return "string"
            
        if isinstance(json_type, list):
            return [self._convert_json_type_to_avro({"type": t}) for t in json_type]
        
        if json_type == "string":
            format_type = json_prop.get("format")
            if format_type == "date-time":
                return {"type": "long", "logicalType": "timestamp-micros"}
            elif format_type == "date":
                return {"type": "int", "logicalType": "date"}
            elif format_type == "time":
                return {"type": "int", "logicalType": "time-millis"}
            elif format_type == "uuid":
                return {"type": "string", "logicalType": "uuid"}
            elif format_type == "email":
                return {"type": "string", "doc": "Email address"}
            else:
                return "string"
                
        elif json_type == "integer":
            return "int"
            
        elif json_type == "number":
            return "double"
            
        elif json_type == "boolean":
            return "boolean"
            
        elif json_type == "null":
            return "null"
            
        elif json_type == "array":
            items = json_prop.get("items", {"type": "string"})
            return {
                "type": "array",
                "items": self._convert_json_type_to_avro(items)
            }
            
        elif json_type == "object":
            if "properties" in json_prop:
                name = "Object" + str(hash(str(json_prop["properties"])))[1:8]
                nested_schema = self.json_schema_to_avro(
                    json_prop, 
                    namespace="com.contextsuite.schema.nested"
                )
                nested_schema["name"] = name
                return nested_schema
            else:
                return {
                    "type": "map",
                    "values": "string"
                }
        
        return "string"
    
    def _make_valid_avro_name(self, name: str) -> str:
        name = re.sub(r'[^a-zA-Z0-9_]', '', name)
        
        if name and not re.match(r'^[a-zA-Z_]', name):
            name = '_' + name
            
        if not name:
            name = "Schema"
            
        return name
    
    def avro_to_json_schema(self, avro_schema: Dict[str, Any], draft_version: str = "2020-12") -> Dict[str, Any]:
        json_schema = {
            "$schema": f"https://json-schema.org/draft/{draft_version}/schema",
            "title": avro_schema.get("name", "ConvertedSchema"),
            "type": "object"
        }
        
        if "doc" in avro_schema:
            json_schema["description"] = avro_schema["doc"]
        
        json_schema["_conversion"] = {
            "source": "avro-schema",
            "converter": f"SchemaConverter v{__version__}",
            "convertedAt": datetime.now().isoformat()
        }
        
        avro_type = avro_schema.get("type")
        
        if avro_type == "record":
            properties = {}
            required = []
            
            for field in avro_schema.get("fields", []):
                field_name = field["name"]
                field_type = field["type"]
                
                is_required = True
                
                if isinstance(field_type, list) and "null" in field_type:
                    is_required = False
                    field_type = [t for t in field_type if t != "null"][0] if len(field_type) > 1 else "string"
                
                prop_schema = self._convert_avro_type_to_json(field_type)
                
                if "doc" in field:
                    prop_schema["description"] = field["doc"]
                
                if "default" in field and field["default"] is not None:
                    prop_schema["default"] = field["default"]
                
                properties[field_name] = prop_schema
                
                if is_required:
                    required.append(field_name)
            
            json_schema["properties"] = properties
            
            if required:
                json_schema["required"] = required
                
            json_schema["additionalProperties"] = False
            
        elif avro_type == "enum":
            json_schema["type"] = "string"
            json_schema["enum"] = avro_schema.get("symbols", [])
            
        elif avro_type == "array":
            json_schema["type"] = "array"
            json_schema["items"] = self._convert_avro_type_to_json(avro_schema.get("items", "string"))
            
        elif avro_type == "map":
            json_schema["type"] = "object"
            json_schema["additionalProperties"] = self._convert_avro_type_to_json(avro_schema.get("values", "string"))
            
        elif avro_type == "fixed":
            json_schema["type"] = "string"
            json_schema["contentEncoding"] = "base64"
            if "size" in avro_schema:
                json_schema["contentMediaType"] = "application/octet-stream"
                json_schema["description"] = f"Binary data with fixed size of {avro_schema['size']} bytes"
        
        elif isinstance(avro_type, str) and avro_type in ["string", "boolean", "int", "long", "float", "double", "bytes", "null"]:
            converted_schema = self._convert_avro_type_to_json(avro_type)
            
            if "title" in json_schema:
                converted_schema["title"] = json_schema["title"]
            if "description" in json_schema:
                converted_schema["description"] = json_schema["description"]
            if "_conversion" in json_schema:
                converted_schema["_conversion"] = json_schema["_conversion"]
                
            json_schema = converted_schema
        
        elif isinstance(avro_type, list):
            non_null_types = [t for t in avro_type if t != "null"]
            if "null" in avro_type and len(non_null_types) == 1:
                json_schema.update(self._convert_avro_type_to_json(non_null_types[0]))
            else:
                json_schema["oneOf"] = [self._convert_avro_type_to_json(t) for t in avro_type]
        
        return json_schema
    
    def _convert_avro_type_to_json(self, avro_type: Union[str, Dict, List]) -> Dict[str, Any]:
        if isinstance(avro_type, str):
            if avro_type == "string":
                return {"type": "string"}
            elif avro_type == "boolean":
                return {"type": "boolean"}
            elif avro_type in ["int", "long"]:
                return {"type": "integer"}
            elif avro_type in ["float", "double"]:
                return {"type": "number"}
            elif avro_type == "bytes":
                return {"type": "string", "contentEncoding": "base64"}
            elif avro_type == "null":
                return {"type": "null"}
            else:
                return {"type": "string"}
        
        if isinstance(avro_type, dict):
            if avro_type.get("type") == "array":
                return {
                    "type": "array",
                    "items": self._convert_avro_type_to_json(avro_type.get("items", "string"))
                }
                
            elif avro_type.get("type") == "map":
                return {
                    "type": "object",
                    "additionalProperties": self._convert_avro_type_to_json(avro_type.get("values", "string"))
                }
                
            elif avro_type.get("type") == "enum":
                return {
                    "type": "string",
                    "enum": avro_type.get("symbols", [])
                }
                
            elif avro_type.get("type") == "fixed":
                result = {
                    "type": "string",
                    "contentEncoding": "base64"
                }
                if "size" in avro_type:
                    result["description"] = f"Binary data with fixed size of {avro_type['size']} bytes"
                return result
                
            elif avro_type.get("type") == "record":
                result = {
                    "type": "object",
                    "properties": {},
                    "additionalProperties": False
                }
                
                if "name" in avro_type:
                    result["title"] = avro_type["name"]
                if "doc" in avro_type:
                    result["description"] = avro_type["doc"]
                    
                required = []
                for field in avro_type.get("fields", []):
                    field_name = field["name"]
                    field_type = field["type"]
                    
                    is_required = True
                    if isinstance(field_type, list) and "null" in field_type:
                        is_required = False
                        field_type = [t for t in field_type if t != "null"][0] if len(field_type) > 1 else "string"
                    
                    prop_schema = self._convert_avro_type_to_json(field_type)
                    
                    if "doc" in field:
                        prop_schema["description"] = field["doc"]
                        
                    if "default" in field and field["default"] is not None:
                        prop_schema["default"] = field["default"]
                        
                    result["properties"][field_name] = prop_schema
                    
                    if is_required:
                        required.append(field_name)
                
                if required:
                    result["required"] = required
                    
                return result
                
            logical_type = avro_type.get("logicalType")
            base_type = avro_type.get("type")
            
            if logical_type == "timestamp-micros" or logical_type == "timestamp-millis":
                return {"type": "string", "format": "date-time"}
                
            elif logical_type == "date":
                return {"type": "string", "format": "date"}
                
            elif logical_type == "time-micros" or logical_type == "time-millis":
                return {"type": "string", "format": "time"}
                
            elif logical_type == "uuid":
                return {"type": "string", "format": "uuid"}
                
            elif logical_type == "decimal":
                result = {"type": "string"}
                if "precision" in avro_type:
                    result["description"] = f"Decimal with precision {avro_type.get('precision')}"
                    if "scale" in avro_type:
                        result["description"] += f" and scale {avro_type.get('scale')}"
                return result
                
            return self._convert_avro_type_to_json(base_type)
        
        if isinstance(avro_type, list):
            types = [self._convert_avro_type_to_json(t) for t in avro_type]
            return {"oneOf": types}
    
    def convert_file(self, input_file: str, output_file: Optional[str] = None) -> str:
        """
        Convert a schema file between JSON Schema and Avro Schema formats.
        
        Args:
            input_file: Path to the input schema file
            output_file: Path to the output schema file (auto-generated if None)
            
        Returns:
            Path to the output file
        """
        if not os.path.exists(input_file):
            raise FileNotFoundError(f"Input file not found: {input_file}")
        
        input_format = self.detect_file_format(input_file)
        
        with open(input_file, 'r') as f:
            input_schema = json.load(f)
        
        if input_format == 'json-schema':
            output_schema = self.json_schema_to_avro(input_schema)
            output_format = 'avro'
            default_ext = '.avsc'
        else: 
            output_schema = self.avro_to_json_schema(input_schema)
            output_format = 'json-schema'
            default_ext = '.json'
        
        if not output_file:
            base_name = os.path.splitext(os.path.basename(input_file))[0]
            output_dir = os.path.dirname(input_file)
            output_file = os.path.join(output_dir, f"{base_name}_converted{default_ext}")
        
        with open(output_file, 'w') as f:
            json.dump(output_schema, f, indent=2)
        
        logger.info(f"Converted {input_format} to {output_format}: {output_file}")
        return output_file
    
    def detect_file_format(self, file_path: str) -> str:
        """
        Detect if a file contains a JSON Schema or an Avro Schema.
        
        Args:
            file_path: Path to the schema file
            
        Returns:
            'json-schema' or 'avro-schema'
        """
        if file_path.endswith('.avsc'):
            return 'avro-schema'
        elif file_path.endswith('.json'):
            try:
                with open(file_path, 'r') as f:
                    schema = json.load(f)
                
                if "type" in schema and schema.get("type") in ["record", "enum", "array", "map", "fixed"]:
                    if "name" in schema or "namespace" in schema:
                        return 'avro-schema'
                
                if "$schema" in schema or ("properties" in schema and schema.get("type") == "object"):
                    return 'json-schema'
                    
                if "fields" in schema and isinstance(schema.get("fields"), list):
                    return 'avro-schema'
                elif "required" in schema and isinstance(schema.get("required"), list):
                    return 'json-schema'
                
            except Exception as e:
                logger.warning(f"Error detecting schema type: {str(e)}")
        
        logger.warning(f"Could not definitively detect schema type for {file_path}, defaulting to JSON Schema")
        return 'json-schema'


# Convenience functions
def json_schema_to_avro_schema(json_schema: Dict[str, Any], namespace: str = "com.contextsuite.schema") -> Dict[str, Any]:
    """
    Convert a JSON Schema object to an Avro Schema object.
    
    Args:
        json_schema: The JSON Schema to convert
        namespace: The Avro namespace to use
        
    Returns:
        The converted Avro Schema
    """
    converter = SchemaConverter()
    return converter.json_schema_to_avro(json_schema, namespace)


def avro_schema_to_json_schema(avro_schema: Dict[str, Any], draft_version: str = "2020-12") -> Dict[str, Any]:
    """
    Convert an Avro Schema object to a JSON Schema object.
    
    Args:
        avro_schema: The Avro Schema to convert
        draft_version: The JSON Schema draft version to target
        
    Returns:
        The converted JSON Schema
    """
    converter = SchemaConverter()
    return converter.avro_to_json_schema(avro_schema, draft_version)


def convert_schema_file(input_file: str, output_file: Optional[str] = None, schema_dir: Optional[str] = None) -> str:
    """
    Convert a schema file between JSON Schema and Avro Schema formats.
    
    Args:
        input_file: Path to the input schema file
        output_file: Path to the output schema file (auto-generated if None)
        schema_dir: Optional directory containing schema files for reference resolution
        
    Returns:
        Path to the output file
    """
    converter = SchemaConverter(schema_dir)
    return converter.convert_file(input_file, output_file)
