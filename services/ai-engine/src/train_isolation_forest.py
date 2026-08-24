import yaml
import os
import pandas as pd
from sklearn.ensemble import IsolationForest
from validator import FeatureValidator
from inference_engine import ModelExporter

def main():
    print("🌲 Preparing Isolation Forest (Zero-Day Anomaly Detection) Trainer...")
    
    # Load Configuration
    config_path = os.path.join(os.path.dirname(__file__), '../config/model_config.yaml')
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    data_path = os.path.join(os.path.dirname(__file__), '../', config['dataset']['path'])
    
    if not os.path.exists(data_path):
        print(f"⏳ Waiting for dataset from the SRE team...\nTarget path not found: {data_path}")
        print("Please run this script again once the telemetry generation task is complete.")
        return

    print("✅ Dataset located. Loading telemetry vectors...")
    df = pd.read_csv(data_path)
    
    # Validate and clean data
    X = FeatureValidator.extract_feature_matrix(df)
    features = config['dataset']['features']
    
    # Initialize Model
    params = config['models']['isolation_forest']
    model = IsolationForest(
        contamination=params['contamination'],
        n_estimators=params['n_estimators'],
        random_state=params['random_state']
    )
    
    print(f"⚙️ Training Isolation Forest with {params['n_estimators']} estimators on {len(X)} records...")
    model.fit(X)
    
    # Export Model
    export_path = os.path.join(os.path.dirname(__file__), '../', params['export_path'])
    ModelExporter.export_isolation_forest(model, features, export_path)
    print("🎯 Isolation Forest training and export complete. Ready for Go Runtime.")

if __name__ == '__main__':
    main()
