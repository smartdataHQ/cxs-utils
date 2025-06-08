---
title: Internal Analysis & Processing Metrics (analysis field)
---

# Internal Analysis & Processing Metrics (`analysis` field)

The `analysis` field within the Semantic Event Schema is a nested structure designed to store metadata related to the internal processing, analysis, and potential costs associated with an event as it moves through the data pipeline and undergoes various enrichment or analytical steps.

{% .callout type="warning" %}
**Important Notice: For Internal Use Only**

The `analysis` structure is used to track costs and metrics associated with the internal analysis and processing of an event. **It is strictly for internal operational use by the data platform team and should not be used for any other purpose by external consumers or for end-user analytics.** The fields and their meanings are subject to change without notice and are not intended for public or general analytical consumption.
{% / .callout %}

When present on an event, the `analysis` field is typically a list (array) of objects. Each object represents a specific internal processing or analysis step that was instrumented, allowing for multiple such steps to be recorded for a single event.

## Analysis Object Properties

The following table details the fields found within each object in the `analysis` list. These fields are populated by internal systems for operational monitoring.

| Property Name     | Type                | Description                                                                                                   | Optional |
|-------------------|---------------------|---------------------------------------------------------------------------------------------------------------|----------|
| `item`            | `String`            | Identifies the specific internal analysis item, service, or model being tracked (e.g., "LLMEnrichment", "NERService", "RiskScoreModel"). From `LowCardinality(String)`. | No       |
| `provider`        | `String`            | The provider of the analysis item or service (e.g., "OpenAI", "AWSComprehend", "InternalModelService"). From `LowCardinality(String)`. | No       |
| `variant`         | `String (Optional)` | Specifies a particular version, model, or variant of the item or provider (e.g., "text-davinci-003", "v2.1", "high_sensitivity_config"). From `LowCardinality(String)`. | Yes      |
| `processing_time` | `Float (Optional)`  | The time taken for this analysis step, typically in seconds or milliseconds.                                  | Yes      |
| `token_in`        | `Integer (Optional)`| Number of input tokens processed (e.g., for LLM or NLP services).                                             | Yes      |
| `token_out`       | `Integer (Optional)`| Number of output tokens generated (e.g., for LLM or NLP services).                                            | Yes      |
| `currency`        | `String (Optional)` | Currency code (e.g., "USD") if a monetary cost is associated with this analysis step. From `LowCardinality(String)`. | Yes      |
| `amount`          | `Float (Optional)`  | The monetary amount or cost associated with this analysis step, in the specified `currency`.                   | Yes      |

## Internal Use-Case Examples

The `analysis` structure is used by internal teams to monitor the performance, cost, and operational aspects of the event processing pipeline. **These examples are for illustrative internal purposes only and are not intended for end-user analytics.**

1.  **Tracking LLM Cost for Event Content Summarization:**
    An event's content might be summarized by an LLM. The `analysis` entry could be:
    ```json
    {
      "item": "LLMSummarization",
      "provider": "OpenAI",
      "variant": "gpt-3.5-turbo",
      "processing_time": 0.85,
      "token_in": 750,
      "token_out": 120,
      "currency": "USD",
      "amount": 0.0018
    }
    ```

2.  **Monitoring Token Usage for Entity Extraction:**
    An NLP service extracts entities from event text.
    ```json
    {
      "item": "NERExtraction",
      "provider": "InternalNLPService",
      "variant": "model_v3.2_finance",
      "token_in": 400,
      "token_out": 65
    }
    ```

3.  **Measuring Processing Time for a Risk Scoring Step:**
    An event is passed through a risk scoring model.
    ```json
    {
      "item": "RiskAssessment",
      "provider": "InternalFraudDetection",
      "variant": "ruleset_v1.5",
      "processing_time": 0.045
    }
    ```

These internal metrics help the data platform team optimize resource usage, manage costs, identify bottlenecks, and ensure the reliability of various automated analysis and enrichment services operating on the event stream.
