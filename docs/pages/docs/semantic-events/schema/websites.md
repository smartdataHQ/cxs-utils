---
title: Website Interaction Properties
---

# Website Interaction Properties

Events originating from websites are typically enriched with a variety of properties that describe the user's browsing context, the page they interacted with, details about their browser and screen, and the tracking library that captured the event. These fields, often prefixed with `page.*`, `referrer.*`, `screen.*`, `user_agent.*`, and `library.*`, are fundamental for web analytics and understanding user engagement on web platforms.

## Page Properties (`page.*`)

These properties provide details about the web page on which the event occurred.

| Name                    | Required | Data Type | Description                                                                                                                               |
|-------------------------|----------|-----------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `page.url`              |          | `String`  | The full URL of the page where the event was generated (e.g., "https://www.example.com/path?query=value"). This field is optional.           |
| `page.path`             |          | `String`  | The path part of the URL (e.g., "/path/to/page.html"). This field is optional.                                                            |
| `page.title`            |          | `String`  | The title of the web page, typically from the `<title>` HTML tag. This field is optional.                                                   |
| `page.host`             |          | `String`  | The hostname of the page URL (e.g., "www.example.com"). Originally `LowCardinality(String)`. This field is optional.                         |
| `page.referrer`         |          | `String`  | The full URL of the page that referred the user to the current page. This field is optional.                                                |
| `page.referring_domain` |          | `String`  | The domain of the referring URL. Automatically parsed from `page.referrer`. Originally `LowCardinality(String)`. This field is optional.    |
| `page.search`           |          | `String`  | The search query string part of the page URL (e.g., "?query=value"). This field is optional.                                              |
| `page.encoding`         |          | `String`  | Character encoding of the page, (e.g. "UTF-8"). Originally `LowCardinality(String)`. This field is optional.                                |

## Referring Source Properties (`referrer.*`)

These properties can provide more structured or specific information about the source that referred the user to the website, potentially beyond what `page.referrer` captures.

| Name            | Required | Data Type | Description                                                                                                                                                              |
|-----------------|----------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `referrer.id`   |          | `String`  | An identifier for a specific referring source, link, or affiliate. Originally `LowCardinality(String)`. This field is optional.                                            |
| `referrer.type` |          | `String`  | The type of the referrer (e.g., "affiliate", "partner_integration", "internal_campaign"). Originally `LowCardinality(String)`. This field is optional.                      |

**Note:** `referrer.*` fields might be used by specific integrations or for more granular programmatic referrer tracking, complementing the general `page.referrer` URL. They can also help differentiate internal referrers from external ones if specific `referrer.type` values are used.

## Screen Properties (`screen.*`)

These properties describe the characteristics of the user's screen or browser window where the web page was displayed.

| Name                  | Required | Data Type | Description                                                                                                                               |
|-----------------------|----------|-----------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `screen.width`        |          | `Integer` | The total width of the user's screen in pixels (e.g., 1920). Originally `Nullable(Int16)`. This field is optional.                           |
| `screen.height`       |          | `Integer` | The total height of the user's screen in pixels (e.g., 1080). Originally `Nullable(Int16)`. This field is optional.                          |
| `screen.density`      |          | `Integer` | The pixel density of the screen (e.g., 1 for standard, 2 for Retina). Originally `Nullable(Int16)`. This field is optional.                  |
| `screen.inner_width`  |          | `Integer` | The inner width of the browser window (viewport) in pixels. Originally `Nullable(Int16)`. This field is optional.                            |
| `screen.inner_height` |          | `Integer` | The inner height of the browser window (viewport) in pixels. Originally `Nullable(Int16)`. This field is optional.                           |

## User Agent & Browser Properties (`user_agent.*`)

These properties are derived from parsing the browser's User-Agent string and provide information about the browser, OS, and device platform.

| Name                   | Required | Data Type        | Description                                                                                                                                                              |
|------------------------|----------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `user_agent.signature` |          | `String`         | The full, raw User-Agent string from the browser. This field is optional.                                                                                                  |
| `user_agent.mobile`    |          | `Boolean`        | Indicates if the User-Agent string suggests a mobile device. This field is optional.                                                                                       |
| `user_agent.platform`  |          | `String`         | The platform indicated by the User-Agent (e.g., "Windows", "Macintosh", "Linux", "iPhone"). Originally `LowCardinality(String)`. This field is optional.                 |
| `user_agent.data`      |          | `Array(Object)`  | A list of User-Agent Client Hint objects, each detailing browser brand and version. See sub-fields below. This field is optional.                                           |

**`user_agent.data` Object Properties:**

| Name        | Required | Data Type | Description                                                                                                |
|-------------|----------|-----------|------------------------------------------------------------------------------------------------------------|
| `brand`     |          | `String`  | The browser brand (e.g., "Google Chrome", "Microsoft Edge"). Originally `LowCardinality(String)`.            |
| `version`   |          | `String`  | The major version of the browser brand. Originally `LowCardinality(String)`.                                 |

*Example of `user_agent.data` structure:*
```json
"user_agent.data": [
  { "brand": "Not_A Brand", "version": "99" },
  { "brand": "Google Chrome", "version": "109" },
  { "brand": "Chromium", "version": "109" }
]
```

## Tracking Library Properties (`library.*`)

These properties identify the client-side library or SDK that was used to generate and send the event.

| Name              | Required | Data Type | Description                                                                                                                               |
|-------------------|----------|-----------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `library.name`    |          | `String`  | The name of the analytics library (e.g., "analytics.js", "segment-web", "custom_tracker"). Originally `LowCardinality(String)`. This field is optional. |
| `library.version` |          | `String`  | The version of the analytics library (e.g., "4.1.0", "v2.beta"). Originally `LowCardinality(String)`. This field is optional.                |

## Purpose and Usage

This rich set of website interaction properties enables a wide range of analytical capabilities:

*   **Web Analytics:**
    *   Tracking page views, unique visitors, session duration, bounce rates.
    *   Analyzing user navigation paths, entry and exit pages.
    *   Identifying popular content and features on the website.
*   **User Experience (UX) Optimization:**
    *   Understanding the distribution of user screen sizes (`screen.*`) and browser types (`user_agent.*`) to optimize website design, responsiveness, and compatibility.
    *   Identifying if users on specific platforms or browsers experience issues.
*   **Traffic Source Attribution:**
    *   Using `page.referrer`, `page.referring_domain`, and `referrer.*` fields to understand where website traffic originates from (e.g., organic search, social media, direct, other websites). This complements `campaign.*` parameters for marketing attribution.
*   **Client-Side Debugging & Monitoring:**
    *   `library.name` and `library.version` can help in diagnosing issues related to event collection, ensuring that the correct SDK version is deployed and functioning as expected.
*   **Audience Segmentation:**
    *   Grouping users based on their browsing technology (e.g., users on mobile browsers, users with high-resolution screens) for targeted analysis or content delivery.

By leveraging these properties, businesses can gain deep insights into how users interact with their websites, optimize their online presence, and make data-driven decisions to improve user engagement and conversion.
