---
title: Event Forwarding Control (integrations field)
---

# Event Forwarding Control (`integrations` field)

The `integrations` field in the Semantic Event Schema provides a powerful mechanism for explicit, per-event control over whether an event should be forwarded to specific downstream destinations or third-party integrations. This allows for fine-grained management of data flow, potentially overriding default pipeline routing rules or configurations.

This field is particularly useful for scenarios such as selectively sending certain events to specific tools, preventing sensitive or noisy events from reaching certain destinations, or A/B testing new integrations with a subset of event data.

## `integrations` Field Definition

| Name             | Required | Data Type               | Description                                                                                                                                                                                                                            |
|------------------|----------|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `integrations`   |          | `Map(String, Boolean)`  | A map for explicit, per-event control over forwarding to downstream destinations. Keys are integration names (originally `LowCardinality(String)`), values are booleans (`true` to send, `false` to not send). Absence of a key implies default routing for that integration. |

## Structure of the `integrations` Map

The `integrations` field is defined conceptually as a `Map<String, Boolean>`.

*   **Key (`String`):** The key is a string that represents the unique name or identifier of a specific configured downstream destination or integration. Examples could be "Salesforce", "GoogleAnalytics", "CustomerIO_Webhook", "DataWarehouse_Primary", or "Zendesk". In the underlying SQL, this key is typically a `LowCardinality(String)` for efficiency.

*   **Value (`Boolean`):** The value is a boolean that determines the forwarding action for the integration specified by the key:
    *   `true`: Explicitly instructs the pipeline to send the event to this integration.
    *   `false`: Explicitly instructs the pipeline *not* to send the event to this integration.

**Behavior for Absent Keys:**
If a specific integration key is *not present* in the `integrations` map for a given event, that integration will typically follow its default routing behavior. This default behavior is configured at the pipeline or integration setup level and might mean the event is sent, or not sent, based on those global or tool-specific rules. The `integrations` map provides a way to override these defaults on an individual event basis.

## How to Use the `integrations` Field

The `integrations` field offers granular control over your event data flow. To use it effectively:

1.  **Identify Configured Integrations:** You need to know the specific keys (names) that your data pipeline uses to identify each configured downstream destination. These keys are typically defined during the setup of your event collection and routing infrastructure. Refer to your internal documentation or data platform team for a list of available integration keys.
2.  **Apply Logic in Event Generation:** When an event is generated, if specific routing decisions need to be made for that event, populate the `integrations` map accordingly. For example, a client application might decide that certain diagnostic events should not go to a marketing analytics tool.
3.  **Pipeline Enforcement:** The event processing pipeline must be designed to interpret the `integrations` map and act upon its directives, routing the event only to destinations that are either explicitly set to `true` or are enabled by default and not explicitly set to `false`.

## Use-Case Examples

Here are some examples illustrating how the `integrations` map can be used:

1.  **Selective Forwarding to Specific Tools:**
    You want a particular event (e.g., a high-value "Subscription Upgraded" event) to be sent only to your primary Data Warehouse and a CRM like Salesforce, overriding other defaults.
    ```json
    {
      "event": "Subscription Upgraded",
      // ... other event fields
      "integrations": {
        "DataWarehouse_Primary": true,
        "Salesforce_CRM": true
      }
    }
    ```
    *(This implies that if other integrations like "GeneralAnalytics" or "EmailMarketingTool" were configured with default ON, they would not receive this specific event unless also listed as `true` or if the pipeline logic defaults to sending if not mentioned.)*

2.  **Explicitly Excluding an Event from a Destination:**
    You have a verbose "Debug Logged" event that is useful for developers but should not clutter your main production analytics suite.
    ```json
    {
      "event": "Debug Logged",
      // ... other event fields
      "integrations": {
        "ProductionAnalyticsSuite": false
      }
    }
    ```
    *(This ensures the event does not go to "ProductionAnalyticsSuite", even if that integration is enabled by default for most other events.)*

3.  **Targeted Enablement for a New or Beta Integration:**
    You are testing a new analytics tool and want to send only specific types of events or events from a particular user segment to it.
    ```json
    {
      "event": "New Feature Used",
      // ... other event fields
      "properties": {
        "feature_name": "BetaDashboard"
      },
      "integrations": {
        "NewBetaAnalyticsTool": true
      }
    }
    ```

4.  **Combining Inclusion and Exclusion Rules:**
    Ensure an event is archived for compliance but prevent it from triggering real-time alerts.
    ```json
    {
      "event": "System Maintenance Started",
      // ... other event fields
      "integrations": {
        "LongTermEventArchive": true,
        "RealTimeAlertingSystem": false
      }
    }
    ```

By leveraging the `integrations` map, you gain precise control over where each piece of your event data flows, allowing for optimized costs, cleaner data in downstream tools, and flexible testing of new destinations.
