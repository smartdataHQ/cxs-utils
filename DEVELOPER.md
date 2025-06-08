# Developer Documentation

## Overview
This repository, "Context Suite Utilities for Data Engineering," provides a collection of tools, schemas, and libraries to facilitate the onboarding and streaming of operational data into the Context Suite. It aims to offer a centralized resource for developers working with Context Suite data integration.

## Repository Structure
The repository is organized as follows:

- **`/` (Root)**: Contains main README, this developer guide, and configuration files.
- **`cxs-schema/`**: Houses data schemas in various formats:
    - `avro/`: Apache Avro schemas (`.avsc` files). Includes a `README.md` and validation script.
    - `json-schema/`: JSON Schema definitions (`.json` files). Includes a `README.md` and validation script.
    - `pydantic/`: Pydantic models generated from the schemas. Includes validation scripts.
    - `sql/`: SQL table definitions (`.sql` files) related to the schemas. Includes a `README.md`.
- **`docs/`**: Contains a documentation website built with Next.js and Markdoc. This site likely serves as user-facing documentation for the schemas and tools.
    - `pages/docs/`: Contains the actual documentation content in Markdown.
- **`javascript/`**: Contains JavaScript/TypeScript code and related utilities.
    - `jitsu/`: Specific utilities or integrations related to Jitsu (a data collection platform).
- **`plugins/`**: Intended for plugins or extensions, currently includes an `ecommerce` plugin example.
- **`python/`**: Contains Python libraries and scripts.
    - `cxs/`: Core Python library for Context Suite, including client code and schema-related Pydantic models.

## Current Contents
The repository currently includes:

- **Data Schemas**: Comprehensive schemas for various data points, entities, and events in Avro and JSON Schema formats.
- **Pydantic Models**: Python Pydantic models auto-generated or corresponding to the defined schemas, useful for data validation and manipulation in Python applications.
- **SQL Definitions**: Basic SQL table structures corresponding to some of the core schemas.
- **Validation Scripts**: Python scripts to validate Avro schemas (`validate_avro_schemas.py`) and JSON schemas (`validate_json_schemas.py`), and Pydantic models (`validate_pydantic_models.py`).
- **Documentation Website**: A Next.js based website in `docs/` providing detailed information about schemas.
- **Jitsu Integration Example**: Basic JavaScript code under `javascript/jitsu/` demonstrating a Jitsu-related test or utility.
- **Python Library**: A Python library in `python/cxs/` for interacting with Context Suite, including schema handling.

## Future Direction
This section outlines the planned enhancements and future scope of this repository.
*(Note: This section requires input from the project maintainers for specific upcoming features, tools, or areas of development. Examples could include:)*
- *Expansion of schemas to cover more domains.*
- *Development of client libraries for other programming languages (e.g., Java, Go).*
- *More comprehensive CLI tools for schema management and data generation.*
- *Integration guides for more third-party platforms.*
- *Enhanced automated testing for all components.*

## Contributing
Contributions to this repository are welcome. Please refer to the `CONTRIBUTING.md` file (if available) for detailed guidelines on how to contribute. If such a file does not exist, general best practices apply:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes, including tests if applicable.
4. Ensure your code lints and tests pass.
5. Submit a pull request with a clear description of your changes.
