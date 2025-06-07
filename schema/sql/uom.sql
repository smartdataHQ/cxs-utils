-- A table used for standard based UOM (Unit of Measure) definitions
-- UN CEFACT Common Codes

CREATE TABLE IF NOT EXISTS uom  (
    `code`          String,                                             -- a CEFACT code for the unit of measure (e.g., 'kg', 'm', 's', etc.)
    `label`         String,                                             -- The human-readable label for the unit of measure (e.g., 'Kilogram', 'Meter', 'Second', etc.)
    `symbol`        String,                                             -- The symbol for the unit of measure (e.g., 'kg', 'm', 's', etc.)
    `slug`          String,                                             -- A URL-friendly version of the code (e.g., 'kilogram', 'meter', 'second', etc.)
    `description`   String,                                             -- A description of the unit of measure (e.g., 'A kilogram is a unit of mass in the metric system.', etc.)
    `conversion`    String,                                             -- A conversion factor to a base unit (e.g., '1 kg = 1000 g', '1 m = 100 cm', etc.)
    `core_unit`     String,                                             -- The core unit of measure that this unit is based on (e.g., 'kg' for mass, 'm' for length, etc.)
    `level`         String,                                             -- The level of the unit of measure in a hierarchy (e.g., 'base', 'derived', etc.)
    `sectors`       Array(LowCardinality(String)),                      -- The sectors that this unit of measure is applicable to (e.g., 'agriculture', 'energy', 'transportation', etc.)
    `quantities`    Array(LowCardinality(String)),                      -- The quantities that this unit of measure can measure (e.g., 'mass', 'length', 'time', etc.)
    `schema`        LowCardinality(String),                             -- The schema or standard that this unit of measure adheres to (e.g., 'SI', 'Imperial', etc.)
    `properties`    Map(LowCardinality(String), LowCardinality(String)) -- Additional properties for the unit of measure (e.g., 'precision', 'accuracy', etc.)
) ENGINE = ReplacingMergeTree()
      PRIMARY KEY (code)
      ORDER BY (code);



