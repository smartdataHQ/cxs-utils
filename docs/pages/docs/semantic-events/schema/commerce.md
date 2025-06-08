---
title: Commerce Event Properties
---

# Semantic Event Schema: Commerce Properties

Commerce properties within the Semantic Event Schema are designed to capture detailed information about e-commerce activities and transactions. These fields allow for comprehensive tracking of events like "Order Completed", "Product Added to Cart", "Checkout Started", and many others. By standardizing these properties, businesses can gain deeper insights into sales performance, customer purchasing behavior, and product interactions.

This document outlines the overall commerce-related properties associated with an event and the detailed structure for product information, typically found in a list or array accompanying the event.

## Overall Commerce Properties

These properties provide a summary of the commerce-related aspects of an event, such as order details, financial totals, and shipping information.

| Name                                    | Required | Data Type | Description                                                                                                                                                    |
|-----------------------------------------|----------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `commerce.order_id`                     |          | `String`  | Unique identifier for the order or transaction. This field is optional.                                                                                        |
| `commerce.order_gid`                    |          | `UUID`    | Global unique identifier for the order or transaction. This field is optional. (Note: Avro type is string with logicalType uuid, Markdown was UUID (String, Optional)) |
| `commerce.total`                        |          | `Double`  | The grand total value of the transaction, including taxes, shipping, and after discounts. This field is optional. (Avro type: `double`)                          |
| `commerce.revenue`                      |          | `Double`  | The net revenue from the transaction, typically excluding taxes and shipping, but after discounts. This field is optional. (Avro type: `double`)                 |
| `commerce.tax`                          |          | `Double`  | Total tax amount for the transaction. This field is optional. (Avro type: `double`)                                                                              |
| `commerce.shipping`                     |          | `Double`  | Total shipping cost for the transaction. This field is optional. (Note: Avro for `commerce.avsc` does not list `shipping` explicitly, derived from markdown)     |
| `commerce.discount`                     |          | `Double`  | Total discount amount applied to the transaction. This field is optional. (Avro type: `double`)                                                                  |
| `commerce.coupon`                       |          | `String`  | Coupon code used for the transaction. This field is optional.                                                                                                    |
| `commerce.currency`                     |          | `String`  | Currency code for all monetary values (e.g., "USD", "EUR"). Originally `LowCardinality(String)`. This field is optional.                                          |
| `commerce.payment_type`                 |          | `String`  | Method of payment used (e.g., "credit_card", "paypal"). Originally `LowCardinality(String)`. This field is optional.                                               |
| `commerce.shipping_method`              |          | `String`  | Shipping method chosen (e.g., "standard", "express"). Originally `LowCardinality(String)`. This field is optional.                                                |
| `commerce.billing_address_country_code` |          | `String`  | ISO country code for the billing address (e.g., "US", "GB"). Originally `LowCardinality(String)`. This field is optional.                                          |
| `commerce.billing_address_postal_code`  |          | `String`  | Postal code for the billing address. This field is optional.                                                                                                     |
| `commerce.shipping_address_country_code`|          | `String`  | ISO country code for the shipping address (e.g., "US", "GB"). Originally `LowCardinality(String)`. This field is optional.                                         |
| `commerce.shipping_address_postal_code` |          | `String`  | Postal code for the shipping address. This field is optional.                                                                                                    |
| `commerce.subscription_id`              |          | `String`  | Identifier for a subscription, if the commerce event relates to recurring billing. This field is optional.                                                       |
| `commerce.subscription_status`          |          | `String`  | Status of the subscription (e.g., "active", "cancelled"). Originally `LowCardinality(String)`. This field is optional.                                            |
| `commerce.checkout_id`                  |          | `String`  | Unique identifier for the checkout process. This field is optional.                                                                                              |
| `commerce.checkout_step`                |          | `Integer` | The step number in the checkout process (e.g., 1 for shipping, 2 for payment). This field is optional.                                                          |
| `commerce.affiliation`                  |          | `String`  | Store or affiliate from which the transaction occurred (e.g., "Website", "iOS App", "PartnerName"). This field is optional.                                      |

