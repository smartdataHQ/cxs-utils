"""
Test for timeseries validation framework.

This demonstrates how to use the data quality validation framework
with TimeSeries and DataPoint models.
"""
import unittest
import uuid
from datetime import datetime, timedelta

from cxs.schema.pydantic.timeseries import TimeSeries, DataPoint, Entity, ValueType, TSResolution, TSCategory
from cxs.schema.pydantic.uom import UOM
from cxs.tools.validation.timeseries_validation import validate_timeseries, validate_datapoints, generate_validation_summary


class TestTimeseriesValidation(unittest.TestCase):
    """Test case for timeseries validation."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create a sample entity
        self.entity = Entity(
            gid_url="https://example.com/entities/test-entity",
            gid=uuid.uuid4(),
            label="Test Entity",
            type="test"
        )
        
        # Create a sample timeseries
        self.timeseries = TimeSeries(
            gid_url="https://example.com/timeseries/test",
            gid=uuid.uuid4(),
            group_gid_url="https://example.com/timeseries/group/test",
            group_gid=uuid.uuid4(),
            label="Test TimeSeries",
            slug="test_timeseries",
            value_types=ValueType.Actual,
            category=TSCategory.Energy,
            sub_category="Prices",
            resolution=TSResolution.P1D,
            metrics={
                "price_usd": {
                    "gid_url": "https://example.com/metrics/price_usd",
                    "gid": uuid.uuid4(),
                    "category": "price",
                    "label": "Price USD",
                    "slug": "price_usd",
                    "uom": UOM.code_28  # kg/m²
                }
            },
            owner=self.entity,  # Added the required owner field
            source=self.entity,
            country="USA"
        )
        
        # Create sample datapoints
        now = datetime.now()
        self.datapoints = []
        
        # Valid datapoints
        for i in range(10):
            dp = DataPoint(
                series_gid=self.timeseries.gid,
                timestamp=now - timedelta(days=i),
                metrics={"price_usd": 100.0 + i},
                signature=uuid.uuid4()  # Adding required signature field
            )
            self.datapoints.append(dp)
        
        # Add an anomaly
        dp_anomaly = DataPoint(
            series_gid=self.timeseries.gid,
            timestamp=now - timedelta(days=10),
            metrics={"price_usd": 999.0},  # Very different value
            signature=uuid.uuid4()  # Adding required signature field
        )
        self.datapoints.append(dp_anomaly)
        
        # Add a gap
        dp_gap = DataPoint(
            series_gid=self.timeseries.gid,
            timestamp=now - timedelta(days=15),  # 5-day gap
            metrics={"price_usd": 100.0},
            signature=uuid.uuid4()  # Adding required signature field
        )
        self.datapoints.append(dp_gap)
        
        # Add the datapoints to the timeseries
        self.timeseries.datapoints = self.datapoints
    
    def test_timeseries_validation(self):
        """Test validation of a TimeSeries object and its data."""
        # Validate the timeseries
        reports = validate_timeseries(
            self.timeseries,
            expected_frequency=timedelta(days=1),
            z_score_threshold=2.0  # Lower threshold to catch our anomaly
        )
        
        # Generate a summary
        summary = generate_validation_summary(reports)
        
        # Basic assertions
        self.assertIn("timeseries", reports)
        self.assertIn("datapoints", reports)
        self.assertIn("dataset", reports)
        
        # Print validation summary for demonstration
        print("\n=== Timeseries Validation Summary ===")
        print(f"Overall valid: {summary['overall_valid']}")
        print(f"Error count: {summary['error_count']}")
        print(f"Warning count: {summary['warning_count']}")
        print(f"Info count: {summary['info_count']}")
        
        if summary['issues']:
            print("\nIssues found:")
            for issue in summary['issues']:
                print(f"- [{issue['severity']}] {issue['message']}")
        
        # There should be at least one warning for the anomaly
        self.assertGreaterEqual(summary['warning_count'], 1)
        
        # Find the anomaly detection issue
        anomaly_issues = [
            issue for issue in summary['issues'] 
            if 'anomaly' in issue['message'].lower()
        ]
        self.assertTrue(len(anomaly_issues) > 0, "Expected to find anomaly issue")
        
        # Find the gap detection issue
        gap_issues = [
            issue for issue in summary['issues'] 
            if 'gap' in issue['message'].lower()
        ]
        self.assertTrue(len(gap_issues) > 0, "Expected to find gap issue")
    
    def test_datapoints_validation(self):
        """Test validation of a list of DataPoint objects."""
        # Validate just the datapoints
        reports = validate_datapoints(
            self.datapoints,
            expected_frequency=timedelta(days=1)
        )
        
        # Generate a summary
        summary = generate_validation_summary(reports)
        
        # Basic assertions
        self.assertIn("datapoints", reports)
        self.assertIn("dataset", reports)
        
        # Print validation summary for demonstration
        print("\n=== DataPoints Validation Summary ===")
        print(f"Overall valid: {summary['overall_valid']}")
        print(f"Error count: {summary['error_count']}")
        print(f"Warning count: {summary['warning_count']}")
        
        # There should be issues with the gap and anomaly
        self.assertGreaterEqual(summary['warning_count'], 1)


if __name__ == "__main__":
    unittest.main()
