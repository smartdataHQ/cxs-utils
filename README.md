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
│           ├── data_quality.py       # Data quality validation framework
│           ├── timeseries_validators.py  # Timeseries-specific validators
│           └── timeseries_validation.py  # Validation pipelines and utilities
├── tests/                     # Test suite
│   ├── core/                  # Tests for core functionality  
│   └── schema/                # Tests for schema models
│       └── test_timeseries_validation.py  # Tests for timeseries validation
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

### Timeseries Data Validation

```python
from cxs.schema.pydantic.timeseries import TimeSeries, DataPoint
from cxs.tools.validation.timeseries_validation import validate_timeseries, generate_validation_summary

# Create a timeseries with datapoints
timeseries = TimeSeries(
    name="Equipment Temperature",
    owner="system",
    # other required fields...
)

# Add datapoints
timeseries.datapoints = [
    DataPoint(timestamp="2025-06-01T12:00:00Z", value=25.5, signature="system"),
    DataPoint(timestamp="2025-06-01T12:05:00Z", value=26.0, signature="system"),
    # more datapoints...
]

# Validate the timeseries and its datapoints
validation_results = validate_timeseries(timeseries)

# Generate a summary of validation results
summary = generate_validation_summary(validation_results)

# Check if the data is valid
if summary["overall_valid"]:
    print("Timeseries data is valid")
else:
    print(f"Found {summary['error_count']} errors and {summary['warning_count']} warnings")
    for issue in summary["issues"]:
        print(f"{issue['severity']}: {issue['message']}")
```

## Documentation

For detailed developer information, see [DEVELOPER.md](./DEVELOPER.md)