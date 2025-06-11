"""
Practical timeseries validation for CXS utilities.

This module provides ready-to-use validation functions for TimeSeries and DataPoint models.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union

from cxs.schema.pydantic.timeseries import TimeSeries, DataPoint
from .data_quality import ValidationPipeline, ValidationReport, ValidationSeverity
from .timeseries_validators import (
    NumericRangeValidator,
    TimeGapValidator,
    AnomalyDetector,
    MetricConsistencyValidator
)


def create_datapoint_validation_pipeline(name: str = "DataPoint Validation") -> ValidationPipeline:
    """
    Create a validation pipeline for DataPoint objects.
    
    Args:
        name: Optional name for the validation pipeline
        
    Returns:
        ValidationPipeline object configured for DataPoint validation
    """
    pipeline = ValidationPipeline(name=name, description="Validates DataPoint objects")
    
    # Add timestamp validator
    pipeline.add_field_validator(
        NumericRangeValidator(
            field_name="timestamp",
            min_value=datetime(2000, 1, 1),  # Basic sanity check
            max_value=datetime.now() + timedelta(days=1),  # Allow slightly future timestamps
            severity=ValidationSeverity.ERROR
        )
    )
    
    # Add consistency validators for metrics
    def total_equals_sum(metrics: Dict[str, float]) -> bool:
        """Check if 'total' equals sum of other metrics."""
        if 'total' not in metrics:
            return True  # Not applicable
        
        other_metrics_sum = sum(value for key, value in metrics.items() if key != 'total')
        return abs(metrics['total'] - other_metrics_sum) < 0.001  # Allow for small floating point differences
    
    def non_negative_metrics(metrics: Dict[str, float]) -> bool:
        """Check that metrics that shouldn't be negative aren't."""
        non_negative_keys = ['count', 'total', 'volume', 'quantity']
        return all(
            metrics[key] >= 0 
            for key in metrics 
            if key in non_negative_keys and key in metrics
        )
    
    pipeline.add_record_validator(
        MetricConsistencyValidator(
            metrics_field="metrics",
            consistency_rules={
                "total_equals_sum": total_equals_sum,
                "non_negative_metrics": non_negative_metrics
            },
            severity=ValidationSeverity.ERROR
        )
    )
    
    return pipeline


def create_timeseries_validation_pipeline(name: str = "TimeSeries Validation") -> ValidationPipeline:
    """
    Create a validation pipeline for TimeSeries objects.
    
    Args:
        name: Optional name for the validation pipeline
        
    Returns:
        ValidationPipeline object configured for TimeSeries validation
    """
    pipeline = ValidationPipeline(name=name, description="Validates TimeSeries objects")
    
    # Add consistency validators for fields
    pipeline.add_field_validator(
        NumericRangeValidator(
            field_name="resolution",
            min_value=None,  # Any resolution is valid
            max_value=None,  # Any resolution is valid
            severity=ValidationSeverity.WARNING
        )
    )
    
    # Add more field validators as needed
    
    return pipeline


def create_timeseries_data_validation_pipeline(
    name: str = "TimeSeries Data Validation",
    expected_frequency: Optional[timedelta] = None,
    z_score_threshold: float = 3.0
) -> ValidationPipeline:
    """
    Create a validation pipeline for datapoints in a TimeSeries.
    
    Args:
        name: Optional name for the validation pipeline
        expected_frequency: Optional expected frequency between timestamps
        z_score_threshold: Z-score threshold for anomaly detection
        
    Returns:
        ValidationPipeline object configured for TimeSeries data validation
    """
    pipeline = ValidationPipeline(name=name, description="Validates TimeSeries data")
    
    # Add gap detector if frequency is specified
    if expected_frequency is not None:
        pipeline.add_dataset_validator(
            TimeGapValidator(
                timestamp_field="timestamp",
                expected_frequency=expected_frequency,
                max_gap_multiple=2.0,  # Allow gaps up to 2x the expected frequency
                severity=ValidationSeverity.WARNING
            )
        )
    
    # Add anomaly detector for each metric
    pipeline.add_dataset_validator(
        AnomalyDetector(
            value_field="metrics",  # This will need custom extraction
            z_score_threshold=z_score_threshold,
            min_samples=10,
            severity=ValidationSeverity.WARNING
        )
    )
    
    return pipeline


def validate_timeseries(
    timeseries: TimeSeries,
    expected_frequency: Optional[timedelta] = None,
    z_score_threshold: float = 3.0
) -> Dict[str, ValidationReport]:
    """
    Validate a TimeSeries object and its data.
    
    Args:
        timeseries: The TimeSeries object to validate
        expected_frequency: Optional expected frequency between timestamps
        z_score_threshold: Z-score threshold for anomaly detection
        
    Returns:
        Dictionary containing validation reports for the TimeSeries object and its data
    """
    # Create validation pipelines
    ts_pipeline = create_timeseries_validation_pipeline(
        name=f"Validation for TimeSeries {timeseries.gid}"
    )
    data_pipeline = create_timeseries_data_validation_pipeline(
        name=f"Validation for TimeSeries {timeseries.gid} data",
        expected_frequency=expected_frequency,
        z_score_threshold=z_score_threshold
    )
    datapoint_pipeline = create_datapoint_validation_pipeline(
        name=f"Validation for TimeSeries {timeseries.gid} datapoints"
    )
    
    # Validate TimeSeries object
    ts_report = ts_pipeline.validate(timeseries)
    
    # Validate datapoints individually
    dp_reports = []
    for i, datapoint in enumerate(timeseries.datapoints):
        report = datapoint_pipeline.validate(datapoint)
        report.metadata["datapoint_index"] = i
        dp_reports.append(report)
    
    # Consolidate datapoint reports
    combined_dp_report = ValidationReport(f"Consolidated DataPoint Validation for TimeSeries {timeseries.gid}")
    for report in dp_reports:
        combined_dp_report.add_results(report.validation_results)
    
    # Validate dataset as a whole
    data_report = data_pipeline.validate(timeseries.datapoints, is_dataset=True)
    
    return {
        "timeseries": ts_report,
        "datapoints": combined_dp_report,
        "dataset": data_report
    }


def validate_datapoints(datapoints: List[DataPoint], 
                       expected_frequency: Optional[timedelta] = None,
                       z_score_threshold: float = 3.0) -> Dict[str, ValidationReport]:
    """
    Validate a list of DataPoint objects.
    
    Args:
        datapoints: The list of DataPoint objects to validate
        expected_frequency: Optional expected frequency between timestamps
        z_score_threshold: Z-score threshold for anomaly detection
        
    Returns:
        Dictionary containing validation reports for the DataPoint objects
    """
    # Create validation pipelines
    datapoint_pipeline = create_datapoint_validation_pipeline("DataPoint Validation")
    data_pipeline = create_timeseries_data_validation_pipeline(
        name="DataPoint Dataset Validation",
        expected_frequency=expected_frequency,
        z_score_threshold=z_score_threshold
    )
    
    # Validate datapoints individually
    dp_reports = []
    for i, datapoint in enumerate(datapoints):
        report = datapoint_pipeline.validate(datapoint)
        report.metadata["datapoint_index"] = i
        dp_reports.append(report)
    
    # Consolidate datapoint reports
    combined_dp_report = ValidationReport("Consolidated DataPoint Validation")
    for report in dp_reports:
        combined_dp_report.add_results(report.validation_results)
    
    # Validate dataset as a whole
    data_report = data_pipeline.validate(datapoints, is_dataset=True)
    
    return {
        "datapoints": combined_dp_report,
        "dataset": data_report
    }


def generate_validation_summary(validation_reports: Dict[str, ValidationReport]) -> Dict[str, Any]:
    """
    Generate a user-friendly summary from validation reports.
    
    Args:
        validation_reports: Dictionary of validation reports
        
    Returns:
        Dictionary containing validation summary statistics and issues
    """
    summary = {
        "timestamp": datetime.now().isoformat(),
        "overall_valid": True,
        "error_count": 0,
        "warning_count": 0,
        "info_count": 0,
        "reports": {},
        "issues": []
    }
    
    # Process each report
    for report_name, report in validation_reports.items():
        report_summary = {
            "is_valid": report.is_valid,
            "error_count": report.error_count,
            "warning_count": report.warning_count,
            "info_count": sum(1 for r in report.validation_results if r.severity == ValidationSeverity.INFO)
        }
        summary["reports"][report_name] = report_summary
        
        # Update overall stats
        if not report.is_valid:
            summary["overall_valid"] = False
        summary["error_count"] += report.error_count
        summary["warning_count"] += report.warning_count
        summary["info_count"] += report_summary["info_count"]
        
        # Collect issues
        for result in report.validation_results:
            if not result.is_valid or result.severity != ValidationSeverity.INFO:
                issue = {
                    "report": report_name,
                    "severity": result.severity.value,
                    "message": result.message,
                    "field": result.field_name,
                    "record_index": result.record_index,
                    "details": result.details or {}
                }
                summary["issues"].append(issue)
    
    return summary
