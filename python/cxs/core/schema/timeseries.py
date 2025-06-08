import uuid
import pandas as pd
import slugify
import math

from datetime import datetime
from enum import Enum
from typing import Dict, Any
from typing import Optional
from pydantic import BaseModel, Field, model_validator, field_serializer, FieldSerializationInfo
from cxs.core.schema.entity import Entity, Location
from cxs.core.schema.uom import UOM
from cxs.core.utils.gid import create_gid

from python.cxs.core.schema import OmitIfNone


class ValueType(str, Enum):
    Actual = 'Actual'               # This value represents an actual value
    Goal = 'Goal'                   # This value represents a goal
    Estimation = 'Estimation'       # This value represents an estimation
    Projection = 'Projection'       # This value represents a projection
    Forecast = 'Forecast'           # This value represents a forecast
    Official = 'Official'           # This value represents an official
    Unknown = 'Unknown'             # This value of unknown type

class DefaultAgg(str, Enum):
    Sum = 'Sum'                     # Sum of the values is the default aggregation
    Avg = 'Avg'                     # Average of the values is the default aggregation
    Min = 'Min'                     # Minimum of the values is the default aggregation
    Max = 'Max'                     # Maximum of the values is the default aggregation
    Custom = 'Custom'               # Custom aggregation is the default aggregation

class TMAmountAdj(str, Enum):
    NotAdjusted = 'NotAdjusted'     # This monetary amount is not adjusted
    Adjusted = 'Adjusted'           # This monetary amount is adjusted on a specific date
    Obfuscated = 'Obfuscated'       # This monetary amount is obfuscated or somehow distorted
    Unknown = 'Unknown'             # This monetary amount is of unknown adjustment type

class TSType(str, Enum):
    SingleMetric = 'SingleMetric'   # This timeseries only has one metric
    MultiMetrics = 'MultiMetrics'   # this is a multi-metric timeseries

# `access_type` Enum8('Local' = 0, 'Exclusive' = 1, 'Group' = 2, 'SharedPercentiles' = 3, 'SharedObfuscated' = 4, 'Shared' = 5, 'Public' = 6) DEFAULT(1),
class TSAccess(str, Enum):
    Local = 'Local'                         # Private to the customer that owns the data
    Exclusive = 'Exclusive'                 # Exclusively offered to specific customers
    Group = 'Group'                         # Shared with a group of customers
    SharedPercentiles = 'SharedPercentiles' # Shared with all customers with percentiles (Somewhat Obfuscated)
    SharedObfuscated = 'SharedObfuscated'   # Shared with all customers with obfuscated values
    Shared = 'Shared'                       # Shared with all customers
    Public = 'Public'                       # Publicly available

class TSCompleteness(str, Enum):
    Unspecified = 'Unspecified' # The completeness of the data is unspecified
    Partial = 'Partial'     # The data is partially complete
    InProgress = 'InProgress'   # The data is in progress
    Complete = 'Complete'    # The data is complete
    Verified = 'Verified'    # The data is verified
    Golden = 'Golden'      # The data is golden
    Unknown = 'Unknown'      # The data is of unknown completeness
    Irrelevant = 'Irrelevant'   # The data completeness is irrelevant

class TSResolution(str, Enum):
    PNT = 'PNT'
    P1Y = 'P1Y'
    P1Q = 'P1Q'
    P2M = 'P2M'
    P1M = 'P1M'
    P2W = 'P2W'
    P1W = 'P1W'
    P1D = 'P1D'
    PT1H = 'PT1H'
    PT30M = 'PT30M'
    PT15M = 'PT15M'
    PT10M = 'PT10M'
    PT5M = 'PT5M'
    PTM = 'PT1M'
    PT1S = 'PT1S'

class TSCategory(str, Enum):
    Agriculture = 'Agriculture'
    Communication = 'Communication'
    Culture = 'Culture'
    Demography = 'Demography'
    Economy = 'Economy'
    Education = 'Education'
    Energy = 'Energy'
    Environment = 'Environment'
    Geography = 'Geography'
    Governance = 'Governance'
    Health = 'Health'
    Industry = 'Industry'
    Infrastructure = 'Infrastructure'
    Media = 'Media'
    Other = 'Other'
    Philosophy = 'Philosophy'
    Politics = 'Politics'
    Physics = 'Physics'
    Religion = 'Religion'
    Science = 'Science'
    Security = 'Security'
    Society = 'Society'
    SocialMedia = 'SocialMedia'
    Sports = 'Sports'
    Technology = 'Technology'
    Tourism = 'Tourism'
    Transportation = 'Transportation'
    Weather = 'Weather'

