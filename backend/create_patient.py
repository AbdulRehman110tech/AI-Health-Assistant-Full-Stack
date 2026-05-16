# Run this once to create a patient profile for testuser
# python create_patient.py

from app.database.database import SessionLocal
from app.models.user import User
from app.models.patient import Patient
from app.models.prediction_history import PredictionHistory

db = SessionLocal()

user = db.query(User).filter(User.username == "testuser").first()

if not user:
    print("[ERROR] User 'testuser' not found. Register first.")
    db.close()
    exit()

print(f"[OK] User found: ID={user.id}, username={user.username}")

existing = db.query(Patient).filter(Patient.user_id == user.id).first()
if existing:
    print(f"[OK] Patient already exists: ID={existing.id}")
    db.close()
    exit()

patient = Patient(
    user_id=user.id,
    full_name="Test User",
    age=25,
    gender="Male",
    phone_number="0300-0000000"
)

db.add(patient)
db.commit()
db.refresh(patient)

print(f"[OK] Patient created: ID={patient.id}")
db.close()