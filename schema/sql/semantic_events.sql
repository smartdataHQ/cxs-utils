CREATE TABLE IF NOT EXISTS default.semantic_events (                -- Extends segment.com semantic event schema and is tailored for the Context Suite
    `entity_gid`                UUID,                               -- The entity that the event is associated with (Context Suite Specific) (Account or any sub-entity)
    `timestamp`                 DateTime64,                         -- The timestamp of the event is always stored in UTC
    `type`                      LowCardinality(String),             -- The event type (e.g. "track, page, identify, group, alias, screen etc.")
    `event`                     LowCardinality(String),             -- The event name (e.g. "Product Added") always capitalized and always ended with a verb in passed tense

                                                                    -- These IDs should never be the same as any personally identifiable information (PII) and should be obfuscated as UUIDs
                                                                    -- User traits are stored in a separate table and are not included in the event so that we can easily obfuscate them remove them if needed (e.g. GDPR)
    `anonymous_id`              Nullable(String) CODEC (ZSTD(1)),   -- The anonymous ID of the user before they are identified
    `anonymous_gid`             Nullable(UUID),                     -- The anonymous ID of the user before they are identified
    `user_id`                   Nullable(String) CODEC (ZSTD(1)),   -- The user ID of the user
    `user_gid`                  Nullable(UUID),                     -- The user ID of the user
    `account_id`                Nullable(String) CODEC (ZSTD(1)),   -- The account ID of the user (Often the same as the entity_gid)
    `previous_id`               Nullable(String) CODEC (ZSTD(1)),   -- The user ID of the user before the event (e.g. "anonymousId" before "identify")
    `session_id`                Nullable(String) CODEC (ZSTD(1)),   -- The session ID of the user in the client that generated the event
    `session_gid`               Nullable(UUID),                     -- The session GID of the user session that generated the event
    `context_ip`                Nullable(IPv4),                     -- The IP of the user in IPv4 format

                                                                    -- Root level properties
    `importance`                Nullable(Int8),                     -- The importance of the event (eg. 1..5)
    `customer_facing`           Int8 default 0,                     -- The session ID of the user in the client that generated the event

                                                                    -- A dictionary of additional content that is associated with the event
    `content`                   Map(LowCardinality(String),String) CODEC (ZSTD(1)), -- The type of content (e.g. "Body", "Subject", "Title", "Description", "Summary", "Initial Response", "Other")

                                                                    -- Involves is a Context Suite Specific array of objects used to track the entities that are involved in the event
    `involves` Nested (                                             -- Involvement can be implicit (via other properties) or explicit using this structure
        `label`                 Nullable(String),                   -- The label of the entity that is involved in the event
        `role`                  LowCardinality(String),             -- The role of the entity in the event. (Capitalized like: Supplier, Buyer, Victim, HomeTeam)
        `entity_type`           LowCardinality(String),             -- The type of the entity that is involved in the event (Capitalized Entity name like: Person, Organization, LegalEntity)
        `entity_gid`            Nullable(UUID),                     -- The Graph UUID of the entity that is involved in the event. Entity GIDs are ContextSuite native IDs. Use the id field for other IDs.
        `id`                    Nullable(String),                   -- The ID of the entity that is involved in the event
        `id_type`               LowCardinality(String),             -- The ID type indicates what organization issued the ID. (This is potentially your own name)
        `capacity`              Nullable(Float)                     -- The capacity of the entity in the event. If the involvement is fractional, this is the fraction of the entity that is involved in the event. (e.g. 0.5 for half of a person)
    ),

    `sentiment` Nested (                                            -- Sentiment is a Context Suite Specific array if sentiment objects used to track entity sentiment expressed in the event
        `type`                  LowCardinality(String),             -- Enum8('Praise'=1, 'Criticism'=2, 'Complaint'=3, 'Abuse'=4, 'Threat'=5, 'Opinion'=6, 'Other'=0),
        `sentiment`             LowCardinality(String),             -- The sentiment expressed
        `entity_type`           LowCardinality(String),             -- The type of the entity that is involved in the event
        `entity_gid`            Nullable(UUID),                     -- The entity that the sentiment is expressed about
        `id_type`               LowCardinality(String),             -- The ID of the entity that is involved in the event
        `id`                    Nullable(String),                   -- The entity that the sentiment is expressed about
        `target_category`       LowCardinality(String),             -- The type of the entity that is involved in the event
        `target_type`           LowCardinality(String),             -- The target type of the sentiment
        `target_entity`         Nullable(String),                   -- The target of the sentiment
        `reason`                Nullable(String)                    -- The reasoning behind the sentiment
    ),

    `classification` Nested (                                       -- Classification is a Context Suite Specific property used to track the classification of the event //Intent, Categories, Subcategories, Tags, Confidence, Score, Segmentation, etc.
        `type`                  LowCardinality(String),             -- Enum8('Intent'=1, 'Intent Category'=2, 'Category'=3, 'Subcategory'=4, 'Tag'=5, 'Segmentation'=6, 'Age Group'=7, 'Inbox'=8, 'Keyword'=9, 'Priority'=10, 'Other'=0),                                                                                                                                                                                 -- The type of classification
        `value`                 LowCardinality(String),             -- The category, tag, intent or whatever is being classified according to the type
        `reasoning`             Nullable(String),                   -- The category, tag, intent or whatever is being classified according to the type
        `score`                 Nullable(Float),                    -- The score of the classification
        `confidence`            Nullable(Float),                    -- The confidence of the classification from the classification model
        `weight`                Float                               -- The relevance of the classification
    ),

    `location` Nested (                                             -- Location is a Context Suite Specific property used to track the location of the event
        `location_of`           LowCardinality(String),             -- The type of location (e.g. "Customer", "Supplier", "Postal Address", "Business Address", "Home Address", "Other")
        `label`                 LowCardinality(String),             -- The label of the location (e.g. "Street name 1, 1234")
        `country`               LowCardinality(String),             -- The name of the country (e.g."Iceland")
        `country_code`          LowCardinality(String),             -- The country code (e.g. "IS")
        `code`                  LowCardinality(String),             -- The code of the location (e.g. "1234")
        `region`                LowCardinality(String),             -- The region of the location (e.g. "Gullbringu og kjósarsýsla")
        `division`              LowCardinality(String),             -- The division of the location (e.g. "Capital Region")
        `municipality`          LowCardinality(String),             -- The municipality of the location (e.g. "Reykjavik")
        `locality`              LowCardinality(String),             -- The locality of the location (e.g. "Vesturbær")
        `postal_code`           LowCardinality(String),             -- The postal code of the location (e.g. "101")
        `postal_name`           LowCardinality(String),             -- The name of the postal code (e.g. "Vesturbær")
        `street`                LowCardinality(String),             -- The street of the location (e.g. "Laugavegur")
        `street_nr`             Nullable(String),                   -- The street number of the location (e.g. "1")
        `address`               Nullable(String),                   -- The address of the location (e.g. "Laugavegur 1, 101 Reykjavik")
        `longitude`             Nullable(Float64),                  -- The longitude of the location (e.g. -21.9333)
        `latitude`              Nullable(Float64),                  -- The latitude of the location (e.g. 64.1355)
        `geohash`               Nullable(String),                   -- The geohash of the location (e.g. "gcpuv")
        `duration_from`         Nullable(DateTime64),               -- The start date of the location (e.g. "2022-01-01 00:00:00") Used if the location is temporary
        `duration_until`        Nullable(DateTime64)                -- The end date of the location (e.g. "2022-01-01 00:00:00") Used if the location is temporary
    ),

    `entity_linking` Nested (                                       -- An array of entity links. ntity Linking is used to link an entity mention to a specific named entity in the graph
        content_key             LowCardinality(String),             -- The type of content (e.g. "body", "subject", "title", "description", "summary", "quick response", "other")
        label                   Nullable(String),                   -- The label of the entity that is involved in the event
        starts_at               Nullable(Int32),                    -- The start index of the entity in the content
        ends_at                 Nullable(Int32),                    -- The end index of the entity in the content
        entity_type             Nullable(String),                   -- The Entity type of the entity that is involved in the event (e.g. "Person", "Organization", "LegalEntity")
        entity_gid              Nullable(UUID),                     -- The Graph UUID of the entity that is involved in the event
        entity_wid              Nullable(String),                   -- The Wikidata UUID of the entity that is involved in the event
        certainty               Nullable(Float)                     -- The certainty of the entity linking
    ),

    `contextual_awareness` Nested (                                 -- Contextual Awareness is a Context Suite Specific property used to track additional context for entities involved in the event
        `type`                  LowCardinality(String),             -- Description, Summary, Conditions, History, Other),
        `entity_type`           LowCardinality(String),             -- The entity type that the event is associated with (e.g. "Currency", "Product", "Service", "Other")
        `entity_gid`            Nullable(UUID),                     -- The entity that the event is associated with (Context Suite Specific) (Account or any sub-entity)
        `entity_wid`            Nullable(String),                   -- The wikidata ID of the entity that the event is associated with (Context Suite Specific) (Account or any sub-entity)
        `context`               Nullable(String)                    -- The context information (e.g. "Silfra is an extremely cold pond with a constant temperature of 2° celsius")
    ),

    `properties`                Map(LowCardinality(String),String) CODEC(ZSTD(1)),  -- A dictionary of additional properties for the event in any JSON format. -- Properties are all moved into dedicated columns, if possible. If not, they are stored in properties
    `dimensions`                Map(LowCardinality(String),LowCardinality(String)) CODEC(ZSTD(1)), -- Additional dimensions for the event, There are low-cardinality dimensions that are not defined in the schema and used on dashboards
    `metrics`                   Map(LowCardinality(String),Float32), -- Additional metrics for the event. These are additional metrics that are not defined in the schema and used on dashboards
    `flags`                     Map(LowCardinality(String),Boolean), -- Boolean flags for the event. These are additional flags that are not defined in the schema and used on dashboards

                                                                    -- Standard marketing properties as defined by Segment and Google Analytics
    `campaign.campaign`         LowCardinality(String),             -- The campaign (e.g. "summer")
    `campaign.source`           LowCardinality(String),             -- The source (e.g. "google")
    `campaign.medium`           LowCardinality(String),             -- The medium (e.g. "cpc")
    `campaign.term`             LowCardinality(String),             -- The term (e.g. "beach")
    `campaign.content`          LowCardinality(String),             -- The content (e.g. "ad1")

                                                                    -- Phone Application properties
    `app.build`                 LowCardinality(String),             -- The build of the app (e.g. "1.1.0")
    `app.name`                  LowCardinality(String),             -- The name of the app (e.g. "Segment")
    `app.namespace`             LowCardinality(String),             -- The namespace of the app (e.g. "com.segment.analytics")
    `app.version`               LowCardinality(String),             -- The version of the app (e.g. "1.1.0")

                                                                    -- Phone Device properties
    `device.ad_tracking_enabled` Nullable(Boolean),                 -- Whether ad tracking is enabled (e.g. "true")
    `device.id`                 LowCardinality(String),             -- The manufacturer id for the device (e.g. "e3bcf3f796b9f377284bfbfbcf1f8f92b6")
    `device.version`            LowCardinality(String),             -- The device version (e.g. "9.1")
    `device.mac_address`        LowCardinality(String),             -- The device mac address (e.g. "00:00:00:00:00:00")
    `device.manufacturer`       LowCardinality(String),             -- The manufacturer of the device (e.g. "Apple")
    `device.brand`              LowCardinality(String),             -- The manufacturer of the device (e.g. "Apple")
    `device.model`              LowCardinality(String),             -- The model of the device (e.g. "iPhone 6")
    `device.variant`            LowCardinality(String),             -- The variant of the device (e.g. "iPhone 6s")
    `device.name`               LowCardinality(String),             -- The name of the device (e.g. "Nexus 5")
    `device.type`               LowCardinality(String),             -- The type of the device (e.g. "Mobile", "Tablet", "Desktop", "TV", "Wearable", "Other")
    `device.token`              LowCardinality(String),             -- The token of the device (e.g. "e3bcf3f796b9f377284bfbfbcf1f8f92b6")
    `device.locale`             LowCardinality(String),             -- The locale of the device (e.g. "en-US")
    `device.timezone`           LowCardinality(String),             -- The timezone of the device (e.g. "America/Los_Angeles")
    `device.advertising_id`     LowCardinality(String),             -- The advertising ID of the device (e.g. "350e9d90-d7f5-11e4-b9d6-1681e6b88ec1")

                                                                    -- OS properties
    `os.name`                   LowCardinality(String),             -- The OS of the device (e.g. "iOS")
    `os.version`                LowCardinality(String),             -- The OS version of the device (e.g. "9.1")

                                                                    -- Event Library properties
    `library.name`              LowCardinality(String),             -- The name of the library (e.g. "analytics-ios")
    `library.version`           LowCardinality(String),             -- The version of the library (e.g. "3.0.0")

                                                                    -- Browser properties
    `user_agent.signature`      LowCardinality(String),             -- The user agent (e.g. "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36")
    `user_agent.mobile`         Nullable(Boolean),                  -- Whether the user agent is mobile (e.g. "true")
    `user_agent.platform`       LowCardinality(String),             -- The platform of the user agent (e.g. "Apple Mac")
    `user_agent.data` Nested(
        `brand`                 LowCardinality(String),             -- The brand of the user agent (e.g. "Apple")
        `version`               LowCardinality(String)              -- The version of the user agent (e.g. "Mac OS X 10_10_5")
    ),

                                                                    -- Mobile properties
    `network.carrier`           LowCardinality(String),             -- The network carrier of the library (e.g. "Verizon")
    `network.cellular`          Nullable(Boolean),                  -- Whether the network is cellular (e.g. "true")
    `network.bluetooth`         Nullable(Boolean),                  -- Whether the network is bluetooth (e.g. "true")
    `network.wifi`              Nullable(Boolean),                  -- Whether the network is wifi (e.g. "true")

                                                                    -- Trait Properties that should be stores separately for GDPR reasons
                                                                    -- The user id should never be the same as the user id in the traits or any other personal identifiable information
    `traits.id`                 LowCardinality(String),             -- The ID of the user
    `traits.name`               LowCardinality(String),             -- The name of the user
    `traits.first_name`         LowCardinality(String),             -- The first name of the user
    `traits.last_name`          LowCardinality(String),             -- The last name of the user
    `traits.social_security_nr` LowCardinality(String),             -- The social security number of the user
    `traits.social_security_nr_family`  LowCardinality(String),     -- The social security number of the user
    `traits.email`              LowCardinality(String),             -- The email of the user
    `traits.phone`              LowCardinality(String),             -- The phone number of the user
    `traits.avatar`             LowCardinality(String),             -- The avatar of the user
    `traits.username`           LowCardinality(String),             -- The username of the user
    `traits.website`            LowCardinality(String),             -- The website of the user
    `traits.age`                Nullable(Int8),                     -- The age of the user
    `traits.birthday`           Nullable(Date),                     -- The birthday of the user
    `traits.created_at`         Nullable(Date),                     -- The date the user was created
    `traits.company`            LowCardinality(String),             -- The company of the user
    `traits.title`              LowCardinality(String),             -- The title of the user
    `traits.gender`             LowCardinality(String),             -- Enum8('Male'=1, 'Female'=2, 'Transgender'=3, 'Non-Binary'=4, 'Gender Queer'=5, 'Gender Fluid'=6, 'Gender Neutral'=7, 'Intersex'=8, 'Gender Non-Conforming'=9, 'Gender-Expansive'=10, 'Agender'=11, 'Gendervoid'=12, 'Bigender'=13, 'Omnigender'=14, 'Pangender'=15, 'Two-spirit'=16, 'Trans'=17, 'No Response'=0, ''=99), --
    `traits.pronouns`           LowCardinality(String),             -- The pronouns of the user
    `traits.salutation`         LowCardinality(String),             -- The salutation of the user
    `traits.description`        String,                             -- A general description of the user
    `traits.industry`           LowCardinality(String),             -- The industry of the user
    `traits.employees`          Nullable(Int32),                    -- The number of employees of the user
    `traits.plan`               LowCardinality(String),             -- The plan of the user
    `traits.total_billed`       Nullable(Float32),                  -- The total billed of the user
    `traits.logins`             Nullable(Int32),                    -- The number of logins of the user
    `traits.address`            Map(LowCardinality(String),String), -- All traits that are not defined explicitly
    -- `traits.properties` Map(LowCardinality(String),String),      -- All traits that are not defined explicitly

                                                                    -- Page Properties
    `page.encoding`             LowCardinality(String),             -- The encoding of the page (e.g. "UTF-8")
    `page.host`                 LowCardinality(String),             -- The host of the page (e.g. "segment.com")
    `page.path`                 LowCardinality(String),             -- The path of the page (e.g. "/docs")
    `page.referrer`             LowCardinality(String),             -- The referrer of the page (e.g. "https://segment.com")
    `page.referring_domain`     LowCardinality(String),             -- The referring domain of the page (e.g. "segment.com")
    `page.search`               LowCardinality(String),             -- The search of the page (e.g. "segment")
    `page.title`                LowCardinality(String),             -- The title of the page (e.g. "Analytics.js Quickstart - Segment")
    `page.url`                  LowCardinality(String),             -- The url of the page (e.g. "https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/quickstart/")

                                                                    -- Referrer properties (e.g. the referrer/previous page)
    `referrer.id`               LowCardinality(String),             -- The referrer ID of the library (e.g. "3c8da4a4-4f4b-11e5-9e98-2f3c942e34c8")
    `referrer.type`             LowCardinality(String),             -- The referrer type of the library (e.g. "dataxu")

                                                                    -- Device Screen Properties
    `screen.density`            Nullable(Int16),                    -- The density of the screen (e.g. 2)
    `screen.height`             Nullable(Int16),                    -- The height of the screen (e.g. "568")
    `screen.width`              Nullable(Int16),                    -- The width of the screen (e.g. "320")
    `screen.inner_height`       Nullable(Int16),                    -- The inner height of the screen (e.g. "568")
    `screen.inner_width`        Nullable(Int16),                    -- The inner width of the screen (e.g. "320")

                                                                    -- Root level event message context properties
    `context.active`            Nullable(Boolean),                  -- Whether the library is active (e.g. "1")
    `context.ip`                Nullable(IPv4),                     -- The IP of the user in IPv4 format
    `context.ipv6`              Nullable(IPv6),                     -- The IP of the user in IPv6 format
    `context.locale`            LowCardinality(String),             -- The locale used where the event happened (e.g. "en-US")
    `context.group_id`          LowCardinality(String),             -- The group ID associated with the event (e.g. "a89d88da-4f4b-11e5-9e98-2f3c942e34c8")
    `context.timezone`          LowCardinality(String),             -- The timezone the event happened in (e.g. "America/Los_Angeles")
    `context.location`          Point,                              -- The location associated with the event (e.g. "37.7576171,-122.5776844")

                                                                    -- Context as defined by Segment semantic events spec
    `context.extras`            String,                             -- Other properties of the event that cannot be mapped to the schema or have complex data types

                                                                    -- Extended Commerce Properties and totals
    `commerce.details`          Nullable(String),                   -- Other properties of the commerce event that cannot be mapped to the schema or have complex data types
    `commerce.checkout_id`      Nullable(String),                   -- Unique ID for the checkout
    `commerce.order_id`         Nullable(String),                   -- Unique ID for the order
    `commerce.cart_id`          Nullable(String),                   -- Unique ID for the cart
    `commerce.employee_id`      LowCardinality(String),             -- Unique ID for the employee working the terminal/register
    `commerce.external_order_id` Nullable(String),                  -- Unique External ID for the order
    `commerce.terminal_id`      LowCardinality(String),             -- Unique External ID for the terminal used for the transaction

    `commerce.affiliation_id`   LowCardinality(String),             -- Unique ID for the affiliation
    `commerce.affiliation`      LowCardinality(String),             -- Store or affiliation from which this transaction occurred (for example, Google Store)
    `commerce.agent`            LowCardinality(String),             -- The Agent responsible for the sale
    `commerce.agent_id`         LowCardinality(String),             -- The ID of the Agent responsible for the sale
    `commerce.sold_location`    LowCardinality(String),             -- The location where the sale occurred
    `commerce.sold_location_id` LowCardinality(String),             -- The ID of the location where the sale occurred
    `commerce.business_day`     LowCardinality(Date32),             -- The business day of the transaction

                                                                    -- Total and Revenue are mutually exclusive. If you send both, we will use total and ignore revenue.
    `commerce.revenue`          Nullable(Float64),                  -- Total gross revenue
    `commerce.tax`              Nullable(Float64),                  -- Total tax amount
    `commerce.discount`         Nullable(Float64),                  -- Total discount amount
    `commerce.cogs`             Nullable(Float64),                  -- Total cost of goods sold
    `commerce.commission`       Nullable(Float64),                  -- Total commission amount

    `commerce.currency`         LowCardinality(String),             -- Currency code associated with the transaction
    `commerce.exchange_rate`    LowCardinality(Float32),            -- Currency exchange rate associated with the transaction
    `commerce.coupon`           LowCardinality(String),             -- Transaction coupon redeemed with the transaction

    `commerce.payment_type`     LowCardinality(String),             -- Type of payment (ex. Card, Paypal, Cash, etc.)
    `commerce.payment_sub_type` LowCardinality(String),             -- Subtype of payment (ex. Visa, Mastercard, etc.)
    `commerce.payment_details`  Nullable(String),                   -- Details of the payment (ex. Last 4 digits of the card, etc.)

    `commerce.products` Nested (                                    -- Individual products in the order, cart, product list, wishlist, etc.
        `position`              Nullable(UInt16),                   -- Position in the product list (ex. 3)
        `entry_type`            LowCardinality(String),             -- 'Cart Item', 'Line Item', 'Wishlist', 'Recommendation', 'Purchase Order', 'Search Results', 'Other', 'Delivery', 'Reservation', 'Reservation', 'Stockout'
        `line_id`               Nullable(String),                   -- Unique ID for the line item

        `product_id`            LowCardinality(String),             -- Database id of the product being purchases
        `entity_gid`            LowCardinality(UUID),               -- Database id of the product being purchases
        `sku`                   LowCardinality(String),             -- Sku of the product being purchased
        `barcode`               LowCardinality(String),             -- Barcode of the product being purchased
        `gtin`                  LowCardinality(String),             -- GTIN of the product being purchased
        `upc`                   LowCardinality(String),             -- UPC of the product being purchased
        `ean`                   LowCardinality(String),             -- EAN of the product being purchased
        `isbn`                  LowCardinality(String),             -- ISBN of the product being purchased
        `serial_number`         LowCardinality(String),             -- Serial number of the product being purchased
        `supplier_number`       LowCardinality(String),             -- Supplier number of the product being purchased
        `tpx_serial_number`     LowCardinality(String),             -- Serial number of the product being purchased issued by a third party (not GS1)

        `bundle_id`             LowCardinality(String),             -- The ID of the bundle the product belongs to when listing all products in a bundle
        `bundle`                LowCardinality(String),             -- The name of the bundle the product belongs to

        `product`               LowCardinality(String),             -- Name of the product being viewed
        `variant`               LowCardinality(String),             -- Variant of the product being purchased
        `novelty`               LowCardinality(String),             -- Novelty of the product being purchased
        `size`                  LowCardinality(String),             -- Size of the product being purchased
        `packaging`             LowCardinality(String),             -- Packaging of the product being purchased
        `condition`             LowCardinality(String),             -- Condition of the product being purchased //like fresh, frozen, etc.
        `ready_for_use`         Nullable(BOOLEAN),                  -- If the product is ready for use //Varies between food and non-food items
        `core_product`          LowCardinality(String),             -- The core product being purchased // Spaghetti, Razor Blades (No Brand, No Variant, No Category)
        `origin`                LowCardinality(String),             -- Location identifier for the origin of the product being purchased

        `brand`                 LowCardinality(String),             -- Brand associated with the product
        `product_line`          LowCardinality(String),             -- Product line associated with the product
        `own_product`           Nullable(BOOLEAN),                  -- If the item is a store brand
        `product_dist`          LowCardinality(String),             -- Product Distribution is used to track the distribution class of the product (e.g. "A", "B", "C", "D", "E", "F", "G", "H", "I", "J")

        `main_category`         LowCardinality(String),             -- Product category being purchased
        `main_category_id`      LowCardinality(String),             -- Product category ID being purchased
        `category`              LowCardinality(String),             -- Name of the sub-category of the product being purchased
        `category_id`           LowCardinality(String),             -- ID of the sub-category of the product being purchased

        `gs1_brick_id`          LowCardinality(String),             -- GS1 Brick ID of the product being purchased
        `gs1_brick`             LowCardinality(String),             -- GS1 Brick Name of the product being purchased
        `gs1_brick_short`       LowCardinality(String),             -- GS1 Brick Short Name
        `gs1_brick_variant`     LowCardinality(String),             -- GS1 Brick Variant
        `gs1_conditions`        LowCardinality(String),             -- GS1 Brick Conditions
        `gs1_processed`         LowCardinality(String),             -- GS1 Brick Processed
        `gs1_consumable`        LowCardinality(String),             -- GS1 Brick Processed
        `gs1_class`             LowCardinality(String),             -- GS1 Class
        `gs1_family`            LowCardinality(String),             -- GS1 Family
        `gs1_segment`           LowCardinality(String),             -- GS1 Segment

        `starts`                Nullable(DateTime64),               -- Start date for the product being purchased
        `ends`                  Nullable(DateTime64),               -- End date for the product being purchased
        `duration`              Nullable(Float32),                  -- Duration for the product being purchased in minutes
        `seats`                 Nullable(String),                   -- Seats assignments for the product being purchased
        `destination`           Nullable(String),                   -- Location identifier for the destination of the product being purchased
        `lead_time`             Nullable(Float32),                  -- Lead time in days from the product being purchased until it's delivered (from purchase data to delivery date)
        `dwell_time_ms`         Nullable(Int64),                    -- The time that this product was in the viewport of the customer (above the fold)

        `supplier`              LowCardinality(String),             -- Supplier of the product being purchased
        `supplier_id`           LowCardinality(String),             -- Supplier ID of the product being purchased
        `manufacturer`          LowCardinality(String),             -- Manufacturer of the product being purchased
        `manufacturer_id`       LowCardinality(String),             -- Manufacturer ID of the product being purchased
        `promoter`              LowCardinality(String),             -- Promoter of the product being purchased
        `promoter_id`           LowCardinality(String),             -- Promoter ID of the product being purchased
        `product_mgr_id`        LowCardinality(String),             -- Product Manager ID of the product being purchased
        `product_mgr`           LowCardinality(String),             -- Product Manager of the product being purchased

        `units`                 Nullable(Float64),                  -- Product units (1 if sold by wight (see quantity))
        `unit_price`            Nullable(Float64),                  -- Price ($) of the product being purchased
        `unit_cost`             Nullable(Float64),                  -- Cost ($) of the product being purchased

        `bundled_units`         Nullable(Int16),                    -- Number of units in a volume pack or bundle
        `unit_size`             Nullable(Float64),                  -- The quantity of each unit
        `uom`                   LowCardinality(String),             -- Unit of measure of the product(s) being purchased (Weight, Duration, Items, Volume, etc.)

        `tax_percentage`        Nullable(Float32),                  -- Total tax-percentage associated with the product purchase (unit_price * units * tax_rate = tax)
        `discount_percentage`   Nullable(Float32),                  -- The discount-percentage applied to the product (unit_price * units * discount_rate = discount)
        `kickback_percentage`   Nullable(Float32),                  -- The discount-percentage applied to the product (unit_price * units * discount_rate = discount)
        `commission`            Nullable(Float32),                  -- The total commission percentage applied to the product on the line basis (unit_price * units * commission_rate = commission)

        `scale_item`            Nullable(BOOLEAN),                  -- If the quantity of the product was measured during checkout / at the register
        `price_changed`         Nullable(BOOLEAN),                  -- If the price of the product has changed at the register/terminal
        `line_discounted`       Nullable(BOOLEAN),                  -- If the line item has a discount

        `price_bracket`         LowCardinality(String),         -- Price bracket of the product being purchased
        `income_category`       LowCardinality(String),             -- Income category of the product being purchased

        `coupon`                LowCardinality(String),             -- Coupon code associated with a product (for example, MAY_DEALS_3)
        `url`                   LowCardinality(String),             -- URL of the product page
        `img_url`               LowCardinality(String)              -- Image url of the product
    ),

    `analysis` Nested (                                             -- Analysis array is used to track the cost associated with analysis of the event. This is strictly for internal use and should not be used for any other purpose
        `item` LowCardinality(String),                              -- The item that is involved in the event
        `provider` LowCardinality(String),                          -- The provider of the item that is involved in the event
        `variant` LowCardinality(String),                           -- The variant of the item that is involved in the event
        `processing_time` Nullable(Float),                          -- The process time of the item that is involved in the event
        `token_in` Nullable(Int32),                                 -- The token of the item that is involved in the event
        `token_out` Nullable(Int32),                                -- The token of the item that is involved in the event
        `currency` LowCardinality(String),                          -- The currency of the item that is involved in the event
        `amount` Nullable(Float)                                    -- The price of the item that is involved in the event
    ),

    `base_events` Nested (                                          -- If this is an derived event (higher order) then this will be populated with the base event information
        `entity_gid` UUID,
        `type` LowCardinality(String),
        `event` LowCardinality(String),
        `timestamp` DateTime64,
        `message_id` String,                                        -- The message ID of the event
        `event_gid` UUID                                            -- The event gid of the root event
    ),

    `access` Nested (                                               -- Black or whitelist of users that have access to the event or not
        `type` Enum8('Blacklisted'=1, 'Whitelisted'=2),             -- The type of the user
        `label` LowCardinality(String),                             -- The user ID of the user
        `user_gid` UUID,                                            -- The user ID of the user
        `organization_gid` Nullable(UUID),                          -- The department ID (sub organization) of users that have access
        `date_from` Nullable(DateTime64),                           -- The access start date
        `date_to` Nullable(DateTime64)                              -- The access end date
    ),
                                                                    -- Source and access information
    `source.type` Nullable(String),                                 -- The type of source (e.g. "CRM", "ERP", "eCommerce", "Social", "Email", "SMS", "Web", "Mobile", "Other")
    `source.label` Nullable(String),                                -- The label of the source of the event
    `source.source_gid` Nullable(UUID),                             -- The Graph UUID of the source of the event
    `source.access_gid` Nullable(UUID),                             -- The Graph UUID of the authentication details of the source of the event

                                                                    -- Timestamps associated with the handling of the event
    `local_time` Nullable(DateTime64),                              -- The original timestamp of the event
    `original_timestamp` Nullable(DateTime64),                      -- The original timestamp of the event
    `received_at` Nullable(DateTime64),                             -- The time the event was received by Segment
    `sent_at` Nullable(DateTime64),                                 -- The timestamp of when the event was sent

                                                                    -- Event metadata
    `message_id` String CODEC(ZSTD(1)),                             -- A unique ID for each message as assigned by the client library
    `event_gid` UUID,                                               -- A unique GID for each message - calculated on the server side from the message ID or other factors if missing
    `analyse` Map(LowCardinality(String), Boolean), -- analysis     -- Custom analysis flags that override the default analysis for this event
    `integrations` Map(LowCardinality(String), Boolean),            -- Customer integrations flags that override the default integrations for this event

    `write_key` LowCardinality(String),                             -- The write key used to send the event (salted hash of the write key) - Internal, can not be set by the user or vie API
    `ttl_days` Nullable(Float64),                                   -- The number of days the event will be stored in the database (defaults to forever)
    `partition` LowCardinality(String)                              -- The version of the event message - Internal, can not be set by the user or vie API
)
ENGINE = ReplacingMergeTree()
    PARTITION BY (partition, toStartOfMonth(timestamp))
    PRIMARY KEY (entity_gid, type, event, timestamp, event_gid)
    ORDER BY (entity_gid, type, event, timestamp, event_gid);
