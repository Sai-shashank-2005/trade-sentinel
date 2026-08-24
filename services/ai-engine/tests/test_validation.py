import unittest
import pandas as pd
import numpy as np
from src.validator import FeatureValidator

class TestFeatureValidator(unittest.TestCase):
    def test_valid_schema(self):
        df = pd.DataFrame({
            'ReqRate': [10.5, 20.0],
            'LogVolume': [100, 200],
            'ErrorCount': [0, 5]
        })
        valid, errors = FeatureValidator.validate_schema(df)
        self.assertTrue(valid)
        self.assertEqual(len(errors), 0)

    def test_missing_column(self):
        df = pd.DataFrame({
            'ReqRate': [10.5],
            'LogVolume': [100]
        })
        valid, errors = FeatureValidator.validate_schema(df)
        self.assertFalse(valid)
        self.assertIn("ErrorCount", errors[0])

    def test_clean_and_normalize_nan(self):
        df = pd.DataFrame({
            'ReqRate': [np.nan, 15.0],
            'LogVolume': [50, np.nan],
            'ErrorCount': [np.nan, 2]
        })
        cleaned = FeatureValidator.clean_and_normalize(df)
        self.assertEqual(cleaned['ReqRate'].iloc[0], 0.0)
        self.assertEqual(cleaned['LogVolume'].iloc[1], 0)
        self.assertEqual(cleaned['ErrorCount'].iloc[0], 0)

    def test_negative_values_clipped(self):
        df = pd.DataFrame({
            'ReqRate': [-5.0],
            'LogVolume': [-10],
            'ErrorCount': [-1]
        })
        cleaned = FeatureValidator.clean_and_normalize(df)
        self.assertEqual(cleaned['ReqRate'].iloc[0], 0.0)
        self.assertEqual(cleaned['LogVolume'].iloc[0], 0)
        self.assertEqual(cleaned['ErrorCount'].iloc[0], 0)

if __name__ == '__main__':
    unittest.main()
