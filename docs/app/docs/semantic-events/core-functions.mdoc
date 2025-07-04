# Introduction to Semantic Event Functions
The Context Suite leverages semantic event functions—page, screen, identify, group, and alias—to clearly and accurately capture user interactions across web, mobile, and server environments. Each of these functions corresponds to distinct, well-defined use cases, enabling rich analytics, identity management, and operational insights.

Using these semantic event functions correctly ensures you gather meaningful, structured data aligned with best practices from leading analytics platforms like Segment, Jitsu, and RudderStack. Events captured this way are automatically enriched server-side, adding context such as user identity, device details, geographic location, and session data.

Here's a quick overview of each semantic event function:

- **[page]():** Tracks page views in web environments, providing detailed insights into user journeys and interactions.
- **[screen]():** Captures screen views in mobile apps, helping understand app navigation and engagement.
- **[identify]():** Links actions and events to an individual user, enabling personalized experiences and user-level analysis.
- **[group]():** Associates users with organizations, teams, or accounts, essential for B2B analytics and team-based insights.
- **[alias]():** Merges anonymous and authenticated user identities, ensuring consistent user profiles and accurate historical analytics.
- **[track]():** Refer to the Event Bible for details on how to use the track function.

Implementing these functions correctly creates a strong foundation for real-time analytics, advanced segmentation, and operational decision-making.

## Page
The `page` event records when a user views a specific page in your web application or website. It’s the foundational event for tracking navigation and user engagement with your web content.

**Use this event for:**
- Tracking individual page views
- Capturing page-level interactions or impressions
- Understanding navigation flow and user journey

### Sending Page Events
The `cxs.page()` function typically takes a page name and an optional properties object.
```javascript
cxs.page("Pricing Page", {
  category: "Marketing",
  featuredPlan: "Professional"
});
```

**Function Parameters:**
| Name         | Required | Data Type | Description                                                                 |
|--------------|----------|-----------|-----------------------------------------------------------------------------|
| `name`       |          | `String`  | The name of the page being viewed (e.g., "Pricing Page").                     |
| `properties` |          | `Object`  | An optional object containing custom properties for the page event. See below. |

**`properties` Object Fields:**
| Name             | Required | Data Type | Description                                                      |
|------------------|----------|-----------|------------------------------------------------------------------|
| `category`       |          | `String`  | The category of the page (e.g., "Marketing").                    |
| `featuredPlan`   |          | `String`  | A featured plan highlighted on the page (e.g., "Professional"). |
_Other custom properties can be included as needed._

### Enriched Page Events
This event will be enriched with additional context and properties, such as the user’s session ID, device information, and more. The server-side enriched event includes many fields detailed in other schema documents (e.g., `page.*`, `context.*`, `device.*`).
```javascript
{
  "type": "page",
  "event": "Pricing Page", // Often, the page name becomes the event name for type: page
  "timestamp": "2025-05-18T10:20:30.000Z",
  "message_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "properties": { // Custom properties sent with the page call
    "category": "Marketing",
    "featuredPlan": "Professional"
  },
  "page": { // Automatically captured page details
    "title": "Pricing - Context Suite",
    "url": "https://example.com/pricing",
    // ... other page.* fields
  }
  // ... other enriched context (user, device, session, etc.)
}
```

### Enriching Page Events
Once the event reaches Context Suite servers, it is enriched automatically, adding extensive context:
- **Automatic page details:** `title`, `url`, `path`, and `referrer` information are filled in based on browser context.
- **User session details:** Identifiers such as `anonymous_id` and `session_id` for user tracking.
- **Geolocation and IP-based enrichment:** `context.location` includes detailed geographical insights based on IP lookup.
- **Device and Browser enrichment:** Browser type, device details, OS, and versioning for accurate segmentation.
- **Campaign tracking:** Marketing attribution automatically derived from URL parameters.

This enriched event structure immediately integrates into ready-made dashboards and analytics, allowing you to analyze user behavior, traffic sources, conversion paths, and more—without manual processing.

