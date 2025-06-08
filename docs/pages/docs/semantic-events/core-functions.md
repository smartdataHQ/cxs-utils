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
The page event records when a user views a specific page in your web application or website. 

It’s the foundational event for tracking navigation and user engagement with your web content.

**Use this event for:**
- Tracking individual page views

- Capturing page-level interactions or impressions

- Understanding navigation flow and user journey

Below is how you send a page event using the CXS client, along with an example of how the event might look once enriched server-side by Context Suite.

### Sending Page Events
```javascript
cxs.page("Pricing Page", {
  category: "Marketing",
  featuredPlan: "Professional"
});
```
### Enriched Page Events
This event will be enriched with additional context and properties, such as the user’s session ID, device information, and more.
```javascript
{
  "type": "page",
  "event": "Pricing Page",
  "timestamp": "2025-05-18T10:20:30.000Z",
  "message_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "anonymous_id": "anonym-uuid-1234-abcd-5678efgh",
  "user_id": null,
  "session_id": "session-uuid-5678-efgh-1234abcd",
  "properties": {
    "category": "Marketing",
    "featuredPlan": "Professional"
  },
  "page": {
    "title": "Pricing - Context Suite",
    "url": "https://example.com/pricing",
    "path": "/pricing",
    "referrer": "https://google.com",
    "referring_domain": "google.com",
    "search": "?source=adwords",
    "host": "example.com",
    "encoding": "UTF-8"
  },
  "context": {
    "ip": "203.0.113.45",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    "locale": "en-US",
    "timezone": "America/New_York",
    "location": {
      "country": "United States",
      "region": "New York",
      "city": "New York",
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "device": {
    "type": "desktop",
    "brand": "Apple",
    "model": "MacBookPro16,1",
    "manufacturer": "Apple"
  },
  "os": {
    "name": "macOS",
    "version": "10.15.7"
  },
  "browser": {
    "name": "Chrome",
    "version": "136.0.0.0",
    "mobile": false
  },
  "campaign": {
    "source": "google",
    "medium": "cpc",
    "campaign": "spring_campaign",
    "term": "context suite pricing",
    "content": "pricing ad variant 1"
  }
}
```

### Enriching Page Events

Once the event reaches Context Suite servers, it is enriched automatically, adding extensive context:

- **Automatic page details:**\
title, url, path, and referrer information are filled in based on browser context.

- **User session details:**\
Identifiers such as anonymous_id and session_id for user tracking.

- **Geolocation and IP-based enrichment:**\
context.location includes detailed geographical insights based on IP lookup.

- **Device and Browser enrichment:**\
Browser type, device details, OS, and versioning for accurate segmentation.

- **Campaign tracking:**\
Marketing attribution automatically derived from URL parameters.

This enriched event structure immediately integrates into ready-made dashboards and analytics, allowing you to analyze user behavior, traffic sources, conversion paths, and more—without manual processing.

## Screen

The screen event captures the viewing of screens or views within mobile apps. It's the equivalent of the page event in web environments and is essential for tracking navigation, user behavior, and feature usage in mobile applications.

**Use this event for:**

- Tracking screens users visit within your mobile app
- Analyzing navigation patterns and user journeys
- Measuring screen-level engagement and conversion rates

Below is how you'd send a screen event using the CXS client, along with a server-side enriched example.

### Sending Screen Events
```javascript
// Send a screen event
cxs.screen("Checkout Screen", {
  section: "Purchase",
  cartValue: 99.99
});
```

### Enriched Screen Events
Once received by the Context Suite, the event gets automatically enriched to include detailed metadata and user context:
```javascript
{
  "type": "screen",
  "event": "Checkout Screen",
  "timestamp": "2025-05-18T10:25:45.000Z",
  "message_id": "b2c3d4e5-f6a7-890b-cdef-234567890abc",
  "anonymous_id": "anonym-uuid-7890-ghij-1234klmn",
  "user_id": "user-12345",
  "session_id": "session-uuid-2345-bcde-6789fghi",
  "properties": {
    "section": "Purchase",
    "cartValue": 99.99
  },
  "app": {
    "name": "MyShop App",
    "namespace": "com.myshop.mobile",
    "version": "3.2.1",
    "build": "3210"
  },
  "device": {
    "id": "device-uuid-abcdef-1234567890",
    "type": "ios",
    "model": "iPhone 15 Pro",
    "manufacturer": "Apple",
    "advertising_id": "AID-1234-5678-9101",
    "ad_tracking_enabled": true,
    "locale": "en-US",
    "timezone": "America/Los_Angeles"
  },
  "os": {
    "name": "iOS",
    "version": "19.2"
  },
  "network": {
    "wifi": true,
    "carrier": "Verizon",
    "cellular": false,
    "bluetooth": true
  },
  "context": {
    "ip": "198.51.100.123",
    "location": {
      "country": "United States",
      "region": "California",
      "city": "San Francisco",
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}
```

