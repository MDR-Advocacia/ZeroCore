import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de conexão vinda do ambiente (Docker/Coolify)
# Padrão: postgresql://usuario:senha@host:porta/nome_do_banco
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/zerocore")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Função para injetar a sessão do banco nas rotas do FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()