## Screen
The `screen` event captures the viewing of screens or views within mobile apps. It's the equivalent of the `page` event in web environments and is essential for tracking navigation, user behavior, and feature usage in mobile applications.

**Use this event for:**
- Tracking screens users visit within your mobile app
- Analyzing navigation patterns and user journeys
- Measuring screen-level engagement and conversion rates

### Sending Screen Events
The `cxs.screen()` function typically takes a screen name and an optional properties object.
```javascript
cxs.screen("Checkout Screen", {
  section: "Purchase",
  cartValue: 99.99
});
```

**Function Parameters:**
| Name         | Required | Data Type | Description                                                                  |
|--------------|----------|-----------|------------------------------------------------------------------------------|
| `name`       |          | `String`  | The name of the screen being viewed (e.g., "Checkout Screen").                |
| `properties` |          | `Object`  | An optional object containing custom properties for the screen event. See below. |

**`properties` Object Fields:**
| Name        | Required | Data Type | Description                                               |
|-------------|----------|-----------|-----------------------------------------------------------|
| `section`   |          | `String`  | The section of the app the screen belongs to (e.g., "Purchase"). |
| `cartValue` |          | `Number`  | The value of the cart at this screen view (e.g., 99.99).  |
_Other custom properties can be included as needed._

### Enriched Screen Events
Once received by the Context Suite, the event gets automatically enriched. The server-side enriched event includes many fields detailed in other schema documents (e.g., `app.*`, `device.*`, `os.*`).
```javascript
{
  "type": "screen",
  "event": "Checkout Screen", // Often, the screen name becomes the event name for type: screen
  "timestamp": "2025-05-18T10:25:45.000Z",
  "message_id": "b2c3d4e5-f6a7-890b-cdef-234567890abc",
  "properties": { // Custom properties sent
    "section": "Purchase",
    "cartValue": 99.99
  },
  "app": { // Automatically captured app details
    "name": "MyShop App",
    // ... other app.* fields
  }
  // ... other enriched context
}
```

### Enriching Screen Events
Upon arrival at the Context Suite servers, this event is enriched automatically:
- **App Information:** App name, package namespace, app version, and build information are automatically included.
- **Detailed Device Information:** Device type, OS version, hardware details, and advertising ID.
- **Network and Connectivity:** Network carrier details, connectivity type.
- **Geo-IP Enrichment:** User’s approximate geolocation.
- **User Identity:** Links to `user_id`, `anonymous_id`, and `session_id`.

## Identify
The `identify` event is used to associate a user’s actions with their unique identity. This is typically done once a user logs in, registers, or when their user profile information changes.

**Use this event for:**
- Linking anonymous user activity with a known user profile
- Storing and updating user profile traits
- Enabling personalized experiences and detailed user-level analytics

### Sending Identify Events
The `cxs.identify()` function takes a `userId` and an optional `traits` object.
```javascript
cxs.identify("user-12345", {
  email: "john.doe@example.com",
  name: "John Doe",
  plan: "Premium",
  signup_date: "2025-05-01"
});
```

**Function Parameters:**
| Name     | Required | Data Type | Description                                                                |
|----------|----------|-----------|----------------------------------------------------------------------------|
| `userId` | Yes      | `String`  | The unique identifier for the user in your system (e.g., "user-12345").    |
| `traits` |          | `Object`  | An optional object containing user traits to be set or updated. See below. |

**`traits` Object Fields (Common Examples):**
| Name          | Required | Data Type | Description                                       |
|---------------|----------|-----------|---------------------------------------------------|
| `email`       |          | `String`  | User's email address (e.g., "john.doe@example.com"). |
| `name`        |          | `String`  | User's full name (e.g., "John Doe").              |
| `plan`        |          | `String`  | User's subscription plan (e.g., "Premium").       |
| `signup_date` |          | `String`  | User's registration date (e.g., "2025-05-01").    |
_Other custom traits can be included. Refer to `traits.md` for more standard trait names._