from typing import Dict, Any, Optional, List, Annotated # Ensure Annotated is imported

class DefinedMetric(BaseModel): # Assuming it should inherit from CXSBase if OmitIfNone behavior is desired from base
    gid_url: str = Field(..., description="RDF URL for the metric definition.") # SQL: String
    gid: uuid.UUID = Field(..., description="Unique GID for the metric definition.") # SQL: UUID

    category: str = Field(..., description="The category of the metric.") # SQL: LowCardinality(String)
    label: str = Field(..., description="The full human-readable name of the metric.") # SQL: String
    slug: str  = Field(..., description="The slug of the metric, used as a key in metrics dictionaries.") # SQL: String

    uom: UOM = Field(..., description='The unit of measure for the metric.') # SQL: String (enum name/value stored)

    currency: Annotated[Optional[str], OmitIfNone()] = Field(default="", description='The currency of the metric if applicable (e.g., USD).') # SQL: LowCardinality(String)
    adj_type: Annotated[Optional[TMAmountAdj], OmitIfNone()] = Field(default=TMAmountAdj.NotAdjusted, description= 'Adjustment type for the metric if it is a monetary value.') # SQL: LowCardinality(String)
    adj_date: Annotated[Optional[str], OmitIfNone()] = Field(default="", description='Date of adjustment if the monetary value is adjusted.') # SQL: LowCardinality(String)

    wid: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description='WikiData ID for what is being measured (e.g., Q15645384).') # SQL: LowCardinality(String)
    concept_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description='Concept ID from a knowledge graph (e.g., ConceptNet ID like /c/en/wheat).') # SQL: LowCardinality(String)
    synset_id: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description='Synset ID from a lexical database (e.g., BabelNet ID like bn:00080959n).') # SQL: LowCardinality(String)
    properties: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description='Additional properties for the metric definition.') # SQL: Map

    agg: Annotated[Optional[DefaultAgg], OmitIfNone()] = Field(default=DefaultAgg.Sum, description='Default aggregation type for the metric.') # SQL: LowCardinality(String)

    @model_validator(mode="before")
    def pre_init(cls, values):
        assert values.get("category") is not None, "Category must be set"
        assert values.get("label") is not None, "Label must be set"
        assert values.get("uom") is not None, "Unit of measure must be set"

        values["gid_url"] = f"https://quicklookup.com/metrics/{conform_label(values.get('category'))}/{conform_label(values.get('label'))}/{values.get('uom').name[5:]}"

        # slug is always calculated from the label and the uom
        values["slug"] = slugify.slugify(values["label"],separator='_') + '_' + slugify.slugify(values["uom"].name[5:])
        if values.get("currency"):
            values["currency"] = values.get("currency").lower()
            values["slug"] = values["slug"] + '_' + values["currency"]
            values["gid_url"] = values["gid_url"] + '/' + values["currency"].upper()

        if values.get("adj_type") or values.get("adj_date"):
            if values.get("adj_type") == TMAmountAdj.Adjusted:
                assert values.get("adj_date") is not None, "Adjustment data must be set when currency is adjusted"

        values["gid"] = create_gid(values.get("gid_url"), normalize=True)

        return values

class DPEntity(BaseModel): # Assuming it should inherit from CXSBase if OmitIfNone behavior is desired from base
    label: str = Field(..., description="Label of the DataPoint-related entity.")
    type: str = Field(..., description="Type of the DataPoint-related entity.")
    gid: uuid.UUID = Field(..., description="GID of the DataPoint-related entity.")
    gid_url: str = Field(..., description="GID URL of the DataPoint-related entity.")

