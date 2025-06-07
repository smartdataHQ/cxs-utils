# Data Ingestion

This document outlines the methods and formats for ingesting data into the Context Suite using cxs-utils.

## Supported Data Types

cxs-utils supports the ingestion of the following data types:

*   **Time Series Data:** For tracking measurements over time.
    *   Refer to the `data_points` and `series` table schemas.
*   **Entity Information:** For storing details about various entities.
    *   Refer to the `entities` table schema.
*   **Semantic Events:** For capturing events with rich contextual information.
    *   Refer to the `semantic_events` table schema.

## Data Formats

Data can be provided in the following formats:

*   **Avro:** Schema definitions are available in the `schema/avro/` directory.
*   **JSON Schema:** Schema definitions are available in the `schema/json-schema/` directory.
*   **SQL:** SQL table definitions are available in the `schema/sql/` directory. This is the primary format used by ClickHouse.

## Ingestion Process (General Outline)

While specific implementation details may vary, the general process for ingesting data involves:

1.  **Preparing your data:** Ensure your data conforms to one of the supported schemas (Avro, JSON Schema, or directly matches the SQL table structure).
2.  **Choosing an ingestion method:** (This section would ideally detail the specific tools or APIs provided by cxs-utils for ingestion. Since those are not defined in the current codebase, we'll keep it general).
    *   This could involve using a provided Python library (details to be added if available).
    *   Direct database insertion (e.g., using ClickHouse client tools for SQL data).
    *   Using a data pipeline or ETL process that outputs data in the required format.
3.  **Validating the data:** Ensure the data is correctly formatted and adheres to schema constraints before or during ingestion.
4.  **Monitoring ingestion:** Check logs or system metrics to confirm successful data ingestion.

## Examples

(This section will be populated with concrete examples once the ingestion tools/APIs are further defined or if example scripts are available in the repository.)

### Example: Ingesting Time Series Data (Conceptual)

```
// Conceptual representation - actual implementation depends on cxs-utils tools

// 1. Data in JSON format matching parts of the 'data_points' schema
data_point = {
  "series_gid": "uuid-for-metric-A",
  "entity_gid": "uuid-for-entity-X",
  "timestamp": "2023-10-26T10:00:00Z",
  "period": "PT1H",
  "metrics": {
    "temperature": 25.5,
    "humidity": 60.1
  },
  "uom": {
    "temperature": "CEL",
    "humidity": "PCT"
  }
  // ... other relevant fields
}

// 2. Use cxs-utils ingestion tool/library (hypothetical)
// cxs_ingest_client.submit_data_point(data_point)
```

### Note on Python Utilities

The `python/cxs/core/` directory suggests the presence of Python utilities. As these are developed or documented, specific instructions for their use in data ingestion will be added here.
```
