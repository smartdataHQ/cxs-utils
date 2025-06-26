### Room List Viewed Event

This event is sent when a user views a **list of available rooms** for a specific property—typically after selecting dates, guests, and room count.
It helps track **room-level demand**, **search behavior**, and optimize **inventory visibility** based on guest filters like adults, children, and room types.

```js
jitsu.track("Room List Viewed", {
  commerce: {
    currency: "ISK",                // ISO 4217 currency code
    products: [{
      entry_type: "Search Results", // where the listing was shown
      product_id: "5884",
      sku: "5884",
      product: "Saga Luxury Villa",
      category: "Rooms",        
      unit_price: 0,               
      units: 1                  
    }]
  },

  metrics: {
    pax: 1 // total guests (adults + children), used for aggregation
  },

  dimensions: {
    adults: "1",        // filterable guest count
    children: "0",
    rooms: "1",         // number of rooms selected
    room_types: "all"   // available room type filter
  },

  classification: [
    {
      type: "Category",
      value: "Rooms"
    }
  ],

  timestamp: "2025-06-25T14:37:26.027Z" // event time in UTC
});
```