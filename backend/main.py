from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, patients, appointments, templates, settings

# Cria as tabelas no banco de dados (pode ser substituído pelo Alembic no futuro, mas útil para o início)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Gestão para Psicólogos")

# Configuração de CORS
origins = [
    "http://localhost",
    "http://localhost:5173", # Porta padrão do Vite
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

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Sistema de Gestão para Psicólogos"}
