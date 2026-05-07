from dotenv import load_dotenv
load_dotenv()  # Carrega as variáveis do arquivo .env antes de qualquer import

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, patients, appointments, templates, settings, admin

# Cria as tabelas no banco de dados (pode ser substituído pelo Alembic no futuro, mas útil para o início)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Gestão para Psicólogos")

# Configuração de CORS
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
]

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
