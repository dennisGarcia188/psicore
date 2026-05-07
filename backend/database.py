import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Lê a URL do banco de dados da variável de ambiente.
# Facilita a troca para AWS RDS em produção sem alterar código.
# Fallback: PostgreSQL local via Docker (docker-compose.yml)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://psicore:psicore_secret@localhost:5432/psicore"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
