"""
Base classes for all Pydantic models in the CXS schema
"""
from cxs.core.utils.schema_builder import ExtendableBaseModel
import pydantic
from pydantic import BaseModel
from dataclasses import dataclass

@dataclass
class OmitIfNone:
    """
    Marker class for fields that should be omitted from serialization if None
    """
    pass

class CXSSchema(BaseModel):
    """
    Base schema class with serialization handling for None fields
    """
    @pydantic.model_serializer
    def _serialize(self):
        omit_if_none_fields = {
            k
            for k, v in self.model_fields.items()
            if any(isinstance(m, OmitIfNone) for m in v.metadata)
        }
        return {k: v for k, v in self if k not in omit_if_none_fields or v is not None}

class CXSBase(ExtendableBaseModel):
    """
    Base class for all CXS models with extended functionality
    """
    @pydantic.model_serializer
    def _serialize(self):
        omit_if_none_fields = {
            k
            for k, v in self.model_fields.items()
            if any(isinstance(m, OmitIfNone) for m in v.metadata)
        }
        return {k: v for k, v in self if k not in omit_if_none_fields or v}
