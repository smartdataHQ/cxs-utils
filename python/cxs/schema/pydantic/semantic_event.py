import enum
import json
import uuid
from datetime import datetime
from typing import Any, Annotated, Optional
from typing import Dict

import logging
from pydantic import Field, model_validator, BaseModel
from cxs.schema.pydantic import CXSBase, OmitIfNone
from cxs.core.utils.event_utils import calculate_event_id

logger = logging.getLogger(__name__)

class EventType(enum.Enum):
    track = "track"
    page = "page"
    screen = "screen"
    identify = "identify"
    group = "group"


class Involved(CXSBase):
    label: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The label of the entity that is involved in the event")
    role: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The role of the entity in the event. (Capitalized like: Supplier, Buyer, Victim, HomeTeam)")
    entity_type: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The type of the entity that is involved in the event (Capitalized Entity name like: Person, Organization, LegalEntity)")
    entity_gid: Annotated[Optional[uuid.UUID],OmitIfNone()] = Field(default=None, description="The Graph UUID of the entity that is involved in the event. Entity GIDs are ContextSuite native IDs. Use the id field for other IDs.")
    id: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The ID of the entity that is involved in the event")
    id_type: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The ID type indicates what organization issued the ID. (This is potentially your own name)")
    capacity: Annotated[Optional[float],OmitIfNone()] = Field(default=None, description="The capacity of the entity in the event. If the involvement is fractional, this is the fraction of the entity that is involved in the event. (e.g. 0.5 for half of a person)")

    @model_validator(mode="before")
    def pre_init(cls, values):

        if values.get("entity_gid") and isinstance(values.get("entity_gid"), str):
            values["entity_gid"] = uuid.UUID(values.get("entity_gid"))

        if values.get("entity_gid") == uuid.UUID('00000000-0000-0000-0000-000000000000'):
            del values["entity_gid"]

        values["id"] = str(values.get("id"))

        return values


class Classification(CXSBase):
    type: Annotated[Optional[str],OmitIfNone()] = Field(..., description="The type of classification. SQL Enum8('Intent'=1, 'Intent Category'=2, 'Category'=3, 'Subcategory'=4, 'Tag'=5, 'Segmentation'=6, 'Age Group'=7, 'Inbox'=8, 'Keyword'=9, 'Priority'=10, 'Other'=0)")
    value: Annotated[Optional[str],OmitIfNone()] = Field(..., description="The category, tag, intent or whatever is being classified according to the type")
    reasoning: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The reasoning behind the classification") # SQL: Nullable(String)
    score: Annotated[Optional[float],OmitIfNone()] = Field(default=None, description="The score of the classification")
    confidence: Annotated[Optional[float],OmitIfNone()] = Field(default=None, description="The confidence of the classification from the classification model")
    weight: float = Field(default=0.0, description="The relevance of the classification") # SQL: Float (non-nullable)

    """
    @model_serializer
    def ser_model(self) -> Dict[str, Any]:
        return {
            "classification.type": [self.type], 
            "classification.value": [self.value]
        }
    """

class Sentiment(CXSBase):
    type: Annotated[Optional[str],OmitIfNone()] = Field(..., description="Type of the sentiment. SQL Enum8('Praise'=1, 'Criticism'=2, 'Complaint'=3, 'Abuse'=4, 'Threat'=5, 'Opinion'=6, 'Other'=0)")
    sentiment: Annotated[Optional[str],OmitIfNone()] = Field(..., description="The sentiment expressed")
    entity_type: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The type of the entity that is involved in the event")
    entity_gid: Annotated[Optional[uuid.UUID],OmitIfNone()] = Field(default=None, description="The entity that the sentiment is expressed about")
    id_type: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The ID of the entity that is involved in the event") # SQL comment, seems to refer to id_type of the entity_gid
    id: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The entity that the sentiment is expressed about") # SQL comment, seems to refer to id of the entity_gid
    target_category: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The type of the entity that is involved in the event") # SQL comment, ambiguous, possibly category of target_entity
    target_type: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The target type of the sentiment")
    target_entity: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The target of the sentiment") # SQL: Nullable(String)
    reason: Annotated[Optional[str],OmitIfNone()] = Field(default="", description="The reasoning behind the sentiment") # SQL: Nullable(String)


class Analysis(CXSBase):
    item: str = Field(..., description="The item that is involved in the event")
    provider: str = Field(..., description="The provider of the item that is involved in the event")
    variant: str = Field(..., description="The variant of the item that is involved in the event")
    token_in: Annotated[Optional[int],OmitIfNone()] = Field(..., description="The token of the item that is involved in the event") # SQL: Nullable(Int32)
    token_out: Annotated[Optional[int],OmitIfNone()] = Field(..., description="The token of the item that is involved in the event") # SQL: Nullable(Int32)
    amount: Annotated[Optional[float],OmitIfNone()] = Field(default=None, description="The price of the item that is involved in the event") # SQL: Nullable(Float)
    processing_time: Annotated[Optional[float],OmitIfNone()] = Field(default=None, description="The process time of the item that is involved in the event") # SQL: Nullable(Float)
    currency: Annotated[Optional[str],OmitIfNone()] = Field(default="USD", description="The currency of the item that is involved in the event") # SQL: LowCardinality(String)

    @model_validator(mode="before")
    def pre_init(cls, values):
        if not values.get('token_in'):
            logger.warn("token_in missing for values: %s", str(values))
        return values

class Location(CXSBase):
    location_of: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The type of location (e.g. \"Customer\", \"Supplier\", \"Postal Address\", \"Business Address\", \"Home Address\", \"Other\")") # Matched to SQL, made Optional as default is empty
    label: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The label of the location (e.g. \"Street name 1, 1234\")") # Matched to SQL, made Optional
    country: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The name of the country (e.g.\"Iceland\")")
    country_code: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The country code (e.g. \"IS\")")
    code: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The code of the location (e.g. \"1234\")")
    region: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The region of the location (e.g. \"Gullbringu og kjósarsýsla\")")
    division: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The division of the location (e.g. \"Capital Region\")")
    municipality: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The municipality of the location (e.g. \"Reykjavik\")")
    locality: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The locality of the location (e.g. \"Vesturbær\")")
    postal_code: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The postal code of the location (e.g. \"101\")")
    postal_name: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The name of the postal code (e.g. \"Vesturbær\")")
    street: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The street of the location (e.g. \"Laugavegur\")")
    street_nr: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The street number of the location (e.g. \"1\")") # SQL: Nullable(String)
    address: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The address of the location (e.g. \"Laugavegur 1, 101 Reykjavik\")") # SQL: Nullable(String)
    longitude: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The longitude of the location (e.g. -21.9333)") # SQL: Nullable(Float64)
    latitude: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The latitude of the location (e.g. 64.1355)") # SQL: Nullable(Float64)
    geohash: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The geohash of the location (e.g. \"gcpuv\")") # SQL: Nullable(String)
    duration_from: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The start date of the location (e.g. \"2022-01-01 00:00:00\") Used if the location is temporary") # SQL: Nullable(DateTime64)
    duration_until: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The end date of the location (e.g. \"2022-01-01 00:00:00\") Used if the location is temporary") # SQL: Nullable(DateTime64)

