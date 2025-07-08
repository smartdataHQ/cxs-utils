---
title: Event Content (content field)
---

# Event Content (`content` field)

The `content` field in the Semantic Event Schema provides a flexible way to store various textual or string-based content snippets associated with an event.

## `content` Field Definition

| Name      | Required | Data Type             | Description                                                                                                                                                                                             |
|-----------|----------|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `content` |          | `Map(String, String)` | A flexible map to store various textual or string-based content snippets associated with an event. Keys are typically `LowCardinality(String)`. See 'Common Content Keys' below for suggested usage. |

## Common Content Keys

While the `content` map is flexible, several common keys are suggested by the schema definition, covering frequent use cases. Using these standardized keys can help in creating consistency across different event types and sources. The table below lists these common keys and their typical uses:

| Key                | Example Value                                       | Typical Use / Description                                                                 |
|--------------------|-----------------------------------------------------|-------------------------------------------------------------------------------------------|
| `Subject`          | "Your Order Confirmation"                           | The subject line of an email, message, or notification.                                   |
| `Title`            | "Q3 Financial Report"                               | The title of a document, article, page, or section being interacted with.                 |
| `Body`             | "Thank you for your order..."                       | The main body text of an email, message, comment, or document. May be truncated or partial. |
| `Description`      | "A summary of financial performance for Q3 2023."   | A brief description of an item, product, or event focus.                                  |
| `Summary`          | "Key findings include a 10% revenue increase."      | A condensed summary of a longer piece of content.                                         |
| `Initial Response` | "User reported the issue at 10:00 AM."              | The first response or message in a communication thread, like a support ticket.           |
| `Query`            | "semantic event schema"                             | A search query string entered by a user.                                                  |
| `CodeSnippet`      | `SELECT * FROM events WHERE event_type = 'Test';`   | A snippet of code relevant to the event (e.g. an error, a query run).                   |
| `ErrorMessage`     | "TypeError: Cannot read property 'xyz' of undefined"| An error message captured during an event.                                                |
| `Other`            | "User настроение: позитивное"                       | For any other specific textual content that doesn't fit the predefined keys.                |

## Flexibility and Custom Keys

Beyond the common keys listed above, the `content` map is designed for flexibility. You can introduce custom keys as needed to store any other relevant string-based information pertinent to your events.

For instance, if you are tracking interactions with a survey, you might include keys like `QuestionText` and `UserAnswer`. If tracking a system notification, you might have `NotificationTemplateID` and `RenderedMessage`.

When using custom keys, it's advisable to:
*   Maintain a consistent naming convention (e.g., `camelCase` or `snake_case`).
*   Document your custom keys internally for clarity across your team and systems.

## Use-Case Examples

Here are a few examples illustrating how the `content` map can be used in different event scenarios:

**1. 'Email Sent' Event:**
```json
{
  "event": "Email Sent",
  "user_id": "user-123",
  "content": {
    "Subject": "Your Weekly Newsletter",
    "Body": "Hello [User], here's your update for the week...",
    "CampaignID": "newsletter_wk34"
  }
}
```

**2. 'Comment Posted' Event:**
```json
{
  "event": "Comment Posted",
  "entity_gid": "article-abc",
  "content": {
    "Title": "Re: Thoughts on New Features",
    "Body": "I think the new dashboard is a great improvement!",
    "AuthorAlias": "HelpfulHannah"
  }
}
```

**3. 'Product Reviewed' Event:**
```json
{
  "event": "Product Reviewed",
  "commerce": {
    "products": [
      { "product_id": "prod-xyz" }
    ]
  },
  "content": {
    "Title": "Amazing headphones!",
    "Body": "These noise-cancelling headphones are the best I've ever owned. Battery life is incredible.",
    "Rating": "5_stars" // Note: Rating could also be a dedicated field elsewhere
  }
}
```

**4. 'Support Ticket Updated' Event:**
```json
{
  "event": "Support Ticket Updated",
  "properties": {
    "ticket_id": "SUP-98765"
  },
  "content": {
    "UpdateText": "Agent [AgentName] has been assigned to your ticket.",
    "Visibility": "internal_note"
  }
}
```

By utilizing the `content` map effectively, you can significantly enrich your semantic events with detailed textual information, making them more informative and useful for analysis, debugging, and understanding user interactions.
