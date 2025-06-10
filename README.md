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
from cxs.schema.pydantic.semantic_event import SemanticEvent
from cxs.core.client.cxs_client import CXSClient

# Create a client
client = CXSClient(endpoint='https://api.example.com')

# Create an event
event = SemanticEvent(
    name='example_event',
    type='track',
    source_name='example_source'
)

# Send the event
client.track(event)
```

## Documentation

For detailed developer information, see [DEVELOPER.md](./DEVELOPER.md)