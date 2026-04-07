# ml-api/api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI()

# Allow React to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Class names for the 7 contaminant types
CLASS_NAMES = [
    "Agricultural / Nitrate",
    "Chemical / Industrial",
    "Clean / Safe",
    "Heavy Metal Contamination",
    "Microbial / Sewage",
    "Organic Contamination",
    "Saline / Brackish Intrusion"
]

# Load the real model
model_path = "water_quality_model.pkl"
if os.path.exists(model_path):
    model = joblib.load(model_path)
    print("✅ Real ML model loaded successfully")
else:
    print("❌ Model not found. Run python save_model.py first")
    model = None

class SensorData(BaseModel):
    pH: float
    turbidity: float
    conductivity: float

@app.get("/")
def root():
    return {
        "message": "PureFLOW ML API", 
        "status": "ready", 
        "model_loaded": model is not None,
        "classes": CLASS_NAMES
    }

@app.post("/predict")
def predict(data: SensorData):
    if model is None:
        return {"error": "Model not loaded. Run python save_model.py first"}
    
    # Prepare features
    features = np.array([[data.pH, data.turbidity, data.conductivity]])
    
    # Make prediction
    prediction_idx = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = round(max(probabilities) * 100, 1)
    
    # Get class name
    contaminant = CLASS_NAMES[prediction_idx] if prediction_idx < len(CLASS_NAMES) else "Unknown"
    
    # Get top 3 predictions
    top_indices = np.argsort(probabilities)[-3:][::-1]
    top_predictions = [
        {"contaminant": CLASS_NAMES[i], "confidence": round(probabilities[i] * 100, 1)}
        for i in top_indices if i < len(CLASS_NAMES)
    ]
    
    return {
        "contaminant": contaminant,
        "confidence": confidence,
        "top_predictions": top_predictions,
        "input_values": {
            "pH": data.pH,
            "turbidity": data.turbidity,
            "conductivity": data.conductivity
        }
    }

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)