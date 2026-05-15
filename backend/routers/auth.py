from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import jwt
import datetime

from database import get_db
import models, schemas, utils
from email_service import send_welcome_email

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado.")
    
    hashed_password = utils.get_password_hash(user.password)
    trial_end = datetime.datetime.utcnow() + datetime.timedelta(days=15)
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        crp=user.crp,
        specialty=user.specialty,
        phone=user.phone,
        trial_expires_at=trial_end,
        subscription_status=models.SubscriptionStatus.TRIAL.value,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Criar configurações do consultório automaticamente
    clinic = models.ClinicSettings(
        owner_id=db_user.id,
        clinic_name=user.clinic_name,
        cnpj=user.clinic_cnpj,
        address=user.clinic_address,
        phone=user.clinic_phone,
    )
    db.add(clinic)
    db.commit()

    # Enviar e-mail de boas-vindas em background
    background_tasks.add_task(
        send_welcome_email,
        psychologist_name=db_user.name,
        psychologist_email=db_user.email
    )

    return db_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sua conta está suspensa. Entre em contato com o suporte.",
        )

    # Registrar last_login
    user.last_login = datetime.datetime.utcnow()
    db.commit()

    access_token_expires = utils.timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/me/trial-status")
def get_trial_status(current_user: models.User = Depends(get_current_user)):
    """Retorna informações sobre o período trial e status da assinatura."""
    now = datetime.datetime.utcnow()
    is_trial = current_user.subscription_status == models.SubscriptionStatus.TRIAL.value
    trial_active = (
        is_trial and
        current_user.trial_expires_at is not None and
        current_user.trial_expires_at > now
    )
    days_remaining = None
    if is_trial and current_user.trial_expires_at:
        delta = current_user.trial_expires_at - now
        days_remaining = max(0, delta.days)
    
    trial_expired = is_trial and (current_user.trial_expires_at is None or current_user.trial_expires_at <= now)

    return {
        "subscription_status": current_user.subscription_status,
        "is_trial": is_trial,
        "trial_active": trial_active,
        "trial_expired": trial_expired,
        "trial_expires_at": current_user.trial_expires_at.isoformat() if current_user.trial_expires_at else None,
        "days_remaining": days_remaining,
        "plan_price": current_user.plan_price,
    }

@router.put("/me", response_model=schemas.User)
def update_me(data: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Atualiza perfil do psicólogo e dados do consultório."""
    # Atualiza dados do usuário
    for field in ["name", "crp", "specialty", "phone"]:
        val = getattr(data, field)
        if val is not None:
            setattr(current_user, field, val)
    
    # Atualiza ou cria dados do consultório
    clinic = db.query(models.ClinicSettings).filter(models.ClinicSettings.owner_id == current_user.id).first()
    if not clinic:
        clinic = models.ClinicSettings(owner_id=current_user.id)
        db.add(clinic)
    
    if data.clinic_name is not None: clinic.clinic_name = data.clinic_name
    if data.clinic_cnpj is not None: clinic.cnpj = data.clinic_cnpj
    if data.clinic_address is not None: clinic.address = data.clinic_address
    if data.clinic_phone is not None: clinic.phone = data.clinic_phone

    db.commit()
    db.refresh(current_user)
    return current_user
