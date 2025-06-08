### Core Event Properties
| Field        | Type       | Description                                                                 |
| ------------ | ---------- | --------------------------------------------------------------------------- |
| `timestamp`  | DateTime64 | UTC timestamp when the event occurred                                       |
| `type`       | String     | Type of the event (`track`, `page`, `identify`, `group`, `alias`, `screen`) |
| `event`      | String     | Name of the event (e.g., "Product Added")                                   |
| `message_id` | String     | Unique identifier for the message                                           |

### User and Session Identification
| Field          | Type             | Description                                               |
| -------------- | ---------------- | --------------------------------------------------------- |
| `anonymous_id` | Nullable(String) | Anonymous ID prior to user identification                 |
| `user_id`      | Nullable(String) | Unique user identifier (post-identification)              |
| `previous_id`  | Nullable(String) | Previous user ID (e.g., `anonymous_id` before `identify`) |
| `session_id`   | Nullable(String) | Unique identifier for a user session                      |

### Context Information
| Field              | Type           | Description                                       |
| ------------------ | -------------- | ------------------------------------------------- |
| `context_ip`       | Nullable(IPv4) | IP address of the user                            |
| `context.locale`   | String         | Locale where the event occurred (e.g., "en-US")   |
| `context.group_id` | String         | Group ID associated with the event                |
| `context.timezone` | String         | Timezone of event occurrence                      |
| `context.location` | Point          | Latitude/Longitude of event location              |
| `context.extras`   | String         | Additional event properties not explicitly mapped |

### Campaign Properties
| Field               | Type   | Description                      |
| ------------------- | ------ | -------------------------------- |
| `campaign.campaign` | String | Campaign name (e.g., "summer")   |
| `campaign.source`   | String | Campaign source (e.g., "google") |
| `campaign.medium`   | String | Campaign medium (e.g., "cpc")    |
| `campaign.term`     | String | Campaign term (e.g., keyword)    |
| `campaign.content`  | String | Campaign content (e.g., "ad1")   |

### App and Device Information
| Field                        | Type              | Description                          |
| ---------------------------- | ----------------- | ------------------------------------ |
| `app.name`                   | String            | Name of the app                      |
| `app.version`                | String            | Version of the app                   |
| `app.build`                  | String            | Build number of the app              |
| `app.namespace`              | String            | App namespace                        |
| `device.id`                  | String            | Device unique identifier             |
| `device.manufacturer`        | String            | Device manufacturer                  |
| `device.model`               | String            | Device model                         |
| `device.type`                | String            | Device type (e.g., "ios", "android") |
| `device.version`             | String            | Device OS version                    |
| `device.ad_tracking_enabled` | Nullable(Boolean) | If advertising tracking is enabled   |
| `device.advertising_id`      | String            | Advertising ID                       |
| `device.locale`              | String            | Device locale                        |
| `device.timezone`            | String            | Device timezone                      |

### OS Information
| Field        | Type   | Description                                    |
| ------------ | ------ | ---------------------------------------------- |
| `os.name`    | String | Operating system name (e.g., "iOS", "Android") |
| `os.version` | String | Operating system version                       |

### Library Information
| Field             | Type   | Description                                                 |
| ----------------- | ------ | ----------------------------------------------------------- |
| `library.name`    | String | Library name used to send the event (e.g., "analytics-ios") |
| `library.version` | String | Version of the event library                                |

### Browser Information
| Field                  | Type              | Description                  |
| ---------------------- | ----------------- | ---------------------------- |
| `user_agent.signature` | String            | Full user agent string       |
| `user_agent.mobile`    | Nullable(Boolean) | Whether the device is mobile |
| `user_agent.platform`  | String            | User agent platform          |

### Network Information
| Field               | Type              | Description                  |
| ------------------- | ----------------- | ---------------------------- |
| `network.carrier`   | String            | Mobile network carrier name  |
| `network.cellular`  | Nullable(Boolean) | Whether on cellular network  |
| `network.wifi`      | Nullable(Boolean) | Whether on Wi-Fi             |
| `network.bluetooth` | Nullable(Boolean) | Whether Bluetooth is enabled |

### Page Information (Web-specific)
| Field                   | Type   | Description                 |
| ----------------------- | ------ | --------------------------- |
| `page.url`              | String | Full URL of the page viewed |
| `page.path`             | String | Path of the page            |
| `page.host`             | String | Host domain                 |
| `page.title`            | String | Page title                  |
| `page.search`           | String | Search query within URL     |
| `page.referrer`         | String | Referring page URL          |
| `page.referring_domain` | String | Referring domain            |

### Referrer Information
| Field           | Type   | Description                |
| --------------- | ------ | -------------------------- |
| `referrer.id`   | String | Referrer unique identifier |
| `referrer.type` | String | Type of referrer           |

### Screen Information (Mobile-specific)
| Field                 | Type            | Description             |
| --------------------- | --------------- | ----------------------- |
| `screen.width`        | Nullable(Int16) | Screen width in pixels  |
| `screen.height`       | Nullable(Int16) | Screen height in pixels |
| `screen.density`      | Nullable(Int16) | Screen density          |
| `screen.inner_width`  | Nullable(Int16) | Inner viewport width    |
| `screen.inner_height` | Nullable(Int16) | Inner viewport height   |

### Event Source and Metadata
| Field                | Type                 | Description                               |
| -------------------- | -------------------- | ----------------------------------------- |
| `write_key`          | String               | Segment write key (hashed)                |
| `received_at`        | Nullable(DateTime64) | Timestamp event received by Segment       |
| `sent_at`            | Nullable(DateTime64) | Timestamp when event was sent from client |
| `original_timestamp` | Nullable(DateTime64) | Original timestamp of event creation      |
