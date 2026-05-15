# ============================================================
# train_model.py
# One-Time Model Training Script
#
# PURPOSE:
# - Loads Training.csv
# - Trains the RandomForestClassifier
# - Saves trained model + metadata as .pkl files
#
# HOW TO RUN:
# python train_model.py
#
# WHEN TO RUN:
# - Once before starting the server for the first time
# - Again only if Training.csv changes
#
# OUTPUT FILES (saved to ml_models/):
# - disease_model.pkl       → trained RandomForest model
# - symptom_columns.pkl     → list of all symptom column names
# - disease_classes.pkl     → list of all disease names
# ============================================================

import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# ============================================================
# PATHS
# ============================================================

# Base directory = backend/ folder (where this file lives)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Path to Training.csv
TRAINING_CSV = os.path.join(BASE_DIR, "datasets", "Training.csv")

# Path to ml_models/ folder
MODELS_DIR = os.path.join(BASE_DIR, "ml_models")

# Output file paths
MODEL_PATH          = os.path.join(MODELS_DIR, "disease_model.pkl")
SYMPTOM_COLS_PATH   = os.path.join(MODELS_DIR, "symptom_columns.pkl")
DISEASE_CLASSES_PATH = os.path.join(MODELS_DIR, "disease_classes.pkl")


# ============================================================
# STEP 1 — VERIFY FILES EXIST BEFORE STARTING
# ============================================================

def verify_paths():
    """Check that required files and folders exist."""

    if not os.path.exists(TRAINING_CSV):
        raise FileNotFoundError(
            f"\n[ERROR] Training.csv not found at:\n  {TRAINING_CSV}"
            f"\nMake sure datasets/Training.csv exists."
        )

    if not os.path.exists(MODELS_DIR):
        print(f"[INFO] ml_models/ folder not found. Creating it...")
        os.makedirs(MODELS_DIR)
        print(f"[INFO] Created: {MODELS_DIR}")


# ============================================================
# STEP 2 — LOAD DATASET
# ============================================================

def load_dataset():
    """Load and clean the training dataset."""

    print(f"\n[STEP 1] Loading dataset from:\n  {TRAINING_CSV}")

    df = pd.read_csv(TRAINING_CSV)

    # Clean column names (remove accidental spaces)
    df.columns = [col.strip() for col in df.columns]

    print(f"[INFO] Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    # Extract symptom columns (everything except target column)
    symptom_columns = [col for col in df.columns if col != "prognosis"]

    print(f"[INFO] Symptoms found: {len(symptom_columns)}")
    print(f"[INFO] Unique diseases: {df['prognosis'].nunique()}")

    return df, symptom_columns


# ============================================================
# STEP 3 — TRAIN MODEL
# ============================================================

def train_model(df, symptom_columns):
    """Train the RandomForestClassifier."""

    print(f"\n[STEP 2] Training RandomForestClassifier...")
    print(f"[INFO] This may take a few seconds...")

    # Prepare features (X) and target (y)
    X = df[symptom_columns].values
    y = df["prognosis"].values

    # Initialize and train the model
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        n_jobs=-1              # Use all available CPU cores
    )

    model.fit(X, y)

    disease_classes = list(model.classes_)

    print(f"[INFO] Training complete.")
    print(f"[INFO] Model trained on {len(symptom_columns)} symptoms")
    print(f"[INFO] Model can predict {len(disease_classes)} diseases")

    return model, disease_classes


# ============================================================
# STEP 4 — SAVE MODEL FILES
# ============================================================

def save_artifacts(model, symptom_columns, disease_classes):
    """Save model and metadata to ml_models/ folder."""

    print(f"\n[STEP 3] Saving model files to ml_models/...")

    # Save the trained model
    joblib.dump(model, MODEL_PATH)
    print(f"[SAVED] disease_model.pkl")

    # Save the symptom column names
    joblib.dump(symptom_columns, SYMPTOM_COLS_PATH)
    print(f"[SAVED] symptom_columns.pkl")

    # Save the disease class names
    joblib.dump(disease_classes, DISEASE_CLASSES_PATH)
    print(f"[SAVED] disease_classes.pkl")


# ============================================================
# STEP 5 — VERIFY SAVED FILES
# ============================================================

def verify_saved_files():
    """Confirm all three .pkl files were created successfully."""

    print(f"\n[STEP 4] Verifying saved files...")

    all_ok = True

    for path, name in [
        (MODEL_PATH,           "disease_model.pkl"),
        (SYMPTOM_COLS_PATH,    "symptom_columns.pkl"),
        (DISEASE_CLASSES_PATH, "disease_classes.pkl"),
    ]:
        size_kb = os.path.getsize(path) / 1024

        if os.path.exists(path):
            print(f"[OK] {name} — {size_kb:.1f} KB")
        else:
            print(f"[MISSING] {name} — NOT FOUND")
            all_ok = False

    return all_ok


# ============================================================
# MAIN — RUN ALL STEPS
# ============================================================

if __name__ == "__main__":

    print("=" * 55)
    print("  AI Health Assistant — Model Training Script")
    print("=" * 55)

    # Step 1: Verify paths
    verify_paths()

    # Step 2: Load dataset
    df, symptom_columns = load_dataset()

    # Step 3: Train model
    model, disease_classes = train_model(df, symptom_columns)

    # Step 4: Save artifacts
    save_artifacts(model, symptom_columns, disease_classes)

    # Step 5: Verify files
    ok = verify_saved_files()

    print()

    if ok:
        print("=" * 55)
        print("  SUCCESS — All model files saved.")
        print("  You can now start the FastAPI server.")
        print("  Run: python -m uvicorn main:app --reload")
        print("=" * 55)
    else:
        print("[ERROR] Some files were not saved correctly.")
        print("Please check the errors above and try again.")