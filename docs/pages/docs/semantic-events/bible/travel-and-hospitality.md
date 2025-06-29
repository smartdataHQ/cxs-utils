---
title: Travel & Hospitality
---

# Travel & Hospitality
The following events are used to track user interactions with hotel booking and travel-related activities. 

Each event is categorized by its core event type, which helps in understanding the context of the interaction.

## Hospitality
{% table %}
- &nbsp; {% align="left" width="30%" %}
- Core Event {% align="left" width="30%" %}
- Sent ... {% align="left" width="700%" %}
---
- \
  **Cart** {% align="left" colspan="3" %}
---
- [Booking Viewed]()
- [Cart Viewed]()
- when a user views their booking cart contents
---
- [Room Removed]()
- [Product Removed]()
- when a user removes a selected room from their booking cart
---
- [Room Selected]()
- [Product Added]()
- when a user selects a room type and adds it to their booking cart
---
- \
  **Ordering** {% align="left" colspan="3" %}
---
- [Booking Updated]()
- [Order Updated]()
- when a user modifies their existing hotel booking
---
- [Booking Cancelled]()
- [Order Cancelled]()
- when a user cancels an existing hotel booking
---
- [Booking Completed]()
- [Order Completed]()
- when a user successfully completes a hotel booking
---
- [Booking Refunded]()
- [Order Refunded]()
- when a refund is processed for a hotel booking
---
- \
  **Discovery** {% align="left" colspan="3" %}
---
- [Availability Checked](../#availability-checked)
- [Availability Checked]()
- when a user checks the availability of rooms or dates
---
- [Hotel Filter Applied]()
- [Product List Viewed]()
- when a user applies filter criteria to narrow hotel results
---
- [Hotel List Viewed](/docs/semantic-events/bible/example-events/hotel-list-viewed-example)
- [Product List Viewed]()
- when a user views a list or category of hotels
---
- [Hotel Searched]()
- [Products Searched]()
- when a user searches for hotels using search criteria
---
- [Hotel Viewed](/docs/semantic-events/bible/example-events/hotel-viewed-example)
- [Product Viewed]()
- when a user views detailed information about a hotel
---
- [Room List Viewed](/docs/semantic-events/bible/example-events/room-list-viewed-example)
- [Room Type Viewed]()
- when a user views specific room type details within a hotel
---
- \
  **Checkout** {% align="left" colspan="3" %}
---
- [Booking Started]()
- [Checkout Started]()
- when a user initiates the booking checkout process
---
- [Booking Step Completed]()
- [Checkout Step Completed]()
- when a user completes a step within the booking checkout process
---
- [Booking Step Viewed]()
- [Checkout Step Viewed]()
- when a user views any step within the booking checkout process
---
- \
  **Engagement** {% align="left" colspan="3" %}
---
- [Booking Shared]()
- [Product Shared]()
- When a user shares booking details (via social media, email, etc.)
---
- [Hotel Reviewed]()
- [Product Reviewed]()
- When a user submits a review or rating of a hotel stay
{% /table %}