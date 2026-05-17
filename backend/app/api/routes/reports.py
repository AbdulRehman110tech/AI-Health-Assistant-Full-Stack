# ============================================================
# app/api/routes/reports.py
#
# Endpoints:
#   POST /api/v1/reports/upload       — upload medical report
#   GET  /api/v1/reports              — list patient reports
#   GET  /api/v1/reports/{report_id}  — download report
# ============================================================

import os
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.services.report_service import save_report, get_patient_reports, get_report_by_id

router = APIRouter(prefix="/api/v1/reports", tags=["Medical Reports"])


def get_patient_or_404(db, user_id):
    patient = db.query(Patient).filter(Patient.user_id == user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail={"status": "error", "message": "Patient profile not found."})
    return patient


@router.post("/upload", status_code=201, summary="Upload Medical Report")
async def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = get_patient_or_404(db, current_user.id)

    # Get file extension
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""

    try:
        content = await file.read()
        report = save_report(
            db=db,
            patient_id=patient.id,
            original_filename=file.filename,
            file_content=content,
            file_type=ext,
        )
        return {
            "status":    "success",
            "message":   "Report uploaded successfully.",
            "report_id": report.id,
            "file_name": report.original_file_name,
            "file_type": report.file_type,
            "uploaded_at": report.upload_timestamp.isoformat() if report.upload_timestamp else None,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"status": "error", "message": str(e)})


@router.get("/", status_code=200, summary="List My Reports")
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = get_patient_or_404(db, current_user.id)
    reports = get_patient_reports(db, patient.id)

    return {
        "status": "success",
        "total":  len(reports),
        "reports": [
            {
                "id":          r.id,
                "file_name":   r.original_file_name,
                "file_type":   r.file_type,
                "uploaded_at": r.upload_timestamp.isoformat() if r.upload_timestamp else None,
            }
            for r in reports
        ],
    }


@router.get("/{report_id}", summary="Download Report")
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = get_patient_or_404(db, current_user.id)

    try:
        report = get_report_by_id(db, report_id, patient.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"status": "error", "message": str(e)})
    except PermissionError:
        raise HTTPException(status_code=403, detail={"status": "error", "message": "Access denied."})

    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail={"status": "error", "message": "File not found on server."})

    return FileResponse(
        path=report.file_path,
        filename=report.original_file_name,
        media_type="application/octet-stream",
    )