**Note on `commerce.total` vs. `commerce.revenue`:**
- `commerce.total` generally represents the amount charged to the customer.
- `commerce.revenue` often represents the value recognized by the business after certain deductions (but before cost of goods sold). The exact definition can vary by implementation, so consistency is key.

## Product Properties (within `commerce.products` list)

Most commerce events that involve products (e.g., "Order Completed", "Product Added to Cart", "Product List Viewed") will include a list or array named `commerce.products`. Each item in this list is an object representing a distinct product and has the following properties:

| Name                    | Required | Data Type        | Description                                                                                                                                                    |
|-------------------------|----------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `product_id`            |          | `String`         | Unique identifier for the product (e.g., database ID).                                                                                                           |
| `product_gid`           |          | `UUID`           | Global unique identifier for the product. (Avro: `entity_gid`). This field is optional.                                                                        |
| `sku`                   |          | `String`         | Stock Keeping Unit (SKU) of the product. This field is optional.                                                                                                 |
| `product`               |          | `String`         | Name of the product. (Avro: `product`).                                                                                                                          |
| `variant`               |          | `String`         | Product variant (e.g., "Red", "Large"). Originally `LowCardinality(String)`. This field is optional.                                                              |
| `brand`                 |          | `String`         | Brand of the product. Originally `LowCardinality(String)`. This field is optional.                                                                               |
| `category`              |          | `String`         | Primary category of the product (e.g., "Apparel/Mens/Shirts"). Originally `LowCardinality(String)`. (Avro: `main_category` or `category`). This field is optional. |
| `categories`            |          | `Array(String)`  | A list of all categories the product belongs to. Each string originally `LowCardinality(String)`. This field is optional.                                          |
| `unit_price`            |          | `Double`         | Price per unit of the product at the time of the transaction. This field is optional. (Avro type: `double`)                                                       |
| `original_unit_price`   |          | `Double`         | Original price per unit, if `unit_price` reflects a sale or discount. This field is optional. (Note: Not directly in product.avsc, using original type Float)     |
| `quantity`              |          | `Double`         | Quantity of the product involved in the event (e.g., 1, 1.5, 2). (Avro: `units` is `double`). This field is optional.                                              |
| `uom`                   |          | `String`         | Unit of Measure for the quantity (e.g., "pcs", "kg", "ltr"). Originally `LowCardinality(String)`. This field is optional.                                          |
| `discount`              |          | `Float`          | Discount amount applied specifically to this product instance in this transaction. This field is optional. (Note: Not directly in product.avsc, using original type) |
| `coupon`                |          | `String`         | Coupon code applied specifically to this product. This field is optional.                                                                                        |
| `tax_rate`              |          | `Float`          | Tax rate applied to this product (e.g., 0.08 for 8% tax). (Avro: `tax_percentage`). This field is optional.                                                        |
| `tax_code`              |          | `String`         | Tax code associated with the product (e.g., for jurisdiction-specific tax rules). This field is optional.                                                        |
| `position`              |          | `Integer`        | Position of the product in a list (e.g., in search results, category page, or cart). This field is optional. (Avro type: `int`)                                   |
| `url`                   |          | `String`         | URL of the product page. This field is optional.                                                                                                                 |
| `image_url`             |          | `String`         | URL of the main image for the product. (Avro: `img_url`). This field is optional.                                                                                |
| `custom_properties`     |          | `Map(String, String)` | A map for any additional, non-standard properties related to the product. Both key/value are strings. This field is optional.                                   |
| `subscription_id`       |          | `String`         | Identifier for a subscription, if this specific product is part of a recurring billing. This field is optional.                                                  |
| `subscription_status`   |          | `String`         | Status of the subscription for this product. Originally `LowCardinality(String)`. This field is optional.                                                         |
| `cart_id`               |          | `String`         | Identifier for the cart this product instance is associated with, if applicable. This field is optional.                                                         |

By capturing these granular details for each product, businesses can perform sophisticated analyses, such as understanding which products are frequently bought together, the impact of promotions on product sales, and how product attributes correlate with conversion rates.
