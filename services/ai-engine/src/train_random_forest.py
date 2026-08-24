import yaml
import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from validator import FeatureValidator
from inference_engine import ModelExporter

def main():
    print("🌳 Preparing Random Forest (Root-Cause Classifier) Trainer...")
    
    config_path = os.path.join(os.path.dirname(__file__), '../config/model_config.yaml')
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    data_path = os.path.join(os.path.dirname(__file__), '../', config['dataset']['path'])
    
    if not os.path.exists(data_path):
        print(f"⏳ Waiting for dataset from the SRE team...\nTarget path not found: {data_path}")
        return

    print("✅ Dataset located. Loading telemetry vectors...")
    df = pd.read_csv(data_path)
    
    X = FeatureValidator.extract_feature_matrix(df)
    y = df[config['dataset']['target']]
    features = config['dataset']['features']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config['dataset']['test_size'], random_state=config['dataset']['random_state']
    )
    
    params = config['models']['random_forest']
    model = RandomForestClassifier(
        n_estimators=params['n_estimators'],
        max_depth=params['max_depth'],
        min_samples_split=params['min_samples_split'],
        random_state=params['random_state']
    )
    
    print(f"⚙️ Training Random Forest on {len(X_train)} records...")
    model.fit(X_train, y_train)
    
    print("📊 Evaluating Model Accuracy...")
    y_pred = model.predict(X_test)
    
    # Map label integers to string names based on config
    target_names = [config['labels'][int(c)] for c in model.classes_]
    print(classification_report(y_test, y_pred, target_names=target_names))
    
    export_path = os.path.join(os.path.dirname(__file__), '../', params['export_path'])
    ModelExporter.export_random_forest(model, features, export_path)
    print("🎯 Random Forest training and export complete. Ready for Go Runtime.")

if __name__ == '__main__':
    main()
