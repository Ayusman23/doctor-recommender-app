import pandas as pd
import numpy as np
import random
import os
import sys
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

class DiseasePredictor:
    def __init__(self):
        # Paths relative to this file
        self.model_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(self.model_dir, '..', 'data')
        self.dataset_path = os.path.join(self.data_dir, 'disease_dataset.csv')
        self.model_path = os.path.join(self.model_dir, 'disease_model.pkl')
        self.columns_path = os.path.join(self.model_dir, 'model_columns.pkl')
        
        self.model = None
        self.columns = None
        self.classes_ = None

    def load_model(self):
        """Loads the trained model and columns if they exist."""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.columns_path):
                self.model = joblib.load(self.model_path)
                self.columns = joblib.load(self.columns_path)
                # Ensure classes are loaded correct if model has them
                if hasattr(self.model, 'classes_'):
                    self.classes_ = self.model.classes_
                return True
            return False
        except Exception as e:
            # If there's an error (e.g. version mismatch), we return False so it retrains
            print(f"Error loading model (will retrain): {e}")
            return False

    def train_model(self):
        """Trains the Random Forest model on the dataset."""
        print("Training model...")
        if not os.path.exists(self.dataset_path):
            print(f"Dataset not found at {self.dataset_path}. Please run generate_dataset.py first.")
            return False

        try:
            df = pd.read_csv(self.dataset_path)
            
            # Assumptions: 'Disease' is the target column
            # All other columns are symptoms (0 or 1)
            target_col = 'Disease'
            if target_col not in df.columns:
                print(f"Dataset must contain '{target_col}' column.")
                return False

            X = df.drop(target_col, axis=1)
            y = df[target_col]
            
            # Save feature columns
            self.columns = X.columns.tolist()
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train model
            self.model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
            self.model.fit(X_train, y_train)
            
            # Evaluate
            predictions = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, predictions)
            print(f"Model trained successfully with accuracy: {accuracy:.4f}")
            
            self.classes_ = self.model.classes_
            
            # Save model and columns
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.columns, self.columns_path)
            print(f"Model saved to {self.model_path}")
            print(f"Columns saved to {self.columns_path}")
            
            return True
        except Exception as e:
            print(f"Error during training: {e}")
            return False

    def predict_disease(self, symptoms_list):
        """
        Predicts disease based on a list of symptoms.
        Args:
            symptoms_list (list): List of symptom strings.
        Returns:
            dict: Prediction result with probabilities.
        """
        if self.model is None:
            if not self.load_model():
                print("Model not loaded. Attempting to train...")
                if not self.train_model():
                    return {"error": "Model could not be trained or loaded."}

        # Create input vector initialized with 0
        input_data = pd.DataFrame(0, index=[0], columns=self.columns)
        
        # Set present symptoms to 1
        matched_symptoms = []
        for symptom in symptoms_list:
            # Simple normalization: lower case, strip
            symptom_clean = symptom.strip().lower().replace(" ", "_")
            
            # Try exact match or match with replacement
            if symptom_clean in self.columns:
                input_data[symptom_clean] = 1
                matched_symptoms.append(symptom_clean)
            else:
                # Try to fuzzy match or just ignore? Best to ignore for now to avoid false positives
                # But let's check if the raw symptom is a column
                if symptom in self.columns:
                    input_data[symptom] = 1
                    matched_symptoms.append(symptom)

        if not matched_symptoms and len(symptoms_list) > 0:
            return {
                "prediction": "Unknown",
                "confidence": 0.0,
                "top_predictions": [],
                "warning": "No matching symptoms found in the model database."
            }

        try:
            # Predict
            prediction = self.model.predict(input_data)[0]
            probabilities = self.model.predict_proba(input_data)[0]
            
            # Get top 3 predictions
            class_probs = list(zip(self.classes_, probabilities))
            # Sort by probability descending
            class_probs.sort(key=lambda x: x[1], reverse=True)
            
            top_3 = [{"disease": c, "probability": float(p)} for c, p in class_probs[:3] if p > 0.0]

            return {
                "prediction": prediction,
                "confidence": float(class_probs[0][1]),
                "top_predictions": top_3,
                "matched_symptoms": matched_symptoms
            }
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    predictor = DiseasePredictor()
    
    # Check for training flag
    if len(sys.argv) > 1 and sys.argv[1] == '--train':
        predictor.train_model()
    # Check for prediction arguments
    elif len(sys.argv) > 1:
        symptoms = sys.argv[1:]
        # Load model (or train if missing)
        if not os.path.exists(predictor.model_path):
            predictor.train_model()
        else:
            predictor.load_model()
            
        result = predictor.predict_disease(symptoms)
        import json
        print(json.dumps(result))
    else:
        # Default behavior: Ensure model is trained, then test
        if not os.path.exists(predictor.model_path):
            predictor.train_model()
        else:
            predictor.load_model()
            
        print("Model ready. Usage: python disease_predictor.py [symptom1] [symptom2] ...")
        
        # Test case
        test_symptoms = ["fever", "cough", "headache"]
        print(f"Testing with symptoms: {test_symptoms}")
        result = predictor.predict_disease(test_symptoms)
        print("Result:", result)