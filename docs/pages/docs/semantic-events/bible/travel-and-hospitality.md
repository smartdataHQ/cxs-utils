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
- [Hotel List Viewed]()
- [Product List Viewed]()
- when a user views a list or category of hotels
---
- [Hotel Searched]()
- [Products Searched]()
- when a user searches for hotels using search criteria
---
- [Hotel Viewed]()
- [Product Viewed]()
- when a user views detailed information about a hotel
---
- [Room Type Viewed]()
- [Product Viewed]()
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


### Hotel Viewed Event
This event is sent when a user views detailed information about a specific hotel, including availability, pricing, amenities, and location. 
Tracking these details helps businesses deeply analyze customer interests, demand forecasting, and hotel-performance metrics.

``` JavaScript
cxs.track("Hotel Viewed", {
  products: [
    {
      entry_type: "Search Results", // type of entry (not sales)
      position: "1", // position in the search results
      product_id: "hotel_98765",
      sku: "HTL-IS-RVK-101",
      
      product: "Hotel Reykjavík Centrum",
      variant: "Deluxe Double Room with City View",
      main_category: "Accommodation",
      category: "Hotels",
      
      brand: "Keahotels",
      supplier: "<Distribution Partner>",
      supplier_id: "<Distribution Partner ID>",
      
      manufacturer: "<Hoetel Group>",
      manufacturer_id: "<Hotel Group ID>",
      
      starts: "2025-07-15T15:00:00Z",
      ends: "2025-07-20T11:00:00Z",
      duration: P3D, // ISO 8601 duration format
      lead_time: P45D, // days between viewing and arrival date in ISO 8601 format
      units: 3, 
      uom: "Nights",
      unit_price: 220.00, // per night
      unit_cost: 180.00, // per night
      commission: 0.15, // 15% commission
      currency: "EUR",
      coupon: "SUMMER2025"
    }
  ],
  metrics: {
    avg_review: 4.5,
    review_count: 1342
  },
  dimensions: {
    star_rating: "4",
    membership_status: "Gold",
  },
  tags: [
    "Free WiFi", 
    "Breakfast Included", 
    "Gym", 
    "Spa", 
    "City Center"
  ],
  properties: {
    search_id: "search_abc12345",
    sort_order: "Price Ascending",
    position_in_results: 3
  }
});
```
