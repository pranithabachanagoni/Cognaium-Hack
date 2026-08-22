import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

def generate_synthetic_data(n_normal=5000, n_anomalies=100):
    """
    Generate synthetic GPS metrics.
    Features: [speed, distance_from_prev]
    """
    np.random.seed(42)
    
    # Normal data: speed [0, 105], distance [0, 80]
    normal_speed = np.random.uniform(0, 105, n_normal)
    normal_dist = np.random.uniform(0, 80, n_normal)
    X_normal = np.column_stack((normal_speed, normal_dist))
    
    # Anomalous data: speed [120, 200] or distance [500, 1000]
    # Type 1: High speed
    anomaly_speed = np.random.uniform(120, 200, n_anomalies // 2)
    anomaly_dist_1 = np.random.uniform(0, 80, n_anomalies // 2)
    X_anomaly_1 = np.column_stack((anomaly_speed, anomaly_dist_1))
    
    # Type 2: GPS Jump (high distance)
    anomaly_speed_2 = np.random.uniform(0, 105, n_anomalies // 2)
    anomaly_dist_2 = np.random.uniform(500, 1000, n_anomalies // 2)
    X_anomaly_2 = np.column_stack((anomaly_speed_2, anomaly_dist_2))
    
    X_anomalous = np.vstack((X_anomaly_1, X_anomaly_2))
    
    # Combine
    X = np.vstack((X_normal, X_anomalous))
    
    # Labels (1 = normal, -1 = anomaly for Isolation Forest)
    y = np.array([1] * n_normal + [-1] * n_anomalies)
    
    # Shuffle
    idx = np.random.permutation(len(X))
    return X[idx], y[idx]

def train_and_save_model():
    print("Generating synthetic GPS data...")
    X, y = generate_synthetic_data()
    
    print(f"Training Isolation Forest on {len(X)} samples...")
    # contamination = ratio of anomalies in the dataset
    contamination = 100 / 5100
    model = IsolationForest(contamination=contamination, random_state=42, n_estimators=100)
    model.fit(X)
    
    # Test accuracy on training set (just to verify)
    preds = model.predict(X)
    acc = np.mean(preds == y)
    print(f"Model Training Accuracy: {acc:.4f}")
    
    # Save the model
    model_path = os.path.join(os.path.dirname(__file__), "gps_anomaly_model.joblib")
    joblib.dump(model, model_path)
    print(f"Model saved successfully to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
