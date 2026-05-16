from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator
import datetime
import enum
import os
from database import Base

# Setup Encryption
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
fernet = None
if ENCRYPTION_KEY:
    try:
        from cryptography.fernet import Fernet
        fernet = Fernet(ENCRYPTION_KEY)
    except ImportError:
        pass

class EncryptedText(TypeDecorator):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None and fernet:
            return fernet.encrypt(str(value).encode('utf-8')).decode('utf-8')
        return value

    def process_result_value(self, value, dialect):
        if value is not None and fernet:
            try:
                return fernet.decrypt(str(value).encode('utf-8')).decode('utf-8')
            except Exception:
                # Fallback para leitura de dados não-criptografados legados
                return value
        return value

class AppointmentStatus(str, enum.Enum):
    PENDING = "Aguardando Confirmação"
    CONFIRMED = "Confirmada"
    CANCELED = "Cancelada"
    COMPLETED = "Realizada"

class SubscriptionStatus(str, enum.Enum):
    TRIAL = "Trial"
    ACTIVE = "Ativo"
    OVERDUE = "Inadimplente"
    CANCELED = "Cancelado"

class ChargeStatus(str, enum.Enum):
    PENDING = "Pendente"
    PAID = "Pago"
    OVERDUE = "Atrasado"
    CANCELED = "Cancelado"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)

    # Dados profissionais
    crp = Column(String, nullable=True)
    specialty = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    # Controle de acesso (Admin)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    subscription_status = Column(String, default=SubscriptionStatus.TRIAL.value)
    trial_expires_at = Column(DateTime, nullable=True)  # Expiração do período gratuito
    plan_price = Column(Float, default=0.0)
    next_billing_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    patients = relationship("Patient", back_populates="owner")
    templates = relationship("RecordTemplate", back_populates="owner")
    clinic_settings = relationship("ClinicSettings", back_populates="owner", uselist=False)
    charges = relationship("Charge", back_populates="user")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    cpf = Column(String, nullable=True)
    rg = Column(String, nullable=True)
    address = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    birth_date = Column(String, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="patients")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    date_time = Column(DateTime)
    notes = Column(EncryptedText, nullable=True)
    status = Column(String, default=AppointmentStatus.CONFIRMED.value)
    fee = Column(Float, default=0.0)
    is_paid = Column(Boolean, default=False)

    patient_id = Column(Integer, ForeignKey("patients.id"))
    patient = relationship("Patient", back_populates="appointments")

class RecordTemplate(Base):
    __tablename__ = "record_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    type = Column(String)
    content = Column(Text)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="templates")

class ClinicSettings(Base):
    __tablename__ = "clinic_settings"

    id = Column(Integer, primary_key=True, index=True)
    clinic_name = Column(String, nullable=True)
    cnpj = Column(String, nullable=True)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"), unique=True)
    owner = relationship("User", back_populates="clinic_settings")

class Charge(Base):
    __tablename__ = "charges"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    due_date = Column(DateTime)
    status = Column(String, default=ChargeStatus.PENDING.value)
    paid_at = Column(DateTime, nullable=True)
    reference_month = Column(String)  # Formato "AAAA-MM"

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="charges")

class PatientDocument(Base):
    __tablename__ = "patient_documents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    document_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    sent_by_email = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    patient = relationship("Patient", backref="documents")
    owner = relationship("User", backref="documents")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")

def log_audit(db, user_id: int, action: str, entity: str, entity_id: int = None):
    audit = AuditLog(user_id=user_id, action=action, entity=entity, entity_id=entity_id)
    db.add(audit)
    db.commit()
