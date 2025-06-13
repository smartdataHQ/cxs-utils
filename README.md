# Context Suite Utilities for Data Engineering 

Here you will find all tools you need to onboard/stream operational data into the Context Suite.

## Project Structure

The project has been reorganized for better usability:

```
cxs-utils/
├── cxs/                       # Main Python package
│   ├── core/                  # Core functionality
│   │   └── utils/             # Utility functions
│   ├── schema/                # Data schemas
│   │   └── pydantic/          # Pydantic models
│   └── tools/                 # Helper tools
│       └── validation/        # Schema validation tools
├── docs/                      # Documentation site
│   ├── components/            # React components for docs
│   ├── pages/                 # Documentation content
│   │   └── docs/              # Main documentation pages
│   └── public/                # Static assets
├── tests/                     # Test suite
│   ├── core/                  # Tests for core functionality  
│   └── schema/                # Tests for schema models
├── setup.py                   # Python package setup
├── requirements.txt           # Dependencies
└── .gitignore                 # Git ignore rules
```

## Installation

To install in development mode:

```bash
pip install -e .
```

## Usage

### Validating Pydantic Models

```bash
python -m cxs.tools.validation.validate_schemas
```

### Creating and Sending Events

```python
from datetime import datetime
import uuid
from cxs.schema.pydantic.semantic_event import SemanticEvent
from cxs.core.client.cxs_client import CXSClient

# Create a client with required write_key
client = CXSClient(write_key='your_write_key', endpoint='https://inbox.contextsuite.com/v1')

# Create a semantic event with required fields
event = SemanticEvent(
    event='Product Viewed',  # Descriptive past-tense name
    type='track',
    timestamp=datetime.now(),
    entity_gid=uuid.uuid4()
)

# Add entity involvement with proper role
event.involves.append({
    'role': 'Source',
    'entity_type': 'Product',
    'id': '12345',
    'label': 'Premium Headphones'
})

# Send the event (async method)
import asyncio
asyncio.run(client.track(event))
```

## ClickHouse Docker Setup

This repository includes Docker configuration for running ClickHouse locally:

```bash
# Start the ClickHouse Docker container
cd clickhouse
docker-compose up -d
```

### Import SQL Schemas

Use the import script to load all schemas into ClickHouse:

```bash
./clickhouse/scripts/import-sql.sh
```

### Important Notes

- The setup uses a single node cluster configuration (`clickhouse/config/single_node_cluster.xml`)
- When importing SQL schemas with LowCardinality data types (especially with Float32), use the `--allow_suspicious_low_cardinality_types=1` flag as a workaround to avoid ClickHouse exceptions

## Schema Conversion and Comparison

### JSON Schema ↔ Avro Schema Conversion

The toolkit includes utilities to convert between JSON Schema and Avro Schema formats, with support for preserving schema references and logical types.

```bash
# Convert a single schema file
python -m cxs.tools.converter.schema_cli convert semantic_event.json

# Convert an Avro schema to JSON Schema
python -m cxs.tools.converter.schema_cli convert semantic_event.avsc

# Convert all schemas in a directory
python -m cxs.tools.converter.schema_cli convert-dir ./json-schema --pattern "*.json"
```

### Schema Comparison

Compare schemas to identify functional differences while ignoring formatting variations:

```bash
# Compare two schemas
python -m cxs.tools.converter.schema_cli compare semantic_event.json semantic_event.avsc

# Batch compare all schemas between two directories
python -m cxs.tools.converter.schema_cli batch-compare --schema-dir ./cxs-schema
```

### JSON ↔ Avro Data Conversion

Convert between JSON data files and Avro binary files with support for logical types:

```bash
# Convert JSON to Avro binary
python -m cxs.tools.converter.avro_json_cli convert event.json

# Convert Avro binary to JSON
python -m cxs.tools.converter.avro_json_cli convert event.avro

# Batch convert all files in a directory
python -m cxs.tools.converter.avro_json_cli convert-dir ./data --pattern "*.json"
```

## Documentation & Core Concepts

Context Suite uses a semantic web inspired approach for entity identification and other advanced concepts.

For comprehensive developer documentation, including details on our GID_URL and Entity_GID system, see [DEVELOPER.md](./DEVELOPER.md#entity-identification-in-context-suite).
