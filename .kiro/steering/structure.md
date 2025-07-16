# Project Structure

## Root Organization
```
cxs-utils/
├── cxs/                       # Main Python package
├── cxs-schema/                # Schema definitions (Avro, JSON Schema)
├── docs/                      # Next.js documentation website
├── tests/                     # Test suite
├── examples/                  # Example schemas and data
├── javascript/                # JavaScript utilities and integrations
├── plugins/                   # Plugin extensions
├── python/                    # Additional Python utilities
└── scripts/                   # Build and utility scripts
```

## Core Python Package (`cxs/`)
- **`core/`**: Core functionality and utilities
  - `client/`: CXS client implementation
  - `utils/`: Utility functions (event_utils, gid, schema_builder)
- **`schema/`**: Schema definitions and models
  - `pydantic/`: Pydantic models (base classes, entities, events)
- **`tools/`**: CLI tools and converters
  - `converter/`: Schema conversion utilities
  - `validation/`: Schema validation tools

## Schema Directory (`cxs-schema/`)
- **`avro/`**: Avro schema files (.avsc) - **Primary source of truth**
- **`json-schema/`**: JSON Schema files (.json) - Draft 2020-12
- Validation scripts for each format
- Event validator and SQL schema parser

## Documentation (`docs/`)
- **Next.js application** with TypeScript
- **`app/`**: App router structure with nested documentation
- **`components/`**: Reusable React components
- **`pages/docs/`**: Markdown documentation content
- **Markdoc** for content rendering

## Architecture Patterns

### Schema Hierarchy
1. **Avro schemas** are the authoritative source
2. **JSON schemas** derived from Avro with Draft 2020-12 compliance
3. **Pydantic models** generated/aligned with schema definitions

### Base Classes
- **`CXSBase`**: Extended base model with serialization handling
- **`CXSSchema`**: Schema base with None field omission
- **`ExtendableBaseModel`**: Dynamic model creation and field addition

### Entity Identification
- **GID_URL**: Semantic web-inspired entity URLs (authoritative location)
- **Entity_GID**: UUID derived from GID_URL using named UUID algorithm
- All `_gid` suffixed fields are calculated from meaningful URLs

### Naming Conventions
- **Files**: snake_case for Python, kebab-case for schemas
- **Classes**: PascalCase for Pydantic models
- **Fields**: snake_case for schema fields
- **Modules**: snake_case package structure

### Directory Patterns
- **Tests mirror source structure**: `tests/schema/` matches `cxs/schema/`
- **Schema files grouped by format**: Separate directories for each schema type
- **Tools as CLI modules**: Importable via `python -m cxs.tools.module`

## Key Files
- **`setup.py`**: Package configuration and dependencies
- **`README.md`**: Main project documentation
- **`DEVELOPER.md`**: Detailed developer guidance
- **Schema validation scripts** in each schema directory