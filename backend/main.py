import os
from dotenv import load_dotenv
load_dotenv()  # Carrega as variáveis do arquivo .env antes de qualquer import

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, patients, appointments, templates, settings, admin

# Cria as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Gestão para Psicólogos")

# Configuração de CORS
origins = [
    "http://localhost:5173",
    "https://psicore.app.br",
    "https://www.psicore.app.br",
    "https://psicore.vercel.app",
]

# Permite adicionar mais origens via variável de ambiente (separadas por vírgula)
env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    origins.extend([o.strip() for o in env_origins.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(templates.router)
app.include_router(settings.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Sistema de Gestão para Psicólogos"}