class Product(CXSBase):
    position: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="Position in the product list (ex. 3)") # SQL: Nullable(UInt16)
    entry_type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="'Cart Item', 'Line Item', 'Wishlist', 'Recommendation', 'Purchase Order', 'Search Results', 'Other', 'Delivery', 'Reservation', 'Reservation', 'Stockout'") # SQL: LowCardinality(String)
    line_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Unique ID for the line item") # SQL: Nullable(String)

    product_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Database id of the product being purchases") # SQL: LowCardinality(String)
    entity_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="Database id of the product being purchases") # SQL: LowCardinality(UUID) - assuming Nullable if Optional

    sku: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Sku of the product being purchased")
    barcode: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Barcode of the product being purchased")
    gtin: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GTIN of the product being purchased")
    upc: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="UPC of the product being purchased")
    ean: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="EAN of the product being purchased")
    isbn: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="ISBN of the product being purchased")
    serial_number: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Serial number of the product being purchased")
    supplier_number: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Supplier number of the product being purchased")
    tpx_serial_number: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Serial number of the product being purchased issued by a third party (not GS1)")

    bundle_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The ID of the bundle the product belongs to when listing all products in a bundle")
    bundle: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The name of the bundle the product belongs to")
    product: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Name of the product being viewed") # Field name in Pydantic, SQL is also 'product'
    variant: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Variant of the product being purchased")
    novelty: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Novelty of the product being purchased")
    size: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Size of the product being purchased")
    packaging: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Packaging of the product being purchased")
    condition: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Condition of the product being purchased //like fresh, frozen, etc.")
    ready_for_use: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="If the product is ready for use //Varies between food and non-food items") # SQL: Nullable(BOOLEAN)
    core_product: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The core product being purchased // Spaghetti, Razor Blades (No Brand, No Variant, No Category)")
    origin: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Location identifier for the origin of the product being purchased")
    brand: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Brand associated with the product")
    product_line: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Product line associated with the product")
    own_product: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="If the item is a store brand") # SQL: Nullable(BOOLEAN)
    product_dist: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Product Distribution is used to track the distribution class of the product (e.g. \"A\", \"B\", \"C\", \"D\", \"E\", \"F\", \"G\", \"H\", \"I\", \"J\")")

    main_category: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Product category being purchased")
    main_category_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Product category ID being purchased")
    category: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Name of the sub-category of the product being purchased")
    category_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="ID of the sub-category of the product being purchased")
    income_category: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Income category of the product being purchased")

    gs1_brick_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GS1 Brick ID of the product being purchased")
    gs1_brick: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GS1 Brick Name of the product being purchased")
    gs1_brick_short: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GS1 Brick Short Name")
    gs1_brick_variant: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GS1 Brick Variant")
    gs1_conditions: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GS1 Brick Conditions")
    gs1_processed: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GS1 Brick Processed")
    gs1_consumable: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GS1 Brick Processed") # SQL comment same as gs1_processed
    gs1_class: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GS1 Class")
    gs1_family: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GS1 Family")
    gs1_segment: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="GS1 Segment")

    starts: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="Start date for the product being purchased") # SQL: Nullable(DateTime64)
    ends: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="End date for the product being purchased") # SQL: Nullable(DateTime64)
    duration: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Duration for the product being purchased in minutes") # SQL: Nullable(Float32)
    seats: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Seats assignments for the product being purchased") # SQL: Nullable(String) -> default="" if it can be empty, or None if truly optional
    destination: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Location identifier for the destination of the product being purchased") # SQL: Nullable(String)
    lead_time: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Lead time in days from the product being purchased until it's delivered (from purchase data to delivery date)") # SQL: Nullable(Float32)

    dwell_time_ms: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The time that this product was in the viewport of the customer (above the fold)") # SQL: Nullable(Int64)

    supplier: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Supplier of the product being purchased")
    supplier_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Supplier ID of the product being purchased")
    manufacturer: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Manufacturer of the product being purchased")
    manufacturer_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Manufacturer ID of the product being purchased")
    promoter: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Promoter of the product being purchased")
    promoter_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Promoter ID of the product being purchased")
    product_mgr_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Product Manager ID of the product being purchased")
    product_mgr: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Product Manager of the product being purchased")

    units: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Product units (1 if sold by wight (see quantity))") # SQL: Nullable(Float64)
    unit_size: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The quantity of each unit") # SQL: Nullable(Float64)
    uom: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Unit of measure of the product(s) being purchased (Weight, Duration, Items, Volume, etc.)")
    unit_price: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Price ($) of the product being purchased") # SQL: Nullable(Float64)
    unit_cost: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Cost ($) of the product being purchased") # SQL: Nullable(Float64)
    bundled_units: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="Number of units in a volume pack or bundle") # SQL: Nullable(Int16)
    price_bracket: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Price bracket of the product being purchased")

    tax_percentage: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Total tax-percentage associated with the product purchase (unit_price * units * tax_rate = tax)") # SQL: Nullable(Float32)
    discount_percentage: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The discount-percentage applied to the product (unit_price * units * discount_rate = discount)") # SQL: Nullable(Float32)
    kickback_percentage: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The discount-percentage applied to the product (unit_price * units * discount_rate = discount)") # SQL: Nullable(Float32) - SQL comment same as discount_percentage
    commission: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The total commission percentage applied to the product on the line basis (unit_price * units * commission_rate = commission)") # SQL: Nullable(Float32)
    coupon: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Coupon code associated with a product (for example, MAY_DEALS_3)")

    scale_item: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="If the quantity of the product was measured during checkout / at the register") # SQL: Nullable(BOOLEAN)
    price_changed: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="If the price of the product has changed at the register/terminal") # SQL: Nullable(BOOLEAN)
    line_discounted: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="If the line item has a discount") # SQL: Nullable(BOOLEAN)
    url: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="URL of the product page")
    img_url: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Image url of the product")

class Commerce(CXSBase):
    details: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="Other properties of the commerce event that cannot be mapped to the schema or have complex data types") # SQL: Nullable(String)
    checkout_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="Unique ID for the checkout") # SQL: Nullable(String)
    order_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="Unique ID for the order") # SQL: Nullable(String)
    cart_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="Unique ID for the cart") # SQL: Nullable(String)
    employee_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Unique ID for the employee working the terminal/register") # SQL: LowCardinality(String)
    external_order_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="Unique External ID for the order") # SQL: Nullable(String)
    terminal_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Unique External ID for the terminal used for the transaction") # SQL: LowCardinality(String)
    affiliation_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Unique ID for the affiliation") # SQL: LowCardinality(String)
    affiliation: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Store or affiliation from which this transaction occurred (for example, Google Store)") # SQL: LowCardinality(String)
    agent: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The Agent responsible for the sale") # SQL: LowCardinality(String)
    agent_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The ID of the Agent responsible for the sale") # SQL: LowCardinality(String)
    sold_location: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The location where the sale occurred") # SQL: LowCardinality(String)
    sold_location_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The ID of the location where the sale occurred") # SQL: LowCardinality(String)
    business_day: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The business day of the transaction") # SQL: LowCardinality(Date32) - Treat as Nullable for Pydantic
    revenue: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Total gross revenue") # SQL: Nullable(Float64)
    tax: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Total tax amount") # SQL: Nullable(Float64)
    discount: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Total discount amount") # SQL: Nullable(Float64)
    cogs: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Total cost of goods sold") # SQL: Nullable(Float64)
    commission: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="Total commission amount") # SQL: Nullable(Float64)
    currency: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Currency code associated with the transaction") # SQL: LowCardinality(String)
    exchange_rate: float = Field(default=1.0, description="Currency exchange rate associated with the transaction") # SQL: LowCardinality(Float32)
    coupon: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Transaction coupon redeemed with the transaction") # SQL: LowCardinality(String)
    payment_type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Type of payment (ex. Card, Paypal, Cash, etc.)") # SQL: LowCardinality(String)
    payment_sub_type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Subtype of payment (ex. Visa, Mastercard, etc.)") # SQL: LowCardinality(String)
    payment_details: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="Details of the payment (ex. Last 4 digits of the card, etc.)") # SQL: Nullable(String)
    products: Annotated[Optional[list[Product]], OmitIfNone()] = Field(default_factory=list, description="Products involved in the commerce event")

