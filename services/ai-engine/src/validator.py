import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any

class FeatureValidator:
    """
    FeatureValidator ensures telemetry vectors comply with the KubeHeals schema
    before being passed to Machine Learning models.
    """
    REQUIRED_COLUMNS = ['ReqRate', 'LogVolume', 'ErrorCount']
    
    @classmethod
    def validate_schema(cls, df: pd.DataFrame) -> Tuple[bool, List[str]]:
        errors = []
        for col in cls.REQUIRED_COLUMNS:
            if col not in df.columns:
                errors.append(f"Missing required feature column: '{col}'")
        return len(errors) == 0, errors

    @classmethod
    def clean_and_normalize(cls, df: pd.DataFrame) -> pd.DataFrame:
        df_clean = df.copy()
        
        # 1. Fill NaNs with statistical fallback
        df_clean['ReqRate'] = df_clean['ReqRate'].fillna(0.0)
        df_clean['LogVolume'] = df_clean['LogVolume'].fillna(0).astype(int)
        df_clean['ErrorCount'] = df_clean['ErrorCount'].fillna(0).astype(int)
        
        # 2. Enforce non-negative bounds
        df_clean['ReqRate'] = df_clean['ReqRate'].clip(lower=0.0)
        df_clean['LogVolume'] = df_clean['LogVolume'].clip(lower=0)
        df_clean['ErrorCount'] = df_clean['ErrorCount'].clip(lower=0)
        
        # 3. Log errors exceeding volume sanity check
        mask = df_clean['ErrorCount'] > df_clean['LogVolume']
        df_clean.loc[mask, 'LogVolume'] = df_clean.loc[mask, 'ErrorCount']
        
        return df_clean

    @classmethod
    def extract_feature_matrix(cls, df: pd.DataFrame) -> np.ndarray:
        df_clean = cls.clean_and_normalize(df)
        return df_clean[cls.REQUIRED_COLUMNS].values
