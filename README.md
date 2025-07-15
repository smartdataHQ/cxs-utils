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
## Virtual Environment
preferred version for python (python3.10)
```
python3.10 -m venv .venv
```
On Unix / macOS:
```
source .venv/bin/activate
```
On Windows (Command Prompt):
```
.venv\Scripts\activate.bat
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

## Schema Conversion and Comparison

### JSON Schema ↔ Avro Schema Conversion

The toolkit includes utilities to convert between JSON Schema and Avro Schema formats, with support for preserving schema references and logical types.

```bash
# Convert a single schema file
python -m cxs.tools.converter.schema_cli convert examples/semantic_event.json

# Convert an Avro schema to JSON Schema
python -m cxs.tools.converter.schema_cli convert examples/semantic_event.avsc

# Convert all schemas in a directory
python -m cxs.tools.converter.schema_cli convert-dir cxs-schema/json-schema --pattern "*.json"
```

### Schema Comparison

Compare schemas to identify functional differences while ignoring formatting variations:

```bash
# Batch compare all schemas between two directories
python -m cxs.tools.converter.schema_cli batch-compare --schema-dir ./cxs-schema
```

## Documentation & Core Concepts

Context Suite uses a semantic web inspired approach for entity identification and other advanced concepts.

For comprehensive developer documentation, including details on our GID_URL and Entity_GID system, see [DEVELOPER.md](./DEVELOPER.md#entity-identification-in-context-suite).
