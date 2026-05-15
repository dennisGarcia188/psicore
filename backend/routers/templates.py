from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import base64

from database import get_db
import models, schemas
from routers.auth import get_current_user
from email_service import _send
from pydantic import BaseModel

class SendDocumentRequest(BaseModel):
    to_email: str
    patient_id: int
    patient_name: str
    document_type: str
    pdf_base64: str  # PDF gerado no frontend, enviado em base64

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

# ── Endpoint: Enviar documento PDF por e-mail ─────────────────────────────────
@router.post("/send-document")
def send_document_email(
    req: SendDocumentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Recebe um PDF em base64 e envia por e-mail ao paciente."""
    doc_types = {
        "atestado": "Atestado Psicológico",
        "declaracao": "Declaração de Comparecimento",
        "encaminhamento": "Encaminhamento",
    }
    doc_label = doc_types.get(req.document_type, req.document_type)

    html_body = f"""
    <p>Olá, <strong>{req.patient_name}</strong>!</p>
    <p>Segue em anexo seu <strong>{doc_label}</strong> emitido por <strong>{current_user.name}</strong>.</p>
    <p style="margin-top:16px;color:#64748b;font-size:13px;">
      Este documento foi gerado pelo sistema PsiCore e é de uso exclusivo do destinatário.
    </p>
    """

    # Nota: Resend suporta attachments via API. Construímos o payload diretamente.
    import resend as resend_lib
    import os

    resend_lib.api_key = os.getenv("RESEND_API_KEY", "")
    email_from = os.getenv("EMAIL_FROM", "PsiCore <nao-responda@psicore.app.br>")

    if not resend_lib.api_key:
        # Mock em dev
        return {"status": "mock", "message": "E-mail não enviado (sem API Key). PDF gerado com sucesso."}

    try:
        pdf_bytes = base64.b64decode(req.pdf_base64)
        filename = f"{req.document_type}_{req.patient_name.replace(' ', '_')}.pdf"

        resend_lib.Emails.send({
            "from": email_from,
            "to": [req.to_email],
            "subject": f"PsiCore — {doc_label} de {req.patient_name}",
            "html": html_body,
            "attachments": [
                {
                    "filename": filename,
                    "content": list(pdf_bytes),
                }
            ],
        })
        
        # Save history
        doc_history = models.PatientDocument(
            patient_id=req.patient_id,
            document_type=req.document_type,
            sent_by_email=True,
            owner_id=current_user.id
        )
        db.add(doc_history)
        db.commit()

        return {"status": "ok", "message": f"E-mail enviado para {req.to_email}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar e-mail: {str(e)}")

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

@router.post("/history", response_model=schemas.PatientDocument)
def record_document_history(
    doc: schemas.PatientDocumentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verify patient belongs to user
    patient = db.query(models.Patient).filter(models.Patient.id == doc.patient_id, models.Patient.owner_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")

    doc_history = models.PatientDocument(
        patient_id=doc.patient_id,
        document_type=doc.document_type,
        sent_by_email=doc.sent_by_email,
        owner_id=current_user.id
    )
    db.add(doc_history)
    db.commit()
    db.refresh(doc_history)
    return doc_history
