import re
import uuid
from datetime import datetime
from typing import Annotated, Any, Dict, Optional

import pydantic
from pydantic import BaseModel, Field, model_validator

from cxs.core.schema import CXSBase, OmitIfNone
from cxs.core.utils.gid import create_gid, normalize_gid_url


class Content(CXSBase):
    label: str = Field(..., description="The label of the content (e.g. \"Prologue\", \"Synopsis\", \"Description\", \"Summary\", \"Conditions\", \"History\", \"Other\")")
    type: str = Field(..., description="Enum8('Description'=1, 'Summary'=2, 'Conditions'=3, 'History'=4, 'Other'=0)") # SQL type hint
    sub_type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Enum8('short'=1, 'long'=2, 'other'=0)") # SQL type hint
    value: str = Field(..., description="The content of the event") # Renamed from "The content of the event" to "The content value" for clarity
    language: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The primary language of the content (2 letter ISO code)")
    meta_description: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="A description of the contents' purpose and a few questions it may answer")

    @model_validator(mode="before")
    def pre_init(cls, values):
        if "content_start" in values:
            values["content_starts"] = values["content_start"]
            del values["content_start"]
        return values


class Media(CXSBase):
    media_type: str = Field(default="", description="Image, Video, Audio, etc.")
    type: Annotated[Optional[str], OmitIfNone()] = Field(None, description="Poster, Thumbnail, etc.") # Explicitly None if it can be omitted
    sub_type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="Program, Season, Episode, etc.")
    url: str = Field(..., description="The URL of the media")
    language: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The primary language of the media")
    aspect_ratio: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The aspect ratio of the media")


class Embeddings(CXSBase):
    label: str = Field(..., description="The label of the embedding matches the content label (e.g. \"Prologue\", \"Synopsis\", \"Description\", \"Summary\", \"Conditions\", \"History\", \"Other\")")
    model: str = Field(..., description="The model used to generate the embedding (e.g. \"text-embedding-3-small\", \"text-embedding-3-large\")")
    vectors: Annotated[Optional[list[float]], OmitIfNone()] = Field(None, description="The vectors of the embedding, used for similarity search and clustering, usually 1024 dimensions")
    content_starts: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The content that starts the embedding (e.g. \"Title: \", \"Description: \", \"Content: \")")
    content_ends: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The content that ends the embedding (e.g. \" \", \".\", \" - \")")
    opening_phrase: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The opening phrase of the embedding (e.g. \"This is a description of \", \"This is a content of \")")
    closing_phrase: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The closing phrase of the embedding (e.g. \" for more information.\", \" for more details.\")")


class ID(CXSBase):
    label: Annotated[Optional[str], OmitIfNone()] = Field(None, description="The label of the entity that is involved in the event")
    role: Annotated[Optional[str], OmitIfNone()] = Field(None, description="The role of the entity in the event")
    entity_type: Annotated[Optional[str], OmitIfNone()] = Field(None, description="The type of the entity that is involved in the event")
    entity_gid: Annotated[Optional[uuid.UUID], OmitIfNone()] = Field( # Changed from Optional[uuid.UUID] to Annotated for OmitIfNone
        default=None, # SQL is Nullable(UUID), so None is appropriate default for Pydantic
        description="The Graph UUID of the entity that is involved in the event",
    )

    id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The ID of the entity that is involved in the event")
    id_type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The ID of the entity that is involved in the event") # SQL comment is identical to id
    capacity: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The capacity of the entity in the event")

    @model_validator(mode="before")
    def pre_init(cls, values):

        new_values = {}
        for key, value in values.items():
            # quickhand for pandas fields -> ids.<entity_type>.<role>.<id_type>.<label>
            if "." in key:
                keys = key.split(".")
                new_values["entity_type"] = keys[0]
                new_values["role"] = keys[1] if len(keys) > 1 else None
                new_values["id_type"] = keys[2] if len(keys) > 2 else None
                new_values["label"] = keys[3] if len(keys) > 3 else None
                new_values["id"] = value

        if new_values:
            values.update(new_values)

        if values.get("entity_gid") == "":
            values["entity_gid"] = None

        if values.get("id"):
            values["id"] = str(values["id"])

        if not values.get("label"):
            values["label"] = str(values["id"])

        return values


