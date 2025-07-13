---
title: The Event Bible
description: The Event Bible is a collection of all the events and properties that are supported by ContextuSuite.
---


# Introduction to the Event Bible
The Event Bible is a comprehensive reference guide detailing a set of predefined, standardized semantic events designed specifically for use within the Context Suite. It establishes clear naming conventions, required properties, recommended enrichment, and detailed semantic structures, ensuring consistency across organizational data streams. Utilizing the Event Bible helps organizations quickly unlock the full potential of their data within the Context Suite, maximizing analytical accuracy, operational insights, and management visibility.

By leveraging predefined events outlined in the Event Bible—such as eCommerce actions, customer engagement interactions, support ticket events, and operational logs—organizations gain immediate access to fully enriched and analytically optimized event data. These predefined events include carefully structured extended properties, automatically populated and analyzed by the Context Suite middleware. This meticulous enrichment dramatically accelerates the creation of powerful, role-based dashboards, predictive models, advanced analytics, and sophisticated complex event processing (CEP) workflows.

## Unlocks Advanced Capabilities
Events defined in the Event Bible are crafted to provide maximum analytical depth, clarity, and consistency. Each event:

- **Is fully serviced and enriched upon reception**, with automatic contextual enrichment including location details, classifications, sentiment insights, and relevant dimensions and metrics.

- **Undergoes sophisticated internal analysis**, populating advanced classification schemas, sentiment analysis results, entity linking, and related semantic metadata.

- **Supports role-based management dashboards** and predefined analytical models that instantly transform events into actionable insights tailored specifically to executives, analysts, marketing, sales, and operational teams.

- **Feeds into complex event processing (CEP) workflows**, allowing real-time automation and triggering of business processes based on recognized event patterns, correlations, or thresholds.

In short, adhering to the Event Bible ensures that every event captured within the Context Suite is immediately ready for advanced analytical use, significantly reducing time-to-insight and streamlining decision-making.

## Leveraging LLMs for Text Analysis
Certain event types in the Event Bible—such as customer interactions, support tickets, product reviews, or engagement events—often contain free-form textual content. To effectively analyze and classify this content, the Context Suite integrates powerful Large Language Models (LLMs).

Here’s how textual event content is processed:

- **Extraction & Preprocessing:**\
Text content from event fields (such as content.subject, content.body, or descriptions) is automatically extracted and prepared.

- **Semantic Analysis via LLMs:**\
Using state-of-the-art LLMs, each textual event is analyzed to:

  - Identify intent, key topics, or significant entities mentioned in the text.
  - Perform sentiment analysis, accurately capturing nuanced emotional context.
  - Automatically categorize the event based on semantic understanding, aligning it with predefined classifications and taxonomies.

- **Structured Output & Integration:**\
The resulting classifications, sentiment scores, identified entities, and enriched metadata are seamlessly integrated into the event record, making the insights instantly available for analytical dashboards, CEP, and downstream data science tasks.

This robust semantic text analysis significantly enhances analytical precision, enabling deep understanding and proactive management of customer experiences, operational issues, product feedback, and market sentiments.

## Tailored Event Presentation
The Context Suite’s Event Explorer provides a specialized visualization for each predefined event type. Recognizing that every event carries a unique analytical context, the Event Explorer adapts dynamically, highlighting the most relevant properties, metrics, and metadata based on the event type.

- **Custom Event Views:**\
Events such as eCommerce transactions, customer feedback, or support tickets are presented with tailored visualizations emphasizing their most critical properties (e.g., order totals, sentiment indicators, product performance).

- **Intuitive & Readable Format:**\
All events are structured to ensure readability and intuitive understanding, making event data approachable for analysts, managers, and executives alike. Complex data points and metadata are presented clearly, ensuring maximum comprehension at a glance.

- **Quick Access to Enriched Data:**\
Users can easily drill down into detailed enriched properties, semantic classifications, sentiment analysis results, and associated entities, unlocking deeper insights without extensive manual exploration.

- **Role-Based Dashboards and Views:**\
Each event type automatically populates dashboards and summaries designed explicitly for specific organizational roles—whether it’s management overviews, marketing performance reports, or operational analytics. This ensures immediate relevance and actionable insight for each user group.

- **Contextual Highlights & Alerts:**\
The Event Explorer surfaces key contextual insights automatically, highlighting significant changes, anomalies, or critical patterns identified through internal analysis or complex event processing.