class Campaign(BaseModel):
    """
    Standard marketing properties as defined by Segment and Google Analytics
    """
    campaign: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The campaign (e.g. \"summer\")") # SQL: campaign.campaign
    source: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The source (e.g. \"google\")") # SQL: campaign.source
    medium: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The medium (e.g. \"cpc\")") # SQL: campaign.medium
    term: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The term (e.g. \"beach\")") # SQL: campaign.term
    content: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The content (e.g. \"ad1\")") # SQL: campaign.content

class App(BaseModel):
    """
    Application properties as defined by Segment
    """
    build: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The build of the app (e.g. \"1.1.0\")") # SQL: app.build
    name: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The name of the app (e.g. \"Segment\")")   # SQL: app.name
    namespace: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The namespace of the app (e.g. \"com.segment.analytics\")") # SQL: app.namespace
    version: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The version of the app (e.g. \"1.1.0\")") # SQL: app.version

class OS(BaseModel):
    """
    Operating System properties as defined by Segment
    """
    name: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The OS of the device (e.g. \"iOS\")") # SQL: os.name
    version: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The OS version of the device (e.g. \"9.1\")") # SQL: os.version

class UserAgent(BaseModel):
    """
    User Agent properties as defined by Segment
    """
    mobile: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="Whether the user agent is mobile (e.g. \"true\")") # SQL: user_agent.mobile Nullable(Boolean)
    platform: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The platform of the user agent (e.g. \"Apple Mac\")") # SQL: user_agent.platform LowCardinality(String)
    signature: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The user agent (e.g. \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36\")") # SQL: user_agent.signature LowCardinality(String)
    # data: Annotated[Optional[UserAgentData], OmitIfNone()] = Field(default=None, description="User agent data including brand and version") # SQL: user_agent.data Nested

class Page(BaseModel):
    """
    Page properties as defined by Segment
    """
    encoding: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The encoding of the page (e.g. \"UTF-8\")") # SQL: page.encoding
    host: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The host of the page (e.g. \"segment.com\")") # SQL: page.host
    path: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The path of the page (e.g. \"/docs\")") # SQL: page.path
    referrer: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The referrer of the page (e.g. \"https://segment.com\")") # SQL: page.referrer
    referring_domain: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The referring domain of the page (e.g. \"segment.com\")") # SQL: page.referring_domain
    search: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The search of the page (e.g. \"segment\")") # SQL: page.search
    title: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The title of the page (e.g. \"Analytics.js Quickstart - Segment\")") # SQL: page.title
    url: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The url of the page (e.g. \"https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/quickstart/\")") # SQL: page.url

class Referrer(BaseModel):
    """
    Referrer properties as defined by Segment
    """
    id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The referrer ID of the library (e.g. \"3c8da4a4-4f4b-11e5-9e98-2f3c942e34c8\")") # SQL: referrer.id
    type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The referrer type of the library (e.g. \"dataxu\")") # SQL: referrer.type

class Screen(BaseModel):
    """
    Screen properties as defined by Segment
    """
    density: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The density of the screen (e.g. 2)") # SQL: screen.density Nullable(Int16)
    height: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The height of the screen (e.g. 568)") # SQL: screen.height Nullable(Int16)
    width: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The width of the screen (e.g. 320)") # SQL: screen.width Nullable(Int16)
    inner_height: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The inner height of the screen (e.g. 568)") # SQL: screen.inner_height Nullable(Int16)
    inner_width: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The inner width of the screen (e.g. 320)") # SQL: screen.inner_width Nullable(Int16)

class Context(BaseModel):
    """
    Root level event message context properties
    """
    active: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="Whether the library is active (e.g. \"1\")") # SQL: context.active Nullable(Boolean)
    ip: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The IP of the user in IPv4 format") # SQL: context.ip Nullable(IPv4)
    ipv6: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The IP of the user in IPv6 format") # SQL: context.ipv6 Nullable(IPv6)
    locale: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The locale used where the event happened (e.g. \"en-US\")") # SQL: context.locale LowCardinality(String)
    group_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The group ID associated with the event (e.g. \"a89d88da-4f4b-11e5-9e98-2f3c942e34c8\")") # SQL: context.group_id LowCardinality(String)
    timezone: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The timezone the event happened in (e.g. \"America/Los_Angeles\")") # SQL: context.timezone LowCardinality(String)
    location: Annotated[Optional[tuple[float, float]], OmitIfNone()] = Field(default=None, description="The location associated with the event (e.g. \"37.7576171,-122.5776844\")") # SQL: context.location Point
    region: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The region associated with the event (e.g. \"AWS-West\")") # SQL: context.region LowCardinality(String)
    namespace: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The k8s namespace of the server where the event was produced (e.g. \"default\")") # SQL: context.namespace LowCardinality(String)
    hostname: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The k8s hostname of the server where the event was produced (e.g. \"k8s-12345\")") # SQL: context.hostname LowCardinality(String)
    pod: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The K8S pod of the server where the event was produces (e.g. \"k8s-12345-pod\")") # SQL: context.pod LowCardinality(String)
    extras: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Other properties of the event that cannot be mapped to the schema or have complex data types") # SQL: context.extras String

class Library(BaseModel):
    """
    Library properties as defined by Segment
    """
    name: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The name of the library (e.g. \"analytics-ios\")") # SQL: library.name
    version: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The version of the library (e.g. \"3.0.0\")") # SQL: library.version

class Device(BaseModel):
    """
    Device properties as defined by Segment
    """
    ad_tracking_enabled: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="Whether ad tracking is enabled (e.g. \"true\")") # SQL: device.ad_tracking_enabled Nullable(Boolean)
    id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The manufacturer id for the device (e.g. \"e3bcf3f796b9f377284bfbfbcf1f8f92b6\")") # SQL: device.id
    version: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The device version (e.g. \"9.1\")") # SQL: device.version
    mac_address: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The device mac address (e.g. \"00:00:00:00:00:00\")") # SQL: device.mac_address
    manufacturer: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The manufacturer of the device (e.g. \"Apple\")") # SQL: device.manufacturer
    model: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The model of the device (e.g. \"iPhone 6\")") # SQL: device.model
    name: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The name of the device (e.g. \"Nexus 5\")") # SQL: device.name
    type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The type of the device (e.g. \"Mobile\", \"Tablet\", \"Desktop\", \"TV\", \"Wearable\", \"Other\")") # SQL: device.type
    token: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The token of the device (e.g. \"e3bcf3f796b9f377284bfbfbcf1f8f92b6\")") # SQL: device.token
    locale: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The locale of the device (e.g. \"en-US\")") # SQL: device.locale
    timezone: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The timezone of the device (e.g. \"America/Los_Angeles\")") # SQL: device.timezone
    brand: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The manufacturer of the device (e.g. \"Apple\")") # SQL: device.brand (comment same as manufacturer)
    variant: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The variant of the device (e.g. \"iPhone 6s\")") # SQL: device.variant
    advertising_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The advertising ID of the device (e.g. \"350e9d90-d7f5-11e4-b9d6-1681e6b88ec1\")") # SQL: device.advertising_id

