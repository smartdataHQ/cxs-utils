---
title: Commerce Event Properties
---

# Semantic Event Schema: Commerce Properties

Commerce properties within the Semantic Event Schema are designed to capture detailed information about e-commerce activities and transactions. These fields allow for comprehensive tracking of events like "Order Completed", "Product Added to Cart", "Checkout Started", and many others. By standardizing these properties, businesses can gain deeper insights into sales performance, customer purchasing behavior, and product interactions.

This document outlines the overall commerce-related properties associated with an event and the detailed structure for product information, typically found in a list or array accompanying the event.

## Overall Commerce Properties

These properties provide a summary of the commerce-related aspects of an event, such as order details, financial totals, and shipping information.

| Property Name                         | Type                             | Description                                                                                                | Optional |
|---------------------------------------|----------------------------------|------------------------------------------------------------------------------------------------------------|----------|
| `commerce.order_id`                   | `String (Optional)`              | Unique identifier for the order or transaction.                                                            | Yes      |
| `commerce.order_gid`                  | `UUID (String, Optional)`        | Global unique identifier for the order or transaction.                                                     | Yes      |
| `commerce.total`                      | `Float (Optional)`               | The grand total value of the transaction, including taxes, shipping, and after discounts.                  | Yes      |
| `commerce.revenue`                    | `Float (Optional)`               | The net revenue from the transaction, typically excluding taxes and shipping, but after discounts.         | Yes      |
| `commerce.tax`                        | `Float (Optional)`               | Total tax amount for the transaction.                                                                      | Yes      |
| `commerce.shipping`                   | `Float (Optional)`               | Total shipping cost for the transaction.                                                                   | Yes      |
| `commerce.discount`                   | `Float (Optional)`               | Total discount amount applied to the transaction.                                                          | Yes      |
| `commerce.coupon`                     | `String (Optional)`              | Coupon code used for the transaction.                                                                      | Yes      |
| `commerce.currency`                   | `String (Optional)`              | Currency code for all monetary values (e.g., "USD", "EUR"). From `LowCardinality(String)`.                 | Yes      |
| `commerce.payment_type`               | `String (Optional)`              | Method of payment used (e.g., "credit_card", "paypal"). From `LowCardinality(String)`.                     | Yes      |
| `commerce.shipping_method`            | `String (Optional)`              | Shipping method chosen (e.g., "standard", "express"). From `LowCardinality(String)`.                       | Yes      |
| `commerce.billing_address_country_code`| `String (Optional)`              | ISO country code for the billing address (e.g., "US", "GB"). From `LowCardinality(String)`.                | Yes      |
| `commerce.billing_address_postal_code`| `String (Optional)`              | Postal code for the billing address.                                                                       | Yes      |
| `commerce.shipping_address_country_code`| `String (Optional)`            | ISO country code for the shipping address (e.g., "US", "GB"). From `LowCardinality(String)`.               | Yes      |
| `commerce.shipping_address_postal_code`| `String (Optional)`            | Postal code for the shipping address.                                                                      | Yes      |
| `commerce.subscription_id`            | `String (Optional)`              | Identifier for a subscription, if the commerce event relates to recurring billing.                         | Yes      |
| `commerce.subscription_status`        | `String (Optional)`              | Status of the subscription (e.g., "active", "cancelled"). From `LowCardinality(String)`.                   | Yes      |
| `commerce.checkout_id`                | `String (Optional)`              | Unique identifier for the checkout process.                                                                | Yes      |
| `commerce.checkout_step`              | `Integer (Optional)`             | The step number in the checkout process (e.g., 1 for shipping, 2 for payment).                             | Yes      |
| `commerce.affiliation`                | `String (Optional)`              | Store or affiliate from which the transaction occurred (e.g., "Website", "iOS App", "PartnerName").      | Yes      |

**Note on `commerce.total` vs. `commerce.revenue`:**
- `commerce.total` generally represents the amount charged to the customer.
- `commerce.revenue` often represents the value recognized by the business after certain deductions (but before cost of goods sold). The exact definition can vary by implementation, so consistency is key.

## Product Properties (within `commerce.products` list)

Most commerce events that involve products (e.g., "Order Completed", "Product Added to Cart", "Product List Viewed") will include a list or array named `commerce.products`. Each item in this list represents a distinct product and has the following properties:

| Property Name             | Type                             | Description                                                                                              | Optional |
|---------------------------|----------------------------------|----------------------------------------------------------------------------------------------------------|----------|
| `product_id`              | `String`                         | Unique identifier for the product (e.g., database ID).                                                   | No       |
| `product_gid`             | `UUID (String, Optional)`        | Global unique identifier for the product.                                                                | Yes      |
| `sku`                     | `String (Optional)`              | Stock Keeping Unit (SKU) of the product.                                                                 | Yes      |
| `product`                 | `String`                         | Name of the product.                                                                                     | No       |
| `variant`                 | `String (Optional)`              | Product variant (e.g., "Red", "Large"). From `LowCardinality(String)`.                                   | Yes      |
| `brand`                   | `String (Optional)`              | Brand of the product. From `LowCardinality(String)`.                                                     | Yes      |
| `category`                | `String (Optional)`              | Primary category of the product (e.g., "Apparel/Mens/Shirts"). From `LowCardinality(String)`.            | Yes      |
| `categories`              | `Array<String> (Optional)`       | A list of all categories the product belongs to. Each string from `LowCardinality(String)`.              | Yes      |
| `unit_price`              | `Float (Optional)`               | Price per unit of the product at the time of the transaction.                                            | Yes      |
| `original_unit_price`     | `Float (Optional)`               | Original price per unit, if `unit_price` reflects a sale or discount.                                    | Yes      |
| `quantity`                | `Float (Optional)`               | Quantity of the product involved in the event (e.g., 1, 1.5, 2).                                         | Yes      |
| `uom`                     | `String (Optional)`              | Unit of Measure for the quantity (e.g., "pcs", "kg", "ltr"). From `LowCardinality(String)`.              | Yes      |
| `discount`                | `Float (Optional)`               | Discount amount applied specifically to this product instance in this transaction.                       | Yes      |
| `coupon`                  | `String (Optional)`              | Coupon code applied specifically to this product.                                                        | Yes      |
| `tax_rate`                | `Float (Optional)`               | Tax rate applied to this product (e.g., 0.08 for 8% tax).                                                | Yes      |
| `tax_code`                | `String (Optional)`              | Tax code associated with the product (e.g., for jurisdiction-specific tax rules).                        | Yes      |
| `position`                | `Integer (Optional)`             | Position of the product in a list (e.g., in search results, category page, or cart).                     | Yes      |
| `url`                     | `String (Optional)`              | URL of the product page.                                                                                 | Yes      |
| `image_url`               | `String (Optional)`              | URL of the main image for the product.                                                                   | Yes      |
| `custom_properties`       | `Map<String, String> (Optional)` | A map for any additional, non-standard properties related to the product. Both key/value are strings.    | Yes      |
| `subscription_id`         | `String (Optional)`              | Identifier for a subscription, if this specific product is part of a recurring billing.                  | Yes      |
| `subscription_status`     | `String (Optional)`              | Status of the subscription for this product. From `LowCardinality(String)`.                              | Yes      |
| `cart_id`                 | `String (Optional)`              | Identifier for the cart this product instance is associated with, if applicable.                         | Yes      |

By capturing these granular details for each product, businesses can perform sophisticated analyses, such as understanding which products are frequently bought together, the impact of promotions on product sales, and how product attributes correlate with conversion rates.
