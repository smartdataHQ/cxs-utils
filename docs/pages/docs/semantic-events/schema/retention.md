---
title: Event Data Retention (ttl_days)
---

# Event Data Retention (`ttl_days` field)

Event data retention refers to the policies, strategies, and mechanisms that determine how long event data is stored in various systems. Managing data retention is crucial for controlling storage costs, complying with legal and regulatory requirements (like GDPR or CCPA), and ensuring data remains useful and accessible for appropriate durations.

The Semantic Event Schema includes a specific field, `ttl_days`, which can be set on individual events to suggest a desired retention period for that particular event.

## The `ttl_days` Property

This field provides a hint to data lifecycle management systems about the intended lifespan of an event in primary storage.

| Name         | Required | Data Type | Description                                                                                                                                                                                                                                                                                          |
|--------------|----------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ttl_days`   |          | `Float`   | A numeric value specifying the suggested Time-To-Live (TTL) for the event, in days. If set, it indicates for how long this specific event should ideally be retained in primary, readily queryable storage systems. The value can include fractions of days (e.g., `0.5` for 12 hours). If `null` or not provided, defaults to indefinite retention subject to global policies. Originally `Nullable(Float64)`. This field is optional. |

**Default Behavior:** If `ttl_days` is `null` or not provided on an event, the event is generally assumed to be retained indefinitely ("defaults to forever") within its primary storage tier. However, this is always subject to any overriding global or system-level retention policies that may be in place.

## Purpose and Implications of `ttl_days`

Setting a `ttl_days` value on events can serve several important purposes:

*   **Storage Management:**
    For high-volume event streams, especially those containing transient or diagnostic data, specifying a shorter `ttl_days` can help manage storage growth and associated costs by identifying data that can be periodically archived or deleted.
*   **Compliance and Data Privacy:**
    Data privacy regulations (e.g., GDPR, CCPA) often include requirements for data minimization and the right to erasure. Setting `ttl_days` can be a mechanism to help comply with mandates that require personal data not to be kept longer than necessary for its intended purpose.
*   **Tiered Storage Strategies:**
    The `ttl_days` value can act as a signal for data lifecycle management processes. For example, events exceeding their suggested TTL might be automatically moved from expensive, high-performance primary storage to more cost-effective long-term archival storage.
*   **Data Relevance:**
    Some event data loses its analytical relevance over time. A defined `ttl_days` can help ensure that dashboards and routine queries primarily operate on timely and relevant data, improving performance and focus.

**Operational Aspects:**

It's important to understand that `ttl_days` is typically a *metadata field* that provides a suggestion or instruction to external processes.
*   The actual deletion or archival of events based on `ttl_days` is usually performed by separate, dedicated data lifecycle management (DLM) jobs or data pipeline components.
*   These DLM processes periodically scan the event data, identify events that have passed their `ttl_days`, and then execute the appropriate action (delete, archive, anonymize).
*   It does not usually imply an automatic, record-level TTL enforced directly by the primary event database in real-time (especially in large-scale distributed systems).

## Example Scenarios

Here’s how `ttl_days` might be used for different types of events:

1.  **Short-term retention for high-volume, transient diagnostic logs:**
    ```json
    {
      "event": "ServiceAPICallTrace",
      "properties": {
        "service_name": "authentication_api",
        "response_time_ms": "15"
      },
      "ttl_days": 7
    }
    ```
    *(This suggests the detailed trace log is primarily needed for short-term debugging and can be removed after a week.)*

2.  **Medium-term retention for standard user interaction analytics:**
    ```json
    {
      "event": "ProductFeatureUsed",
      "user_id": "usr_abc",
      "properties": {
        "feature_name": "dashboard_customization",
        "action_detail": "widget_added"
      },
      "ttl_days": 400
    }
    ```
    *(Retaining for just over a year, e.g., for year-over-year comparisons.)*

3.  **Indefinite primary retention for critical audit or milestone events:**
    (Achieved by omitting `ttl_days` or setting it to `null`)
    ```json
    {
      "event": "SubscriptionPaymentProcessed",
      "user_id": "usr_xyz",
      "commerce.order_id": "ord_12345",
      "commerce.total": 29.99,
      "commerce.currency": "USD"
      // No ttl_days field implies default 'forever' retention in primary storage,
      // subject to global policies.
    }
    ```

## Important Considerations

*   **Global Overrides:** System-wide or global retention policies configured by data administrators may override or complement the event-level `ttl_days`. For example, a global policy might enforce a maximum retention of 2 years for all events, regardless of a longer `ttl_days` set on an individual event. Conversely, certain critical event types might be globally configured for longer retention even if `ttl_days` is not set.
*   **Platform Dependence:** The exact interpretation, enforcement mechanisms, and interaction with global policies for `ttl_days` depend on the specific architecture and data governance rules of the data platform processing and storing the semantic events.
*   **Archival vs. Deletion:** `ttl_days` reaching its end doesn't always mean outright deletion. It often triggers a process that might first archive the data to a different storage tier before eventual deletion, if any.

By thoughtfully applying the `ttl_days` property, organizations can implement more effective and compliant data retention strategies for their semantic event data.
