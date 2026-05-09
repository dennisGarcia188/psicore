from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from routers.auth import get_current_user
from email_service import send_support_email

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)

@router.get("/", response_model=schemas.ClinicSettings)
def read_settings(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.owner_id == current_user.id).first()
    if not settings:
        # Retorna um objeto vazio caso não tenha sido criado ainda
        return schemas.ClinicSettings(id=0, owner_id=current_user.id, clinic_name="", cnpj="", address="", phone="")
    return settings

@router.put("/", response_model=schemas.ClinicSettings)
def update_settings(settings_update: schemas.ClinicSettingsCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.owner_id == current_user.id).first()
    
    if db_settings is None:
        db_settings = models.ClinicSettings(**settings_update.model_dump(), owner_id=current_user.id)
        db.add(db_settings)
    else:
        for key, value in settings_update.model_dump().items():
            setattr(db_settings, key, value)
            
    db.commit()
    db.refresh(db_settings)
    return db_settings

@router.post("/support", status_code=status.HTTP_202_ACCEPTED)
def request_support(payload: schemas.SupportRequest, background_tasks: BackgroundTasks, current_user: models.User = Depends(get_current_user)):
    background_tasks.add_task(send_support_email, current_user.name, current_user.email, payload.message)
    return {"message": "Sua mensagem foi enviada com sucesso!"}
