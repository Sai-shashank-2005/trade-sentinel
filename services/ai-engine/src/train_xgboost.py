import yaml
import os
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from validator import FeatureValidator

def main():
    print("🚀 Preparing XGBoost (Remediation Policy) Trainer...")
    
    config_path = os.path.join(os.path.dirname(__file__), '../config/model_config.yaml')
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    data_path = os.path.join(os.path.dirname(__file__), '../', config['dataset']['path'])
    
    if not os.path.exists(data_path):
        print(f"⏳ Waiting for dataset from the SRE team...\nTarget path not found: {data_path}")
        return

    print("✅ Dataset located. Loading telemetry vectors...")
    df = pd.read_csv(data_path)
    
    # For XGBoost Remediation, the input is the Feature Vector, 
    # but the target is the mapped Remediation Action.
    X = FeatureValidator.extract_feature_matrix(df)
    
    # Convert labels (0, 1, 2) to remediation classes (0=NO_ACTION, 1=SCALE, etc.)
    # In a real environment, this might be a complex heuristic mapping.
    y = df[config['dataset']['target']]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config['dataset']['test_size'], random_state=config['dataset']['random_state']
    )
    
    params = config['models']['xgboost_policy']
    model = xgb.XGBClassifier(
        n_estimators=params['n_estimators'],
        max_depth=params['max_depth'],
        learning_rate=params['learning_rate'],
        random_state=params['random_state'],
        use_label_encoder=False,
        eval_metric='mlogloss'
    )
    
    print(f"⚙️ Training XGBoost Policy Engine on {len(X_train)} records...")
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"📊 XGBoost Remediation Policy Accuracy: {accuracy * 100:.2f}%")
    
    export_path = os.path.join(os.path.dirname(__file__), '../', params['export_path'])
    os.makedirs(os.path.dirname(export_path), exist_ok=True)
    
    # Native XGBoost JSON export
    model.save_model(export_path)
    print(f"✅ Model exported natively to: {export_path}")
    print("🎯 XGBoost training complete. Ready for Go Runtime.")

if __name__ == '__main__':
    main()