class Classification(CXSBase):
    type: Annotated[Optional[str], OmitIfNone()] = Field(None, description="The event category-> subcategory")
    value: Annotated[Optional[str], OmitIfNone()] = Field(None, description="like Sports->Football, Concert->Pop etc.")
    babelnet_id: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The concept ID for the classification (Used to translate and associate the classification with other systems)")
    weight: float = Field(default=0.0, description="The relevance of the classification")

    @model_validator(mode="before")
    def pre_init(cls, values):
        if "babel_id" in values:
            values["babelnet_id"] = values["babel_id"]
            del values["babel_id"]

        if "babelnet_id" not in values or not values["babelnet_id"]:
            values["babelnet_id"] = ""

        if "weight" not in values or not values["weight"]:
            values["weight"] = 0

        return values


class Location(CXSBase):
    type: str = Field(..., description="The type of the location (e.g. \"Home\", \"Work\", \"Venue\", \"Address\", \"Geographic\", \"Permanent\", \"Temporary\", \"Other\")") # type is not Optional, it has a default in pre_init
    label: str = Field(..., description="A readable label for the location (e.g. \"Home\", \"Work\", \"Venue\", \"Address\", \"Geographic\", \"Permanent\", \"Temporary\", \"Other\")") # label is not Optional, it has a default in pre_init
    country: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The country of the location (e.g. \"France\", \"United States\", \"Germany\"), always in English and in singular form and capitalized")
    country_code: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The 3 letter country code of the location (e.g. \"FRA\", \"USA\", \"DEU\"), always in uppercase")
    code: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The code of the location (e.g. \"75001\", \"10001\", \"10115\"), always in uppercase")
    region: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The region of the location (e.g. \"Île-de-France\", \"New York\", \"Berlin\"), always in English and in singular form and capitalized")
    division: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The division of the location (e.g. \"Paris\", \"Manhattan\", \"Mitte\"), always in English and in singular form and capitalized")
    municipality: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The municipality of the location (e.g. \"Paris\", \"New York\", \"Berlin\"), always in English and in singular form and capitalized")
    locality: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The locality/neighbourhood of the location (e.g. \"Montmartre\", \"SoHo\", \"Kreuzberg\"), always in English and in singular form and capitalized")
    postal_code: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The postal code of the location (e.g. \"75001\", \"10001\", \"10115\"), always in uppercase")
    postal_name: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The name of the postal code area (e.g. \"1er Arrondissement\", \"Chelsea\", \"Mitte\"), always in English and in singular form and capitalized")
    street: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The street of the location (e.g. \"Rue de Rivoli\", \"Broadway\", \"Friedrichstraße\"), always in English and in singular form and capitalized")
    street_nr: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The street number of the location (e.g. \"1\", \"100\", \"15\"), always in uppercase") # SQL Nullable
    address: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The full address of the location (e.g. \"1 Rue de Rivoli, 75001 Paris, France\", \"100 Broadway, New York, NY 10001, USA\", \"15 Friedrichstraße, 10117 Berlin, Germany\"), always in English and in singular form and capitalized") # SQL Nullable

    longitude: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The longitude of the location (e.g. 2.3364, -74.0060, 13.3889)")
    latitude: Annotated[Optional[float], OmitIfNone()] = Field(default=None, description="The latitude of the location (e.g. 48.8606, 40.7128, 52.5166)")
    geohash: Annotated[Optional[str], OmitIfNone()] = Field(default=None, description="The geohash of the location (e.g. \"u09t2\", \"dqcjq\", \"s9z6x\"), always in lowercase") # SQL Nullable

    duration_from: Annotated[Optional[datetime], OmitIfNone()] = Field(
        default=None, description="The start of the duration for the location (e.g. \"2023-01-01 00:00:00\", \"2023-01-01 00:00:00\", \"2023-01-01 00:00:00\")"
    )
    duration_until: Annotated[Optional[datetime], OmitIfNone()] = Field(
        default=None, description="The end of the duration for the location (e.g. \"2023-12-31 23:59:59\", \"2023-12-31 23:59:59\", \"2023-12-31 23:59:59\")"
    )

    @model_validator(mode="before")
    def pre_init(cls, values):
        if not values.get("type"):
            values["type"] = "Location"

        if not values.get("label"):
            values["label"] = "Default"

        return values


