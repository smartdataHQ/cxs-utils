-- ClickHouse SQL script for setting up the Nova CDR database
-- Entities are also stored in a Neo4j graph database, so the schema is designed to be compatible with both systems.
-- This schema defines the structure of the entities table, which stores information about various entities in the system.
CREATE TABLE IF NOT EXISTS entities (
    `gid`                       UUID,                           -- The Graph UUID of the entity
    `gid_url`                   String,                         -- The URL of the entity's GID

    `label`                     String,                         -- The primary label of the entity (e.g. "Eiffel Tower")
    `labels`                    Array(LowCardinality(String)),  -- Additional labels for the entity with language prefixes (e.g. ["en:Eiffel Tower", "fr:Tour Eiffel"])

    `type`                      LowCardinality(String),         -- The type of the entity (e.g. "Event", "Place", "Person"), always in English and in singular form and capitalized
    `variant`                   LowCardinality(String),         -- The variant of the entity (e.g. "Concert", "Exhibition", "Match"), always in English and in singular form and capitalized
    `icon`                      LowCardinality(String),         -- The icon of the entity (e.g. "concert", "exhibition", "match"), always in English and in singular form and capitalized
    `colour`                    LowCardinality(String),         -- The colour of the entity (e.g. "red", "blue", "green"), always in English and in singular form and capitalized

    `dimensions`                Map(LowCardinality(String), LowCardinality(String)),        -- additional (generic) dimensions for the entity
    `tags`                      Array(LowCardinality(String)),                              -- additional tags for the entity
    `flags`                     Map(LowCardinality(String), BOOLEAN),                       -- additional flags for the entity
    `metrics`                   Map(LowCardinality(String), Float64),                       -- additional metrics for the entity
    `properties`                Map(LowCardinality(String), LowCardinality(String)),        -- additional properties for the entity
    `names`                     Map(LowCardinality(String), LowCardinality(String)),        -- additional names for the entity, e.g. "Eiffel Tower" -> "Tour Eiffel"

    `content` Nested (
        `label`                 LowCardinality(String),         -- The label of the content (e.g. "Prologue", "Synopsis", "Description", "Summary", "Conditions", "History", "Other")
        `type`                  LowCardinality(String),         -- Enum8('Description'=1, 'Summary'=2, 'Conditions'=3, 'History'=4, 'Other'=0)
        `sub_type`              LowCardinality(String),         -- Enum8('short'=1, 'long'=2, 'other'=0)
        `value`                 String,                         -- The content of the event
        `meta_description`      String,                         -- A description of the contents' purpose and a few questions it may answer
        `language`              LowCardinality(String)          -- The primary language of the content (2 letter ISO code)
    ),

    `media` Nested (
        `media_type`            LowCardinality(String),         -- Image, Video, Audio, etc.
        `type`                  LowCardinality(String),         -- Poster, Thumbnail, etc.
        `sub_type`              LowCardinality(String),         -- Program, Season, Episode, etc.
        `url`                   String,                         -- The URL of the media
        `language`              LowCardinality(String),         -- The primary language of the media
        `aspect_ratio`          LowCardinality(String)          -- The aspect ratio of the media
    ),

    `embeddings` Nested(                                        -- The embeddings/vectors of the entity, used for similarity search and clustering
        `label`                 LowCardinality(String),         -- The label of the embedding matches the content label (e.g. "Prologue", "Synopsis", "Description", "Summary", "Conditions", "History", "Other")
        `content_starts`        LowCardinality(String),         -- The content that starts the embedding (e.g. "Title: ", "Description: ", "Content: ")
        `content_ends`          LowCardinality(String),         -- The content that ends the embedding (e.g. " ", ".", " - ")
        `opening_phrase`        LowCardinality(String),         -- The opening phrase of the embedding (e.g. "This is a description of ", "This is a content of ")
        `closing_phrase`        LowCardinality(String),         -- The closing phrase of the embedding (e.g. " for more information.", " for more details.")
        `vectors`               Array(Float64),                 -- The vectors of the embedding, used for similarity search and clustering, usually 1024 dimensions
        `model`                 LowCardinality(String)          -- The model used to generate the embedding (e.g. "text-embedding-3-small", "text-embedding-3-large")
    ),

    `ids` Nested (
        `label`                 Nullable(String),               -- The label of the entity that is involved in the event
        `role`                  LowCardinality(String),         -- The role of the entity in the event
        `entity_type`           LowCardinality(String),         -- The type of the entity that is involved in the event
        `entity_gid`            Nullable(UUID),                 -- The Graph UUID of the entity that is involved in the event
        `id`                    Nullable(String),               -- The ID of the entity that is involved in the event
        `id_type`               LowCardinality(String),         -- The ID of the entity that is involved in the event
        `capacity`              Nullable(Float)                 -- The capacity of the entity in the event
    ),

    `classification` Nested (
        `type`                  LowCardinality(String),         -- The event category-> subcategory
        `value`                 LowCardinality(String),         -- like Sports->Football, Concert->Pop etc.
        `babelnet_id`           LowCardinality(String),         -- The concept ID for the classification (Used to translate and associate the classification with other systems)
        `weight`                Float                           -- The relevance of the classification
    ),

    -- Location information
    `location` Nested (
        `type`                  LowCardinality(String),         -- The type of the location (e.g. "Home", "Work", "Venue", "Address", "Geographic", "Permanent", "Temporary", "Other")
        `label`                 LowCardinality(String),         -- A readable label for the location (e.g. "Home", "Work", "Venue", "Address", "Geographic", "Permanent", "Temporary", "Other")
        `country`               LowCardinality(String),         -- The country of the location (e.g. "France", "United States", "Germany"), always in English and in singular form and capitalized
        `country_code`          LowCardinality(String),         -- The 3 letter country code of the location (e.g. "FRA", "USA", "DEU"), always in uppercase
        `code`                  LowCardinality(String),         -- The code of the location (e.g. "75001", "10001", "10115"), always in uppercase
        `region`                LowCardinality(String),         -- The region of the location (e.g. "Île-de-France", "New York", "Berlin"), always in English and in singular form and capitalized
        `division`              LowCardinality(String),         -- The division of the location (e.g. "Paris", "Manhattan", "Mitte"), always in English and in singular form and capitalized
        `municipality`          LowCardinality(String),         -- The municipality of the location (e.g. "Paris", "New York", "Berlin"), always in English and in singular form and capitalized
        `locality`              LowCardinality(String),         -- The locality/neighbourhood of the location (e.g. "Montmartre", "SoHo", "Kreuzberg"), always in English and in singular form and capitalized
        `postal_code`           LowCardinality(String),         -- The postal code of the location (e.g. "75001", "10001", "10115"), always in uppercase
        `postal_name`           LowCardinality(String),         -- The name of the postal code area (e.g. "1er Arrondissement", "Chelsea", "Mitte"), always in English and in singular form and capitalized
        `street`                LowCardinality(String),         -- The street of the location (e.g. "Rue de Rivoli", "Broadway", "Friedrichstraße"), always in English and in singular form and capitalized
        `street_nr`             Nullable(String),               -- The street number of the location (e.g. "1", "100", "15"), always in uppercase
        `address`               Nullable(String),               -- The full address of the location (e.g. "1 Rue de Rivoli, 75001 Paris, France", "100 Broadway, New York, NY 10001, USA", "15 Friedrichstraße, 10117 Berlin, Germany"), always in English and in singular form and capitalized

        `longitude`             Nullable(Float64),              -- The longitude of the location (e.g. 2.3364, -74.0060, 13.3889)
        `latitude`              Nullable(Float64),              -- The latitude of the location (e.g. 48.8606, 40.7128, 52.5166)
        `geohash`               Nullable(String),               -- The geohash of the location (e.g. "u09t2", "dqcjq", "s9z6x"), always in lowercase

        `duration_from`         Nullable(DateTime64),           -- The start of the duration for the location (e.g. "2023-01-01 00:00:00", "2023-01-01 00:00:00", "2023-01-01 00:00:00")
        `duration_until`        Nullable(DateTime64)            -- The end of the duration for the location (e.g. "2023-12-31 23:59:59", "2023-12-31 23:59:59", "2023-12-31 23:59:59")
    ),

    `partition`         LowCardinality(String),                 -- The storage partition for the entity. This is internal and can not be submitted by the user. It is used to partition the data for performance and scalability.
    `sign`              Int8 default 1                          -- This is an internal field used to ensure that the right entries can be updated/replaced. It is used to mark the latest version of the entity.

) ENGINE = ReplacingMergeTree(sign)
    PARTITION BY partition
    ORDER BY (gid, partition);
