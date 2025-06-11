"""
Timeseries-specific validators for the CXS data quality framework.

This module provides concrete implementations of validators
specifically designed for timeseries data.

Validators for timeseries data, including range checks,
gap detection, anomaly detection, and consistency checks.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union, Tuple, Callable

import numpy as np

from .data_quality import (
    ValidationResult,
    ValidationSeverity,
    FieldValidator,
    RecordValidator,
    DatasetValidator
)


class NumericRangeValidator(FieldValidator):
    """Validate that a numeric field falls within a specified range.

    This validator checks that a field's value is within the specified minimum and
    maximum values. It can be used for any numeric field, including integers,
    floats, and timestamps.
    """

    def __init__(
        self,
        field_name: str,
        min_value: Optional[Union[int, float, datetime]] = None,
        max_value: Optional[Union[int, float, datetime]] = None,
        severity: ValidationSeverity = ValidationSeverity.ERROR
    ):
        """Initialize a numeric range validator.

        Args:
            field_name: The name of the field to validate
            min_value: Optional minimum value (inclusive)
            max_value: Optional maximum value (inclusive)
            severity: The severity level for validation issues
        """
        name = f"Range check for {field_name}"
        description = (f"Validates that {field_name} is "
                       f"{'' if min_value is None else f'>= {min_value}'} "
                       f"{'' if max_value is None else f'<= {max_value}'}")
        super().__init__(field_name, name, description, severity)
        self.min_value = min_value
        self.max_value = max_value

    def validate_field(
            self,
            value,
            field_name: str,
            record_index: Optional[int] = None) -> ValidationResult:
        """Validate a field value against the specified numeric range."""
        # If value is None and we are validating an optional field, it's valid
        if value is None:
            return ValidationResult(
                field_name=field_name,
                record_index=record_index,
                is_valid=True,
                severity=self.severity,
                message=f"Field '{field_name}' is None, skipping range validation")

        # Handle datetime objects specially
        if isinstance(value, datetime):
            if isinstance(self.min_value, datetime) and value < self.min_value:
                return ValidationResult(
                    field_name=field_name,
                    record_index=record_index,
                    is_valid=False,
                    severity=self.severity,
                    message=(
                        f"Field '{field_name}' datetime '{value}' is before minimum "
                        f"'{self.min_value}'"),
                    details={
                        "value": str(value),
                        "min": str(self.min_value)
                    }
                )
            if isinstance(self.max_value, datetime) and value > self.max_value:
                return ValidationResult(
                    field_name=field_name,
                    record_index=record_index,
                    is_valid=False,
                    severity=self.severity,
                    message=(
                        f"Field '{field_name}' datetime '{value}' is after maximum "
                        f"'{self.max_value}'"),
                    details={
                        "value": str(value),
                        "max": str(self.max_value)
                    }
                )
            return ValidationResult(
                field_name=field_name,
                record_index=record_index,
                is_valid=True,
                severity=ValidationSeverity.INFO,
                message=f"Field '{field_name}' datetime '{value}' is within range")

        # For non-datetime values, try to convert to numeric
        try:
            numeric_value = float(value)
        except (ValueError, TypeError):
            # If it's not a datetime and not numeric, then it's invalid
            return ValidationResult(
                field_name=field_name,
                record_index=record_index,
                is_valid=False,
                severity=self.severity,
                message=(
                    f"Field '{field_name}' value '{value}' is not numeric or datetime"
                )
            )

        if self.min_value is not None and numeric_value < self.min_value:
            return ValidationResult(
                field_name=field_name,
                record_index=record_index,
                is_valid=False,
                severity=self.severity,
                message=(
                    f"Field '{field_name}' value {numeric_value} is less than "
                    f"minimum {self.min_value}"
                ),
                details={
                    "value": numeric_value,
                    "min": self.min_value
                }
            )

        if self.max_value is not None and numeric_value > self.max_value:
            return ValidationResult(
                field_name=field_name,
                record_index=record_index,
                is_valid=False,
                severity=self.severity,
                message=(
                    f"Field '{field_name}' value {numeric_value} is above maximum "
                    f"{self.max_value}"
                ),
                details={
                    "value": numeric_value,
                    "max": self.max_value
                }
            )

        return ValidationResult(
            field_name=field_name,
            record_index=record_index,
            is_valid=True,
            severity=ValidationSeverity.INFO,
            message=f"Field '{field_name}' value {numeric_value} is within range")


class TimeGapValidator(DatasetValidator):
    """
    Validates that there are no unexpected gaps in timeseries data.
    """

    def __init__(self, timestamp_field: str, expected_frequency: timedelta,
                 max_gap_multiple: float = 1.0,
                 severity: ValidationSeverity = ValidationSeverity.WARNING):
        """
        Initialize a time gap validator.

        Args:
            timestamp_field: The field containing timestamp values
            expected_frequency: The expected frequency between timestamps
            max_gap_multiple: Maximum allowed gap as a multiple of expected_frequency
            severity: The severity level if validation fails
        """
        name = f"Time gap check for {timestamp_field}"
        description = (f"Validates that there are no unexpected gaps in {timestamp_field} "
                       f"based on expected frequency {expected_frequency}")
        super().__init__(name, description, severity)
        self.timestamp_field = timestamp_field
        self.expected_frequency = expected_frequency
        self.max_gap_multiple = max_gap_multiple
        self.max_allowed_gap = expected_frequency * max_gap_multiple

    def validate_dataset(self, dataset: List[Any]) -> List[ValidationResult]:
        """
        Validate for unexpected gaps in the timeseries data.

        Args:
            dataset: List of records to validate

        Returns:
            List of ValidationResult objects
        """
        if not dataset:
            return [ValidationResult(
                is_valid=True,
                severity=ValidationSeverity.INFO,
                message="Empty dataset, no time gaps to check"
            )]

        # Extract timestamps
        timestamps = []
        for i, record in enumerate(dataset):
            if hasattr(record, self.timestamp_field):
                ts = getattr(record, self.timestamp_field)
                timestamps.append((i, ts))
            elif isinstance(record, dict) and self.timestamp_field in record:
                ts = record[self.timestamp_field]
                timestamps.append((i, ts))

        if not timestamps:
            return [
                ValidationResult(
                    is_valid=False,
                    severity=self.severity,
                    message=f"No valid timestamps found in field '{
                        self.timestamp_field}'")]

        # Sort by timestamp
        timestamps.sort(key=lambda x: x[1])

        # Check for gaps
        results = []
        for i in range(1, len(timestamps)):
            prev_idx, prev_ts = timestamps[i - 1]
            curr_idx, curr_ts = timestamps[i]

            if not isinstance(
                    prev_ts,
                    datetime) or not isinstance(
                    curr_ts,
                    datetime):
                results.append(ValidationResult(
                    is_valid=False,
                    severity=self.severity,
                    message=f"Non-datetime value found in timestamp field '{self.timestamp_field}'",
                    record_index=curr_idx if not isinstance(curr_ts, datetime) else prev_idx
                ))
                continue

            gap = curr_ts - prev_ts
            if gap > self.max_allowed_gap:
                results.append(
                    ValidationResult(
                        is_valid=False,
                        severity=self.severity,
                        message=f"Unexpected gap of {gap} between timestamps (> {
                            self.max_allowed_gap})",
                        record_index=curr_idx,
                        details={
                            "prev_timestamp": prev_ts.isoformat(),
                            "curr_timestamp": curr_ts.isoformat(),
                            "gap": str(gap),
                            "max_allowed_gap": str(
                                self.max_allowed_gap)}))

        # If no issues were found, add a success result
        if not results:
            results.append(
                ValidationResult(
                    is_valid=True,
                    severity=ValidationSeverity.INFO,
                    message=f"No unexpected time gaps found in field '{
                        self.timestamp_field}'"))

        return results


class AnomalyDetector(DatasetValidator):
    """Detect anomalies in a dataset using z-score method.

    This validator looks at the distribution of values and identifies outliers
    based on how many standard deviations they are away from the mean (z-score).
    """

    def __init__(
        self,
        value_field: str,
        z_score_threshold: float = 3.0,
        min_samples: int = 5,
        severity: ValidationSeverity = ValidationSeverity.WARNING
    ):
        """Initialize the anomaly detector.

        Args:
            value_field: The field containing the numeric values to check
            z_score_threshold: Values with z-score above this threshold will be flagged
            min_samples: Minimum number of samples needed for detection
            severity: The severity level for validation issues
        """
        self.value_field = value_field
        self.z_score_threshold = z_score_threshold
        self.min_samples = min_samples
        self.severity = severity

    def validate_dataset(self, dataset: List[Any]) -> List[ValidationResult]:
        """Detect anomalies in a dataset of records.

        Args:
            dataset: A list of records (e.g., DataPoint objects or dictionaries)

        Returns:
            List of validation results
        """
        if len(dataset) < self.min_samples:
            return [
                ValidationResult(
                    field_name=self.value_field,
                    is_valid=True,
                    severity=ValidationSeverity.INFO,
                    message=f"Not enough samples for anomaly detection. Need {
                        self.min_samples}, got {
                        len(dataset)}")]

        results = []

        # Extract values - handle the case where value_field is 'metrics' or
        # another dict
        values_by_metric = {}
        for i, record in enumerate(dataset):
            # Handle dict-like objects and objects with attributes
            if hasattr(record, "get") and callable(record.get):
                value = record.get(self.value_field)
            elif hasattr(record, self.value_field):
                value = getattr(record, self.value_field, None)
            else:
                continue

            # If the field is a dictionary (like metrics), we need to analyze
            # each metric separately
            if isinstance(value, dict):
                for metric_name, metric_value in value.items():
                    if isinstance(metric_value, (int, float)):
                        if metric_name not in values_by_metric:
                            values_by_metric[metric_name] = []
                        values_by_metric[metric_name].append((i, metric_value))
            elif value is not None and isinstance(value, (int, float)):
                # It's a direct numeric value
                if '_default_' not in values_by_metric:
                    values_by_metric['_default_'] = []
                values_by_metric['_default_'].append((i, value))

        # If no values found, return early
        if not values_by_metric:
            return [
                ValidationResult(
                    field_name=self.value_field,
                    is_valid=True,
                    severity=ValidationSeverity.INFO,
                    message=f"No numeric values found for field '{
                        self.value_field}'")]

        # Process each metric separately
        for metric_name, values in values_by_metric.items():
            if len(values) < self.min_samples:
                continue  # Skip metrics with too few samples

            indices, data = zip(*values)
            data_array = np.array(data)
            mean = np.mean(data_array)
            std = np.std(data_array)

            if std == 0 or np.isnan(std):
                continue  # Skip if standard deviation is zero or NaN

            # Calculate z-scores and find outliers
            field_name = f"{self.value_field}.{
                metric_name}" if metric_name != '_default_' else self.value_field
            for idx, value in values:
                z_score = abs((value - mean) / std)
                if z_score > self.z_score_threshold:
                    results.append(ValidationResult(
                        field_name=field_name,
                        record_index=idx,
                        is_valid=False,
                        severity=self.severity,
                        message=f"Anomaly detected in {field_name} at index {idx}. Value: {value}, Z-score: {z_score:.2f}",
                        details={
                            "value": value,
                            "mean": float(mean),
                            "std": float(std),
                            "z_score": float(z_score),
                            "threshold": self.z_score_threshold,
                            "metric": metric_name
                        }
                    ))

        # Add a summary result
        if not results:  # No anomalies found
            results.append(
                ValidationResult(
                    field_name=self.value_field,
                    is_valid=True,
                    severity=ValidationSeverity.INFO,
                    message=f"No anomalies detected in {
                        self.value_field}. All values within {
                        self.z_score_threshold} standard deviations."))

        return results


class MetricConsistencyValidator(RecordValidator):
    """
    Validates the consistency of metric values within a record.
    """

    def __init__(self, metrics_field: str, consistency_rules: Dict[str, Callable[[
                 Dict[str, float]], bool]], severity: ValidationSeverity = ValidationSeverity.ERROR):
        """
        Initialize a metric consistency validator.

        Args:
            metrics_field: The field containing the metrics dictionary
            consistency_rules: Dictionary mapping rule names to validator functions
            severity: The severity level if validation fails
        """
        name = f"Metric consistency check for {metrics_field}"
        description = f"Validates that metrics in {
            metrics_field} follow consistency rules"
        super().__init__(name, description, severity)
        self.metrics_field = metrics_field
        self.consistency_rules = consistency_rules

    def validate_record(
            self, record: Any) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Validate consistency of metrics in a record.

        Args:
            record: The record to validate

        Returns:
            Tuple containing:
                - Boolean indicating if metrics are consistent
                - Optional error message if inconsistent
                - Optional details dictionary
        """
        # Extract metrics
        if hasattr(record, self.metrics_field):
            metrics = getattr(record, self.metrics_field)
        elif isinstance(record, dict) and self.metrics_field in record:
            metrics = record[self.metrics_field]
        else:
            return False, f"Field '{
                self.metrics_field}' not found in record", None

        if not isinstance(metrics, dict):
            return False, f"Field '{
                self.metrics_field}' is not a dictionary", None

        # Apply consistency rules
        failed_rules = []
        for rule_name, rule_func in self.consistency_rules.items():
            try:
                if not rule_func(metrics):
                    failed_rules.append(rule_name)
            except Exception as e:
                failed_rules.append(f"{rule_name} (error: {str(e)})")

        if failed_rules:
            return (
                False, f"Metrics in '{
                    self.metrics_field}' failed consistency rules: {
                    ', '.join(failed_rules)}", {
                    "failed_rules": failed_rules, "metrics": dict(metrics)})

        return True, None, {"metrics": dict(metrics)}