class Entity(BaseModel):
    gid_url: str = Field(..., description="The URL of the entity's GID")
    gid: uuid.UUID = Field(
        description="The Graph UUID of the entity", # Updated description
        default_factory=lambda: uuid.UUID("00000000-0000-0000-0000-000000000000") # Use default_factory for UUID
    )

    label: str = Field(..., description="The primary label of the entity (e.g. \"Eiffel Tower\")")
    labels: Annotated[Optional[list[str]], OmitIfNone()] = Field(default_factory=list, description="Additional labels for the entity with language prefixes (e.g. [\"en:Eiffel Tower\", \"fr:Tour Eiffel\"])")

    type: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The type of the entity (e.g. \"Event\", \"Place\", \"Person\"), always in English and in singular form and capitalized")
    variant: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The variant of the entity (e.g. \"Concert\", \"Exhibition\", \"Match\"), always in English and in singular form and capitalized")
    icon: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The icon of the entity (e.g. \"concert\", \"exhibition\", \"match\"), always in English and in singular form and capitalized")
    colour: Annotated[Optional[str], OmitIfNone()] = Field(default="", description="The colour of the entity (e.g. \"red\", \"blue\", \"green\"), always in English and in singular form and capitalized")

    dimensions: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="additional (generic) dimensions for the entity")
    tags: Annotated[Optional[list[str]], OmitIfNone()] = Field(default_factory=list, description="additional tags for the entity")
    flags: Annotated[Optional[Dict[str, bool]], OmitIfNone()] = Field(default_factory=dict, description="additional flags for the entity")
    metrics: Annotated[Optional[Dict[str, float]], OmitIfNone()] = Field(default_factory=dict, description="additional metrics for the entity")
    properties: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="additional properties for the entity")
    names: Annotated[Optional[Dict[str, str]], OmitIfNone()] = Field(default_factory=dict, description="additional names for the entity, e.g. \"Eiffel Tower\" -> \"Tour Eiffel\"")

    ids: Annotated[Optional[list[ID]], OmitIfNone()] = Field(default_factory=list, description="List of identifiers associated with the entity.")
    content: Optional[list[Content]] = Field(default_factory=list, description="List of content items related to the entity.")
    media: Annotated[Optional[list[Media]], OmitIfNone()] = Field(default_factory=list, description="List of media items associated with the entity.")
    embeddings: Annotated[Optional[list[Embeddings]], OmitIfNone()] = Field(default_factory=list, description="List of embeddings for the entity.")
    classification: Optional[list[Classification]] = Field(default_factory=list, description="List of classifications for the entity.")
    location: Annotated[Optional[list[Location]], OmitIfNone()] = Field(default_factory=list, description="List of locations associated with the entity.")

    partition: str = Field(default="_open_", description="The storage partition for the entity. This is internal and can not be submitted by the user. It is used to partition the data for performance and scalability.")
    sign: int = Field(default=1, description="This is an internal field used to ensure that the right entries can be updated/replaced. It is used to mark the latest version of the entity.")

    def get_content(self, labels: list[str]) -> str:
        return_string = ""
        for content in self.content:
            if content.label in labels:
                # remove everything that looks like images or links from markdown text using regex matching
                return_string += re.sub(r"!\[.*?\]\(.*?\)", "", content.value) + " \n"
        return re.sub(r"\n+", "\n", return_string) or "No content for the specified label(s)"

    def get_all_content(self, exclude_types: list[str] = []) -> list[str]:
        """
        Parsed documents have labels like '218_4001', '4002_5967' which are character ranges
        in the parsed text, and not names like "content", "summary" as the `get_content` method
        expects.

        Args:
            exclude_types (list[str]): types to exclude f.ex "summary".

        Returns:
            list of content strings.
        """
        if not self.content:
            return []

        return [
            content.value
            for content in self.content
            if content.type not in exclude_types and content.value is not None
        ]

    @model_validator(mode="before")
    def pre_init(cls, values):

        if "_type" in values and values["_type"] == "clickhouse":
            return cls.from_clickhouse(values)

        if not values.get("partition"):
            values["partition"] = "_open_"

        if values.get("gid_url"):
            values["gid_url"] = normalize_gid_url(values["gid_url"])
            if not values.get("gid"):
                values["gid"] = create_gid(values["gid_url"])

        values["classification"] = [
            cf
            for cf in values.get("classification", [])
            if isinstance(values.get("classification", [])[0], Classification) or cf.get("value") is not None
        ]

        # loop over all fields in values and reassign values if the have '.' in them
        groups = {}
        for key, value in values.items():
            if "." in key:
                keys = key.split(".")
                if keys[0] not in groups:
                    groups[keys[0]] = {}
                if value:
                    groups[keys[0]][".".join(keys[1:])] = value

        for key, value in groups.items():
            if key in ["ids"] and isinstance(value, dict):
                values[key] = [ID(**{key: value}) for key, value in value.items()]
            elif key == "labels":
                if not values.get(key):
                    values[key] = []
                values[key].append(list(value.values())[0])
            elif key == "location":
                values[key] = [Location(**value)]
            else:
                values[key] = value

        return values

    @classmethod
    def from_clickhouse(cls, values):

        if values.get("embeddings.label") is not None:
            embeddings = []
            idx = 0
            for some in values.get("embeddings.label"):
                embeddings.append(
                    {
                        "label": values.get("embeddings.label")[idx],
                        "model": values.get("embeddings.model")[idx],
                        "vectors": values.get("embeddings.vectors")[idx],
                        "content_starts": values.get("embeddings.content_starts")[idx],
                        "content_ends": values.get("embeddings.content_ends")[idx],
                        "opening_phrase": values.get("embeddings.opening_phrase")[idx],
                        "closing_phrase": values.get("embeddings.closing_phrase")[idx],
                    }
                )
                idx += 1
            values["embeddings"] = embeddings

        if values.get("ids.label") is not None:
            ids = []
            idx = 0
            for some in values.get("ids.label"):
                ids.append(
                    {
                        "label": values.get("ids.label")[idx],
                        "role": values.get("ids.role")[idx],
                        "entity_type": values.get("ids.entity_type")[idx],
                        "entity_gid": values.get("ids.entity_gid")[idx],
                        "id": values.get("ids.id")[idx],
                        "id_type": values.get("ids.id_type")[idx],
                        "capacity": values.get("ids.capacity")[idx],
                    }
                )
                idx += 1
            values["ids"] = ids

        if values.get("media.type") is not None:
            media = []
            idx = 0
            for some in values.get("media.type"):
                media.append(
                    {
                        "media_type": values.get("media.media_type")[idx],
                        "type": values.get("media.type")[idx],
                        "sub_type": values.get("media.sub_type")[idx],
                        "url": values.get("media.url")[idx],
                        "language": values.get("media.language")[idx],
                        "aspect_ratio": values.get("media.aspect_ratio")[idx],
                    }
                )
                idx += 1
            values["media"] = media

        if values.get("location.type") is not None:
            locations = []
            idx = 0
            for some in values.get("location.type"):
                locations.append(
                    {
                        "type": values.get("location.type")[idx],
                        "label": values.get("location.label")[idx],
                        "country": values.get("location.country")[idx],
                        "country_code": values.get("location.country_code")[idx],
                        "code": values.get("location.code")[idx],
                        "region": values.get("location.region")[idx],
                        "division": values.get("location.division")[idx],
                        "municipality": values.get("location.municipality")[idx],
                        "locality": values.get("location.locality")[idx],
                        "postal_code": values.get("location.postal_code")[idx],
                        "postal_name": values.get("location.postal_name")[idx],
                        "street": values.get("location.street")[idx],
                        "street_nr": values.get("location.street_nr")[idx],
                        "address": values.get("location.address")[idx],
                        "longitude": values.get("location.longitude")[idx],
                        "latitude": values.get("location.latitude")[idx],
                        "geohash": values.get("location.geohash")[idx],
                    }
                )
                idx += 1
            values["location"] = locations

        if values.get("content.type") is not None:
            contents = []
            idx = 0
            for some in values.get("content.type"):
                contents.append(
                    {
                        "label": values.get("content.label")[idx],
                        "type": values.get("content.type")[idx],
                        "sub_type": values.get("content.sub_type")[idx],
                        "value": values.get("content.value")[idx],
                        "language": values.get("content.language")[idx],
                        "meta_description": values.get("content.meta_description")[idx],
                    }
                )
                idx += 1
            values["content"] = contents

        if values.get("classification.type") is not None:
            classifications = []
            idx = 0
            for some in values.get("classification.type"):
                classifications.append(
                    {
                        "type": values.get("classification.type")[idx],
                        "value": values.get("classification.value")[idx],
                        "babelnet_id": values.get("classification.babelnet_id")[idx],
                        "weight": values.get("classification.weight")[idx],
                    }
                )
                idx += 1
            values["classification"] = classifications

        return values

    @classmethod
    def coalesce(cls, *args):
        for value in args:
            if value is not None:
                return value
        return ""


