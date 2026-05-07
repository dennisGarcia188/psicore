"""
Script para criar o usuário administrador master do PsiCore.
Execute UMA VEZ após configurar o banco:

  cd backend
  source venv/bin/activate
  python create_admin.py
"""
from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine
from models import Base, User
from utils import get_password_hash

# ─── CONFIGURE AQUI ──────────────────────────────────────
ADMIN_NAME = "Admin PsiCore"
ADMIN_EMAIL = "admin@psicore.com"
ADMIN_PASSWORD = "PsiCore@Admin2026!"  # Troque por uma senha forte!
# ─────────────────────────────────────────────────────────

Base.metadata.create_all(bind=engine)
db = SessionLocal()

existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
if existing:
    print(f"⚠️  Usuário admin já existe: {ADMIN_EMAIL}")
else:
    admin = User(
        name=ADMIN_NAME,
        email=ADMIN_EMAIL,
        hashed_password=get_password_hash(ADMIN_PASSWORD),
        is_admin=True,
        is_active=True,
        subscription_status="Ativo",
    )
    db.add(admin)
    db.commit()
    print(f"✅ Admin criado com sucesso!")
    print(f"   E-mail: {ADMIN_EMAIL}")
    print(f"   Senha: {ADMIN_PASSWORD}")
    print(f"\n⚠️  Altere a senha após o primeiro login!")

db.close()