### Enriching Screen Events
Upon arrival at the Context Suite servers, this event is enriched automatically:

- **App Information:**\
App name, package namespace, app version, and build information are automatically included.

- **Detailed Device Information:**\
Device type, OS version, hardware details (model/manufacturer), and advertising ID (for mobile analytics and attribution) are captured.

- **Network and Connectivity:**\
Network carrier details, connectivity type (WiFi, Bluetooth, cellular), crucial for diagnostics or segmentation.

- **Geo-IP Enrichment:**\
User’s approximate geolocation (city, region, country, coordinates) derived from IP address.

- **User Identity:**\
Context Suite automatically links the event to user identifiers (user_id, anonymous_id) and session identifiers.

This comprehensive enrichment enables immediate, detailed insights into mobile app usage, user experience, screen performance, and conversion funnels, directly accessible via built-in analytics dashboards.

## Identify
The identify event is used to associate a user’s actions with their unique identity within your application or website. This is typically done once a user logs in, registers, or when their user profile information changes.

**Use this event for:**
- Linking anonymous user activity with a known user profile
- Storing and updating user profile traits
- Enabling personalized experiences and detailed user-level analytics

Below is how you'd send an identify event using the CXS client, along with an example of the enriched event generated server-side.

### Sending Identify Events
```javascript
import { cxsAnalytics } from '@your-org/cxs-analytics';

// Initialize client (once per app)
cxsAnalytics({
  host: 'https://inbox.contextsuite.com',
  writeKey: 'YOUR_WRITE_KEY',
});

// Identify the user (after login or registration)
cxs.identify("user-12345", {
  email: "john.doe@example.com",
  name: "John Doe",
  plan: "Premium",
  signup_date: "2025-05-01"
});
```

### Enriched Identify Events
Once received by Context Suite, the event is enriched with user context, traits, and additional metadata:
```javascript
{
  "type": "identify",
  "event": "User Identified",
  "timestamp": "2025-05-18T11:05:25.000Z",
  "message_id": "c3d4e5f6-a7b8-90cd-ef23-34567890abcd",
  "user_id": "user-12345",
  "anonymous_id": "anonym-uuid-1234-abcd-5678efgh",
  "session_id": "session-uuid-5678-ijkl-9101mnop",
  "traits": {
    "email": "john.doe@example.com",
    "name": "John Doe",
    "plan": "Premium",
    "signup_date": "2025-05-01"
  },
  "context": {
    "ip": "203.0.113.45",
    "locale": "en-US",
    "timezone": "America/New_York",
    "location": {
      "country": "United States",
      "region": "New York",
      "city": "Brooklyn",
      "latitude": 40.6782,
      "longitude": -73.9442
    }
  },
  "device": {
    "type": "desktop",
    "brand": "Apple",
    "model": "MacBookPro16,1",
    "manufacturer": "Apple"
  },
  "browser": {
    "name": "Chrome",
    "version": "136.0.0.0",
    "mobile": false
  },
  "os": {
    "name": "macOS",
    "version": "10.15.7"
  }
}
```

### Enriching Identify Events
When processed by Context Suite, the identify event includes detailed user context:

- **User Traits:**\
Profile details (email, name, plan, signup_date) become part of the user’s identity profile, available for segmentation, personalization, and customer-level analytics.

- **Identity Resolution:**\
Context Suite associates the provided user_id with the previous anonymous_id, effectively stitching anonymous user activity to a known user profile.

- **Contextual and Device Data:**\
User agent, IP address, geo-location, device details, and browser context provide valuable data for understanding user demographics and usage patterns.

By clearly defining the user profile, you enable highly personalized experiences, improved customer service, and deeper user-level analytics.

## Group
The group event is used to associate a user with a specific group, account, or organization. It’s particularly useful in B2B scenarios or multi-user applications, where users belong to organizations, teams, or subscriptions.

**Use this event for:**

- Associating individual users with companies, organizations, or teams
- Group-level segmentation, analytics, and reporting
- Understanding collective usage patterns and team-based behaviors

Below is how you'd send a group event using the CXS client, followed by an example of the enriched event generated server-side.

### Sending Group Events
Here's how you typically send a group event upon user selection or login into a group context (e.g., team or organization):
```javascript
import { cxsAnalytics } from '@your-org/cxs-analytics';

// Initialize client (once per app)
cxsAnalytics({
  host: 'https://inbox.contextsuite.com',
  writeKey: 'YOUR_WRITE_KEY',
});

// Associate the user with a group (e.g., organization)
cxs.group("org-7890", {
  name: "Acme Corporation",
  industry: "Software",
  plan: "Enterprise",
  employees: 500
});
```

