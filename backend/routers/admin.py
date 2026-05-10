from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

from database import get_db
import models, schemas, utils
from routers.auth import get_current_user
from email_service import send_block_email, send_unblock_email, send_charge_email

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Schemas internos do admin ──────────────────────────────────────────────────

class AdminUserView(BaseModel):
    id: int
    name: str
    email: str
    crp: Optional[str] = None
    specialty: Optional[str] = None
    is_active: bool
    is_admin: bool
    subscription_status: str
    plan_price: float = 0.0
    next_billing_date: Optional[datetime.datetime] = None
    created_at: Optional[datetime.datetime] = None
    last_login: Optional[datetime.datetime] = None
    patient_count: int = 0

    class Config:
        from_attributes = True

class AdminUserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    crp: Optional[str] = None
    specialty: Optional[str] = None

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    crp: Optional[str] = None
    specialty: Optional[str] = None
    plan_price: Optional[float] = None
    next_billing_date: Optional[datetime.datetime] = None
    subscription_status: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    subscription_status: str  # "Trial" | "Ativo" | "Inadimplente" | "Cancelado"

class ChargeView(BaseModel):
    id: int
    amount: float
    due_date: datetime.datetime
    status: str
    paid_at: Optional[datetime.datetime] = None
    reference_month: str
    user_id: int
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

class ChargeCreate(BaseModel):
    user_id: int
    amount: float
    due_date: datetime.datetime
    reference_month: str


# ── Dependência de admin ───────────────────────────────────────────────────────

def require_admin(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito ao administrador.")
    return current_user


# ── Rotas ──────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[AdminUserView])
def list_all_users(db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    """Lista todos os psicólogos cadastrados."""
    users = db.query(models.User).filter(models.User.is_admin == False).order_by(models.User.created_at.desc()).all()
    result = []
    for u in users:
        count = db.query(models.Patient).filter(models.Patient.owner_id == u.id).count()
        result.append(AdminUserView(
            id=u.id, name=u.name, email=u.email, crp=u.crp, specialty=u.specialty,
            is_active=u.is_active, is_admin=u.is_admin,
            subscription_status=u.subscription_status or "Trial",
            plan_price=u.plan_price or 0.0,
            next_billing_date=u.next_billing_date,
            created_at=u.created_at, last_login=u.last_login,
            patient_count=count
        ))
    return result


@router.post("/users/{user_id}/block", response_model=AdminUserView)
def block_user(user_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    """Bloqueia o acesso de um psicólogo e envia e-mail de notificação."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Não é possível bloquear um administrador.")

    user.is_active = False
    db.commit()
    db.refresh(user)

    # E-mail de notificação de bloqueio
    background_tasks.add_task(send_block_email, user.name, user.email)

    count = db.query(models.Patient).filter(models.Patient.owner_id == user.id).count()
    return AdminUserView(**{**user.__dict__, "patient_count": count})


@router.post("/users/{user_id}/unblock", response_model=AdminUserView)
def unblock_user(user_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    """Reativa o acesso de um psicólogo."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    user.is_active = True
    db.commit()
    db.refresh(user)

    background_tasks.add_task(send_unblock_email, user.name, user.email)

    count = db.query(models.Patient).filter(models.Patient.owner_id == user.id).count()
    return AdminUserView(**{**user.__dict__, "patient_count": count})


@router.patch("/users/{user_id}/subscription", response_model=AdminUserView)
def update_subscription(user_id: int, data: SubscriptionUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    """Atualiza o status de assinatura de um psicólogo."""
    valid = ["Trial", "Ativo", "Inadimplente", "Cancelado"]
    if data.subscription_status not in valid:
        raise HTTPException(status_code=400, detail=f"Status inválido. Use: {valid}")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    user.subscription_status = data.subscription_status
    db.commit()
    db.refresh(user)

    count = db.query(models.Patient).filter(models.Patient.owner_id == user.id).count()
    return AdminUserView(**{**user.__dict__, "patient_count": count})


@router.post("/users", response_model=AdminUserView)
def create_user_by_admin(data: AdminUserCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    """Admin cria um psicólogo manualmente."""
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    user = models.User(
        name=data.name, email=data.email,
        hashed_password=utils.get_password_hash(data.password),
        crp=data.crp, specialty=data.specialty,
        is_active=True, subscription_status="Trial",
        plan_price=0.0
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AdminUserView(**{**user.__dict__, "patient_count": 0})


@router.patch("/users/{user_id}", response_model=AdminUserView)
def update_user_by_admin(user_id: int, data: AdminUserUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    """Atualiza dados de um psicólogo."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    update_data = data.dict(exclude_unset=True)
    
    # Se mudar o e-mail, verificar unicidade
    if "email" in update_data and update_data["email"] != user.email:
        if db.query(models.User).filter(models.User.email == update_data["email"]).first():
            raise HTTPException(status_code=400, detail="E-mail já cadastrado por outro usuário.")

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    
    count = db.query(models.Patient).filter(models.Patient.owner_id == user.id).count()
    return AdminUserView(**{**user.__dict__, "patient_count": count})


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    """Remove permanentemente um psicólogo e todos os seus dados."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Não é possível excluir um administrador.")
    db.delete(user)
    db.commit()


# ── Cobranças ─────────────────────────────────────────────────────────────────

@router.get("/charges", response_model=List[ChargeView])
def list_charges(
    month: Optional[str] = None, 
    year: Optional[str] = None, 
    user_id: Optional[int] = None,
    db: Session = Depends(get_db), 
    admin: models.User = Depends(require_admin)
):
    """Lista cobranças com filtros opcionais."""
    query = db.query(models.Charge)
    
    if user_id:
        query = query.filter(models.Charge.user_id == user_id)
    
    if month and year:
        ref = f"{year}-{month.zfill(2)}"
        query = query.filter(models.Charge.reference_month == ref)
    elif year:
        query = query.filter(models.Charge.reference_month.like(f"{year}-%"))

    charges = query.order_by(models.Charge.due_date.desc()).all()
    
    result = []
    for c in charges:
        view = ChargeView.from_orm(c)
        view.user_name = c.user.name
        result.append(view)
    return result


@router.post("/charges", response_model=ChargeView)
def create_charge(
    data: ChargeCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    admin: models.User = Depends(require_admin)
):
    """Gera uma nova cobrança e envia e-mail."""
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    charge = models.Charge(
        amount=data.amount,
        due_date=data.due_date,
        reference_month=data.reference_month,
        user_id=data.user_id,
        status="Pendente"
    )
    db.add(charge)
    db.commit()
    db.refresh(charge)

    # Enviar e-mail de cobrança
    background_tasks.add_task(
        send_charge_email, 
        user.name, 
        user.email, 
        charge.amount, 
        charge.due_date.isoformat(), 
        charge.reference_month
    )

    view = ChargeView.from_orm(charge)
    view.user_name = user.name
    return view


@router.patch("/charges/{charge_id}/pay", response_model=ChargeView)
def mark_charge_as_paid(
    charge_id: int, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(require_admin)
):
    """Marca uma cobrança como paga."""
    charge = db.query(models.Charge).filter(models.Charge.id == charge_id).first()
    if not charge:
        raise HTTPException(status_code=404, detail="Cobrança não encontrada.")

    charge.status = "Pago"
    charge.paid_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(charge)

    view = ChargeView.from_orm(charge)
    view.user_name = charge.user.name
    return view