- **Interactive Filtering & Exploration:**\
Built-in interactive filtering, search capabilities, and drill-down options allow analysts and managers to quickly segment events, explore relationships, and understand event details in context—significantly enhancing data-driven decision-making.

This tailored, adaptive presentation within the Event Explorer empowers users at all organizational levels to easily interpret, explore, and act upon event-driven insights provided by the Context Suite.

## Schema Best Practices

To ensure optimal clarity, consistency, and efficiency, follow these structured best practices when defining and implementing event schemas:

### 1. Field Naming Convention: Use `snake_case`

Maintain consistency and readability across analytics and event data by strictly adhering to the `snake_case` naming convention for all custom property keys:

| Original Field Name | Converted Field Name |
| ------------------- | -------------------- |
| `searchQuery`       | `search_query`       |
| `pageNumber`        | `page_number`        |
| `propertyTypes`     | `property_types`     |
| `roomAmenityCodes`  | `room_amenity_codes` |

Using this standard simplifies querying and integration within analytical and business intelligence tools.

---

### 2. Context Handling

The `context` object, provided automatically by the Jitsu client library, should be restructured to match internal schema standards.

| Original Nested Property | Elevated Root-Level Property |
| ------------------------ | ---------------------------- |
| `context.page.*`         | `page.*`                     |
| `context.userAgent`      | `user_agent`                 |
| `context.screen.*`       | `screen.*`                   |
| `context.library.*`      | `library.*`                  |


---

### 3. Metrics vs. Dimensions

Accurate differentiation between metrics and dimensions significantly improves analytical capabilities:

* **Metrics:** Numeric fields suitable for aggregation operations such as sums, averages, counts, or other statistical computations.
* **Dimensions:** Categorical fields used for grouping, segmenting, filtering, or drill-down analysis.

| Field Example | Appropriate Classification | Reasoning                                                                        |
| ------------- | -------------------------- | -------------------------------------------------------------------------------- |
| `adults`      | Dimension                  | Used for filtering or segmenting data (e.g., number of adults in searches).      |
| `unit_price`  | Metric                     | Used for calculating averages or totals (e.g., average price, revenue analysis). |

**Practical Examples:**

* Dimension Query: "How many searches requested exactly 3 adults?"
* Metric Query: "What's the average unit price of viewed listings?"

---

### 4. Required Product Fields

For product entries within commerce events, ensure all required fields are included as defined in the schema:

| Field        | Required | Example             |
| ------------ | -------- | ------------------- |
| `entry_type` | Yes      | "Search Results"    |
| `product_id` | Yes      | "1593"              |
| `sku`        | Yes      | "1593"              |
| `product`    | Yes      | "Saga Luxury Villa" |
| `unit_price` | Yes      | 15000               |
| `units`      | Yes      | 1                   |
| `uom`        | Yes      | "night"             |

Including these fields ensures compliance and facilitates accurate downstream analytics and enrichment.

---

### 5. Products & Linked Entities

Avoid duplication and complexity by clearly delineating the use of products and linked entities:

* **No duplication:** Products listed under `commerce.products[]` should **not** appear again within `linked_entities`. These are directly accessible for analytics and enrichment, reducing redundancy and potential data conflicts.

---

### 6. Using the "Properties" Field

Reserve the `properties` field strictly for storing contextual or internal metadata that is **not** intended for analytical purposes, dashboards, or filtering:

```json
"properties": {
  "internal_reference": "xyz-123",
  "debug_info": "not relevant for analytics"
}
```

---

## Running and Customizing the Jitsu Next.js Demo

## Prerequisites

* Node.js (v18.x+ recommended)
* npm

---

## Step-by-Step Setup

### 1. Navigate to the Project Directory

```bash
cd javascript/jitsu-next-demo
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Jitsu Analytics

Open:

```
javascript/jitsu-next-demo/src/lib/jitsu.ts
```

Set your actual analytics endpoint and write key:

```typescript
import { jitsuAnalytics, AnalyticsInterface } from "@jitsu/js";