class EntityCH(Entity):

    @pydantic.field_serializer(
        "classification",
        "content",
        "ids",
        "embeddings",
        "media",
        "location",
        "dimensions",
        "flags",
        "metrics",
        "properties",
        "names",
        check_fields=False,
    )
    def my_ch_serializer(self, value: Any, info: pydantic.FieldSerializationInfo) -> Any:
        default_gid = uuid.UUID("00000000-0000-0000-0000-000000000000")
        if info.field_name == "classification":
            return {
                "classification.type": [c.type for c in value],
                "classification.value": [c.value for c in value],
                "classification.babelnet_id": [c.babelnet_id for c in value],
                "classification.weight": [c.weight for c in value],
            }
        elif info.field_name == "ids":
            id = {
                "ids.label": [c.label for c in value],
                "ids.role": [c.role for c in value],
                "ids.entity_type": [c.entity_type for c in value],
                "ids.entity_gid": [c.entity_gid or default_gid for c in value],
                "ids.id": [c.id for c in value],
                "ids.id_type": [c.id_type for c in value],
                "ids.capacity": [c.capacity for c in value],
            }
            return id

        elif info.field_name == "embeddings":
            return {
                "embeddings.label": [c.label for c in value],
                "embeddings.content_starts": [c.content_starts for c in value],
                "embeddings.content_ends": [c.content_ends for c in value],
                "embeddings.opening_phrase": [c.opening_phrase for c in value],
                "embeddings.closing_phrase": [c.closing_phrase for c in value],
                "embeddings.vectors": [c.vectors for c in value],
                "embeddings.model": [c.model for c in value],
            }

        elif info.field_name == "media":
            return {
                "media.media_type": [c.media_type for c in value],
                "media.type": [c.type for c in value],
                "media.sub_type": [c.sub_type or "" for c in value],
                "media.url": [c.url for c in value],
                "media.language": [c.language or "" for c in value],
                "media.aspect_ratio": [c.aspect_ratio or "" for c in value],
            }

        elif info.field_name == "content":
            return {
                "content.label": [c.label for c in value],
                "content.type": [c.type for c in value],
                "content.sub_type": [c.sub_type or "" for c in value],
                "content.value": [c.value for c in value],
                "content.language": [c.language or "" for c in value],
                "content.meta_description": [c.meta_description or "" for c in value],
            }

        elif info.field_name == "location":
            return {
                "location.type": [c.type for c in value],
                "location.label": [c.label for c in value],
                "location.country": [c.country for c in value],
                "location.country_code": [c.country_code for c in value],
                "location.code": [c.code for c in value],
                "location.region": [c.region for c in value],
                "location.division": [c.division for c in value],
                "location.municipality": [c.municipality for c in value],
                "location.locality": [c.locality for c in value],
                "location.postal_code": [c.postal_code for c in value],
                "location.postal_name": [c.postal_name for c in value],
                "location.street": [c.street for c in value],
                "location.street_nr": [c.street_nr for c in value],
                "location.address": [c.address for c in value],
                "location.longitude": [c.longitude for c in value],
                "location.latitude": [c.latitude for c in value],
                "location.geohash": [c.geohash for c in value],
                "location.duration_from": [c.duration_from for c in value],
                "location.duration_until": [c.duration_until for c in value],
            }

        elif info.field_name == "type":
            return str(value.value)
        elif info.field_name == "dimensions":
            return {k: v for k, v in value.items() if v is not None}
        elif info.field_name == "properties":
            return {k: v for k, v in value.items() if v is not None}
        elif info.field_name == "metrics":
            return {k: v for k, v in value.items() if v is not None}
        elif info.field_name == "names":
            return {k: v for k, v in value.items() if v is not None}
        elif info.field_name == "flags":
            return {k: v for k, v in value.items() if v is not None}


