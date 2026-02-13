from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Importação dos Roteadores
from routers import auth, announcements
from database import engine, Base

# Cria as tabelas se elas não existirem (Fallback ao Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ZeroCore API")

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, substitua pelo domínio do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro das Rotas (Onde o 404 acontece se faltar)
app.include_router(auth.router)
app.include_router(announcements.router)

# Configuração de Arquivos Estáticos (Uploads)
# Garante que a pasta existe antes de montar
UPLOAD_DIR = "static/uploads/announcements"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

# Monta a rota /static para servir arquivos físicos
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "ZeroCore API está online"}