class Network(BaseModel):
    """
    Network properties as defined by Segment
    """
    cellular: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="Whether the network is cellular (e.g. \"true\")") # SQL: network.cellular Nullable(Boolean)
    bluetooth: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="Whether the network is bluetooth (e.g. \"true\")") # SQL: network.bluetooth Nullable(Boolean)
    wifi: Annotated[Optional[bool], OmitIfNone()] = Field(default=None, description="Whether the network is wifi (e.g. \"true\")") # SQL: network.wifi Nullable(Boolean)
    carrier: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The network carrier of the device (e.g. \"Verizon\")") # SQL: network.carrier LowCardinality(String)

class Traits(BaseModel):
    """
    Trait Properties that should be stores separately for GDPR reasons
    The user id should never be the same as the user id in the traits or any other personal identifiable information
    """
    id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The ID of the user") # SQL: traits.id
    name: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The name of the user") # SQL: traits.name
    first_name: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The first name of the user") # SQL: traits.first_name
    last_name: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The last name of the user") # SQL: traits.last_name
    social_security_nr: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The social security number of the user") # SQL: traits.social_security_nr
    social_security_nr_family: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The social security number of the user") # SQL: traits.social_security_nr_family (SQL comment same as above)
    email: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The email of the user") # SQL: traits.email
    phone: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The phone number of the user") # SQL: traits.phone
    avatar: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The avatar of the user") # SQL: traits.avatar
    username: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The username of the user") # SQL: traits.username
    website: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The website of the user") # SQL: traits.website
    age: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The age of the user") # SQL: traits.age Nullable(Int8)
    birthday: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The birthday of the user") # SQL: traits.birthday Nullable(Date)
    created_at: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The date the user was created") # SQL: traits.created_at Nullable(Date)
    company: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The company of the user") # SQL: traits.company
    title: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The title of the user") # SQL: traits.title
    gender: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Gender of the user. SQL Enum8(...)") # SQL: traits.gender
    pronouns: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The pronouns of the user") # SQL: traits.pronouns
    salutation: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The salutation of the user") # SQL: traits.salutation
    description: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="A general description of the user") # SQL: traits.description String (non-nullable)
    industry: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The industry of the user") # SQL: traits.industry
    employees: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The number of employees of the user") # SQL: traits.employees Nullable(Int32)
    plan: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The plan of the user") # SQL: traits.plan
    total_billed: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The total billed of the user") # SQL: traits.total_billed Nullable(Float32)
    logins: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The number of logins of the user") # SQL: traits.logins Nullable(Int32)
    address: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="All traits that are not defined explicitly") # SQL: traits.address Map(...)


class UserAgentData(CXSBase):
    brand: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The brand of the user agent (e.g. \"Apple\")")
    version: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The version of the user agent (e.g. \"Mac OS X 10_10_5\")")


class EntityLinking(CXSBase):
    content_key: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The type of content (e.g. \"body\", \"subject\", \"title\", \"description\", \"summary\", \"quick response\", \"other\")")
    label: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The label of the entity that is involved in the event") # SQL Nullable
    starts_at: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The start index of the entity in the content") # SQL Nullable
    ends_at: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The end index of the entity in the content") # SQL Nullable
    entity_type: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The Entity type of the entity that is involved in the event (e.g. \"Person\", \"Organization\", \"LegalEntity\")") # SQL Nullable
    entity_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The Graph UUID of the entity that is involved in the event") # SQL Nullable
    entity_wid: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The Wikidata UUID of the entity that is involved in the event") # SQL Nullable
    certainty: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The certainty of the entity linking") # SQL Nullable


class ContextualAwareness(CXSBase):
    type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Description, Summary, Conditions, History, Other")
    entity_type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The entity type that the event is associated with (e.g. \"Currency\", \"Product\", \"Service\", \"Other\")")
    entity_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The entity that the event is associated with (Context Suite Specific) (Account or any sub-entity)") # SQL Nullable
    entity_wid: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The wikidata ID of the entity that the event is associated with (Context Suite Specific) (Account or any sub-entity)") # SQL Nullable
    context: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The context information (e.g. \"Silfra is an extremely cold pond with a constant temperature of 2° celsius\")") # SQL Nullable


class BaseEventInfo(CXSBase):
    event_gid: uuid.UUID = Field(..., description="The event gid of the root event")
    type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The type of the event (e.g. \"page\", \"track\", \"identify\", \"group\", \"alias\", \"screen\", \"commerce\")")
    event: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The name of the event (e.g. \"Page Viewed\", \"Product Added\", \"User Signed Up\")")
    timestamp: datetime = Field(..., description="The timestamp of the event in UTC (e.g. \"2022-01-01 00:00:00\")")
    messageIs: str = Field(default="", alias="message_id", description="The message ID of the base event") # SQL String (non-nullable)
    entity_gid: uuid.UUID = Field(..., description="The entity GID of the event")


class AccessInfo(CXSBase):
    type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The type of the user. SQL Enum8('Blacklisted'=1, 'Whitelisted'=2)")
    label: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The user ID of the user") # SQL comment might be for a more generic label
    user_gid: uuid.UUID = Field(..., description="The user ID of the user") # SQL UUID (non-nullable)
    organization_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The department ID (sub organization) of users that have access") # SQL Nullable
    date_from: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The access start date") # SQL Nullable
    date_to: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The access end date") # SQL Nullable


class SourceInfo(CXSBase):
    type: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The type of source (e.g. \"CRM\", \"ERP\", \"eCommerce\", \"Social\", \"Email\", \"SMS\", \"Web\", \"Mobile\", \"Other\")") # SQL Nullable
    label: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The label of the source of the event") # SQL Nullable
    source_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The Graph UUID of the source of the event") # SQL Nullable
    access_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The Graph UUID of the authentication details of the source of the event") # SQL Nullable


