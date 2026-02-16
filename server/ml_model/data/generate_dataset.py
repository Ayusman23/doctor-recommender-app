import pandas as pd
import random
import os

# Define diseases and their symptoms
disease_symptoms = {
    "Flu": ["fever", "cough", "sore_throat", "runny_nose", "body_ache", "fatigue", "headache", "chills"],
    "Malaria": ["fever", "chills", "sweating", "headache", "nausea", "muscle_pain", "vomiting", "diarrhea"],
    "Typhoid": ["high_fever", "headache", "weakness", "stomach_pain", "constipation", "rash", "muscle_pain"],
    "Dengue": ["high_fever", "skin_rash", "joint_pain", "pain_behind_eyes", "nausea", "vomiting", "bleeding"],
    "Migraine": ["severe_headache", "nausea", "sensitivity_to_light", "vomiting", "dizziness"],
    "Diabetes": ["excessive_thirst", "frequent_urination", "extreme_hunger", "weight_loss", "fatigue", "blurred_vision"],
    "Common Cold": ["sneezing", "runny_nose", "sore_throat", "cough", "mild_fever", "congestion", "watery_eyes"],
    "COVID-19": ["fever", "dry_cough", "fatigue", "loss_of_taste", "loss_of_smell", "difficulty_breathing", "sore_throat"],
    "Allergy": ["sneezing", "itchy_nose", "itchy_eyes", "red_eyes", "skin_rash", "hives"],
    "Heart Attack": ["chest_pain", "shortness_of_breath", "pain_in_arm", "cold_sweat", "nausea", "lightheadedness"],
    "Pneumonia": ["cough_phlegm", "stabbing_chest_pain", "fever", "sweating", "shaking_chills", "shortness_of_breath"],
    "Arthritis": ["joint_pain", "stiffness", "swelling", "redness", "decreased_range_of_motion"],
    "Gastroenteritis": ["watery_diarrhea", "abdominal_cramps", "nausea", "vomiting", "low_grade_fever"],
    "Tuberculosis": ["cough_3_weeks", "chest_pain", "coughing_blood", "fatigue", "weight_loss", "night_sweats", "fever"],
    "Asthma": ["shortness_of_breath", "chest_tightness", "wheezing", "coughing_at_night"]
}

# Collect all unique symptoms
all_symptoms = set()
for symptoms in disease_symptoms.values():
    all_symptoms.update(symptoms)

all_symptoms = sorted(list(all_symptoms))

# Number of samples per disease
samples_per_disease = 100
total_samples = len(disease_symptoms) * samples_per_disease

data = []

for disease, core_symptoms in disease_symptoms.items():
    for _ in range(samples_per_disease):
        sample = {symptom: 0 for symptom in all_symptoms}
        
        # Set core symptoms with high probability
        for sym in core_symptoms:
            if random.random() > 0.1:  # 90% chance to have a core symptom
                sample[sym] = 1
        
        # Add random noise (rarely have a non-core symptom)
        for sym in all_symptoms:
            if sym not in core_symptoms and random.random() < 0.02: # 2% chance
                sample[sym] = 1

        sample["Disease"] = disease
        data.append(sample)

# Create DataFrame
df = pd.DataFrame(data)

# Shuffle the dataset
df = df.sample(frac=1).reset_index(drop=True)

# Save to CSV
output_path = os.path.join(os.path.dirname(__file__), "disease_dataset.csv")
df.to_csv(output_path, index=False)
print(f"Dataset generated with {len(df)} samples at {output_path}")
