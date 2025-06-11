"""
Data quality validation framework for CXS utilities.

This module provides a comprehensive framework for validating data quality
in timeseries and other data structures beyond basic schema validation.
"""
from abc import ABC, abstractmethod
from enum import Enum
from datetime import datetime
from typing import Dict, List, Any, Set, Optional, Union, Callable, Tuple, TypeVar
from dataclasses import dataclass
import numpy as np
import pandas as pd
from pydantic import BaseModel

T = TypeVar('T')

class ValidationSeverity(str, Enum):
    """Defines the severity level of a validation issue."""
    INFO = "info"           # Informational only, not a problem
    WARNING = "warning"     # Potential issue that may need attention
    ERROR = "error"         # Serious issue that should be fixed
    CRITICAL = "critical"   # Critical issue that must be fixed immediately


@dataclass
class ValidationResult:
    """Result of a validation check."""
    is_valid: bool
    severity: ValidationSeverity = ValidationSeverity.ERROR
    message: str = ""
    field_name: Optional[str] = None
    record_index: Optional[int] = None
    details: Optional[Dict[str, Any]] = None


class ValidationReport:
    """Collection of validation results with summary metrics."""
    
    def __init__(self, source_name: str):
        self.source_name = source_name
        self.timestamp = datetime.now()
        self.validation_results: List[ValidationResult] = []
        self.metadata: Dict[str, Any] = {}
    
    @property
    def is_valid(self) -> bool:
        """Returns True if there are no ERROR or CRITICAL validation results."""
        return not any(
            result.severity in (ValidationSeverity.ERROR, ValidationSeverity.CRITICAL) 
            for result in self.validation_results
        )
    
    @property
    def error_count(self) -> int:
        """Returns the number of ERROR and CRITICAL validation results."""
        return sum(
            1 for result in self.validation_results 
            if result.severity in (ValidationSeverity.ERROR, ValidationSeverity.CRITICAL)
        )
    
    @property
    def warning_count(self) -> int:
        """Returns the number of WARNING validation results."""
        return sum(
            1 for result in self.validation_results 
            if result.severity == ValidationSeverity.WARNING
        )
    
    def add_result(self, result: ValidationResult) -> None:
        """Add a validation result to the report."""
        self.validation_results.append(result)
    
    def add_results(self, results: List[ValidationResult]) -> None:
        """Add multiple validation results to the report."""
        self.validation_results.extend(results)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the validation report to a dictionary."""
        return {
            "source_name": self.source_name,
            "timestamp": self.timestamp.isoformat(),
            "is_valid": self.is_valid,
            "error_count": self.error_count,
            "warning_count": self.warning_count,
            "validation_results": [
                {
                    "is_valid": result.is_valid,
                    "severity": result.severity.value,
                    "message": result.message,
                    "field_name": result.field_name,
                    "record_index": result.record_index,
                    "details": result.details or {}
                } 
                for result in self.validation_results
            ],
            "metadata": self.metadata
        }
    
    def summary(self) -> str:
        """Get a string summary of the validation report."""
        return (
            f"Validation Report for {self.source_name} ({self.timestamp.isoformat()})\n"
            f"Status: {'VALID' if self.is_valid else 'INVALID'}\n"
            f"Total issues: {len(self.validation_results)}\n"
            f" - Errors/Critical: {self.error_count}\n"
            f" - Warnings: {self.warning_count}\n"
            f" - Infos: {sum(1 for r in self.validation_results if r.severity == ValidationSeverity.INFO)}"
        )


class Validator(ABC):
    """Base abstract class for all validators."""
    
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
    
    @abstractmethod
    def validate(self, data: Any) -> ValidationResult:
        """Validate the data and return a ValidationResult."""
        pass


class FieldValidator(Validator):
    """Validator for individual fields."""
    
    def __init__(self, field_name: str, name: str, description: str = "", 
                 severity: ValidationSeverity = ValidationSeverity.ERROR):
        super().__init__(name, description)
        self.field_name = field_name
        self.severity = severity
    
    @abstractmethod
    def validate_field(self, value: Any) -> Tuple[bool, Optional[str]]:
        """
        Validate a specific field value.
        
        Args:
            value: The field value to validate
            
        Returns:
            Tuple containing:
                - Boolean indicating if the value is valid
                - Optional error message if invalid
        """
        pass
    
    def validate(self, record: Any) -> ValidationResult:
        """Validate a field in the record.
        
        Args:
            record: The record containing the field to validate
            
        Returns:
            ValidationResult object with the validation result
        """
        if hasattr(record, "get") and callable(record.get):
            # Handle dict-like objects
            value = record.get(self.field_name)
        else:
            # Handle objects with attributes
            value = getattr(record, self.field_name, None)
            
        # Call the validate_field method with the required parameters
        result = self.validate_field(value, self.field_name)
        if result.record_index is None:
            result.record_index = 0
        return result


class RecordValidator(Validator):
    """Validator for entire records (cross-field validation)."""
    
    def __init__(self, name: str, description: str = "", 
                 severity: ValidationSeverity = ValidationSeverity.ERROR):
        super().__init__(name, description)
        self.severity = severity
    
    @abstractmethod
    def validate_record(self, record: Any) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Validate a record with cross-field validation.
        
        Args:
            record: The record to validate
            
        Returns:
            Tuple containing:
                - Boolean indicating if the record is valid
                - Optional error message if invalid
                - Optional details dictionary with additional information
        """
        pass
    
    def validate(self, data: Any) -> ValidationResult:
        """
        Validate the record.
        
        Args:
            data: The record to validate
            
        Returns:
            ValidationResult object
        """
        is_valid, error_message, details = self.validate_record(data)
        return ValidationResult(
            is_valid=is_valid,
            severity=self.severity if not is_valid else ValidationSeverity.INFO,
            message=error_message if not is_valid else "Record is valid",
            details=details
        )