export const jitsu: AnalyticsInterface = jitsuAnalytics({
  host: "https://inbox.contextsuite.com",  // Replace with your actual Jitsu host URL
  writeKey: "your_write_key_here",         // Replace with your actual write key
  debug: true,                             // Enable debug for testing
});
```
---
## 🛠️ **Changing Analytics Events**

To modify or add new analytics events, you should edit the event payloads directly in:

```
javascript/jitsu-next-demo/src/pages/index.tsx
```

### Example - Modifying the Event

Change the existing payload structure in the `buildEvent` function:

```tsx
const buildEvent = () => ({
  commerce: {
    currency: "USD",
    products: [
      {
        entry_type: "Search Results",
        product_id: "5678",       // Change to your actual product ID
        sku: "SKU-5678",
        product: "Updated Product Name",
        category: "Updated Category",
        unit_price: 149.99,
        units: 1,
        uom: "night" 
      },
    ],
  },
  metrics: {
    review_count: 20,             // Change as needed
  },
  properties: {
    tags: ["Updated", "Analytics"], // Custom tags
  },
  classification: [{ type: "Category", value: "Updated Examples" }],
  timestamp: new Date().toISOString(),
});
```
To change the event name from `"Hotel Viewed"` to another event name, simply update the string passed as the first argument to the `jitsu.track` function inside the `sendEvent` function. For example, if you want to track a `"Product Purchased"` event instead, modify the code as follows:

```js
const sendEvent = async () => {
  try {
    await jitsu.track("Product Purchased", buildEvent()); // Change event name here
    setLog(" Event sent");
  } catch (err) {
    setLog(" Failed to send: " + String(err));
  }
};
```

---

### 4. Run the Demo Application

```bash
npm run dev
```

The demo will be running locally at:

```
http://localhost:3000
```

---

## 🔍 **Checking Payloads via Network Tab**

To verify exactly what data is sent to the analytics server:

1. **Open your browser's Developer Tools** (`F12` or right-click → inspect).
2. Go to the **Network tab**.
3. Trigger the event (e.g., click the button in the demo).

### What to look for in Network Tab:

* **Request URL**: Ensure the correct analytics endpoint is used.
* **Status**: Verify HTTP response (typically `200 OK` indicates success).
* **Request Payload**: Inspect the detailed JSON payload sent.

### How the Payload Appears:

You'll typically see something like this under the request details:

```json
{
  "type": "track",
  "event": "Hotel Viewed",
  "properties": {
    "commerce": {
      "currency": "USD",
      "products": [
        {
          "entry_type": "Search Results",
          "product_id": "5678",
          "sku": "SKU-5678",
          "product": "Updated Product Name",
          "category": "Updated Category",
          "unit_price": 149.99,
          "units": 1,
          "uom": "night"
        }
      ]
    },
    "metrics": {
      "review_count": 20
    },
    "properties": {
      "tags": [
        "Updated",
        "Analytics"
      ]
    },
    "classification": [
      {
        "type": "Category",
        "value": "Updated Examples"
      }
    ],
    "timestamp": "2025-06-26T09:42:24.878Z"
  },
  "userId": null,
  "anonymousId": "26e2891a-8237-42c4-9ca0-1e7050770aae",
  "timestamp": "2025-06-26T09:42:24.881Z",
  "sentAt": "2025-06-26T09:42:24.881Z",
  "messageId": "142cx2t1sg020czobzh2bz",
  "writeKey": "bWP3!E2z1cxs9eq:***",
  "context": {
    "library": {
      "name": "@jitsu/js",
      "version": "2.0.0",
      "env": "browser"
    },
    "userAgent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
    "locale": "en-US",
    "screen": {
      "width": 1279,
      "height": 452,
      "innerWidth": 1279,
      "innerHeight": 452,
      "density": 2
    },
    "traits": {},
    "page": {
      "path": "/",
      "referrer": "",
      "referring_domain": "",
      "host": "localhost:3000",
      "search": "",
      "title": "",
      "url": "http://localhost:3000/",
      "encoding": "UTF-8"
    },
    "clientIds": {},
    "campaign": {}
  }
}

```
##  **Why You Can't Use Simple HTML to Trigger Events**

Using basic HTML, like an `<img>` tag or simple anchor links to send events, is **not suitable for robust analytics tracking**. Here's why:

| Limitation                          | Reason                                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| ❌ **Limited Data Control**          | Pure HTML can't easily send complex JSON payloads or structured event data.                                                         |
| ❌ **No Dynamic Event Building**     | JavaScript-based events can construct detailed, dynamic payloads at runtime (like timestamps, user state, metrics), but HTML can't. |
| ❌ **Lack of Error Handling**        | HTML doesn't handle network errors gracefully. JavaScript can detect failures and retry.                                            |
| ❌ **Security & Compliance**         | JavaScript can ensure data privacy controls (consent checks, anonymization), HTML cannot.                                           |
| ❌ **No Event Queueing or Batching** | JavaScript libraries (like Jitsu/ContextSuite) efficiently batch and queue events. HTML requests are always one-off and immediate.  |
---
