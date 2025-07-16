# Technology Stack

## Python Environment
- **Python Version**: 3.10+ (preferred: python3.10)
- **Package Manager**: pip with setuptools
- **Virtual Environment**: Standard venv recommended

## Core Dependencies
- **Pydantic**: 2.10.5+ for data validation and schema models
- **FastAvro**: 1.9.1+ for Avro schema handling
- **JSONSchema**: 4.19.1+ for JSON schema validation
- **DeepDiff**: 6.3.1+ for schema comparison
- **Requests**: 2.28.1+ for HTTP client functionality
- **Aiohttp**: 3.9.1+ for async HTTP operations

## Documentation Stack
- **Framework**: Next.js 13.5.1 with TypeScript
- **Content**: Markdoc for documentation rendering
- **UI**: Radix UI components with Tailwind CSS
- **Search**: Algolia integration

## Schema Formats
- **Avro**: Primary source of truth for data structure
- **JSON Schema**: Draft 2020-12 specification
- **Pydantic**: Python models for validation and manipulation

## Common Commands

### Environment Setup
```bash
# Create virtual environment
python3.10 -m venv .venv

# Activate (Unix/macOS)
source .venv/bin/activate

# Activate (Windows)
.venv\Scripts\activate.bat

# Install in development mode
pip install -e .
```

### Schema Operations
```bash
# Validate Pydantic models
python -m cxs.tools.validation.validate_schemas

# Convert single schema
python -m cxs.tools.converter.schema_cli convert examples/semantic_event.json

# Convert directory of schemas
python -m cxs.tools.converter.schema_cli convert-dir cxs-schema/json-schema --pattern "*.json"

# Compare schemas
python -m cxs.tools.converter.schema_cli batch-compare --schema-dir ./cxs-schema
```

### Validation
```bash
# Validate Avro schemas
python cxs-schema/validate_avro_schemas.py

# Validate JSON schemas
python cxs-schema/validate_json_schemas.py
```

### Documentation
```bash
# Development server
cd docs && npm run dev

# Build documentation
cd docs && npm run build

# Start production server
cd docs && npm start
```

### Testing
```bash
# Run tests
python -m pytest tests/

# Run specific test module
python -m pytest tests/schema/test_pydantic_models.py
```