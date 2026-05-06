from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas
from routers.auth import get_current_user
from email_service import send_welcome_email

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)

@router.post("/", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_patient = models.Patient(**patient.model_dump(), owner_id=current_user.id)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    # Enviar e-mail em background
    background_tasks.add_task(send_welcome_email, db_patient.name, db_patient.email)
    
    return db_patient

@router.get("/", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    patients = db.query(models.Patient).filter(models.Patient.owner_id == current_user.id).offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id, models.Patient.owner_id == current_user.id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return patient

@router.put("/{patient_id}", response_model=schemas.Patient)
def update_patient(patient_id: int, patient_update: schemas.PatientCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id, models.Patient.owner_id == current_user.id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    
    for key, value in patient_update.model_dump().items():
        setattr(db_patient, key, value)
        
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id, models.Patient.owner_id == current_user.id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    
    db.delete(db_patient)
    db.commit()
    return None