class EntitySolr(Entity):

    def to_stacked_solr(self) -> [dict]:
        entities = []
        for idx, embedding in enumerate(self.embeddings):

            if not embedding.vectors:
                continue

            entity = {
                "id": str(self.gid) + "-" + str(idx) if len(self.embeddings) > 1 else str(self.gid),
                "gid": str(self.gid),
                "gid_url": self.gid_url,
                "type": self.type,
                "variant": self.variant,
                "label": self.label,
                "labels": self.labels,
                "tags": self.tags,
                "partition": self.partition,
                "ids": list(set([c.id for c in self.ids])),
                "category_l1": "".join([c.value for c in self.classification if c.type == "CategoryL1"]),
                "category_l2": "".join([c.value for c in self.classification if c.type == "CategoryL2"]),
                "category_l3": "".join([c.value for c in self.classification if c.type == "CategoryL3"]),
                "category_l4": "".join([c.value for c in self.classification if c.type == "CategoryL4"]),
                "brand": self.dimensions.get("brand", ""),
                "product_line": self.dimensions.get("product_line", ""),
                "product_variant": self.dimensions.get("product_variant", ""),
                "product": self.dimensions.get("product", ""),
                "model": self.dimensions.get("model", ""),
                "embeddings": embedding.vectors,
                "content": (
                    "\n".join(
                        piece.value.replace("\n", "</br></br>")
                        for piece in self.content
                        if piece.type not in ["q_and_a", "search_words"]
                    )
                    if embedding.label == "_various"
                    else self.content[0].value
                ),
            }
            """
              <field name="search_words" type="string" multiValued="true" indexed="true" stored="true"/>
              <field name="price" type="pfloat" multiValued="false" indexed="true" stored="true"/>
              <field name="color" type="pfloat" multiValued="false" indexed="true" stored="true"/>
              <field name="availability" type="string" multiValued="false" indexed="true" stored="true"/>

              <dynamicField indexed="true" multiValued="false" name="metric_*" type="pfloat" stored="true"/>
              <dynamicField indexed="true" multiValued="false" name="dim_*" type="string" stored="true"/>
              <dynamicField indexed="true" multiValued="false" name="flag_*" type="boolean" stored="true"/>
              <dynamicField indexed="true" multiValued="false" name="spec_*" type="string" stored="true"/>
              <dynamicField indexed="true" multiValued="false" name="loc_*" type="location" stored="true"/>
            """
            entities.append(entity)
        return entities
