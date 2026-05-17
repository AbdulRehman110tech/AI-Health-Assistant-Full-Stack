# ============================================================
# seed_doctors.py
# Seeds database with 30 doctors
# Run: python seed_doctors.py
# ============================================================

from app.database.database import SessionLocal, engine, Base
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.medical_report import MedicalReport
from app.models.user import User
from app.models.patient import Patient
from app.models.prediction_history import PredictionHistory

Base.metadata.create_all(bind=engine)

doctors = [
    # Cardiologists
    {"full_name": "Dr. Ahmed Raza",        "specialization": "Cardiologist",       "hospital_name": "Aga Khan University Hospital",      "years_of_experience": 18, "availability_status": True,  "consultation_fee": 3000},
    {"full_name": "Dr. Sara Malik",         "specialization": "Cardiologist",       "hospital_name": "Shifa International Hospital",       "years_of_experience": 12, "availability_status": True,  "consultation_fee": 2500},
    {"full_name": "Dr. Usman Tariq",        "specialization": "Cardiologist",       "hospital_name": "Services Hospital Lahore",           "years_of_experience": 20, "availability_status": False, "consultation_fee": 2000},
    # Neurologists
    {"full_name": "Dr. Hina Baig",          "specialization": "Neurologist",        "hospital_name": "Jinnah Hospital Lahore",             "years_of_experience": 15, "availability_status": True,  "consultation_fee": 2800},
    {"full_name": "Dr. Faisal Mehmood",     "specialization": "Neurologist",        "hospital_name": "Liaquat National Hospital",          "years_of_experience": 10, "availability_status": True,  "consultation_fee": 2200},
    {"full_name": "Dr. Nadia Qureshi",      "specialization": "Neurologist",        "hospital_name": "Aga Khan University Hospital",       "years_of_experience": 14, "availability_status": False, "consultation_fee": 3000},
    # Dermatologists
    {"full_name": "Dr. Bilal Chaudhry",     "specialization": "Dermatologist",      "hospital_name": "Mayo Hospital Lahore",               "years_of_experience": 8,  "availability_status": True,  "consultation_fee": 1500},
    {"full_name": "Dr. Ayesha Farooq",      "specialization": "Dermatologist",      "hospital_name": "Shifa International Hospital",       "years_of_experience": 11, "availability_status": True,  "consultation_fee": 2000},
    # Orthopedic
    {"full_name": "Dr. Kamran Sheikh",      "specialization": "Orthopedic",         "hospital_name": "Ghurki Trust Teaching Hospital",     "years_of_experience": 16, "availability_status": True,  "consultation_fee": 2500},
    {"full_name": "Dr. Rabia Nawaz",        "specialization": "Orthopedic",         "hospital_name": "Jinnah Hospital Lahore",             "years_of_experience": 9,  "availability_status": False, "consultation_fee": 2000},
    {"full_name": "Dr. Sohail Akhtar",      "specialization": "Orthopedic",         "hospital_name": "Services Hospital Lahore",           "years_of_experience": 22, "availability_status": True,  "consultation_fee": 2200},
    # General Physicians
    {"full_name": "Dr. Imran Ali",          "specialization": "General Physician",  "hospital_name": "Pakistan Institute of Medical Sciences", "years_of_experience": 7, "availability_status": True,  "consultation_fee": 1000},
    {"full_name": "Dr. Zara Hussain",       "specialization": "General Physician",  "hospital_name": "District Headquarters Hospital",    "years_of_experience": 5,  "availability_status": True,  "consultation_fee": 800},
    {"full_name": "Dr. Tariq Jameel",       "specialization": "General Physician",  "hospital_name": "Mayo Hospital Lahore",               "years_of_experience": 13, "availability_status": True,  "consultation_fee": 1200},
    # ENT Specialists
    {"full_name": "Dr. Asma Khalid",        "specialization": "ENT Specialist",     "hospital_name": "Shifa International Hospital",       "years_of_experience": 10, "availability_status": True,  "consultation_fee": 2000},
    {"full_name": "Dr. Waqas Zahid",        "specialization": "ENT Specialist",     "hospital_name": "Aga Khan University Hospital",       "years_of_experience": 14, "availability_status": False, "consultation_fee": 2500},
    # Gastroenterologists
    {"full_name": "Dr. Sana Mirza",         "specialization": "Gastroenterologist", "hospital_name": "Liaquat National Hospital",          "years_of_experience": 12, "availability_status": True,  "consultation_fee": 2800},
    {"full_name": "Dr. Hassan Javed",       "specialization": "Gastroenterologist", "hospital_name": "Aga Khan University Hospital",       "years_of_experience": 17, "availability_status": True,  "consultation_fee": 3000},
    {"full_name": "Dr. Maryam Anwar",       "specialization": "Gastroenterologist", "hospital_name": "Services Hospital Lahore",           "years_of_experience": 8,  "availability_status": False, "consultation_fee": 2200},
    # Pulmonologists
    {"full_name": "Dr. Adnan Iqbal",        "specialization": "Pulmonologist",      "hospital_name": "Jinnah Hospital Lahore",             "years_of_experience": 11, "availability_status": True,  "consultation_fee": 2500},
    {"full_name": "Dr. Farah Naz",          "specialization": "Pulmonologist",      "hospital_name": "Pakistan Institute of Medical Sciences", "years_of_experience": 9, "availability_status": True, "consultation_fee": 2000},
    # Psychiatrists
    {"full_name": "Dr. Omar Shahid",        "specialization": "Psychiatrist",       "hospital_name": "Fountain House Lahore",              "years_of_experience": 13, "availability_status": True,  "consultation_fee": 3000},
    {"full_name": "Dr. Lubna Rashid",       "specialization": "Psychiatrist",       "hospital_name": "Shifa International Hospital",       "years_of_experience": 16, "availability_status": False, "consultation_fee": 3500},
    {"full_name": "Dr. Saad Ullah",         "specialization": "Psychiatrist",       "hospital_name": "Mayo Hospital Lahore",               "years_of_experience": 7,  "availability_status": True,  "consultation_fee": 2500},
    # Endocrinologists
    {"full_name": "Dr. Noman Butt",         "specialization": "Endocrinologist",    "hospital_name": "Aga Khan University Hospital",       "years_of_experience": 14, "availability_status": True,  "consultation_fee": 3000},
    {"full_name": "Dr. Amna Riaz",          "specialization": "Endocrinologist",    "hospital_name": "Liaquat National Hospital",          "years_of_experience": 10, "availability_status": True,  "consultation_fee": 2500},
    # Additional
    {"full_name": "Dr. Khalid Mehmood",     "specialization": "Cardiologist",       "hospital_name": "Gulab Devi Hospital",                "years_of_experience": 19, "availability_status": True,  "consultation_fee": 2800},
    {"full_name": "Dr. Iram Shahzad",       "specialization": "Dermatologist",      "hospital_name": "Ittefaq Hospital",                   "years_of_experience": 6,  "availability_status": True,  "consultation_fee": 1800},
    {"full_name": "Dr. Naveed Zafar",       "specialization": "General Physician",  "hospital_name": "Hameed Latif Hospital",              "years_of_experience": 4,  "availability_status": True,  "consultation_fee": 1000},
    {"full_name": "Dr. Samina Pervaiz",     "specialization": "Neurologist",        "hospital_name": "Ittefaq Hospital",                   "years_of_experience": 11, "availability_status": False, "consultation_fee": 2500},
]

db = SessionLocal()

existing = db.query(Doctor).count()
if existing > 0:
    print(f"[INFO] {existing} doctors already exist. Skipping seed.")
    db.close()
    exit()

for d in doctors:
    db.add(Doctor(**d))

db.commit()
print(f"[OK] {len(doctors)} doctors seeded successfully.")
db.close()