class DataPoint(BaseModel):
    series_gid: uuid.UUID = Field(..., description="The GID of the time series this data point belongs to.") # SQL: LowCardinality(UUID)
    entity_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="GID for the entity that the datapoint belongs to. Links to an Entity.") # SQL: LowCardinality(UUID)
    entity_gid_url: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="GID URL for the entity that the datapoint belongs to.") # SQL: LowCardinality(String)

    geohash: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="Geolocation as a geohash (for clustering and sorting) - moves for non-stationary entities.") # SQL: LowCardinality(String)
    period: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The resolution/frequency of the data iso 8691 format (e.g., 'PT1H' for hourly, 'P1D' for daily, 'P1M' for monthly, etc.).") # SQL: LowCardinality(String)
    timestamp: datetime = Field(..., description="The calendar date and time (Hourly interval) (UTC) at the start of the period for which the data is reported. This is the timestamp of the datapoint, not the time it was ingested.") # SQL: DateTime

    owner_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The GID of the owner that this datapoint belongs to. Links to an Entity.") # SQL: LowCardinality(UUID)
    source_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The GID of the source that this datapoint belongs to. Links to an Entity.") # SQL: LowCardinality(UUID)
    publisher_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The GID of the publisher that this datapoint belongs to. Links to an Entity.") # SQL: LowCardinality(UUID)
    publication_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field(default=None, description="The GID of the source that this datapoint belongs to. Links to an Entity.") # SQL: LowCardinality(UUID) (comment says source, likely means publication)

    dimensions: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Dimensions for the entity - low cardinality string keys to allow for flexible dimensions and fit on a dashboard breaking down the datapoint.")
    metrics: Dict[str, float] = Field(..., description="Metrics for the datapoint - the measurement.") # SQL: Map(LowCardinality(String), Float64)

    gids: Annotated[Optional[Dict[str, uuid.UUID]], OmitIfNone()] = Field(default_factory=dict, description="Additional links to Named Entities.") # SQL: Map(LowCardinality(String), LowCardinality(UUID))
    location: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Additional geography for the datapoint.")
    demography: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Additional demography for the datapoint.")
    classification: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Additional classification for the datapoint.")
    topology: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Additional topology for the datapoint.")
    usage: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Additional usage for the datapoint.")
    device: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Additional device for the datapoint.")
    product: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Additional product for the datapoint.")

    flags: Annotated[Optional[Dict[str, bool]], OmitIfNone()] = Field(default_factory=dict, description="Additional flags for the datapoint.")
    tags: Annotated[Optional[list[str]], OmitIfNone()] = Field(default_factory=list, description="Additional tags for the datapoint.")

    mtype: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="The measurement type for a metrics.")
    uom: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Unit of measure for the metrics - All UOM are linked to a UOM Entity.")
    of_what: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="What is the metric measuring usually a standard based if from Wikidata/dbPedia etc. the key is the metric name and the value is the standard (e.g., 'population', 'oil', 'humidity', etc.).")
    agg_method: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="The default aggregation method for the metric the key is the metric name and the value is the aggregation method (e.g., 'sum', 'avg', 'max', 'min', etc.).")

    access_type: Annotated[Optional[TSAccess], OmitIfNone()] = Field(default=TSAccess.Exclusive, description="Access type for the data point. SQL Enum8('Local' = 0, 'Exclusive' = 1, ...)")
    signature: uuid.UUID = Field(..., description="The signature of the time_series + dimensions + of_what + metrics - used to ensure the right entries can be updated/replaced.")
    partition: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The version of the event message (used for partitioning).") # SQL comment "The version of the event message" - likely means partition key
    sign: int = Field(default=1, description="Sign for ReplacingMergeTree engine, indicating version or active status.")

    @model_validator(mode="before")
    def pre_init(cls, values):
        new_structure = {}
        for key, value in values.items():
            if '.' in key:
                type, item = key.split('.')
                if type in ['metrics']:
                    if not new_structure.get(type):
                        new_structure[type] = {}
                    if not math.isnan(value):
                        new_structure[type][item] = value
        values.update(new_structure)
        return values