class SemanticEvent(BaseModel):

    type: EventType = Field(..., description="The event type (e.g. \"track, page, identify, group, alias, screen etc.\")")
    event: str = Field(..., description="The event name (e.g. \"Product Added\") always capitalized and always ended with a verb in passed tense")
    timestamp: datetime = Field(..., description="The timestamp of the event is always stored in UTC")
    event_gid: uuid.UUID = Field(description="A unique GID for each message - calculated on the server side from the message ID or other factors if missing") # SQL: event_gid UUID (non-nullable)
    messageId: Annotated[Optional[str],OmitIfNone()] = Field(default="", alias="message_id", description="A unique ID for each message as assigned by the client library") # SQL: message_id String
    importance: Annotated[Optional[int], OmitIfNone()] = Field(default=None, description="The importance of the event (eg. 1..5)") # SQL: Nullable(Int8)
    customer_facing: int = Field(default=0, description="Indicates if the event is customer-facing (1 for true, 0 for false)") # SQL: Int8 default 0

    anonymous_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The anonymous ID of the user before they are identified") # SQL: Nullable(String)
    anonymous_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The anonymous ID of the user before they are identified") # SQL: Nullable(UUID)
    user_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The user ID of the user") # SQL: Nullable(String)
    user_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The user ID of the user") # SQL: Nullable(UUID)
    account_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The account ID of the user (Often the same as the entity_gid)") # SQL: Nullable(String)
    previous_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The user ID of the user before the event (e.g. \"anonymousId\" before \"identify\")") # SQL: Nullable(String)
    session_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The session ID of the user in the client that generated the event") # SQL: Nullable(String)
    session_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The session GID of the user session that generated the event") # SQL: Nullable(UUID)

    source_info: Annotated[Optional[SourceInfo], OmitIfNone()] = Field(alias="source", default=None, description="Information about the source of the event.")
    app: Annotated[Optional[App], OmitIfNone()] = Field(default=None, description="Application context information.")
    context: Annotated[Optional[Context], OmitIfNone()] = Field(default=None, description="General event context (IP, locale, etc.).")
    library: Annotated[Optional[Library], OmitIfNone()] = Field(default=None, description="Information about the client library that generated the event.")
    os: Annotated[Optional[OS], OmitIfNone()] = Field(alias="operating_system", default=None, description="Operating system context information.")

    network: Annotated[Optional[Network], OmitIfNone()] = Field(default=None, description="Network context information.")
    user_agent: Annotated[Optional[UserAgent], OmitIfNone()] = Field(default=None, description="User agent information.")
    device: Annotated[Optional[Device], OmitIfNone()] = Field(default=None, description="Device context information.")

    campaign: Annotated[Optional[Campaign], OmitIfNone()] = Field(default=None, description="Marketing campaign information.")
    page: Annotated[Optional[Page], OmitIfNone()] = Field(default=None, description="Page context information for web events.")
    referrer: Annotated[Optional[Referrer], OmitIfNone()] = Field(default=None, description="Referrer information.")
    screen: Annotated[Optional[Screen], OmitIfNone()] = Field(default=None, description="Screen context information for mobile events.")
    traits: Annotated[Optional[Traits], OmitIfNone()] = Field(default=None, description="User traits, typically for identify or group events.")
    commerce: Annotated[Optional[Commerce], OmitIfNone()] = Field(default=None, description="Commerce-related event information.")

    ## extended CXS object properties and control fields

    dimensions: Annotated[Optional[Dict[str, str]],OmitIfNone()] = Field(default_factory=dict, description="Additional dimensions for the event. Low-cardinality dimensions not defined in the schema and used on dashboards.")
    metrics: Annotated[Optional[Dict[str, float]],OmitIfNone()] = Field(default_factory=dict, description="Additional metrics for the event. These are additional metrics not defined in the schema and used on dashboards.") # SQL: Map(LowCardinality(String),Float32)
    flags: Annotated[Optional[Dict[str, bool]],OmitIfNone()] = Field(default_factory=dict, description="Boolean flags for the event. These are additional flags not defined in the schema and used on dashboards.")
    properties: Annotated[Optional[Dict[str, str]],OmitIfNone()] = Field(default_factory=dict, description="A dictionary of additional properties for the event in any JSON format.") # SQL: Map(LowCardinality(String),String)

    content: Annotated[Optional[Dict[str, str]],OmitIfNone()] = Field(default_factory=dict, description="A dictionary of additional content that is associated with the event. Keys can be e.g. \"Body\", \"Subject\", \"Title\".") # SQL: Map(LowCardinality(String),String)
    involves: Annotated[Optional[list[Involved]],OmitIfNone()] = Field(default_factory=list, description="Entities involved in the event. Involvement can be implicit (via other properties) or explicit using this structure.")
    sentiment: Annotated[Optional[list[Sentiment]],OmitIfNone()] = Field(default_factory=list, description="Entity sentiment of the event. Context Suite Specific array if sentiment objects used to track entity sentiment expressed in the event.")
    classification: Annotated[Optional[list[Classification]],OmitIfNone()] = Field(default_factory=list, description="Classification of the event. Context Suite Specific property to track event classification (Intent, Categories, etc.).")
    analysis: Annotated[Optional[list[Analysis]],OmitIfNone()] = Field(default_factory=list, description="Analysis array is used to track the cost associated with analysis of the event. Strictly for internal use.")
    location: Annotated[Optional[list[Location]], OmitIfNone()] = Field(default_factory=list, description="Location(s) associated with the event.")

    entity_linking: Annotated[Optional[list[EntityLinking]], OmitIfNone()] = Field(default_factory=list, description="An array of entity links from content to named entities.")
    contextual_awareness: Annotated[Optional[list[ContextualAwareness]], OmitIfNone()] = Field(default_factory=list, description="Additional context for entities involved in the event.")
    base_events: Annotated[Optional[list[BaseEventInfo]], OmitIfNone()] = Field(default_factory=list, description="If this is a derived event (higher order), this will be populated with the base event information.")

    local_time: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The original timestamp of the event in local time of the sender") # SQL: Nullable(DateTime64)
    original_timestamp: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The original timestamp of the event if different from 'timestamp'") # SQL: Nullable(DateTime64)
    received_at: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The time the event was received by Segment (or similar system)") # SQL: Nullable(DateTime64)
    sent_at: Annotated[Optional[datetime], OmitIfNone()] = Field(default=None, description="The timestamp of when the event was sent by the client") # SQL: Nullable(DateTime64)

    ttl_days: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The number of days the event will be stored in the database (defaults to forever)") # SQL: Nullable(Float64)
    access: Annotated[Optional[list[AccessInfo]], OmitIfNone()] = Field(default_factory=list, description="Black or whitelist of users that have access to the event or not.")

    analyse: Annotated[Optional[Dict[str, bool]],OmitIfNone()] = Field(default_factory=dict, description="Custom analysis flags that override the default analysis for this event.") # SQL: analyse Map(LowCardinality(String), Boolean)
    integrations: Annotated[Optional[Dict[str, bool]],OmitIfNone()] = Field(default_factory=dict, description="Customer integrations flags that override the default integrations for this event.") # SQL: integrations Map(LowCardinality(String), Boolean)
    underscore_process: Annotated[Optional[Dict[str, Any]],OmitIfNone()] = Field(default_factory=dict, description="Internal CXS processing flags and properties, not directly mapped to a fixed SQL schema part.")

    entity_gid: uuid.UUID = Field(description="The entity that the event is associated with (Context Suite Specific) (Account or any sub-entity)", default='')  # set on the server side
    partition: str = Field(description="The version of the event message - Internal, can not be set by the user or via API", default='') # set on the server side
    write_key: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The write key used to send the event (salted hash of the write key) - Internal, can not be set by the user or via API")  # enforced on the server side

    @model_validator(mode="before")
    def pre_init(cls, values):

        if "timestamp" not in values or values["timestamp"] is None:
            values["timestamp"] = datetime.now().isoformat()

        if "organization_gid" in values:
            default_gid = values.pop("organization_gid")
            if values.get("entity_gid") is None:
                values["entity_gid"] = default_gid

        if values.get("event_gid") is None or values.get("event_gid") == uuid.UUID("00000000-0000-0000-0000-000000000000"):
            values["event_gid"] = calculate_event_id(values)

        for check_uuid in ["entity_gid", "event_gid"]:
            if isinstance(values.get(check_uuid), str):
                values[check_uuid] = uuid.UUID(values.get(check_uuid))

        if values.get("involves.id") is not None:
            involves = []
            idx = 0
            for some in values.get("involves.id"):
                involves.append({
                    "label": values.get("involves.label")[idx],
                    "role": values.get("involves.role")[idx],
                    "entity_type": values.get("involves.entity_type")[idx],
                    "entity_gid": values.get("involves.entity_gid")[idx],
                    "id": values.get("involves.id")[idx],
                    "id_type": values.get("involves.id_type")[idx],
                    "capacity": values.get("involves.capacity")[idx] if values.get("involves.capacity") else None,
                    "role": values.get("involves.role")[idx],
                })
                idx += 1
            values["involves"] = involves

        if values.get("classification.type") is not None:
            classification = []
            idx = 0
            for some in values.get("classification.type"):
                classification.append({
                    "type": values.get("classification.type")[idx],
                    "value": values.get("classification.value")[idx],
                    "reasoning": values.get("classification.reasoning")[idx],
                    "score": values.get("classification.score")[idx],
                    "confidence": values.get("classification.confidence")[idx],
                    "weight": values.get("classification.weight")[idx],
                })
                idx += 1
            values["classification"] = classification

        if values.get("analysis.item") is not None:
            analysis = []
            idx = 0
            for some in values.get("analysis.item"):
                analysis.append({
                    "item": values.get("analysis.item")[idx],
                    "provider": values.get("analysis.provider")[idx],
                    "variant": values.get("analysis.variant")[idx],
                    "token_in": values.get("analysis.token_in")[idx],
                    "token_out": values.get("analysis.token_out")[idx],
                    "amount": values.get("analysis.amount")[idx],
                    "processing_time": values.get("analysis.processing_time")[idx],
                    "currency": values.get("analysis.currency")[idx],
                })
                idx += 1
            values["analysis"] = analysis

        if values.get("sentiment.type") is not None:
            sentiment = []
            idx = 0
            for some in values.get("sentiment.type"):
                sentiment.append({
                    "type": values.get("sentiment.type")[idx],
                    "sentiment": values.get("sentiment.sentiment")[idx],
                    "reason": values.get("sentiment.reason")[idx],
                    "entity_gid": values.get("sentiment.entity_gid")[idx],
                    "entity_type": values.get("sentiment.entity_type")[idx],
                    "id": values.get("sentiment.id")[idx],
                    "id_type": values.get("sentiment.id_type")[idx],
                    "target_category": values.get("sentiment.target_category")[idx],
                    "target_type": values.get("sentiment.target_type")[idx],
                    "target_entity": values.get("sentiment.target_entity")[idx],
                })
                idx += 1
            values["sentiment"] = sentiment

        if values.get("entity_linking.content_key") is not None:
            entity_linkings = []
            idx = 0
            for _ in values.get("entity_linking.content_key"):
                entity_linkings.append({
                    "content_key": values.get("entity_linking.content_key")[idx],
                    "label": values.get("entity_linking.label")[idx],
                    "starts_at": values.get("entity_linking.starts_at")[idx],
                    "ends_at": values.get("entity_linking.ends_at")[idx],
                    "entity_type": values.get("entity_linking.entity_type")[idx],
                    "entity_gid": values.get("entity_linking.entity_gid")[idx],
                    "entity_wid": values.get("entity_linking.entity_wid")[idx],
                    "certainty": values.get("entity_linking.certainty")[idx],
                })
                idx += 1
            values["entity_linking"] = entity_linkings

        if values.get("contextual_awareness.type") is not None:
            contextual_awareness_items = []
            idx = 0
            for _ in values.get("contextual_awareness.type"):
                contextual_awareness_items.append({
                    "type": values.get("contextual_awareness.type")[idx],
                    "entity_type": values.get("contextual_awareness.entity_type")[idx],
                    "entity_gid": values.get("contextual_awareness.entity_gid")[idx],
                    "entity_wid": values.get("contextual_awareness.entity_wid")[idx],
                    "context": values.get("contextual_awareness.context")[idx],
                })
                idx += 1
            values["contextual_awareness"] = contextual_awareness_items

        if values.get("base_events.event_gid") is not None:
            base_event_items = []
            idx = 0
            for _ in values.get("base_events.event_gid"):
                base_event_items.append({
                    "event_gid": values.get("base_events.event_gid")[idx],
                    "type": values.get("base_events.type")[idx],
                    "event": values.get("base_events.event")[idx],
                    "timestamp": values.get("base_events.timestamp")[idx],
                    "message_id": values.get("base_events.message_id")[idx],
                    "entity_gid": values.get("base_events.entity_gid")[idx],
                })
                idx += 1
            values["base_events"] = base_event_items

        if values.get("access.type") is not None:
            access_items = []
            idx = 0
            for _ in values.get("access.type"):
                access_items.append({
                    "type": values.get("access.type")[idx],
                    "label": values.get("access.label")[idx],
                    "user_gid": values.get("access.user_gid")[idx],
                    "organization_gid": values.get("access.organization_gid")[idx],
                    "date_from": values.get("access.date_from")[idx],
                    "date_to": values.get("access.date_to")[idx],
                })
                idx += 1
            values["access"] = access_items

        # Note: SemanticEvent.location is a list of Location objects
        # SQL schema: location Nested (...)
        # This pre_init part assumes that if location data comes from CH flat, it would be like "location.type", "location.label" etc.
        if values.get("location.type") is not None and isinstance(values.get("location.type"), list):
            location_items = []
            # Need to determine the number of location items based on one of its array fields
            num_locations = len(values.get("location.type"))
            for idx in range(num_locations):
                location_item = {}
                for key in ["type", "label", "country", "country_code", "code", "region", "division",
                            "municipality", "locality", "postal_code", "postal_name", "street",
                            "street_nr", "address", "longitude", "latitude", "geohash",
                            "duration_from", "duration_until", "location_of"]: # Added location_of
                    ch_key = f"location.{key}"
                    if values.get(ch_key) is not None and idx < len(values.get(ch_key)):
                        location_item[key] = values.get(ch_key)[idx]
                    else:
                        # Handle cases where a specific sub-field might be missing for an item
                        location_item[key] = None
                location_items.append(location_item)
            values["location"] = location_items

        # Reconstruct Context Objects from flattened ClickHouse data
        # SourceInfo (replaces source: str)
        if any(k.startswith("source.") for k in values.keys()):
            values["source_info"] = SourceInfo(
                type=values.pop("source.type", None),
                label=values.pop("source.label", None),
                source_gid=values.pop("source.source_gid", None),
                access_gid=values.pop("source.access_gid", None)
            )
            # Remove the old 'source' string field if it's present from older data
            values.pop("source", None)

        if any(k.startswith("campaign.") for k in values.keys()):
            values["campaign"] = Campaign(
                campaign=values.pop("campaign.campaign", None),
                source=values.pop("campaign.source", None),
                medium=values.pop("campaign.medium", None),
                term=values.pop("campaign.term", None),
                content=values.pop("campaign.content", None)
            )

        if any(k.startswith("app.") for k in values.keys()):
            values["app"] = App(
                build=values.pop("app.build", None),
                name=values.pop("app.name", None),
                namespace=values.pop("app.namespace", None),
                version=values.pop("app.version", None)
            )

        if any(k.startswith("os.") for k in values.keys()): # SQL os.name, os.version
            values["os"] = OS( # Pydantic field is os: Optional[OS]
                name=values.pop("os.name", None),
                version=values.pop("os.version", None)
            )

        if any(k.startswith("library.") for k in values.keys()):
            values["library"] = Library(
                name=values.pop("library.name", None),
                version=values.pop("library.version", None)
            )

        if any(k.startswith("network.") for k in values.keys()):
            values["network"] = Network(
                cellular=values.pop("network.cellular", None),
                bluetooth=values.pop("network.bluetooth", None),
                wifi=values.pop("network.wifi", None),
                carrier=values.pop("network.carrier", None)
            )

        if any(k.startswith("page.") for k in values.keys()):
            values["page"] = Page(
                encoding=values.pop("page.encoding", None),
                host=values.pop("page.host", None),
                path=values.pop("page.path", None),
                referrer=values.pop("page.referrer", None),
                referring_domain=values.pop("page.referring_domain", None),
                search=values.pop("page.search", None),
                title=values.pop("page.title", None),
                url=values.pop("page.url", None)
            )

        if any(k.startswith("referrer.") for k in values.keys()):
            values["referrer"] = Referrer(
                id=values.pop("referrer.id", None),
                type=values.pop("referrer.type", None)
            )

        if any(k.startswith("screen.") for k in values.keys()):
            values["screen"] = Screen(
                density=values.pop("screen.density", None),
                height=values.pop("screen.height", None),
                width=values.pop("screen.width", None),
                inner_height=values.pop("screen.inner_height", None),
                inner_width=values.pop("screen.inner_width", None)
            )

        if any(k.startswith("device.") for k in values.keys()):
            values["device"] = Device(
                ad_tracking_enabled=values.pop("device.ad_tracking_enabled", None),
                id=values.pop("device.id", None),
                version=values.pop("device.version", None),
                mac_address=values.pop("device.mac_address", None), # This field is in Pydantic but not explicitly in SQL device.* list
                manufacturer=values.pop("device.manufacturer", None),
                model=values.pop("device.model", None),
                name=values.pop("device.name", None),
                type=values.pop("device.type", None),
                token=values.pop("device.token", None),
                locale=values.pop("device.locale", None),
                timezone=values.pop("device.timezone", None),
                brand=values.pop("device.brand", None), # Added in Pydantic
                variant=values.pop("device.variant", None), # Added in Pydantic
                advertising_id=values.pop("device.advertising_id", None) # Added in Pydantic
            )

        if any(k.startswith("user_agent.") for k in values.keys()):
            ua_data_dict = {}
            if "user_agent.data.brand" in values: # Check if sub-fields exist
                ua_data_dict["brand"] = values.pop("user_agent.data.brand", None)
                ua_data_dict["version"] = values.pop("user_agent.data.version", None)

            values["user_agent"] = UserAgent(
                mobile=values.pop("user_agent.mobile", None),
                platform=values.pop("user_agent.platform", None),
                signature=values.pop("user_agent.signature", None),
                data=UserAgentData(**ua_data_dict) if ua_data_dict else None
            )

        if any(k.startswith("context.") for k in values.keys()):
            loc_tuple = None
            # Assuming context.location might come as separate lat/lon or a pre-formed tuple/list
            # Based on SQL 'Point' type, it would be (lon, lat)
            if "context.location.longitude" in values and "context.location.latitude" in values: # Example if they came flat
                lon = values.pop("context.location.longitude")
                lat = values.pop("context.location.latitude")
                if lon is not None and lat is not None:
                    loc_tuple = (float(lon), float(lat))
            elif "context.location" in values and isinstance(values["context.location"], (list, tuple)) and len(values["context.location"]) == 2:
                 # if it comes as [lon, lat] or (lon, lat)
                raw_loc = values.pop("context.location")
                loc_tuple = (float(raw_loc[0]), float(raw_loc[1]))

            values["context"] = Context(
                active=values.pop("context.active", None),
                ip=values.pop("context.ip", None), # This is context_ip in SQL top level, and context.ip in context map.
                ipv6=values.pop("context.ipv6", None),
                locale=values.pop("context.locale", None),
                group_id=values.pop("context.group_id", None),
                timezone=values.pop("context.timezone", None),
                location=loc_tuple,
                extras=values.pop("context.extras", None)
            )

        if any(k.startswith("traits.") for k in values.keys()):
            address_dict = {}
            # traits.address is Map(String, String), so it won't be like traits.address.city
            # It will be traits.address = {'city': 'Reykjavik', 'street': 'Laugavegur'} if CH client supports map directly
            # Or potentially traits.address.key = [...] traits.address.value = [...] if fully flattened
            # For now, assume traits.address comes as a dict if present, or handle specific keys if known
            if "traits.address" in values and isinstance(values["traits.address"], dict) :
                 address_dict = values.pop("traits.address")
            # else: # If address is flattened like traits.address.city, traits.address.country
            #    if values.get("traits.address.city"): address_dict["city"] = values.pop("traits.address.city")
            #    ... etc. for all known address keys

            values["traits"] = Traits(
                id=values.pop("traits.id", None),
                name=values.pop("traits.name", None),
                first_name=values.pop("traits.first_name", None),
                last_name=values.pop("traits.last_name", None),
                social_security_nr=values.pop("traits.social_security_nr", None),
                social_security_nr_family=values.pop("traits.social_security_nr_family", None),
                email=values.pop("traits.email", None),
                phone=values.pop("traits.phone", None),
                avatar=values.pop("traits.avatar", None),
                username=values.pop("traits.username", None),
                website=values.pop("traits.website", None),
                age=values.pop("traits.age", None),
                birthday=values.pop("traits.birthday", None),
                created_at=values.pop("traits.created_at", None),
                company=values.pop("traits.company", None),
                title=values.pop("traits.title", None),
                pronouns=values.pop("traits.pronouns", None),
                salutation=values.pop("traits.salutation", None),
                description=values.pop("traits.description", None),
                industry=values.pop("traits.industry", None),
                employees=values.pop("traits.employees", None),
                plan=values.pop("traits.plan", None),
                total_billed=values.pop("traits.total_billed", None),
                logins=values.pop("traits.logins", None),
                address=address_dict if address_dict else None,
                gender=values.pop("traits.gender", None) # Added in Pydantic
            )

        if any(k.startswith("commerce.") for k in values.keys()):
            commerce_products = []
            if values.get("commerce.products.product_id") is not None: # Check if product fields exist
                num_products = len(values.get("commerce.products.product_id"))
                for idx_prod in range(num_products):
                    prod_data = {}
                    for field_name in Product.__fields__.keys():
                        ch_key = f"commerce.products.{field_name}"
                        # Check if the key exists and the current index is valid for its list
                        if values.get(ch_key) is not None and idx_prod < len(values.get(ch_key)):
                            prod_data[field_name] = values.get(ch_key)[idx_prod]
                        else:
                            # Field might be optional in Product model or missing in this specific CH row item
                            # Pydantic model's defaults for optional fields will apply if not provided here
                            pass
                    commerce_products.append(Product(**prod_data))

            # Pop all potentially used commerce.products keys after processing
            # This avoids them being misinterpreted by subsequent logic or Pydantic strict validation
            if values.get("commerce.products.product_id") is not None: # Ensure we only pop if they existed
                for field_name_to_pop in Product.__fields__.keys():
                    values.pop(f"commerce.products.{field_name_to_pop}", None)

            values["commerce"] = Commerce(
                details=values.pop("commerce.details", None),
                checkout_id=values.pop("commerce.checkout_id", None),
                order_id=values.pop("commerce.order_id", None),
                cart_id=values.pop("commerce.cart_id", None),
                employee_id=values.pop("commerce.employee_id", None),
                external_order_id=values.pop("commerce.external_order_id", None),
                terminal_id=values.pop("commerce.terminal_id", None),
                affiliation_id=values.pop("commerce.affiliation_id", None),
                affiliation=values.pop("commerce.affiliation", None),
                agent=values.pop("commerce.agent", None),
                agent_id=values.pop("commerce.agent_id", None),
                sold_location=values.pop("commerce.sold_location", None),
                sold_location_id=values.pop("commerce.sold_location_id", None),
                business_day=values.pop("commerce.business_day", None),
                revenue=values.pop("commerce.revenue", None),
                tax=values.pop("commerce.tax", None),
                discount=values.pop("commerce.discount", None),
                cogs=values.pop("commerce.cogs", None),
                commission=values.pop("commerce.commission", None),
                currency=values.pop("commerce.currency", None),
                exchange_rate=values.pop("commerce.exchange_rate", 1.0), # Default from model
                coupon=values.pop("commerce.coupon", None),
                payment_type=values.pop("commerce.payment_type", None),
                payment_sub_type=values.pop("commerce.payment_sub_type", None),
                payment_details=values.pop("commerce.payment_details", None),
                products=commerce_products if commerce_products else None
            )
            # Remove commerce.products.* keys manually as they are not popped by simple key access
            # This is a bit verbose, might need a helper if many such structures
            product_field_keys = [f"commerce.products.{k}" for k in Product.__fields__.keys()]
            for pk in product_field_keys:
                values.pop(pk, None)

        return values

    @classmethod
    def coalesce(cls, *args):
        for value in args:
            if value is not None:
                return value
        return ""

    @classmethod
    def from_ticket_dict(cls, ticket: dict, config: dict) -> "SemanticEvent":
        event_gid = uuid.uuid5(
            uuid.NAMESPACE_DNS, f'https://elko.is/support/ticket/{ticket.get("ticket_id")}/analysed'
        )
        event = SemanticEvent(
            **{
                "entity_gid": config.get("organization_gid"),
                "timestamp": ticket.get("updated_at"),
                "type": "track",
                "event": "Support Ticket Analysed",
                "event_gid": event_gid,
                "partition": config.get("partition"),
            }
        )
        analysis = ticket.get("analysis", {})

        # content
        for ai_content in [
            {"field": "subject", "target": "anonymized_subject"},
            {"field": "executive_summary", "target": "summary"},
            {"field": "initial_response", "target": "customized_reply"},
            {"field": "urgency_reasoning", "target": "urgency_reasoning"},
            {"field": "priority_reasoning", "target": "priority_reasoning"},
            {
                "field": "completion_status_justification",
                "target": "completion_status_justification",
            },
        ]:
            if analysis.get(ai_content["field"]) is not None:
                txt_content = analysis.get(ai_content["field"], "")
                if not isinstance(txt_content, str):
                    txt_content = json.dumps(txt_content)
                event.content[ai_content["target"]] = txt_content

        for ai_dimension in [
            {"field": "inbound_outbound", "target": "inbound_outbound"},
            {"field": "urgency", "target": "urgency"},
            {"field": "priority", "target": "priority"},
        ]:
            if analysis.get(ai_dimension["field"]) is not None:
                event.dimensions[ai_dimension["target"]] = analysis.get(ai_dimension["field"])

        for ai_classification in [
            {"field": "urgency", "target": "urgency", "reasoning": "urgency_reasoning"},
            {"field": "priority", "target": "priority", "reasoning": "priority_reasoning"},
            {
                "field": "original_request_completion_status",
                "target": "completion_status",
                "reasoning": "completion_status_justification",
            },
        ]:
            if (
                analysis.get(ai_classification["field"]) is not None
                and analysis.get(ai_classification["target"]) is not None
            ):
                event.classification.append(
                    Classification(
                        type=ai_classification["target"],
                        value=analysis.get(ai_classification["field"]),
                        reasoning=analysis.get(f'{ai_classification["field"]}_reasoning', ""),
                    )
                )

        for tag in ticket.get("tags", []):
            event.classification.append(Classification(type="tag", value=tag))

        for ai_classification_lists in [
            {"field": "products", "target": "product"},
            {"field": "technology_and_brands", "target": "technology_and_brands"},
            {"field": "keywords", "target": "keyword"},
            {"field": "customer_tone_of_voice", "target": "customer_tone_of_voice"},
            {"field": "agent_tone_of_voice", "target": "agent_tone_of_voice"},
        ]:
            for item in analysis.get(ai_classification_lists["field"], []):
                if item is not None:
                    event.classification.append(
                        Classification(type=ai_classification_lists["target"], value=item)
                    )

        for intent in analysis.get("customer_intent", []):
            if intent is None:
                continue

            customer_intent = intent
            customer_intent_category = None
            if "  " in intent:
                customer_intent, customer_intent_category = intent.split("  ")

            event.classification.append(Classification(type="intent", value=customer_intent))
            if customer_intent_category is not None:
                event.classification.append(
                    Classification(type="intent_category", value=customer_intent_category)
                )

        for analysis_item in ticket.get("analysis_cost", []):
            event.analysis.append(Analysis(**analysis_item))

        for sentiment in analysis.get("entity_sentiment", []):
            if "reason" in sentiment:
                event.sentiment.append(
                    Sentiment(
                        type="Opinion",
                        sentiment=sentiment.get("sentiment"),
                        target_category=sentiment.get(
                            "target_category", sentiment.get("entity_type")
                        ),
                        target_type=sentiment.get("target_type", ""),
                        target_entity=sentiment.get(
                            "target_entity", sentiment.get("target_entity")
                        ),
                        entity=str(sentiment.get("entity", "")),
                        entity_id=str(sentiment.get("entity_id", "")),
                        reason=sentiment.get("reason", ""),
                    )
                )

        if ticket.get("ticket_id"):
            involvement = Involved(
                label="Ticket #" + str(ticket.get("ticket_id")) + " in Zendesk",
                role="Ticket",
                id=str(ticket.get("ticket_id")),
                id_type="Zendesk",
            )
            event.involves.append(involvement)

        for flag_field in ["incomplete", "spam", "relevant", "required_response"]:
            if analysis.get(flag_field) is not None:
                event.flags[flag_field] = analysis.get(flag_field)

        for flag in ticket.get("flags", []):
            event.flags[flag] = ticket.get(flag)

        return event
