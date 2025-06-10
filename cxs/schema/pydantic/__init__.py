# Import base classes and re-export them
from .base import CXSBase, CXSSchema, OmitIfNone

# Export these classes to maintain backwards compatibility
__all__ = ['CXSBase', 'CXSSchema', 'OmitIfNone']
