# ============================================================
# app/services/prediction_service.py
# Inference-Only Prediction Service
#
# PURPOSE:
# - Loads pre-trained model files from ml_models/
# - Provides prediction functions for the API layer
#
# IMPORTANT:
# - This file does NOT train any model
# - Run train_model.py ONCE before starting the server
# - All functions here are read-only inference operations
# ============================================================

import os
import joblib
import numpy as np

# ============================================================
# PATHS
# ============================================================

# backend/ root directory
# CORRECT — goes up 3 levels, lands in backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ml_models/ folder paths
MODELS_DIR           = os.path.join(BASE_DIR, "ml_models")
MODEL_PATH           = os.path.join(MODELS_DIR, "disease_model.pkl")
SYMPTOM_COLS_PATH    = os.path.join(MODELS_DIR, "symptom_columns.pkl")
DISEASE_CLASSES_PATH = os.path.join(MODELS_DIR, "disease_classes.pkl")

# ============================================================
# GLOBAL MODEL VARIABLES
# (loaded once into memory when the server starts)
# ============================================================

model           = None
symptom_columns = []
disease_classes = []

# ============================================================
# TASK 6 — MODEL LOADING LOGIC
# ============================================================

def load_model():
    """
    Loads saved model artifacts from ml_models/ folder.

    This function is called ONCE when the server starts.
    After the first call, the model stays in memory for all
    subsequent requests (no repeated disk reads).

    Raises:
        FileNotFoundError: if .pkl files are missing.
        Run train_model.py first to generate them.
    """

    global model, symptom_columns, disease_classes

    # Skip loading if already loaded (prevents repeated disk reads)
    if model is not None:
        return model, symptom_columns, disease_classes

    # --- Verify model files exist before loading ---
    missing = []

    for path, name in [
        (MODEL_PATH,           "disease_model.pkl"),
        (SYMPTOM_COLS_PATH,    "symptom_columns.pkl"),
        (DISEASE_CLASSES_PATH, "disease_classes.pkl"),
    ]:
        if not os.path.exists(path):
            missing.append(name)

    if missing:
        raise FileNotFoundError(
            f"\n[ERROR] Missing model files in ml_models/:\n"
            + "\n".join(f"  - {f}" for f in missing)
            + "\n\nPlease run: python train_model.py"
        )

    # --- Load all three artifacts ---
    model           = joblib.load(MODEL_PATH)
    symptom_columns = joblib.load(SYMPTOM_COLS_PATH)
    disease_classes = joblib.load(DISEASE_CLASSES_PATH)

    print(f"[INFO] Model loaded successfully.")
    print(f"[INFO] Symptoms: {len(symptom_columns)}")
    print(f"[INFO] Diseases: {len(disease_classes)}")

    return model, symptom_columns, disease_classes


# ============================================================
# GET ALL AVAILABLE SYMPTOMS
# ============================================================

def get_symptom_list():
    """
    Returns all symptoms in user-friendly display format.

    Returns:
        list of tuples:
        [
            (display_name, raw_column_name),
            ...
        ]

    Example:
        [("Chest Pain", "chest_pain"), ("High Fever", "high_fever")]
    """

    _, symptom_cols, _ = load_model()

    symptom_pairs = []

    for col in symptom_cols:

        display_name = (
            col
            .replace("_", " ")
            .strip()
            .title()
        )

        if display_name:
            symptom_pairs.append(
                (display_name, col)
            )

    return symptom_pairs


# ============================================================
# CREATE BINARY SYMPTOM VECTOR
# ============================================================

def create_symptom_vector(selected_raw_symptoms, all_symptom_columns):
    """
    Converts selected symptom names into a binary ML input vector.

    How it works:
    - Creates an array of zeros with length = number of symptoms
    - Sets index to 1 for each selected symptom
    - Returns reshaped array ready for model.predict()

    Args:
        selected_raw_symptoms (list):
            Raw column names of selected symptoms
            e.g. ["chest_pain", "high_fever"]

        all_symptom_columns (list):
            Full list of symptom column names from training

    Returns:
        numpy array of shape (1, num_symptoms)
    """

    vector = np.zeros(len(all_symptom_columns))

    for symptom in selected_raw_symptoms:
        if symptom in all_symptom_columns:
            index = all_symptom_columns.index(symptom)
            vector[index] = 1

    return vector.reshape(1, -1)


# ============================================================
# PREDICT PRIMARY DISEASE
# ============================================================

def predict_disease(selected_raw_symptoms):
    """
    Predicts the most likely disease from selected symptoms.

    Args:
        selected_raw_symptoms (list):
            Raw symptom column names
            e.g. ["chest_pain", "fatigue", "high_fever"]

    Returns:
        tuple: (predicted_disease, confidence_percentage)
        e.g.  ("Malaria", 87.5)
    """

    clf, symptom_cols, _ = load_model()

    vector = create_symptom_vector(
        selected_raw_symptoms,
        symptom_cols
    )

    # Get prediction
    prediction = clf.predict(vector)[0]

    # Get probability scores for all diseases
    probabilities = clf.predict_proba(vector)[0]

    # Find confidence for the predicted disease
    predicted_index = list(clf.classes_).index(prediction)
    confidence = round(probabilities[predicted_index] * 100, 1)

    return prediction, confidence


# ============================================================
# GET TOP N PREDICTIONS
# ============================================================

def get_top_predictions(selected_raw_symptoms, top_n=3):
    """
    Returns the top N most likely diseases with confidence scores.

    Args:
        selected_raw_symptoms (list):
            Raw symptom column names

        top_n (int):
            Number of top predictions to return (default: 3)

    Returns:
        list of tuples: [(disease, confidence), ...]
        e.g. [("Malaria", 87.5), ("Typhoid", 6.2), ("Flu", 3.1)]
    """

    clf, symptom_cols, _ = load_model()

    vector = create_symptom_vector(
        selected_raw_symptoms,
        symptom_cols
    )

    probabilities = clf.predict_proba(vector)[0]
    classes = clf.classes_

    # Get indices sorted by highest probability
    top_indices = np.argsort(probabilities)[::-1][:top_n]

    results = []

    for idx in top_indices:
        disease    = classes[idx]
        confidence = round(probabilities[idx] * 100, 1)
        results.append((disease, confidence))

    return results


# ============================================================
# INITIALIZE — Load model when this module is imported
# ============================================================

load_model()