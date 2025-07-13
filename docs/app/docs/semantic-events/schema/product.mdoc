Of course. Here is the detailed documentation for the `commerce` and `products` structures within your Semantic Events.

-----

# Context Suite Semantic Events: The Commerce and Products Structure

## 5\. Capturing Commercial Transactions

To effectively model commercial activities, from adding an item to a cart to completing a complex B2B order, Context Suite employs a rich, nested `commerce` object. This object is the designated container for all financial and product-related details of a transaction. It is designed to be comprehensive, accommodating everything from simple e-commerce sales to detailed point-of-sale data.

The `commerce` object is typically used in events like `Order Completed`, `Product Added To Cart`, `Checkout Started`, and `Subscription Renewed`.

### 5.1. The Top-Level `commerce` Object

This object holds the summary information for the entire transaction.

| Property | Type | Description |
| :--- | :--- | :--- |
| `order_id` | String | The unique ID of the order or transaction. |
| `checkout_id` | String | A unique ID for the entire checkout process, which may span multiple events. |
| `revenue` | Number | Total gross revenue for the transaction, including all items, shipping, and taxes, minus discounts. |
| `tax` | Number | The total tax amount for the entire transaction. |
| `discount` | Number | The total discount amount applied to the entire transaction. |
| `currency` | String | The 3-letter ISO 4217 currency code (e.g., `USD`, `EUR`, `ISK`). |
| `coupon` | String | The primary coupon code used for the overall transaction. |
| `payment_type`| String | The method of payment (e.g., `Card`, `Paypal`, `Cash`). |
| `payment_sub_type`| String | A specific subtype of the payment method (e.g., `Visa`, `Amex`). |
| `affiliation` | String | The store or affiliate from which the transaction occurred (e.g., `Main Website`, `Reykjavik Flagship Store`). |
| `products` | **Array of Objects** | **An array containing one object for each product line item in the transaction. This is the most detailed part of the commerce event and is documented below.** |

### 5.2. The `commerce.products` Array: The Heart of the Transaction

This is where the granular details of a commerce event live. The `products` array contains one object for each unique product, SKU, or line item involved in the event. Its extensive schema allows for capturing a product's identity, description, categorization, pricing, and logistical details with high fidelity.

Below is a detailed breakdown of every field available within a product object.

-----

### **Product Object Field Reference**

#### **Core Identifiers**

These fields uniquely identify the product within various systems.

| Property | Type | Description |
| :--- | :--- | :--- |
| `product_id` | String | **(Required)** Your system's unique identifier for the product. |
| `entity_gid` | UUID | The Context Suite Graph UUID (`gid`) for the product. Providing this ensures a direct link to the product entity in our system. |
| `sku` | String | The product's Stock Keeping Unit. Essential for inventory tracking. |
| `line_id` | String | A unique identifier for this specific line item within the order, distinct from the `product_id`. Useful if the same product can appear on multiple lines. |
| `entry_type` | String | Describes the context of the product entry (e.g., `Cart Item`, `Line Item`, `Wishlist`, `Recommendation`). |
| `position` | Integer | The position or order of the product in a list (e.g., the 3rd item in the cart). |

#### **Standardized Global Identifiers**

These fields use global standards for product identification.

| Property | Type | Description |
| :--- | :--- | :--- |
| `barcode` | String | The scanned barcode value. |
| `gtin` | String | Global Trade Item Number. |
| `upc` | String | Universal Product Code. |
| `ean` | String | European Article Number. |
| `isbn` | String | International Standard Book Number, for books. |

#### **Product Description & Attributes**

These fields describe the product's characteristics.

| Property | Type | Description |
| :--- | :--- | :--- |
| `product` | String | The display name of the product (e.g., 'Lopapeysa Wool Sweater'). |
| `variant` | String | The specific variant of the product (e.g., `Blue`, `Large`). |
| `brand` | String | The brand name of the product (e.g., `66°North`). |
| `core_product`| String | The fundamental product name without brand or variant (e.g., `Sweater`). |
| `condition` | String | The condition of the product (e.g., `New`, `Used`, `Refurbished`). |
| `size` | String | The size of the product (e.g., `XL`, `100ml`). |
| `packaging` | String | The packaging type (e.g., `Box`, `Bottle`, `Bag`). |
| `origin` | String | The country or region of origin (e.g., `Iceland`). |
| `url` | String | The direct URL to the product's page on your website. |
| `img_url` | String | A URL for the primary image of the product. |

#### **Categorization**

Fields for classifying the product within your own and global taxonomies.

