---
title: Website Interaction Properties
---

# Website Interaction Properties

Events originating from websites are typically enriched with a variety of properties that describe the user's browsing context, the page they interacted with, details about their browser and screen, and the tracking library that captured the event. These fields, often prefixed with `page.*`, `referrer.*`, `screen.*`, `user_agent.*`, and `library.*`, are fundamental for web analytics and understanding user engagement on web platforms.

## Page Properties (`page.*`)

These properties provide details about the web page on which the event occurred.

| Property Name           | Type                | Description                                                                                                | Optional |
|-------------------------|---------------------|------------------------------------------------------------------------------------------------------------|----------|
| `page.url`              | `String (Optional)` | The full URL of the page where the event was generated (e.g., "https://www.example.com/path?query=value").    | Yes      |
| `page.path`             | `String (Optional)` | The path part of the URL (e.g., "/path/to/page.html").                                                     | Yes      |
| `page.title`            | `String (Optional)` | The title of the web page, typically from the `<title>` HTML tag.                                            | Yes      |
| `page.host`             | `String (Optional)` | The hostname of the page URL (e.g., "www.example.com"). From `LowCardinality(String)`.                      | Yes      |
| `page.referrer`         | `String (Optional)` | The full URL of the page that referred the user to the current page.                                         | Yes      |
| `page.referring_domain` | `String (Optional)` | The domain of the referring URL. Automatically parsed from `page.referrer`. From `LowCardinality(String)`.     | Yes      |
| `page.search`           | `String (Optional)` | The search query string part of the page URL (e.g., "?query=value").                                       | Yes      |
| `page.encoding`         | `String (Optional)` | Character encoding of the page, (e.g. "UTF-8"). From `LowCardinality(String)`.                             | Yes      |

## Referring Source Properties (`referrer.*`)

These properties can provide more structured or specific information about the source that referred the user to the website, potentially beyond what `page.referrer` captures.

| Property Name   | Type                | Description                                                                                                | Optional |
|-----------------|---------------------|------------------------------------------------------------------------------------------------------------|----------|
| `referrer.id`   | `String (Optional)` | An identifier for a specific referring source, link, or affiliate. From `LowCardinality(String)`.            | Yes      |
| `referrer.type` | `String (Optional)` | The type of the referrer (e.g., "affiliate", "partner_integration", "internal_campaign"). From `LowCardinality(String)`. | Yes      |

**Note:** `referrer.*` fields might be used by specific integrations or for more granular programmatic referrer tracking, complementing the general `page.referrer` URL. They can also help differentiate internal referrers from external ones if specific `referrer.type` values are used.

## Screen Properties (`screen.*`)

These properties describe the characteristics of the user's screen or browser window where the web page was displayed.

| Property Name         | Type                | Description                                                                                              | Optional |
|-----------------------|---------------------|----------------------------------------------------------------------------------------------------------|----------|
| `screen.width`        | `Integer (Optional)`| The total width of the user's screen in pixels (e.g., 1920). From `Nullable(Int16)`.                     | Yes      |
| `screen.height`       | `Integer (Optional)`| The total height of the user's screen in pixels (e.g., 1080). From `Nullable(Int16)`.                    | Yes      |
| `screen.density`      | `Integer (Optional)`| The pixel density of the screen (e.g., 1 for standard, 2 for Retina). From `Nullable(Int16)`.             | Yes      |
| `screen.inner_width`  | `Integer (Optional)`| The inner width of the browser window (viewport) in pixels. From `Nullable(Int16)`.                      | Yes      |
| `screen.inner_height` | `Integer (Optional)`| The inner height of the browser window (viewport) in pixels. From `Nullable(Int16)`.                     | Yes      |

## User Agent & Browser Properties (`user_agent.*`)

These properties are derived from parsing the browser's User-Agent string and provide information about the browser, OS, and device platform.

| Property Name          | Type                | Description                                                                                                   | Optional |
|------------------------|---------------------|---------------------------------------------------------------------------------------------------------------|----------|
| `user_agent.signature` | `String (Optional)` | The full, raw User-Agent string from the browser.                                                             | Yes      |
| `user_agent.mobile`    | `Boolean (Optional)`| Indicates if the User-Agent string suggests a mobile device.                                                  | Yes      |
| `user_agent.platform`  | `String (Optional)` | The platform indicated by the User-Agent (e.g., "Windows", "Macintosh", "Linux", "iPhone"). From `LowCardinality(String)`. | Yes      |

### User-Agent Client Hints (`user_agent.data`)
Modern browsers may provide more structured User-Agent Client Hints. The `user_agent.data` field is a nested structure to capture this.
*   **Structure:** A list/array of objects, where each object has:
    *   `brand` (`String` from `LowCardinality(String)`): The browser brand (e.g., "Google Chrome", "Microsoft Edge").
    *   `version` (`String` from `LowCardinality(String)`): The major version of the browser brand.
*   **Example:**
    ```json
    "user_agent.data": [
      { "brand": "Not_A Brand", "version": "99" },
      { "brand": "Google Chrome", "version": "109" },
      { "brand": "Chromium", "version": "109" }
    ]
    ```

## Tracking Library Properties (`library.*`)

These properties identify the client-side library or SDK that was used to generate and send the event.

| Property Name     | Type                | Description                                                                                               | Optional |
|-------------------|---------------------|-----------------------------------------------------------------------------------------------------------|----------|
| `library.name`    | `String (Optional)` | The name of the analytics library (e.g., "analytics.js", "segment-web", "custom_tracker"). From `LowCardinality(String)`. | Yes      |
| `library.version` | `String (Optional)` | The version of the analytics library (e.g., "4.1.0", "v2.beta"). From `LowCardinality(String)`.             | Yes      |

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
