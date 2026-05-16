from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas
from routers.auth import get_current_user
from email_service import send_appointment_email, send_cancellation_email

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)

@router.get("/", response_model=List[schemas.AppointmentWithPatient])
def read_all_appointments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    appointments = db.query(models.Appointment).join(models.Patient).filter(models.Patient.owner_id == current_user.id).order_by(models.Appointment.date_time.desc()).all()
    for appt in appointments:
        appt.patient_name = appt.patient.name
    return appointments

def verify_patient_owner(patient_id: int, db: Session, current_user: models.User):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id, models.Patient.owner_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return patient

@router.post("/", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify patient ownership
    patient = db.query(models.Patient).filter(models.Patient.id == appointment.patient_id, models.Patient.owner_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")

    # Double booking check
    overlapping = db.query(models.Appointment).join(models.Patient).filter(
        models.Appointment.date_time == appointment.date_time,
        models.Patient.owner_id == current_user.id
    ).first()
    if overlapping:
        raise HTTPException(status_code=409, detail="Já existe um agendamento marcado para este horário.")

    db_appointment = models.Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Enviar e-mail em background
    background_tasks.add_task(send_appointment_email, patient.name, patient.email, str(db_appointment.date_time), current_user.name)
    
    models.log_audit(db, current_user.id, "Create", "Appointment", db_appointment.id)
    return db_appointment

@router.get("/patient/{patient_id}", response_model=List[schemas.Appointment])
def read_patient_appointments(patient_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    verify_patient_owner(patient_id, db, current_user)
    appointments = db.query(models.Appointment).filter(models.Appointment.patient_id == patient_id).order_by(models.Appointment.date_time.desc()).all()
    models.log_audit(db, current_user.id, "View", "Appointments", patient_id)
    return appointments

@router.put("/{appointment_id}", response_model=schemas.Appointment)
def update_appointment(appointment_id: int, appointment_update: schemas.AppointmentCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    verify_patient_owner(appointment_update.patient_id, db, current_user)
    
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
        
    # Extra security check: make sure the existing appointment actually belongs to the user's patient
    verify_patient_owner(db_appointment.patient_id, db, current_user)

    # Double booking check (if changing time)
    if appointment_update.date_time != db_appointment.date_time:
        overlapping = db.query(models.Appointment).join(models.Patient).filter(
            models.Appointment.date_time == appointment_update.date_time,
            models.Patient.owner_id == current_user.id
        ).first()
        if overlapping:
            raise HTTPException(status_code=409, detail="Já existe um agendamento marcado para este horário.")

    for key, value in appointment_update.model_dump().items():
        setattr(db_appointment, key, value)
        
    db.commit()
    db.refresh(db_appointment)
    
    if appointment_update.status == "Cancelada":
        patient = db.query(models.Patient).filter(models.Patient.id == db_appointment.patient_id).first()
        background_tasks.add_task(send_cancellation_email, patient.name, patient.email, str(db_appointment.date_time), current_user.name)
        
    models.log_audit(db, current_user.id, "Update", "Appointment", db_appointment.id)
    return db_appointment

@router.patch("/{appointment_id}", response_model=schemas.Appointment)
def patch_appointment(appointment_id: int, data: schemas.AppointmentPatch, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Atualiza parcialmente um agendamento (ex: só o status ou só a data)."""
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
    verify_patient_owner(db_appointment.patient_id, db, current_user)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_appointment, field, value)

    db.commit()
    db.refresh(db_appointment)
    
    if data.status == "Cancelada":
        patient = db.query(models.Patient).filter(models.Patient.id == db_appointment.patient_id).first()
        background_tasks.add_task(send_cancellation_email, patient.name, patient.email, str(db_appointment.date_time), current_user.name)

    models.log_audit(db, current_user.id, "Update", "Appointment", db_appointment.id)
    return db_appointment

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
        
    verify_patient_owner(db_appointment.patient_id, db, current_user)
    
    db.delete(db_appointment)
    db.commit()
    models.log_audit(db, current_user.id, "Delete", "Appointment", appointment_id)
    return None
