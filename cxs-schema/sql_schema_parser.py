import re
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple, Any


def parse_sql_schema(file_path: str) -> Dict[str, Any]:
    with open(file_path, 'r') as f:
        sql_content = f.read()
    
    table_content_match = re.search(r'CREATE TABLE[^(]*\((.*?)\)[^)]*ENGINE', sql_content, re.DOTALL)
    if not table_content_match:
        raise ValueError("Could not find CREATE TABLE statement in SQL file")
    
    table_content = table_content_match.group(1)
    
    # Extract field definitions with proper nesting support
    field_defs = []
    nested_level = 0
    current_field = []
    
    for line in table_content.split('\n'):
        line = line.strip()
        if not line or line.startswith('--'):
            continue
            
        # Count opening and closing parentheses for proper nesting tracking
        nested_level += line.count('(') - line.count(')')
        
        current_field.append(line)
        
        # Only finish a field definition when we're back at the root level
        # and the line ends with a comma or has a closing parenthesis
        if nested_level == 0 and (line.endswith(',') or ')' in line):
            field_defs.append(' '.join(current_field))
            current_field = []
    
    all_required_fields = set()
    nullable_fields = set()
    field_types = {}
    field_comments = {}
    nested_fields = set()
    nested_structures = {}
    map_fields = set()
    
    nested_field_pattern = re.compile(r'`([^`]+)`\s+(Nullable\()?([^,\)\s]+)(\))?,\s*--\s*(.+?)$', re.MULTILINE)

    for field_def in field_defs:
        if ' Nested(' in field_def:
            nested_name_match = re.search(r'`([^`]+)`\s+Nested\(', field_def)
            if nested_name_match:
                parent_field = nested_name_match.group(1)
                
                nested_match = re.search(r'Nested\(\s*\n?(.*?)\s*\n?\)', field_def, re.DOTALL)
                if nested_match:
                    nested_content = nested_match.group(1)
                    nested_fields_list = []
                    
                    for nested_line in nested_content.split('\n'):
                        nested_line = nested_line.strip()
                        if not nested_line or nested_line.startswith('--'):
                            continue
                            
                        nested_field_match = re.search(r'`([^`]+)`', nested_line)
                        if nested_field_match:
                            nested_field_name = nested_field_match.group(1)
                            nested_fields.add(nested_field_name)
                            nested_fields_list.append(nested_field_name)
                            
                            field_type_match = re.search(r'`[^`]+`\s+(Nullable\()?([^,\)\s]+)(\))?', nested_line)
                            if field_type_match:
                                is_nullable = field_type_match.group(1) is not None
                                field_type = field_type_match.group(2)
                                
                                if parent_field == 'commerce':
                                    full_field_name = f"{parent_field}.products.{nested_field_name}"
                                else:    
                                    full_field_name = f"{parent_field}.{nested_field_name}"
                                    
                                field_types[full_field_name] = field_type
                                
                                comment_match = re.search(r'--\s*(.+?)$', nested_line)
                                comment = comment_match.group(1).strip() if comment_match else ""
                                
                                field_comments[full_field_name] = comment
                                
                                if is_nullable:
                                    nullable_fields.add(full_field_name)
                                else:
                                    all_required_fields.add(full_field_name)
                    
                    if parent_field == 'commerce':
                        nested_structures['commerce.products'] = nested_fields_list
                    else:
                        nested_structures[parent_field] = nested_fields_list
        
        elif ' Map(' in field_def:
            map_match = re.search(r'`([^`]+)`\s+Map\(', field_def)
            if map_match:
                map_field = map_match.group(1)
                map_fields.add(map_field)
                field_types[map_field] = 'Map'
    
    for field_def in field_defs:
        if ' Nested(' in field_def:
            continue
            
        field_match = re.match(r'`([^`]+)`\s+(Nullable\()?([^,)]+)(\))?(.*)', field_def)
        if field_match:
            field_name = field_match.group(1)
            is_nullable = field_match.group(2) is not None
            field_type = field_match.group(3)
            
            comment_match = re.search(r'--\s*(.*?)$', field_def)
            comment = comment_match.group(1).strip() if comment_match else ""
            
            field_types[field_name] = field_type
            field_comments[field_name] = comment
            
            if is_nullable:
                nullable_fields.add(field_name)
            else:
                all_required_fields.add(field_name)
    
    root_required_fields = set([
        'type',
        'event',
        'timestamp',
        'entity_gid',
        'event_gid',
    ])
    
    return {
        'required_fields': root_required_fields,
        'all_required_fields': all_required_fields,
        'nested_fields': nested_fields,
        'nullable_fields': nullable_fields,
        'field_types': field_types,
        'field_comments': field_comments,
        'nested_structures': nested_structures,
        'map_fields': map_fields
    }


def get_schema_info(schema_path: Optional[str] = None) -> Dict[str, Any]:
    if schema_path is None:
        current_dir = Path(__file__).parent
        schema_path = str(current_dir / "sql" / "semantic_events.sql")
    
    return parse_sql_schema(schema_path)
