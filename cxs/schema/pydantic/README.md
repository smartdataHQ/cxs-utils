# Pydantic Models for ContextSuite

This directory contains Pydantic models that are used within ContextSuite applications for data validation, serialization, and settings management. These models provide a Python-native way to define and work with structured data.

## Validation

The Pydantic library itself performs validation when models are defined and when data is parsed into these models. However, to ensure that all model definitions within this directory are syntactically correct and adhere to Pydantic's requirements, a validation script is provided.

To validate all Pydantic models in this directory, run the following command from the `cxs-schema` directory:

```bash
python validate_pydantic_models.py
```

This script will attempt to import each Python file (excluding `__init__.py` and `test_*.py` files) in this directory. If a file contains Pydantic models with definition errors (e.g., invalid type annotations, incorrect validator usage), the script will report an error for that file.
