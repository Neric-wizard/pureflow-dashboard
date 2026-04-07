# ml-api/save_model.py
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# This creates a SAMPLE model for demonstration
# You will replace this with YOUR actual trained model

# Sample training data (pH, turbidity, conductivity)
X_train = np.array([
    [7.1, 0.3, 280],   # Clean water
    [7.2, 0.5, 290],   # Clean water
    [4.2, 3.5, 1800],  # Industrial
    [4.5, 4.0, 1900],  # Industrial
    [6.5, 95, 750],    # Sewage
    [6.8, 100, 800],   # Sewage
    [7.8, 1.2, 5500],  # Saline
    [8.0, 1.5, 5600],  # Saline
    [3.8, 8.0, 1200],  # Heavy metals
    [4.0, 9.0, 1300],  # Heavy metals
])

# Sample labels (0-6 for 7 contaminant types)
y_train = np.array([2, 2, 1, 1, 4, 4, 6, 6, 3, 3])

# Create pipeline
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(n_estimators=100, random_state=42))
])

# Train the model
pipeline.fit(X_train, y_train)

# Save the model
joblib.dump(pipeline, "water_quality_model.pkl")

print("✅ Model saved as water_quality_model.pkl")
print("Classes: 0=Agricultural, 1=Industrial, 2=Clean, 3=Heavy Metals, 4=Sewage, 5=Organic, 6=Saline")