-- SQL script for setting up the Timeseries database in ClickHouse
-- This script creates the `data_points` table with the necessary columns and configurations
-- This is a multi-metric, multi-dimensional timeseries table

CREATE TABLE IF NOT EXISTS data_points (
    -- Timeseries and the entity reported on
    `series_gid`                    LowCardinality(UUID),                                     -- the gid of the metric that this datapoint belongs to. Links to an Entity
    `entity_gid`                    LowCardinality(UUID),                                     -- GID for the entity that the datapoint belongs to. Links to an Entity
    `entity_gid_url`                LowCardinality(String),                                   -- GID URL for the entity that the datapoint belongs to. Links to an Entity

    -- Primary Location of the entity reported on
    `geohash`                       LowCardinality(String),                                   -- Geolocation as a geohash (for clustering and sorting) - moves for non-stationary entities

    -- Reporting period/intervals
    `period`                        LowCardinality(String),                                   -- The resolution/frequency of the data iso 8691 format (e.g., 'PT1H' for hourly, 'P1D' for daily, 'P1M' for monthly, etc.)
    `timestamp`                     DateTime,                                                 -- The calendar date and time (Hourly interval) (UTC) at the start of the period for which the data is reported. This is the timestamp of the datapoint, not the time it was ingested.

    -- Ownership and Source
    `owner_gid`                     LowCardinality(UUID),                                     -- the gid of the owner that this datapoint belongs to. Links to an Entity
    `source_gid`                    LowCardinality(UUID),                                     -- the gid of the source that this datapoint belongs to. Links to an Entity
    `publisher_gid`                 LowCardinality(UUID),                                     -- the gid of the publisher that this datapoint belongs to. Links to an Entity
    `publication_gid`               LowCardinality(UUID),                                     -- the gid of the source that this datapoint belongs to. Links to an Entity

    -- Extra Metadata and structured dimensions
    `gids`                          Map(LowCardinality(String), LowCardinality(UUID)),        -- additional links to Named Entities
    `location`                      Map(LowCardinality(String), LowCardinality(String)),      -- additional geography for the datapoint
    `demography`                    Map(LowCardinality(String), LowCardinality(String)),      -- additional demography for the datapoint
    `classification`                Map(LowCardinality(String), LowCardinality(String)),      -- additional classification for the datapoint
    `topology`                      Map(LowCardinality(String), LowCardinality(String)),      -- additional topology for the datapoint
    `usage`                         Map(LowCardinality(String), LowCardinality(String)),      -- additional usage for the datapoint
    `device`                        Map(LowCardinality(String), LowCardinality(String)),      -- additional device for the datapoint
    `product`                       Map(LowCardinality(String), LowCardinality(String)),      -- additional product for the datapoint

    -- Additional Metadata for flagging and tagging datapoints
    `flags`                         Map(LowCardinality(String), BOOLEAN),                     -- additional flags for the datapoint
    `tags`                          Array(LowCardinality(String)),                            -- additional tags for the datapoint

    -- The actual datapoint information
    `dimensions`                    Map(LowCardinality(String), LowCardinality(String)),      -- dimensions for the entity - low cardinality string keys to allow for flexible dimensions and fit on a dashboard breaking down the datapoint
    `metrics`                       Map(LowCardinality(String), Float64),                     -- metrics for the datapoint - the measurement

    `mtype`                         Map(LowCardinality(String),LowCardinality(String)),       -- the measurement type for a metrics
    `uom`                           Map(LowCardinality(String),LowCardinality(String)),       -- unit of measure for the metrics - All UOM are linked to a UOM Entity
    `of_what`                       Map(LowCardinality(String),LowCardinality(String)),       -- what is the metric measuring usually a standard based if from Wikidata/dbPedia etc. the key is the metric name and the value is the standard (e.g., 'population', 'oil', 'humidity', etc.)
    `agg_method`                    Map(LowCardinality(String),LowCardinality(String)),       -- the default aggregation method for the metric the key is the metric name and the value is the aggregation method (e.g., 'sum', 'avg', 'max', 'min', etc.)

    -- Access & Partitioning
    `signature`                     UUID,                                                     -- The signature of the time_series + dimensions + of_what + metrics - used to ensure the right entries can be updated/replaced

    `access_type`                   Enum8('Local' = 0, 'Exclusive' = 1, 'Group' = 2, 'SharedPercentiles' = 3, 'SharedObfuscated' = 4, 'Shared' = 5, 'Public' = 6) DEFAULT(1),
    `partition`                     LowCardinality(String),                                    -- The version of the event message

    `sign` Int8 default 1
) ENGINE = ReplacingMergeTree(sign)
    PARTITION BY (partition, toStartOfMonth(timestamp))
    PRIMARY KEY (series_gid, entity_gid, period, timestamp, signature, partition)
    ORDER BY (series_gid, entity_gid, period, timestamp, signature, partition);