# ------------------------------------------------------
# Prediction Service — ML Model Training & Inference
# ------------------------------------------------------
# Loads Training.csv, trains a Random Forest Classifier,
# and provides functions for:
# - symptom vector creation
# - disease prediction
# - confidence scoring
# - top prediction retrieval
#
# This version is backend-compatible and contains
# NO Streamlit dependencies.
# ------------------------------------------------------

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# ------------------------------------------------------
# DATASET PATH
# ------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAINING_CSV = os.path.join(BASE_DIR, "datasets", "Training.csv")

# ------------------------------------------------------
# GLOBAL MODEL VARIABLES
# ------------------------------------------------------

model = None
symptom_columns = []
disease_classes = []

# ------------------------------------------------------
# LOAD & TRAIN MODEL
# ------------------------------------------------------

def load_model():
    """
    Loads the dataset and trains the Random Forest model.

    Returns:
        tuple:
        (
            trained_model,
            symptom_columns,
            disease_classes
        )
    """

    global model, symptom_columns, disease_classes

    # Prevent retraining if already loaded
    if model is not None:
        return model, symptom_columns, disease_classes

    # Load dataset
    df = pd.read_csv(TRAINING_CSV)

    # Clean column names
    df.columns = [col.strip() for col in df.columns]

    # Extract symptom columns
    symptom_columns = [
        col for col in df.columns
        if col != "prognosis"
    ]

    # Features and target
    X = df[symptom_columns].values
    y = df["prognosis"].values

    # Train Random Forest model
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X, y)

    # Store disease classes
    disease_classes = list(model.classes_)

    return model, symptom_columns, disease_classes

# ------------------------------------------------------
# GET ALL AVAILABLE SYMPTOMS
# ------------------------------------------------------

def get_symptom_list():
    """
    Returns all symptoms in user-friendly format.

    Returns:
        list of tuples:
        [
            (display_name, raw_column_name),
            ...
        ]
    """

    _, symptom_columns, _ = load_model()

    symptom_pairs = []

    for col in symptom_columns:

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

# ------------------------------------------------------
# CREATE BINARY SYMPTOM VECTOR
# ------------------------------------------------------

def create_symptom_vector(
    selected_raw_symptoms,
    all_symptom_columns
):
    """
    Converts symptoms into binary ML feature vector.

    Args:
        selected_raw_symptoms:
            list of selected symptom names

        all_symptom_columns:
            full symptom column list

    Returns:
        numpy array
    """

    vector = np.zeros(len(all_symptom_columns))

    for symptom in selected_raw_symptoms:

        if symptom in all_symptom_columns:

            index = all_symptom_columns.index(symptom)

            vector[index] = 1

    return vector.reshape(1, -1)

# ------------------------------------------------------
# PREDICT PRIMARY DISEASE
# ------------------------------------------------------

def predict_disease(selected_raw_symptoms):
    """
    Predicts the most likely disease.

    Args:
        selected_raw_symptoms:
            list of symptom column names

    Returns:
        tuple:
        (
            predicted_disease,
            confidence_percentage
        )
    """

    model, symptom_columns, _ = load_model()

    vector = create_symptom_vector(
        selected_raw_symptoms,
        symptom_columns
    )

    # Predict disease
    prediction = model.predict(vector)[0]

    # Get probabilities
    probabilities = model.predict_proba(vector)[0]

    predicted_index = list(
        model.classes_
    ).index(prediction)

    confidence = round(
        probabilities[predicted_index] * 100,
        1
    )

    return prediction, confidence

# ------------------------------------------------------
# GET TOP N PREDICTIONS
# ------------------------------------------------------

def get_top_predictions(
    selected_raw_symptoms,
    top_n=3
):
    """
    Returns top disease predictions.

    Args:
        selected_raw_symptoms:
            list of symptoms

        top_n:
            number of predictions

    Returns:
        list of tuples:
        [
            (disease, confidence),
            ...
        ]
    """

    model, symptom_columns, _ = load_model()

    vector = create_symptom_vector(
        selected_raw_symptoms,
        symptom_columns
    )

    probabilities = model.predict_proba(vector)[0]

    classes = model.classes_

    # Sort highest probability first
    top_indices = np.argsort(
        probabilities
    )[::-1][:top_n]

    results = []

    for idx in top_indices:

        disease = classes[idx]

        confidence = round(
            probabilities[idx] * 100,
            1
        )

        results.append(
            (disease, confidence)
        )

    return results

# ------------------------------------------------------
# INITIALIZE MODEL ON IMPORT
# ------------------------------------------------------

load_model()