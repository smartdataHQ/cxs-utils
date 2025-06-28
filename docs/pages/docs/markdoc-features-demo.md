---
title: Markdoc Features Demo
description: A live demonstration and documentation of Markdoc features, custom tags, and components used in this project.
nav_order: 0 # Places it near the top of the SideNav for easy reference
search_skip: false # Ensure this page is indexed for search
---

# Markdoc Features Demo & Guide

Welcome! This page serves as a live demonstration and quick reference for the various Markdoc features, custom tags, and components available in this documentation setup. Each feature is shown in action and briefly explained.

## 1. Basic Markdown Formatting

Markdoc is built on Markdown, so all standard formatting applies.

*   **Bold Text:** `**Bold Text**` renders as **Bold Text**.
*   *Italic Text:* `*Italic Text*` or `_Italic Text_` renders as *Italic Text*.
*   `Inline Code:` Backticks around text `` `like this` `` renders as `like this`.
*   **Strikethrough:** `~~Strikethrough~~` renders as ~~Strikethrough~~.

### Links

*   **Internal Links:** `[Link to Entities Page](./entities/index.md)` renders as [Link to Entities Page](./entities/index.md).
    *   *Note: Our custom link node (implemented earlier) doesn't alter internal links.*
*   **External Links:** `[Markdoc Official Site](https://markdoc.io)` renders as [Markdoc Official Site](https://markdoc.io).
    *   *Note: Our custom link node automatically adds `target="_blank"` and `rel="noopener noreferrer"` to external links, so they open in a new tab.*

### Blockquotes

> This is a blockquote, created by prefixing lines with `>`.
> It's useful for quoting text from other sources.

### Lists

**Unordered Lists:**
```markdown
- Item 1
- Item 2
  - Nested Item 2a
  - Nested Item 2b
```
Renders as:
- Item 1
- Item 2
  - Nested Item 2a
  - Nested Item 2b

**Ordered Lists:**
```markdown
1. First item
2. Second item
3. Third item
```
Renders as:
1. First item
2. Second item
3. Third item

---

## 2. Headings & Table of Contents (TOC)

Headings are created using `#` symbols. This page's structure uses them.

`# H1 Heading (Page Title)`
`## H2 Heading`
`### H3 Heading`
`#### H4 Heading`

Our setup automatically generates a Table of Contents (typically on the right side of the page) for `H2` and `H3` headings. You should see headings from this demo page listed there.

---

## 3. Code Blocks with Syntax Highlighting & Copy Button

Code blocks are created using triple backticks ` ``` ` followed by an optional language identifier.

**Features:**
*   Syntax highlighting via PrismJS.
*   A "Copy" button in the top-right corner for easy copying.

**Example:**
```markdown
```javascript
// JavaScript Example
function greet(name) {
  const message = `Hello, ${name}! Welcome to Markdoc.`;
  console.log(message);
  return message;
}

greet('Developer');
```
```
Renders as:
```javascript
// JavaScript Example
function greet(name) {
  const message = `Hello, ${name}! Welcome to Markdoc.`;
  console.log(message);
  return message;
}

greet('Developer');
```

---

## 4. Custom Callout Tags

We have several custom callout tags to emphasize different types of information. Each has a unique style and icon. You can also provide a custom `title`.

**Note Callout:**
```markdown
{% note %}
This is a note. It's useful for providing additional information, hints, or context that isn't critical but is helpful.
{% /note %}

{% note title="Custom Note Title" %}
A note with a specific title provided by the author.
{% /note %}
```
Renders as:
{% note %}
This is a note. It's useful for providing additional information, hints, or context that isn't critical but is helpful.
{% /note %}

{% note title="Custom Note Title" %}
A note with a specific title provided by the author.
{% /note %}

**Warning Callout:**
```markdown
{% warning %}
This is a warning. Use it to alert users to potential issues, deprecated features, or actions that could have negative consequences.
{% /warning %}

{% warning title="Data Loss Risk" %}
A warning with a specific, urgent title.
{% /warning %}
```
Renders as:
{% warning %}
This is a warning. Use it to alert users to potential issues, deprecated features, or actions that could have negative consequences.
{% /warning %}

{% warning title="Data Loss Risk" %}
A warning with a specific, urgent title.
{% /warning %}

**Tip Callout:**
```markdown
{% tip %}
This is a tip. Offer advice, best practices, or shortcuts to make the user's life easier.
{% /tip %}

{% tip title="Pro Tip" %}
A tip with an encouraging custom title.
{% /tip %}
```
Renders as:
{% tip %}
This is a tip. Offer advice, best practices, or shortcuts to make the user's life easier.
{% /tip %}

{% tip title="Pro Tip" %}
A tip with an encouraging custom title.
{% /tip %}

**Important Callout:**
```markdown
{% important %}
This is an important message. For crucial information that users absolutely should not miss.
{% /important %}

{% important title="Security Alert" %}
An important message with a high-priority custom title.
{% /important %}
```
Renders as:
{% important %}
This is an important message. For crucial information that users absolutely should not miss.
{% /important %}

{% important title="Security Alert" %}
An important message with a high-priority custom title.
{% /important %}

**Generic Callout (Base Tag):**
```markdown
{% callout title="Generic Custom Title" %}
This is the base `callout` tag. It renders with default styling if no specific `type` is internally assigned (which our named tags like `note` do via their transform).
{% /callout %}
```
Renders as:
{% callout title="Generic Custom Title" %}
This is the base `callout` tag. It renders with default styling if no specific `type` is internally assigned (which our named tags like `note` do via their transform).
{% /callout %}

---

## 5. Tabs for Content Switching

The `{% tabs %}` and `{% tab label="..." %}` tags allow you to group content into selectable tabs.

**Example:**
```markdown
{% tabs %}
  {% tab label="Installation via NPM" %}
    To install using NPM, run:
    ```bash
    npm install my-package
    ```
  {% /tab %}
  {% tab label="Installation via Yarn" %}
    To install using Yarn, run:
    ```bash
    yarn add my-package
    ```
  {% /tab %}
  {% tab label="Manual Setup" %}
    Follow these steps for a manual setup...
  {% /tab %}
{% /tabs %}
```
Renders as:
{% tabs %}
  {% tab label="Installation via NPM" %}
    To install using NPM, run:
    ```bash
    npm install my-package
    ```
  {% /tab %}
  {% tab label="Installation via Yarn" %}
    To install using Yarn, run:
    ```bash
    yarn add my-package
    ```
  {% /tab %}
  {% tab label="Manual Setup" %}
    Follow these steps for a manual setup...
  {% /tab %}
{% /tabs %}

---

## 6. Enhanced Images (with `next/image` and Captions)

Images written using standard Markdown syntax `![alt text](source "caption text")` are automatically processed to use Next.js's `<Image>` component for optimization (blur-up placeholders, correct sizing, modern formats).

**Features:**
*   `alt text` is used for accessibility.
*   `"caption text"` (the title part of the Markdown image syntax) is rendered as a `<figcaption>`.
*   **Dimensions for `next/image`:** You can provide `width` and `height` via URL query parameters like `?w=600&h=400` or `?width=600&height=400` in the image source. This is crucial for `next/image` to prevent layout shift and optimize loading.

**Examples:**

**Local Image (from `public/` directory):**
```markdown
![A sample local image](/images/sample-image.png?w=400&h=250 "This is a caption for the local sample image. Ensure it exists in public/images/ for optimal display.")
```
Renders as (will be broken if `/images/sample-image.png` doesn't exist):
![A sample local image](/images/sample-image.png?w=400&h=250 "This is a caption for the local sample image. Ensure it exists in public/images/ for optimal display.")

**Remote Image:**
```markdown
![Placeholder Image from via.placeholder.com](https://via.placeholder.com/500x200.png?w=500&h=200 "Caption for a remote placeholder image.")
```
Renders as:
![Placeholder Image from via.placeholder.com](https://via.placeholder.com/500x200.png?w=500&h=200 "Caption for a remote placeholder image.")

---

## 7. Two-Pane Code Layout (`{% code_pane %}`)

For pages where extensive code examples are discussed, you can use the `{% code_pane %}` tag. Content wrapped within this tag will be rendered in a sticky right-hand pane, allowing users to scroll through descriptive text while keeping code examples in view.

The `code_pane` can contain any Markdoc content, but it's primarily designed for code blocks (` ``` `) and tabs (`{% tabs %}`) containing code blocks.

**Example:**
The following Markdown will place a JSON snippet and tabbed code examples into the right-hand code pane. The descriptive text remains in this main column.

```markdown
This text describes the code that will appear in the right pane.
You can explain concepts here, and the user can refer to the code alongside.

{% code_pane %}
  ### Configuration Example

  This is a sample JSON configuration. It will appear in the right pane.

  ```json
  {
    "apiKey": "YOUR_API_KEY",
    "featureFlags": {
      "betaFeature": true,
      "analyticsLogging": "verbose"
    },
    "timeout": 5000
  }
  ```

  ### API Usage Examples (Multi-language)

  Here's how to call our API in different languages. This tabbed content will also be in the right pane.

  {% tabs %}
    {% tab label="Python" %}
    ```python
    import requests

    def get_data(api_key, item_id):
        headers = {'Authorization': f'Bearer {api_key}'}
        response = requests.get(f'https://api.example.com/items/{item_id}', headers=headers)
        return response.json()

    # Usage
    # data = get_data('YOUR_API_KEY', '123')
    # print(data)
    ```
    {% /tab %}
    {% tab label="JavaScript (Node.js)" %}
    ```javascript
    // Using node-fetch or similar
    async function getData(apiKey, itemId) {
      const fetch = require('node-fetch'); // Or import fetch from 'node-fetch';
      const headers = { 'Authorization': `Bearer ${apiKey}` };
      const response = await fetch(`https://api.example.com/items/${itemId}`, { headers });
      return await response.json();
    }

    // Usage
    // getData('YOUR_API_KEY', '123').then(data => console.log(data));
    ```
    {% /tab %}
    {% tab label="cURL" %}
    ```bash
    curl -X GET "https://api.example.com/items/123" \\
         -H "Authorization: Bearer YOUR_API_KEY"
    ```
    {% /tab %}
  {% /tabs %}
{% /code_pane %}

This paragraph follows the `code_pane` block in the Markdown source.
The content inside `code_pane` should now be visible on your right.
If you scroll this main content area, the right pane should remain sticky (if it has enough content to also scroll independently).
```

**Live Demo of `code_pane`:**

This text describes the code that will appear in the right pane. You can explain concepts here, and the user can refer to the code alongside. The `code_pane` below should render its content into the right-hand column of the page.

{% code_pane %}
  ### Configuration Example (Live in Pane)

  This is a sample JSON configuration. It will appear in the right pane.

  ```json
  {
    "apiKey": "YOUR_API_KEY_DEMO",
    "featureFlags": {
      "betaFeature": true,
      "analyticsLogging": "verbose"
    },
    "timeout": 5000
  }
  ```

  ### API Usage Examples (Live in Pane)

  Here's how to call our API in different languages. This tabbed content will also be in the right pane.

  {% tabs %}
    {% tab label="Python (Pane)" %}
    ```python
    import requests

    def get_data(api_key, item_id):
        headers = {'Authorization': f'Bearer {api_key}'}
        response = requests.get(f'https://api.example.com/items/{item_id}', headers=headers)
        return response.json()

    # Usage
    # data = get_data('YOUR_API_KEY_DEMO', '123')
    # print(data)
    ```
    {% /tab %}
    {% tab label="JavaScript (Node.js, Pane)" %}
    ```javascript
    // Using node-fetch or similar
    async function getData(apiKey, itemId) {
      const fetch = require('node-fetch'); // Or import fetch from 'node-fetch';
      const headers = { 'Authorization': `Bearer ${apiKey}` };
      const response = await fetch(`https://api.example.com/items/${itemId}`, { headers });
      return await response.json();
    }

    // Usage
    // getData('YOUR_API_KEY_DEMO', '123').then(data => console.log(data));
    ```
    {% /tab %}
    {% tab label="cURL (Pane)" %}
    ```bash
    curl -X GET "https://api.example.com/items/123" \\
         -H "Authorization: Bearer YOUR_API_KEY_DEMO"
    ```
    {% /tab %}
  {% /tabs %}
{% /code_pane %}

This paragraph follows the `code_pane` block in the Markdown source. The content inside the `code_pane` above should now be visible on your right. If you scroll this main content area, the right pane should remain sticky.

---

## 8. Search Functionality

A search bar is available in the top navigation bar. It allows you to search across all documentation pages. The search index is built at build time and includes page titles, descriptions (from frontmatter), and main content.

**Features:**
*   Client-side search using FlexSearch.
*   Results appear in a dropdown below the search bar.
*   Shows page title and a snippet of the description/content.
*   Search terms are highlighted in the results.

*(Try searching for "callout", "image", or "pane" to test.)*

---

This concludes the demo of the primary Markdoc features and custom enhancements in this project. Refer to this page to see how to use these features in your own documentation content.
