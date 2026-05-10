from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
import datetime
import enum
from database import Base

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
    notes = Column(Text, nullable=True)
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
