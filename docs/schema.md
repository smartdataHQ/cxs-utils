# Database Schema

This document provides an overview of the ClickHouse database schema used by cxs-utils. Understanding the schema is crucial for effective data ingestion and querying.

The SQL schema definitions can be found in the `schema/sql/` directory.

## Main Tables

The core of the data storage revolves around the following tables:

*   **`entities`**: Stores information about various entities.
    *   Key columns: `gid` (Graph UUID), `gid_url`, `label`, `type`, `variant`.
    *   Contains nested structures for `content`, `media`, `embeddings`, `ids`, `classification`, and `location`.
    *   See `schema/sql/entities.sql` for full details.

*   **`data_points`**: Stores time series data. This is a multi-metric, multi-dimensional time series table.
    *   Key columns: `series_gid`, `entity_gid`, `timestamp`, `period`, `metrics`, `uom`.
    *   Includes various metadata fields for ownership, source, location, and dimensions.
    *   See `schema/sql/data_points.sql` for full details.

*   **`semantic_events`**: Stores semantic events, extending the Segment.com semantic event schema.
    *   Key columns: `entity_gid`, `timestamp`, `type`, `event`, `event_gid`.
    *   Contains detailed nested structures for `involves`, `sentiment`, `classification`, `location`, `entity_linking`, `contextual_awareness`, `commerce`, `analysis`, and `base_events`.
    *   Also includes fields for user identification (anonymous, user, session IDs), device information, campaign details, and page/referrer data.
    *   See `schema/sql/semantic_events.sql` for full details.

*   **`series`**: Defines and describes time series.
    *   Key columns: `gid`, `group_gid`, `label`, `slug`, `resolution`.
    *   Links to `metrics` and includes metadata about the series.
    *   See `schema/sql/series.sql` for full details.

*   **`metrics`**: Describes the metrics that can be reported in time series or events.
    *   Key columns: `gid`, `label`, `slug`, `uom`.
    *   See `schema/sql/metrics.sql` for full details.

*   **`uom`**: Defines standard Units of Measure (UOM) based on UN CEFACT Common Codes.
    *   Key columns: `code`, `label`, `symbol`, `description`.
    *   See `schema/sql/uom.sql` for full details.

## Relationships (Conceptual)

*   `data_points.series_gid` links to `series.gid`.
*   `data_points.entity_gid` links to `entities.gid`.
*   `data_points.metrics` (map keys) can conceptually link to `metrics.slug` or `metrics.label`.
*   `data_points.uom` (map keys) can conceptually link to `uom.code` or `uom.symbol`.
*   `semantic_events.entity_gid` links to `entities.gid`.
*   `semantic_events.involves.entity_gid` links to `entities.gid`.
*   `series.metrics.gid` links to `metrics.gid`.

## Schema Details

For the most accurate and detailed information on each table, including column types, default values, and engine configurations, please refer directly to the SQL files in the `schema/sql/` directory.

The schema is designed for ClickHouse and utilizes features like `LowCardinality`, `Nested` data structures, and `ReplacingMergeTree` engine for optimal performance and data management.
```
