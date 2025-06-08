
CREATE TABLE IF NOT EXISTS timeseries (
    `gid`               UUID,
    `gid_url`           String,

    `group_gid`         UUID,
    `group_gid_url`     String,

    `label`             String,
    `slug`              String,
    `value_types`       LowCardinality(String),
    `completeness`      LowCardinality(String),

    `category`          LowCardinality(String),
    `sub_category`      LowCardinality(String),

    `resolution`        LowCardinality(String),

    `owner_gid`         UUID,
    `source_gid`        UUID,
    `publisher_gid`     UUID,
    `publication_gid`   UUID,

    `dimensions`        Map(LowCardinality(String), LowCardinality(String)),      -- additional (generic) dimensions for the entity
    `tags`              Array(LowCardinality(String)),
    `flags`             Map(LowCardinality(String), BOOLEAN),
    `metric_gid`        Map(LowCardinality(String), LowCardinality(UUID)),      -- additional (generic) dimensions for the entity
    `metrics`           Nested (
        `gid`               LowCardinality(UUID),
        `gid_url`           LowCardinality(String),
        `category`          LowCardinality(String),
        `label`             LowCardinality(String),
        `slug`              LowCardinality(String),
        `uom`               LowCardinality(String),
        `currency`          LowCardinality(String),
        `adj_type`          LowCardinality(String),
        `adj_date`          LowCardinality(String),
        `wid`               LowCardinality(String),
        `concept_id`        LowCardinality(String),
        `synset_id`         LowCardinality(String),
        `agg`               LowCardinality(String)
    ),
    `properties`        Map(LowCardinality(String), LowCardinality(String)),
    `access`            Enum8('Group' = 3, 'SharedPercentiles' = 4, 'SharedObfuscated' = 5, 'Exclusive' = 2, 'Local' = 1, 'Public' = 7, 'Shared' = 6) default 7,
    `uom`               LowCardinality(String)
) ENGINE = ReplacingMergeTree()
    PRIMARY KEY gid
    ORDER BY gid;

