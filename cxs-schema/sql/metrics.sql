
CREATE TABLE IF NOT EXISTS ql.metrics on cluster default
(
    `gid`               UUID,
    `gid_url`           String,

    `category`          LowCardinality(String),
    `label`             String,
    `slug`              String,

    `uom`               String,
    `currency`          LowCardinality(String),
    `adj_type`          LowCardinality(String),
    `adj_date`          LowCardinality(String),

    `wid`               LowCardinality(String),
    `concept_id`        LowCardinality(String),
    `synset_id`         LowCardinality(String),
    `properties`        Map(LowCardinality(String), LowCardinality(String)),
    `agg`               LowCardinality(String)
) ENGINE = ReplacingMergeTree()
    PRIMARY KEY gid
    ORDER BY gid;
