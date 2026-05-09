from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Token ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- User ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    crp: Optional[str] = None
    specialty: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    # Dados do consultório (criados junto com o usuário)
    clinic_name: Optional[str] = None
    clinic_cnpj: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_phone: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    crp: Optional[str] = None
    specialty: Optional[str] = None
    phone: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_cnpj: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_phone: Optional[str] = None

class User(UserBase):
    id: int
    is_admin: bool = False
    is_active: bool = True
    class Config:
        from_attributes = True

# --- Patient ---
class PatientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    address: Optional[str] = None
    profession: Optional[str] = None
    emergency_contact: Optional[str] = None
    marital_status: Optional[str] = None
    birth_date: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True

# --- Appointment ---
class AppointmentBase(BaseModel):
    date_time: datetime
    notes: Optional[str] = None
    status: Optional[str] = "Confirmada"
    fee: float = 0.0
    is_paid: bool = False

class AppointmentCreate(AppointmentBase):
    patient_id: int

class Appointment(AppointmentBase):
    id: int
    patient_id: int
    class Config:
        from_attributes = True

class AppointmentPatch(BaseModel):
    date_time: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    fee: Optional[float] = None
    is_paid: Optional[bool] = None

# --- Record Template ---
class RecordTemplateBase(BaseModel):
    title: str
    type: str
    content: str

class RecordTemplateCreate(RecordTemplateBase):
    pass

class RecordTemplate(RecordTemplateBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True

# --- Clinic Settings ---
class ClinicSettingsBase(BaseModel):
    clinic_name: Optional[str] = None
    cnpj: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class ClinicSettingsCreate(ClinicSettingsBase):
    pass

class ClinicSettings(ClinicSettingsBase):
    id: int
    owner_id: int
    class Config:
        from_attributes = True
