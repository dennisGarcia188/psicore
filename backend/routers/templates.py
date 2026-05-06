from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas
from routers.auth import get_current_user

router = APIRouter(
    prefix="/templates",
    tags=["Templates"]
)

@router.post("/", response_model=schemas.RecordTemplate)
def create_template(template: schemas.RecordTemplateCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_template = models.RecordTemplate(**template.model_dump(), owner_id=current_user.id)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.get("/", response_model=List[schemas.RecordTemplate])
def read_templates(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    templates = db.query(models.RecordTemplate).filter(models.RecordTemplate.owner_id == current_user.id).all()
    return templates

@router.put("/{template_id}", response_model=schemas.RecordTemplate)
def update_template(template_id: int, template_update: schemas.RecordTemplateCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_template = db.query(models.RecordTemplate).filter(models.RecordTemplate.id == template_id, models.RecordTemplate.owner_id == current_user.id).first()
    if db_template is None:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")
    
    for key, value in template_update.model_dump().items():
        setattr(db_template, key, value)
        
    db.commit()
    db.refresh(db_template)
    return db_template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(template_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_template = db.query(models.RecordTemplate).filter(models.RecordTemplate.id == template_id, models.RecordTemplate.owner_id == current_user.id).first()
    if db_template is None:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")
    
    db.delete(db_template)
    db.commit()
    return None
