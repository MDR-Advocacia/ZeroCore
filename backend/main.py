from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routers import auth, announcements, employees
from database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ZeroCore API")

# 1. Configuração de CORS 
# 🔥 CRÍTICO: Quando usamos Cookies, não podemos usar ["*"].
# Precisamos listar explicitamente os endereços do Frontend!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Registro das Rotas
app.include_router(auth.router)
app.include_router(announcements.router)
app.include_router(employees.router)

# 3. Configuração de Arquivos Estáticos (Uploads)
UPLOAD_DIR = "static/uploads/announcements"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "ZeroCore API está online e funcional"}