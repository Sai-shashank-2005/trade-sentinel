import json
import os
from typing import Dict, Any

class ModelExporter:
    """
    Exports scikit-learn / tree model structures into portable JSON format
    that can be natively evaluated inside the Go runtime with zero Python dependency.
    """
    @staticmethod
    def export_tree(tree, feature_names) -> Dict[str, Any]:
        tree_ = tree.tree_
        feature_name = [
            feature_names[i] if i != -2 else "undefined!"
            for i in tree_.feature
        ]

        def recurse(node: int) -> Dict[str, Any]:
            if tree_.feature[node] != -2:
                name = feature_name[node]
                threshold = float(tree_.threshold[node])
                left = recurse(int(tree_.children_left[node]))
                right = recurse(int(tree_.children_right[node]))
                return {
                    "type": "split",
                    "feature": name,
                    "threshold": threshold,
                    "left": left,
                    "right": right
                }
            else:
                value = tree_.value[node].tolist()
                return {
                    "type": "leaf",
                    "value": value
                }

        return recurse(0)

    @classmethod
    def export_random_forest(cls, rf_model, feature_names: list, target_path: str):
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        forest_dict = {
            "model_type": "random_forest",
            "n_estimators": len(rf_model.estimators_),
            "classes": [int(c) for c in rf_model.classes_],
            "feature_names": feature_names,
            "trees": [cls.export_tree(estimator, feature_names) for estimator in rf_model.estimators_]
        }
        with open(target_path, "w") as f:
            json.dump(forest_dict, f, indent=2)
        print(f"✅ Model exported to: {target_path}")

    @classmethod
    def export_isolation_forest(cls, if_model, feature_names: list, target_path: str):
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        forest_dict = {
            "model_type": "isolation_forest",
            "offset_": float(if_model.offset_),
            "n_estimators": len(if_model.estimators_),
            "feature_names": feature_names,
            "trees": [cls.export_tree(estimator, feature_names) for estimator in if_model.estimators_]
        }
        with open(target_path, "w") as f:
            json.dump(forest_dict, f, indent=2)
        print(f"✅ Model exported to: {target_path}")