| Property | Type | Description |
| :--- | :--- | :--- |
| `main_category`| String | The top-level category (e.g., `Apparel`). |
| `category` | String | The primary sub-category (e.g., `Sweaters`). |
| `categories` | Array of Strings | A list of any additional categories the product belongs to. |
| `product_line` | String | The specific product line or collection it belongs to. |
| `gs1_brick` | String | The GS1 Global Product Classification (GPC) "Brick" description (e.g., `Outerwear`). The other `gs1_*` fields (`gs1_class`, `gs1_family`, `gs1_segment`) provide the full hierarchy. |

#### **Pricing, Cost & Quantity**

All financial and unit information for the line item.

| Property | Type | Description |
| :--- | :--- | :--- |
| `units` | Number | The quantity of the product for this line item. |
| `unit_price` | Number | The price of a single unit of the product, before discounts. |
| `unit_cost` | Number | The cost of a single unit of the product to your business (Cost of Goods Sold). |
| `uom` | String | The Unit of Measure (e.g., `piece`, `kg`, `litre`). |
| `tax_percentage`| Float | The tax rate applied specifically to this product (e.g., `0.24` for 24%). |
| `discount_percentage`| Float | The discount rate applied specifically to this product (e.g., `0.1` for 10%). |
| `income_category`| String | The type of revenue this line item represents (e.g., `New Sale`, `Renewal`, `Upgrade`). |
| `coupon` | String | A coupon code applied specifically to this product. |

#### **Supply Chain & Management**

Information about the product's journey and internal ownership.

| Property | Type | Description |
| :--- | :--- | :--- |
| `supplier` | String | The name of the product's supplier. |
| `manufacturer` | String | The name of the product's manufacturer. |
| `product_mgr` | String | The name of the internal product manager responsible for this item. |
| `lead_time` | Float | The expected lead time in days from order to delivery. |

#### **Service & Event Attributes**

Fields used when the "product" is a service, event, or subscription.

| Property | Type | Description |
| :--- | :--- | :--- |
| `starts` | DateTime | The start date/time for the service or event. |
| `ends` | DateTime | The end date/time for the service or event. |
| `duration` | Float | The duration of the service in a consistent unit (e.g., minutes). |
| `destination`| String | The location of an event or travel product (e.g., `Harpa Concert Hall`). |
| `seats` | String | Assigned seats for an event (e.g., `A1, A2`). |

#### **Flags & Contextual Booleans**

Simple true/false flags providing important context, especially for Point-of-Sale data.

| Property | Type | Description |
| :--- | :--- | :--- |
| `scale_item` | Boolean | Was this item weighed at checkout (e.g., produce)? |
| `price_changed`| Boolean | Was the price manually overridden at the terminal? |
| `line_discounted`| Boolean | Was a discount applied specifically to this line? |
| `own_product` | Boolean | Is this an in-house or store-brand product? |

-----

### 5.3. Example: "Order Completed" Event

This example shows a completed online order for two different products, demonstrating how the `commerce` and `products` structures work together.

```json
{
  "event": "Order Completed",
  "type": "track",
  "timestamp": "2024-07-12T14:35:10Z",
  "entity_gid": "a4d3b3f4-1b3e-4a6c-8f2a-1b9c2d7e8f0a",
  "user_id": "user-789",
  "commerce": {
    "order_id": "WEB-987654",
    "revenue": 275.50,
    "tax": 53.00,
    "discount": 15.00,
    "currency": "USD",
    "coupon": "SUMMER10",
    "payment_type": "Card",
    "payment_sub_type": "Visa",
    "affiliation": "Main Website",
    "products": [
      {
        "product_id": "SWTR-BL-L",
        "entity_gid": "d1e2f3a4-b5c6-7890-1234-567890abcdef",
        "sku": "SWTR-BL-L-001",
        "product": "Vatnajökull Wool Sweater",
        "brand": "Icelandic Wools",
        "variant": "Glacier Blue",
        "main_category": "Apparel",
        "category": "Sweaters",
        "units": 1,
        "unit_price": 200.00,
        "income_category": "New Sale",
        "url": "https://example.com/products/vatnajokull-sweater"
      },
      {
        "product_id": "PUFN-BK",
        "entity_gid": "e9f8d7c6-b5a4-3210-fedc-ba9876543210",
        "sku": "PUFN-BK-PLSH",
        "product": "Puffin Plush Toy",
        "brand": "Arctic Friends",
        "main_category": "Toys",
        "category": "Plushies",
        "units": 2,
        "unit_price": 45.25,
        "income_category": "New Sale",
        "url": "https://example.com/products/puffin-plush"
      }
    ]
  },
  "involves": [
    {
      "role": "Buyer",
      "entity_type": "Person",
      "id": "user-789"
    }
  ]
}
```