---
title: Sentiment Properties
---

# Semantic Event Schema: Sentiment Properties

Sentiment properties are designed to capture and describe subjective opinions, feelings, or attitudes expressed within or related to a semantic event. This is often crucial for understanding customer feedback, analyzing social media interactions, or evaluating responses to surveys and communications.

Typically, an event may contain a `sentiment` field which is a list (array) of sentiment objects. Each object in this list describes a single piece of expressed sentiment.

## Sentiment Object Properties

The following table details the fields found within each sentiment object.

| Name              | Required | Data Type | Description                                                                                                                                                                                             |
|-------------------|----------|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`            |          | `String`  | The classification of the sentiment expressed. Enum-like values include: 'Praise', 'Criticism', 'Complaint', 'Request', 'Suggestion', 'Question', 'Abuse', 'Threat', 'Opinion', 'Other'. Originally `LowCardinality(String)`. |
| `sentiment`       |          | `String`  | The actual sentiment expressed, often a keyword or phrase (e.g., "positive", "negative", "loved_it", "too_complex"). Originally `LowCardinality(String)`.                                                  |
| `entity_type`     |          | `String`  | The type of entity the sentiment is *about* (e.g., "product", "service", "company", "employee"). Originally `LowCardinality(String)`.                                                                     |
| `entity_gid`      |          | `UUID`    | The Global ID (GID) of the specific entity instance the sentiment is about. This field is optional.                                                                                                     |
| `id_type`         |          | `String`  | The type of identifier used in the `id` field (e.g., "sku", "ticket_number", "user_id"). Originally `LowCardinality(String)`. This field is optional.                                                      |
| `id`              |          | `String`  | The specific identifier (matching `id_type`) of the entity instance the sentiment is about. This field is optional.                                                                                       |
| `target_category` |          | `String`  | Broad category of what the sentiment specifically targets (e.g., "Usability", "Customer Support", "Pricing"). Originally `LowCardinality(String)`. This field is optional.                               |
| `target_type`     |          | `String`  | More specific type within the `target_category` (e.g., "Button Design" if category is "Usability"). Originally `LowCardinality(String)`. This field is optional.                                          |
| `target_entity`   |          | `String`  | The exact aspect, feature, or sub-component the sentiment is directed towards (e.g., "Checkout Button"). This field is optional.                                                                          |
| `reason`          |          | `String`  | The reasoning or justification provided for the expressed sentiment. This field is optional.                                                                                                              |

## Understanding and Using Sentiment Data

Sentiment data provides valuable context to events, transforming raw interactions into richer insights. Here's how it can be leveraged:

*   **Customer Feedback Analysis:** Analyze sentiment expressed in support tickets, surveys, app reviews, or social media mentions to understand customer satisfaction, identify pain points, and discover areas for improvement. For example, a "Complaint" `type` with a "negative" `sentiment` about a "product" (`entity_type`) might specify "Documentation" as the `target_category` and "Installation Guide" as the `target_entity`.
*   **Brand Monitoring:** Track public sentiment towards your brand or specific products over time.
*   **Service Quality Assessment:** Gauge sentiment towards customer service interactions, helping to identify training needs or process improvements.
*   **Proactive Issue Resolution:** Identify emerging negative sentiment trends to address issues before they escalate.

**Key Distinctions:**

*   **Sentiment About vs. Sentiment Target:**
    *   `entity_type`, `entity_gid`, `id_type`, and `id` define the primary subject the sentiment is *about* (e.g., a specific purchased product).
    *   `target_category`, `target_type`, and `target_entity` allow for more granular detail on what *aspect* of that primary subject the sentiment is directed at (e.g., the "battery life" of that purchased product). If the sentiment is about the entity as a whole, these target fields might be omitted.

By structuring sentiment data this way, organizations can perform nuanced analysis, connecting opinions directly to the entities and specific aspects they concern, leading to more targeted actions and a better understanding of qualitative feedback at scale.
