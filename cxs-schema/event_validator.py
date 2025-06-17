import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union

from pydantic import BaseModel, ValidationError

from cxs.schema.pydantic.semantic_event import SemanticEvent
try:
    from sql_schema_parser import get_schema_info
except ImportError:
    from cxs_schema.sql_schema_parser import get_schema_info

logger = logging.getLogger(__name__)


class EventStructureValidator(BaseModel):
    
    errors: List[str] = []
    warnings: List[str] = []
    
    _schema_info = get_schema_info()
    
    required_fields: Set[str] = _schema_info['required_fields']
    
    nullable_fields: Set[str] = _schema_info['nullable_fields']
    
    field_types: Dict[str, str] = _schema_info['field_types']
    
    field_comments: Dict[str, str] = _schema_info['field_comments']
    
    def validate_event(self, event_data: Union[Dict[str, Any], str]) -> bool:
        self.errors = []
        self.warnings = []
        
        event = self._parse_input(event_data)
        if not event:
            return False

        try:
            SemanticEvent(**event)
        except ValidationError as e:
            self.errors.append(f"Schema validation error: {e}")
            return False
            
        self._validate_required_fields(event)
        self._validate_field_types(event)

        self._validate_unknown_fields(event)

        self._validate_property_order(event)
        self._validate_id_fields(event)
        self._validate_commerce_products(event)
            
        return len(self.errors) == 0
    
    def _parse_input(self, event_data: Union[Dict[str, Any], str]) -> Optional[Dict[str, Any]]:
        if isinstance(event_data, str):
            try:
                return json.loads(event_data)
            except json.JSONDecodeError as e:
                self.errors.append(f"Invalid JSON format: {str(e)}")
                return None
        return event_data
    
    def _validate_required_fields(self, event: Dict[str, Any]) -> None:
        for field in self.required_fields:
            if field not in event or event[field] is None:
                self.errors.append(f"Required field '{field}' is missing or null in the event.")
    
    def _validate_field_types(self, event: Dict[str, Any]) -> None:
        nested_fields = self._schema_info.get('nested_fields', set())
        
        for field_name, field_value in event.items():
            if field_name not in self.field_types or field_value is None:
                continue
                
            if (field_name in nested_fields or 
                isinstance(field_value, dict) or
                field_name in ['classification', 'context', 'commerce', 'properties', 'involves']):
                continue
                
            sql_type = self.field_types[field_name]
            
            if "String" in sql_type and not isinstance(field_value, str):
                if not (isinstance(field_value, (int, float)) and str(field_value)):
                    self.errors.append(f"Field '{field_name}' should be a string or convertible to string, got {type(field_value).__name__}")
                
            elif "Int" in sql_type and not isinstance(field_value, int):
                if not (isinstance(field_value, str) and field_value.isdigit()):
                    self.errors.append(f"Field '{field_name}' should be an integer or string digit, got {type(field_value).__name__}")
                
            elif "DateTime" in sql_type and not isinstance(field_value, str):
                self.errors.append(f"Field '{field_name}' should be a datetime string, got {type(field_value).__name__}")
                
    def _validate_property_order(self, event: Dict[str, Any]) -> None:
        first_properties = ['type', 'event', 'timestamp', 'entity_gid', 'event_gid']
        last_properties = ['source', 'source_info', 'partition', 'integration', 'analysis', 'message_id']
        
        event_keys = list(event.keys())
        expected_first_props = [p for p in first_properties if p in event_keys]
        actual_first_props = event_keys[:len(expected_first_props)]
        
        if expected_first_props != actual_first_props:
            self.warnings.append(
                f"For optimal readability, these properties should appear first and in this order: {', '.join(expected_first_props)}"
            )
        
        present_last_props = [prop for prop in last_properties if prop in event_keys]
        
        if present_last_props:
            expected_positions = range(len(event_keys) - len(present_last_props), len(event_keys))
            actual_positions = [event_keys.index(prop) for prop in present_last_props]
            
            if list(expected_positions) != sorted(actual_positions):
                self.warnings.append(
                    f"For optimal readability, these properties should appear last: {', '.join(present_last_props)}"
                )
    
    def _validate_id_fields(self, event: Dict[str, Any]) -> None:
        id_fields = [field for field in event.keys() 
                    if field.endswith('_id') and field != 'message_id']
        
        if 'involves' not in event:
            if id_fields:
                self.warnings.append(
                    f"Found {len(id_fields)} id fields at top level but missing 'involves' array. "
                    f"All *_id fields should be moved into 'involves' array with proper roles and entity types."
                )
            return
            
        if id_fields and isinstance(event.get('involves'), list):
            for field in id_fields:
                entity_type = field.replace('_id', '').capitalize()
                self.warnings.append(
                    f"Field '{field}' should be moved into the 'involves' array with proper "
                    f"role and entity_type='{entity_type}'"
                )
    
    def _validate_unknown_fields(self, event: Dict[str, Any]) -> None:
        known_fields = set(self.field_types.keys())
        known_fields.update(self._schema_info.get('all_required_fields', set()))
        known_fields.update(self.nullable_fields)
        nested_structures = self._schema_info.get('nested_structures', {})
        map_fields = self._schema_info.get('map_fields', set())
        
        standard_event_fields = {
            'type', 'event', 'timestamp', 'entity_gid', 'event_gid', 'properties', 
            'context', 'source_info', 'involves', 'classification', 'content', 
            'commerce', 'message_id', 'flags'
        }
        known_fields.update(standard_event_fields)
        
        standard_nested_fields = {
            'context': {'ip', 'locale', 'timezone'}, 
            'source_info': {'label', 'type'},
            'commerce': {'products', 'checkout_id', 'order_id', 'cart_id'}
        }
        
        products_fields = set()
        if 'commerce.products' in nested_structures:
            products_fields = set(nested_structures['commerce.products'])
        
        for field_name in event.keys():
            if field_name not in known_fields and field_name not in map_fields:
                self.warnings.append(f"Unknown field '{field_name}' is not defined in SQL schema")
        
        for field_name, field_value in event.items():
            if field_name in ['properties', 'content']:
                continue
                
            if field_name in map_fields:
                continue
                
            if isinstance(field_value, list) and field_name in nested_structures:
                self._validate_nested_structure(
                    event, 
                    field_name, 
                    set(nested_structures[field_name])
                )
            
            elif isinstance(field_value, dict):
                if field_name in standard_nested_fields:
                    allowed_keys = standard_nested_fields[field_name]
                    for key in field_value.keys():
                        if key not in allowed_keys and f"{field_name}.{key}" not in known_fields:
                            self.warnings.append(
                                f"Unknown field '{field_name}.{key}' is not defined in SQL schema"
                            )
    
    def _validate_nested_structure(self, event: Dict[str, Any], field_name: str, known_fields: Set[str]) -> None:
        if field_name in event and isinstance(event[field_name], list):
            items = event[field_name]
            for i, item in enumerate(items):
                if isinstance(item, dict):
                    for item_field in item.keys():
                        if item_field not in known_fields:
                            self.warnings.append(
                                f"Unknown field '{field_name}[{i}].{item_field}' is not defined in SQL schema"
                            )

    def _validate_commerce_products(self, event: Dict[str, Any]) -> None:
        if not event.get('event', '').lower().startswith(('product', 'commerce', 'order', 'cart')):
            return
            
        if 'commerce' not in event:
            self.warnings.append(
                "Commerce-related event should include 'commerce' object"
            )
            return
            
        commerce = event.get('commerce', {})
        
        if not isinstance(commerce, dict):
            return
            
        if 'products' not in commerce:
            self.warnings.append(
                "Commerce object should contain 'products' array for commerce-related events"
            )
        elif not isinstance(commerce.get('products'), list):
            self.warnings.append(
                "The 'commerce.products' field should be an array of product objects"
            )
    
    
    def get_report(self) -> str:
        if not self.errors and not self.warnings:
            return "✓ Validation passed! The event structure is compliant with schema."
            
        report = []
        
        if self.errors:
            report.append("❌ ERRORS:")
            for i, error in enumerate(self.errors, 1):
                report.append(f"  {i}. {error}")
        
        if self.warnings:
            report.append("⚠️ WARNINGS:")
            for i, warning in enumerate(self.warnings, 1):
                report.append(f"  {i}. {warning}")
                
        return "\n".join(report)


def validate_event(event_data: Union[Dict[str, Any], str]) -> Tuple[bool, List[str], List[str]]:
    validator = EventStructureValidator()
    is_valid = validator.validate_event(event_data)
    return is_valid, validator.errors, validator.warnings


def validate_event_file(file_path: Union[str, Path]) -> Tuple[bool, List[str], List[str]]:
    path = Path(file_path)
    try:
        with open(path, 'r') as f:
            data = json.load(f)
        return validate_event(data)
    except (json.JSONDecodeError, OSError) as e:
        return False, [f"Error reading/parsing file {path}: {str(e)}"], []


def validate_events_directory(directory_path: Union[str, Path]) -> Dict[str, Dict[str, Any]]:
    results = {}
    path = Path(directory_path)
    
    if not path.exists() or not path.is_dir():
        return {"error": f"Directory {directory_path} does not exist or is not a directory"}
    
    for json_file in path.glob("**/*.json"):
        is_valid, errors, warnings = validate_event_file(json_file)
        results[str(json_file)] = {
            "is_valid": is_valid,
            "errors": errors,
            "warnings": warnings
        }
    
    return results
