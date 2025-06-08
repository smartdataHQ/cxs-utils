---
title: Device & OS Information
---

# Device & Operating System Information (`device.*` and `os.*` fields)

Semantic events often include details about the user's device and operating system from which the event originated. This information is typically derived from the User-Agent string (for web events) or collected directly by mobile SDKs (for app events). These properties, prefixed with `device.*` and `os.*`, are crucial for a variety of analytical, diagnostic, and user experience adaptation purposes.

## Device Properties (`device.*`)

These properties describe the characteristics of the device used by the user when the event occurred.

| Property Name                 | Type                  | Description                                                                                                                               | Optional |
|-------------------------------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `device.id`                   | `String (Optional)`   | A unique identifier for the device instance (e.g., vendor ID, `idfv`).                                                                    | Yes      |
| `device.manufacturer`         | `String (Optional)`   | The manufacturer of the device (e.g., "Apple", "Samsung", "Google"). From `LowCardinality(String)`.                                         | Yes      |
| `device.model`                | `String (Optional)`   | The specific model of the device (e.g., "iPhone 13 Pro", "SM-G998U", "Pixel 6"). From `LowCardinality(String)`.                            | Yes      |
| `device.name`                 | `String (Optional)`   | A user-assigned name for the device, if available (e.g., "John's iPhone"). From `LowCardinality(String)`.                                   | Yes      |
| `device.type`                 | `String (Optional)`   | The type of device (e.g., "mobile", "tablet", "desktop", "wearable"). From `LowCardinality(String)`.                                        | Yes      |
| `device.version`              | `String (Optional)`   | The version of the device hardware or firmware, if distinct from the OS version. May sometimes overlap with `os.version`. See note below. From `LowCardinality(String)`. | Yes      |
| `device.brand`                | `String (Optional)`   | The brand name of the device (e.g., "iPhone", "Galaxy", "Pixel"). Often similar to `manufacturer` for some brands, but can differ (e.g., Manufacturer: "Google", Brand: "Pixel"). From `LowCardinality(String)`. | Yes      |
| `device.advertising_id`       | `String (Optional)`   | The advertising identifier (e.g., IDFA for iOS, GAID for Android).                                                                        | Yes      |
| `device.ad_tracking_enabled`  | `Boolean (Optional)`  | Indicates whether the user has enabled ad tracking on their device.                                                                       | Yes      |
| `device.token`                | `String (Optional)`   | A device token, often used for push notifications.                                                                                        | Yes      |

**Note on `device.manufacturer` vs. `device.brand`:**
*   `device.manufacturer` refers to the company that made the device (e.g., "Apple Inc.", "Samsung Electronics").
*   `device.brand` often refers to the commercial brand or product line name (e.g., "iPhone", "Samsung Galaxy", "Google Pixel"). For some, like Apple, these might be very similar or the same in common usage.

## Operating System Properties (`os.*`)

These properties describe the operating system running on the device.

| Property Name | Type                | Description                                                                                     | Optional |
|---------------|---------------------|-------------------------------------------------------------------------------------------------|----------|
| `os.name`     | `String (Optional)` | The name of the operating system (e.g., "iOS", "Android", "Windows", "macOS"). From `LowCardinality(String)`. | Yes      |
| `os.version`  | `String (Optional)` | The version of the operating system (e.g., "15.1", "12.0", "11"). From `LowCardinality(String)`.   | Yes      |

**Note on `device.version` vs. `os.version`:**
The `os.version` field is generally the canonical place for the operating system's version number (e.g., "16.2" for iOS, "13" for Android). The `device.version` field *could* refer to a specific hardware revision or firmware version if that's distinct and relevant, but it's often less consistently populated or might duplicate the OS version. For OS-level targeting or analysis, `os.version` is typically more reliable.

## Purpose and Usage

Device and OS information provides valuable context to semantic events, enabling:

*   **Analytics & Segmentation:**
    *   Understanding feature adoption across different device types (e.g., "mobile" vs. "desktop").
    *   Analyzing user behavior based on OS (e.g., "iOS users engage more with X feature than Android users").
    *   Tracking performance or error rates specific to OS versions or device models to identify platform-specific issues.
*   **UI/UX Adaptation:**
    *   Tailoring application interfaces or features based on device capabilities, screen size (often inferred from `device.model`), or OS features.
*   **Troubleshooting & Support:**
    *   Diagnosing issues that might be specific to a particular device model, OS version, or even manufacturer.
    *   Understanding if ad tracking limitations (`device.ad_tracking_enabled`) might affect marketing integrations.
*   **Marketing & Targeting:**
    *   Refining marketing strategies based on the technological profile of the user base.
    *   Targeting specific device types or OS versions for campaigns or app features.
*   **Development Prioritization:**
    *   Making informed decisions about which OS versions or device types to prioritize for new development or ongoing support based on usage patterns.

By capturing these `device.*` and `os.*` details, businesses can gain a deeper understanding of the technological context in which users interact with their products and services, leading to better product development, more effective marketing, and improved user support.