### Enriched Identify Events
The server-side enriched event includes these traits and standard contextual information.
```javascript
{
  "type": "identify",
  "event": "User Identified", // Default event name for identify calls
  "timestamp": "2025-05-18T11:05:25.000Z",
  "user_id": "user-12345",
  "traits": { // Traits sent with the identify call
    "email": "john.doe@example.com",
    "name": "John Doe",
    "plan": "Premium",
    "signup_date": "2025-05-01"
  }
  // ... other enriched context
}
```

### Enriching Identify Events
- **User Traits:** Profile details are stored and associated with the user's identity.
- **Identity Resolution:** Links the `userId` with any previous `anonymous_id`.

## Group
The `group` event associates a user with a specific group, account, or organization.

**Use this event for:**
- Associating users with companies or teams
- Group-level segmentation and analytics

### Sending Group Events
The `cxs.group()` function takes a `groupId` and an optional `traits` object for the group.
```javascript
cxs.group("org-7890", {
  name: "Acme Corporation",
  industry: "Software",
  plan: "Enterprise",
  employees: 500
});
```

**Function Parameters:**
| Name      | Required | Data Type | Description                                                                 |
|-----------|----------|-----------|-----------------------------------------------------------------------------|
| `groupId` | Yes      | `String`  | The unique identifier for the group in your system (e.g., "org-7890").      |
| `traits`  |          | `Object`  | An optional object containing traits for the group to be set or updated. See below. |

**`traits` Object Fields (Common Examples for Group):**
| Name        | Required | Data Type | Description                                          |
|-------------|----------|-----------|------------------------------------------------------|
| `name`      |          | `String`  | Name of the group (e.g., "Acme Corporation").        |
| `industry`  |          | `String`  | Industry of the group (e.g., "Software").            |
| `plan`      |          | `String`  | Subscription plan of the group (e.g., "Enterprise"). |
| `employees` |          | `Number`  | Number of employees in the group (e.g., 500).        |
_Other custom group traits can be included._

### Enriched Group Events
```javascript
{
  "type": "group",
  "event": "User Grouped", // Default event name for group calls
  "timestamp": "2025-05-18T11:20:10.000Z",
  "user_id": "user-12345", // The user being associated with the group
  "group_id": "org-7890",
  "traits": { // Group traits sent
    "name": "Acme Corporation",
    "industry": "Software",
    "plan": "Enterprise",
    "employees": 500
  }
  // ... other enriched context
}
```

### Enriching Group Events
- **Group Traits:** Details about the group are stored.
- **User and Group Linking:** Associates the `user_id` with the `group_id`.

## Alias
The `alias` event links two user identifiers, typically an anonymous ID with an authenticated user ID.

**Use this event for:**
- Merging anonymous and authenticated user profiles
- Preserving user history across authentication

### Sending Alias Events
The `cxs.alias()` function takes the new `userId`. The previous ID (often the `anonymous_id`) is typically handled automatically by the SDK.
```javascript
cxs.alias("user-12345"); // 'user-12345' is the new identified user ID
```

**Function Parameters:**
| Name     | Required | Data Type | Description                                                                                                |
|----------|----------|-----------|------------------------------------------------------------------------------------------------------------|
| `userId` | Yes      | `String`  | The new, known user ID to associate with the previous anonymous ID.                                        |
| `previousId`|        | `String`  | (Optional by SDK, but conceptually present) The previous identifier (e.g., `anonymous_id`) being aliased. Many SDKs handle this implicitly. |

### Enriched Alias Events
```javascript
{
  "type": "alias",
  "event": "User Aliased", // Default event name for alias calls
  "timestamp": "2025-05-18T11:30:05.000Z",
  "previous_id": "anonym-uuid-1234-abcd-5678efgh", // The old ID
  "user_id": "user-12345" // The new ID
  // ... other enriched context
}
```

### Enriching Alias Events
- **Identity Linking:** The `previous_id` (often an `anonymous_id`) is linked to the new `user_id`.
- **Unified User Profile:** Historical anonymous activity is merged with the identified user's profile.
