---
title: Classification Properties
---

# Classification Properties

The `classification` nested structure provides a robust method to categorize, tag, segment, and prioritize business events and their associated entities. It enables the assignment of rich, structured metadata, making events easily discoverable, actionable, and analyzable. Classifications are especially useful for leveraging AI-driven autonomous analytics, decision-support systems, and deriving contextual insights.

Typically, an event may contain a `classification` field which is a list (array) of classification objects. Each object in this list describes a single classification applied to the event or an entity within it.

## Classification Object Structure

The following table details the fields found within each classification object.

| Name         | Required | Data Type | Description                                                                                                                                                              |
|--------------|----------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`       |          | `String`  | Type of classification, indicating the category or nature of the classification (e.g., 'Intent', 'Category', 'Tag'). See "Allowed Types" below for common examples. Originally `LowCardinality(String)`. |
| `value`      |          | `String`  | The specific classification value assigned, corresponding to the `type` (e.g., "Support Request", "Electronics", "urgent_tag"). Originally `LowCardinality(String)`.      |
| `reasoning`  |          | `String`  | An optional explanation or basis for why this classification was assigned. This field is primarily used for ML/LLM-generated classifications to provide transparency into the decision-making process and is not typically present in standard data integrations.                                                                       |
| `score`      |          | `Float`   | A numerical score assigned to the classification, often by a model or rule (e.g., a relevance or priority score). This field is optional.                                  |
| `confidence` |          | `Float`   | The confidence level (e.g., 0.0 to 1.0) from a model that assigned this classification. This field is optional.                                                            |
| `weight`     |          | `Float`   | The relevance, importance, or weight of this classification (0.0 to 1.0). This field is primarily used for ML/LLM-generated classifications to indicate confidence or importance, or to represent hierarchical relationships in taxonomies (higher weights for more specific categories). Not typically present in standard data integrations.                                                                 |


## Allowed Types and Descriptions
| Type              | Description                                                      | Example `value` Entries                                      |
| ----------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| `Intent`          | The purpose or goal behind the user's action or event.           | `Purchase`, `Inquiry`, `Cancellation`, `Information Request` |
| `Intent Category` | Higher-level grouping of intent for easier analysis.             | `Commercial`, `Support`, `Information`, `Operational`        |
| `Category`        | Main grouping for broad event classification.                    | `Sales`, `Support`, `Marketing`, `Finance`, `Operations`     |
| `Subcategory`     | Detailed sub-grouping within the main category.                  | `Refund Request`, `Product Complaint`, `Payment Issue`       |
| `Tag`             | Flexible tagging for events to enhance discoverability.          | `Urgent`, `VIP Customer`, `Holiday Promotion`                |
| `Segmentation`    | Classification to segment users or events into defined groups.   | `High Value Customer`, `New User`, `Returning Customer`      |
| `Age Group`       | Demographic categorization based on user age.                    | `18-24`, `25-34`, `35-44`                                    |
| `Inbox`           | Used to route or categorize incoming messages and tickets.       | `Billing`, `Technical Support`, `General Inquiry`            |
| `Keyword`         | Keywords extracted from text for quick search or analysis.       | `Delayed Shipment`, `Refund`, `Broken`, `Late Arrival`       |
| `Priority`        | Importance ranking used to manage urgency and response times.    | `High`, `Medium`, `Low`                                      |
| `Other`           | Any additional classification that doesn’t fit predefined types. | Custom-defined by users                                      |

## ML/DL and LLM Integration with Classification Structure
Machine Learning (ML), Deep Learning (DL), and Large Language Models (LLMs) integrate directly with the classification structure within the Context Suite schema. Both internal analytics models and external event sources can generate classifications. This standardized approach enables consistency, interpretability, and efficient automated decision-making throughout the system.

## How Classification Results Are Produced
Classifications may originate from two primary sources:

- **Internal Models (ML/DL/LLM):**\
  - Autonomous, real-time or batch processes analyzing event data.
  - Examples include:
    - Intent detection models trained on user interaction histories.
    - Sentiment analysis models processing user-generated content.
    - Anomaly detection models identifying unusual event patterns.
    - LLMs extracting categories, intents, or tags from natural language event data.

- **External Event Sources:**\

  - Third-party systems or SaaS applications providing pre-classified events.
  - Examples include:
    - E-commerce platforms tagging product views or purchases.
    - CRM systems categorizing customer interactions.

## Workflow for ML/DL/LLM Classification
The typical workflow for internal model classification within the Context Suite:

- Event Ingestion
  - Raw events are ingested into the Context Suite event stream.
- Contextual Enrichment
  - Events are enriched with contextual information (entities, sentiment, location).
- Model Invocation
  - Internal ML/DL or LLM models are invoked automatically:
    - Real-time event processing (CEP).
    - Scheduled batch analysis (daily classification of historical events).
    - On-demand analysis triggered by user actions.
- Model Output
    - Models generate structured classifications, including:
      - type: Classification category (Intent, Priority, Category, etc.).
      - value: Specific classification label assigned.
      - reasoning: Textual explanation (optional but recommended).
      - score: Numerical model output indicating strength or severity.
      - confidence: Probability or confidence of the classification.
      - weight: Relative importance or relevance factor.
- Appending Classification to Events
  - Classification results are appended directly to the original event records within the nested classification structure.


## Example: LLM-Generated Classification
Scenario: A customer submits a support ticket describing delayed delivery.

**Raw Event Example:**
```
{
    "type": "track",
    "event": "Support Ticket Created",
    "content": {
        "Subject": "Package delayed",
        "Body": "I ordered my item two weeks ago, and it has not arrived yet."
    }
}
```

**LLM-Generated Classification Output:**
```
"classification": [
  {
    "type": "intent_category",
    "value": "Support",
    "reasoning": "Detected from semantic understanding of ticket content.",
    "score": 0.98,
    "confidence": 0.95,
    "weight": 1.0
  },
  {
    "type": "customer_intent",
    "value": "Report Delivery Issue",
    "reasoning": "Extracted from keywords and context related to delivery delays.",
    "score": 0.94,  
    "confidence": 0.90,
    "weight": 0.9
  },
  {
    "type": "Priority",
    "value": "High",
    "reasoning": "Customer frustration indicated urgency; time-sensitive issue.",
    "score": 0.92,
    "confidence": 0.89,
    "weight": 1.0
  }
]
```

## Best Practices for ML/DL/LLM Classification Integration
- **Model Transparency:**\
Clearly document the reasoning behind model-generated classifications.

- **Confidence Thresholding:**\
Establish confidence thresholds for automated decision-making (e.g., confidence ≥ 0.85 triggers automated action).

- **Auditability:**\
Maintain detailed logs for regulatory compliance and model transparency.

- **Model Versioning:**\
Track classification models with version numbers or identifiers in the analysis nested structure for traceability.

- **Feedback Loops:**\
Integrate user and system feedback into ongoing model training and refinement to continually improve accuracy.


## Benefits of Integrated Classification
- **Enhanced Decision Making:**\
Real-time, high-confidence classifications improve speed and accuracy of business decisions.

- **Scalability:**\
Automated classification easily scales across large volumes of data.

- **Improved Customer Experience:**\
Personalization and responsiveness driven by accurate classifications.

- **Operational Efficiency:**\
Reduction in manual classification efforts, allowing employees to focus on higher-value tasks.

- **Holistic Insights:**\
Rich classification metadata enables advanced analytics, reporting, and actionable insights.