class DatasetValidator(Validator):
    """Validator for datasets (collections of records)."""
    
    def __init__(self, name: str, description: str = "", 
                 severity: ValidationSeverity = ValidationSeverity.ERROR):
        super().__init__(name, description)
        self.severity = severity
    
    @abstractmethod
    def validate_dataset(self, dataset: List[Any]) -> List[ValidationResult]:
        """
        Validate a dataset.
        
        Args:
            dataset: List of records to validate
            
        Returns:
            List of ValidationResult objects
        """
        pass
    
    def validate(self, data: List[Any]) -> ValidationResult:
        """
        Validate the dataset and return a summary ValidationResult.
        
        Args:
            data: The dataset to validate
            
        Returns:
            ValidationResult summarizing dataset validation
        """
        results = self.validate_dataset(data)
        is_valid = all(result.is_valid for result in results)
        error_count = sum(1 for result in results if not result.is_valid)
        
        return ValidationResult(
            is_valid=is_valid,
            severity=self.severity if not is_valid else ValidationSeverity.INFO,
            message=f"{error_count} validation issues found" if not is_valid else "Dataset is valid",
            details={"error_count": error_count, "total_records": len(data)}
        )


class ValidationPipeline:
    """Pipeline for running multiple validators on data."""
    
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.field_validators: Dict[str, List[FieldValidator]] = {}
        self.record_validators: List[RecordValidator] = []
        self.dataset_validators: List[DatasetValidator] = []
    
    def add_field_validator(self, validator: FieldValidator) -> 'ValidationPipeline':
        """
        Add a field validator to the pipeline.
        
        Args:
            validator: The field validator to add
            
        Returns:
            Self for method chaining
        """
        if validator.field_name not in self.field_validators:
            self.field_validators[validator.field_name] = []
        self.field_validators[validator.field_name].append(validator)
        return self
    
    def add_record_validator(self, validator: RecordValidator) -> 'ValidationPipeline':
        """
        Add a record validator to the pipeline.
        
        Args:
            validator: The record validator to add
            
        Returns:
            Self for method chaining
        """
        self.record_validators.append(validator)
        return self
    
    def add_dataset_validator(self, validator: DatasetValidator) -> 'ValidationPipeline':
        """
        Add a dataset validator to the pipeline.
        
        Args:
            validator: The dataset validator to add
            
        Returns:
            Self for method chaining
        """
        self.dataset_validators.append(validator)
        return self
    
    def validate(self, data: Union[Any, List[Any]], is_dataset: bool = False) -> ValidationReport:
        """
        Validate data using all registered validators.
        
        Args:
            data: The data to validate, either a single record or a list of records
            is_dataset: If True, data is treated as a dataset even if it's a single record
            
        Returns:
            ValidationReport containing all validation results
        """
        # Create a validation report
        report = ValidationReport(source_name=self.name)
        
        # Handle single record vs dataset
        dataset = [data] if not is_dataset and not isinstance(data, list) else data
        
        # Validate each record
        for i, record in enumerate(dataset):
            # Field validation
            for field_name, validators in self.field_validators.items():
                for validator in validators:
                    result = validator.validate(record)
                    if result.record_index is None:
                        result.record_index = i
                    report.add_result(result)
            
            # Record validation
            for validator in self.record_validators:
                result = validator.validate(record)
                if result.record_index is None:
                    result.record_index = i
                report.add_result(result)
        
        # Dataset validation
        if is_dataset or isinstance(data, list):
            for validator in self.dataset_validators:
                results = validator.validate_dataset(dataset)
                report.add_results(results)
        
        return report