class TimeSeries(BaseModel): # Assuming it should inherit from CXSBase if OmitIfNone behavior is desired from base
    gid_url: str = Field(..., description="RDF URL for the time series, defining its global unique identifier.") # SQL: String
    gid: uuid.UUID = Field(..., description="Unique GID for the time series, derived from gid_url.") # SQL: UUID

    group_gid_url: str = Field(..., description="RDF URL for the conceptual group this time series belongs to.") # SQL: String
    group_gid: uuid.UUID = Field(..., description="Unique GID for the time series group, derived from group_gid_url.") # SQL: UUID

    label: str = Field(..., description="Human-readable label for the time series.") # SQL: String
    slug: str = Field(..., description="URL-friendly slug generated from the label.") # SQL: String
    value_types: Annotated[Optional[ValueType], OmitIfNone()] = Field(default=ValueType.Actual, description="The nature of the values in the time series (e.g., Actual, Forecast).") # SQL: LowCardinality(String)
    completeness: Annotated[Optional[TSCompleteness], OmitIfNone()] = Field(default=TSCompleteness.Complete, description="The completeness status of the time series data.") # SQL: LowCardinality(String)

    category: Annotated[Optional[TSCategory], OmitIfNone()] = Field(default=None, description="Primary category of the time series data (e.g., Economy, Environment).") # SQL: LowCardinality(String)
    sub_category: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Sub-category providing more specific classification.") # SQL: LowCardinality(String)

    resolution: Annotated[Optional[TSResolution], OmitIfNone()] = Field(default=None, description="The resolution or frequency of data points (e.g., P1D for daily, PT1H for hourly).") # SQL: LowCardinality(String)
    metrics: Dict[str, DefinedMetric] = Field(..., description="Dictionary of defined metrics included in this time series, keyed by metric slug.") # SQL: Nested (metrics definition)

    owner: Annotated[Optional[Entity], OmitIfNone()] = Field(default=None, description="The entity that owns this time series data.") # Corresponds to owner_gid
    source: Entity = Field(..., description="The entity that is the source of this time series data.") # Corresponds to source_gid
    publisher: Annotated[Optional[Entity], OmitIfNone()] = Field(default=None, description="The entity that published this time series data.") # Corresponds to publisher_gid
    publication: Annotated[Optional[Entity], OmitIfNone()] = Field(default=None, description="The specific publication this time series belongs to, if any.") # Corresponds to publication_gid

    dimensions: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Additional (generic) dimensions for the time series.") # SQL: Map
    tags: Annotated[Optional[list[str]], OmitIfNone()] = Field(default_factory=list, description="Additional tags for the time series.") # SQL: Array
    flags: Annotated[Optional[Dict[str, bool]], OmitIfNone()] = Field(default_factory=dict, description="Additional boolean flags for the time series.") # SQL: Map
    metric_gid: Annotated[Optional[Dict[str, uuid.UUID]], OmitIfNone()] = Field(default_factory=dict, description="Map of metric slugs to their GIDs, if they are also managed as separate entities.") # SQL: Map
    properties: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="Additional properties for the time series.") # SQL: Map
    uom: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="Primary or default unit of measure for the entire series, if applicable (e.g. for single-metric series).") # SQL: LowCardinality(String)

    datapoints: list[DataPoint] = Field(default_factory=list, description='The data points of the time series.')

    access: Annotated[Optional[TSAccess], OmitIfNone()] = Field(default=TSAccess.Public, description="Access type for the time series. SQL Enum8(...) default 7 (Public).")
    country: Annotated[Optional[str], OmitIfNone()] = Field(default='_open_', description='Country Code, often used for partitioning or regional context. Not a direct column in series.sql but important metadata.')

    def add_datapoints(self, df: pd.DataFrame):
        self.datapoints += [DataPoint(**item) for item in df.to_dict(orient='records')]

    def as_entity(self):
        return Entity(**self.model_dump(exclude={'gid', 'gid_url', 'group_gid', 'group_url', 'datapoints', 'metrics', 'entities'}))

    # Automatic validation at initialization of the TimeSeries class
    @model_validator(mode="before")
    def pre_init(cls, values):

        if not values.get("category"):
            raise ValueError("Category must be set")
        # sub_category is Optional[str] in Pydantic, LowCardinality(String) in SQL (implies non-null).
        # If it's truly optional in logic, Pydantic is fine. If required, it should be str.
        # For now, assume Pydantic Optional[str] is intended if it can be None.
        # If SQL implies it's required (cannot be NULL), then Pydantic should be `str`.
        # Given current Pydantic is Optional[str], validator should not raise error if None.
        # The SQL schema `LowCardinality(String)` without `Nullable()` means it cannot be SQL NULL but can be an empty string.
        # So, if sub_category is mandatory non-empty, Pydantic `str` is better. If it can be empty, `Optional[str]` with `default=""` or `str = ""`
        if values.get("sub_category") is None: # Check if None, allow empty string if that's the convention
             values["sub_category"] = "" # Or handle as error if truly mandatory non-empty

        if not values.get("label"):
            raise ValueError("Label must be set")
        if not values.get("resolution"):
            raise ValueError("Resolution must be set")
        if not values.get("owner"):
            raise ValueError("Owner must be set")
        if not values.get("source"):
             raise ValueError("Source must be set")
        # publisher and publication are Optional[Entity], so they might not be set.
        # No explicit check needed here unless they become mandatory.
        if not values.get("metrics"):
            raise ValueError("Metrics must be set")
        if not values.get("country"):
            raise ValueError("Country must be set")

        # group_gid is non-optional, ensure it's derived if only URL is present initially
        # This specific check might be less relevant now if group_gid is expected directly during instantiation
        if not values.get("group_gid") and values.get("group_gid_url"):
            values["group_gid"] = create_gid(values.get("group_gid_url"), normalize=True)
        elif not values.get("group_gid_url") and values.get("group_gid"): # If GID provided, ensure URL is too (or derive)
             # This part of logic might need defining how to derive URL from GID if that's a path
             pass # Or raise error if both are needed and one is missing without derivable path

        values["slug"] = slugify.slugify(values["label"], separator='_')

        if not values.get("value_types"):
            values["value_types"] = ValueType.Actual

        if not values.get("completeness"):
            values["completeness"] = TSCompleteness.Complete

        if not values.get("datapoints"): # field name is datapoints
            values["datapoints"] = []

        # Set default for publisher if owner is present and publisher is not
        if values.get("owner") and not values.get("publisher"):
            values["publisher"] = values.get("owner")
        # Set default for publication if not present (though it's Optional[Entity], so can be None)
        # No explicit default needed for publication unless business logic dictates one (e.g. from source or owner)

        if not values.get("gid_url"):
            # For internal datasets we use our URL: https://quicklookup.com/timeseries/Energy/Prices/<series_type>/<slug>
            values["gid_url"] = f"https://quicklookup.com/timeseries/{values.get('category').name}/{values.get('sub_category')}/{conform_label(values.get('label'))}/{values.get('value_types').name}/{values.get('resolution').name}"

        values["gid"] = create_gid(values.get("gid_url"), normalize=True)
        values["group_gid_url"] = f"https://quicklookup.com/timeseries/{values.get('category').name}/{values.get('sub_category')}/{conform_label(values.get('label'))}"
        values["group_gid"] = create_gid(values.get("group_gid_url"), normalize=True)

        return values

    @model_validator(mode='after')
    def post_init(self):
        if len(self.country.strip()) != 3:
            raise ValueError(f"Country Code '{self.country}' is not a valid 3-character country code.")