### Enriched Group Events
Once received, Context Suite enriches the event with additional metadata, contextual information, and stores group traits:
```javascript
{
  "type": "group",
  "event": "User Grouped",
  "timestamp": "2025-05-18T11:20:10.000Z",
  "message_id": "d4e5f6a7-b8c9-0def-1234-4567890abcde",
  "user_id": "user-12345",
  "anonymous_id": "anonym-uuid-1234-abcd-5678efgh",
  "session_id": "session-uuid-8901-qrst-2345uvwx",
  "group_id": "org-7890",
  "traits": {
    "name": "Acme Corporation",
    "industry": "Software",
    "plan": "Enterprise",
    "employees": 500
  },
  "context": {
    "ip": "203.0.113.45",
    "locale": "en-US",
    "timezone": "America/New_York",
    "location": {
      "country": "United States",
      "region": "New York",
      "city": "Manhattan",
      "latitude": 40.7831,
      "longitude": -73.9712
    }
  },
  "device": {
    "type": "desktop",
    "brand": "Apple",
    "model": "MacBookPro16,1",
    "manufacturer": "Apple"
  },
  "browser": {
    "name": "Chrome",
    "version": "136.0.0.0",
    "mobile": false
  },
  "os": {
    "name": "macOS",
    "version": "10.15.7"
  }
}
```

### Enriching Group Events

The Context Suite processes the group event, enriching it to provide comprehensive analytics at the organization or team level:

- **Group Traits:**\
Details about the organization or group (name, industry, plan, and employees) are captured and associated with the user profile.

- **User and Group Linking:**\
Associates the individual user (user_id) with their group (group_id) clearly and persistently. This allows the Context Suite to aggregate and analyze data at both the individual and organizational levels seamlessly.

- **Contextual Enrichment:**\
Includes user location, device type, and session context, enabling deeper segmentation and richer insights based on organizational behavior patterns.

Using group events properly ensures accurate reporting, simplifies group-based analytics, and enhances customer insights for teams, businesses, and multi-user accounts.

## Alias
The alias event links two user identifiers, typically merging an anonymous user profile with a known, authenticated user profile. This is essential when users transition from an anonymous browsing state (tracked via anonymous ID) to an identified state (user ID), such as when they sign up or log in for the first time.

Use this event for:

- Merging anonymous user data with authenticated user data
- Preserving user history across authentication boundaries
- Ensuring unified user profiles for accurate analytics

Below is how you'd send an alias event using the CXS client, followed by an example of the enriched event generated server-side.

### Sending Alias Events
Here's how you'd typically send an alias event right after a user registers or logs in for the first time:

```javascript
import { cxsAnalytics } from '@your-org/cxs-analytics';

// Initialize client (once per app)
cxsAnalytics({
  host: 'https://inbox.contextsuite.com',
  writeKey: 'YOUR_WRITE_KEY',
});

// User signs up or logs in for the first time
cxs.alias("user-12345"); // 'user-12345' is the new identified user ID
```

### Enriched Alias Events
When received, the Context Suite enriches the event, linking anonymous and authenticated user profiles:
```javascript
{
  "type": "alias",
  "event": "User Aliased",
  "timestamp": "2025-05-18T11:30:05.000Z",
  "message_id": "e5f6a7b8-c9d0-ef12-3456-567890abcdef",
  "previous_id": "anonym-uuid-1234-abcd-5678efgh",
  "user_id": "user-12345",
  "session_id": "session-uuid-1234-yzab-5678cdef",
  "context": {
    "ip": "203.0.113.45",
    "locale": "en-US",
    "timezone": "America/New_York",
    "location": {
      "country": "United States",
      "region": "New York",
      "city": "Queens",
      "latitude": 40.7282,
      "longitude": -73.7949
    }
  },
  "device": {
    "type": "desktop",
    "brand": "Apple",
    "model": "MacBookPro16,1",
    "manufacturer": "Apple"
  },
  "browser": {
    "name": "Chrome",
    "version": "136.0.0.0",
    "mobile": false
  },
  "os": {
    "name": "macOS",
    "version": "10.15.7"
  }
}
```

### Enriching Alias Events
The Context Suite uses the alias event to ensure user identity continuity across different user states (anonymous to authenticated):

- **Identity Linking:**\
The event clearly indicates the transition from the previous anonymous ID (previous_id) to the new user ID (user_id), ensuring historical data continuity and profile integrity.

- **Session and Device Context:**\
Detailed device and context data ensure precise analytics and accurate user profile merging.

- **Unified User Profile:**\
After aliasing, all historical anonymous activity is correctly attributed to the known user, ensuring a comprehensive and unified user profile.

Proper use of the alias event ensures accurate user analytics, consistent identity management, and improved personalization and user journey analysis.
