from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Ensure we can import from the model directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from model.disease_predictor import DiseasePredictor

app = Flask(__name__)
CORS(app) # Allows React (localhost:3000) to talk to Flask (localhost:5000)

# Initialize predictor
predictor = DiseasePredictor()
# Ensure model is loaded/trained
if not os.path.exists(predictor.model_path):
    print("Training model on startup...")
    predictor.train_model()
else:
    predictor.load_model()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json.get('symptoms', [])
    
    if not data:
        return jsonify({"error": "No symptoms provided"}), 400
        
    # uses the robust predict_disease method
    result = predictor.predict_disease(data)
    
    if "error" in result:
        return jsonify(result), 500
        
    prediction = result.get("prediction", "Unknown")
    
    # Expanded recommendation logic based on disease names from dataset
    # This should be ideally database driven
    recommendations = {
        "Fungal infection": "Dermatologist",
        "Diabetes": "Endocrinologist",
        "Hypertension": "Cardiologist",
        "Malaria": "Infectious Disease Specialist",
        "Flu": "General Physician",
        "Typhoid": "General Physician",
        "Dengue": "General Physician",
        "Migraine": "Neurologist",
        "Common Cold": "General Physician",
        "COVID-19": "General Physician",
        "Allergy": "Allergist",
        "Heart Attack": "Cardiologist",
        "Pneumonia": "Pulmonologist",
        "Arthritis": "Rheumatologist",
        "Gastroenteritis": "Gastroenterologist",
        "Tuberculosis": "Pulmonologist",
        "Asthma": "Pulmonologist"
    }
    
    doctor_type = recommendations.get(prediction, "General Physician")
    
    return jsonify({
        "disease": prediction,
        "recommended_specialist": doctor_type,
        "confidence": result.get("confidence", 0),
        "top_predictions": result.get("top_predictions", [])
    })

if __name__ == "__main__":
    app.run(port=5001, debug=True)