class TimeSeriesCH(TimeSeries):
    # Aliased fields for ClickHouse GID columns
    # Using a distinct name in Pydantic model (e.g. _owner_gid_ch) then aliasing
    # can avoid confusion if base model also had a field named 'owner_gid'
    # For this case, TimeSeries base does not have owner_gid, so direct aliasing is fine.
    owner_gid_ch: uuid.UUID = Field(alias='owner_gid')
    source_gid_ch: uuid.UUID = Field(alias='source_gid')
    publisher_gid_ch: uuid.UUID = Field(alias='publisher_gid')
    publication_gid_ch: uuid.UUID = Field(alias='publication_gid')

    # This model validator runs before field validation on TimeSeriesCH itself,
    # operating on the input data intended to create a TimeSeriesCH instance.
    # If TimeSeriesCH is created from a TimeSeries instance, 'data' will be that instance.
    @model_validator(mode='before')
    @classmethod
    def populate_gids_from_entities(cls, data: Any) -> Any:
        # If data is already a dict (e.g. from model_dump), it might already have these.
        # This validator is more useful when creating TimeSeriesCH from a TimeSeries object.

        # Helper to get attribute if 'data' is an object, or get from dict
        def _get_entity_attr(source_data: Any, attr_name: str) -> Optional[Entity]:
            if isinstance(source_data, BaseModel):
                return getattr(source_data, attr_name, None)
            elif isinstance(source_data, dict):
                return source_data.get(attr_name)
            return None

        # Helper to prepare data for TimeSeriesCH fields
        # This assumes 'data' is a dictionary to be mutated, or converts object to dict
        if not isinstance(data, dict): # If it's a TimeSeries object
            # We need to convert the TimeSeries object to a dict to add/modify keys
            # for the TimeSeriesCH constructor. We only operate on fields relevant here.
            # The original entity objects (owner, source etc.) will be passed through
            # from the base TimeSeries model.
            # The goal here is to ensure the _gid_ch fields are populated for TimeSeriesCH.

            # This validator is tricky with Pydantic v2 when passing a model instance.
            # It's simpler if TimeSeriesCH is always initialized from a dictionary.
            # Let's assume data is a dictionary for modification here.
            # If 'data' is a TimeSeries instance, its fields are already validated.
            # We are preparing the input *for TimeSeriesCH's own fields*.
            pass # No direct mutation if 'data' is already a validated TimeSeries model.
                 # The _gid_ch fields will be populated by their respective serializers if defined,
                 # or need to be part of the input dict.

        # This validator is better placed to run *after* the TimeSeries fields are processed (mode='after')
        # or by using field_serializers for owner, source etc. if we wanted to transform them.
        # Given the task description, the aim is that TimeSeriesCH itself should have fields
        # owner_gid, source_gid etc. that are populated from the base's Entity objects.

        # Let's adjust: Assume TimeSeriesCH is created from a TimeSeries instance.
        # We need to ensure the output dict of TimeSeriesCH has these _gid fields.
        # This implies that the input to TimeSeriesCH constructor will be a TimeSeries instance.
        # The aliased fields will be part of TimeSeriesCH. We need to provide values for them.

        # A different approach for populating these at construction or via specific serializers might be better.
        # For now, let's assume this validator gets a dict or a TimeSeries object.

        output_data = data if isinstance(data, dict) else data.model_dump()

        owner_entity = _get_entity_attr(data, 'owner')
        if owner_entity and owner_entity.gid:
            output_data['owner_gid_ch'] = owner_entity.gid
        elif not output_data.get('owner_gid_ch'): # SQL owner_gid is non-nullable
             raise ValueError("Owner GID is required for TimeSeriesCH as owner_gid is non-nullable in SQL.")

        source_entity = _get_entity_attr(data, 'source')
        if source_entity and source_entity.gid:
            output_data['source_gid_ch'] = source_entity.gid
        elif not output_data.get('source_gid_ch'): # SQL source_gid is non-nullable
            raise ValueError("Source GID is required for TimeSeriesCH as source_gid is non-nullable in SQL.")

        publisher_entity = _get_entity_attr(data, 'publisher')
        if publisher_entity and publisher_entity.gid:
            output_data['publisher_gid_ch'] = publisher_entity.gid
        elif not output_data.get('publisher_gid_ch'): # SQL publisher_gid is non-nullable
            raise ValueError("Publisher GID is required for TimeSeriesCH as publisher_gid is non-nullable in SQL.")

        publication_entity = _get_entity_attr(data, 'publication')
        if publication_entity and publication_entity.gid:
            output_data['publication_gid_ch'] = publication_entity.gid
        elif not output_data.get('publication_gid_ch'): # SQL publication_gid is non-nullable
            raise ValueError("Publication GID is required for TimeSeriesCH as publication_gid is non-nullable in SQL.")

        return output_data

    @field_serializer("metrics","value_types", "resolution", "completeness", "access", "category", check_fields=False)
    def my_ch_serializer(self, value: Any, info: FieldSerializationInfo) -> Any:
        if info.field_name == "metrics":
            fields = ["gid_url", "gid", "category", "label", "slug", "uom", "currency", "adj_type", "adj_date", "wid", "concept_id", "synset_id", "agg"]
            items = {}
            for field in fields:
                items['metrics.'+field] = []
            for key, metric_value in value.items(): # Renamed value to metric_value for clarity
                if isinstance(metric_value, DefinedMetric):
                    for field_name in fields: # Renamed field to field_name for clarity
                        attr = getattr(metric_value, field_name)
                        item_to_append = "" # Default to empty string for None or unhandled
                        if attr is not None:
                            if field_name == "uom": # UOM enum has dicts as values
                                item_to_append = str(attr.name)
                            elif isinstance(attr, Enum): # For other enums like TMAmountAdj, DefaultAgg
                                item_to_append = str(attr.value)
                            else:
                                item_to_append = str(attr)
                        items[f'metrics.{field_name}'].append(item_to_append)
            return items
        else: # For top-level TimeSeries fields like resolution, completeness etc.
            if isinstance(value, Enum):
                return value.value # Using .value for consistency, assuming string enums
            else:
                return value

def conform_label(label: str) -> str:
    new_label = label.strip()
    new_label = new_label.title()
    new_label = new_label.replace("_", " ")
    new_label = new_label.replace("-", " ")
    new_label = new_label.replace(" ", "")
    return new_label