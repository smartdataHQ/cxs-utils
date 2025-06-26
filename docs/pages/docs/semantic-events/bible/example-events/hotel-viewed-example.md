### Hotel Viewed Event
This event is sent when a user views detailed information about a specific hotel, including availability, pricing, amenities, and location. 
Tracking these details helps businesses deeply analyze customer interests, demand forecasting, and hotel-performance metrics.

``` JavaScript
jitsu.track("Hotel Viewed", {
  commerce: {
    currency: "ISK",               // ISO-4217 code shown to the user
    products: [{
      entry_type: "Search Results",// where the listing appeared
      product_id: "1593",          
      sku: "1593",               
      product: "Saga Luxury Villa",
      category: "Hotels",
      unit_price: 0,
      units: 1                     // default quantity (1 night)
    }]
  },

  metrics: {
    review_count: 0               
  },

  properties: {
    tags: [                       
      "Hot tub",
      "Self service kitchen",
      "Patio",
      "Terrace",
      "Free Parking",
      "Parking",
      "Free WiFi"
    ]
  },

  classification: [
    { type: "Category", value: "Travel" }
  ],

  timestamp: "2025-06-10T09:41:34.010Z" // always UTC
});

```
