from pathlib import Path
import pickle
import numpy as np
from sklearn.ensemble import IsolationForest

OUT = Path(__file__).resolve().parent / "model.pkl"

# Synthetic normal trajectory features:
# [distance_km, speed_kmh, route_deviation_km]
rng = np.random.default_rng(42)
normal = np.column_stack([
    rng.normal(1.2, 0.35, 600).clip(0.1),
    rng.normal(45, 8, 600).clip(5),
    rng.normal(0.4, 0.15, 600).clip(0),
])

model = IsolationForest(
    n_estimators=120,
    contamination=0.08,
    random_state=42
)
model.fit(normal)

with OUT.open("wb") as f:
    pickle.dump(model, f)

print(f"trained model -> {OUT}")
