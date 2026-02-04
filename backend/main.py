from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, helpdesk
from auth.security import get_current_user

# Cria as tabelas no startup (Útil para o ambiente de dev do estagiário)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ZeroCore v3.0 - MDR Advocacia")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui os módulos de autenticação e helpdesk
app.include_router(auth.router)
app.include_router(helpdesk.router)

@app.get("/")
async def root():
    return {"message": "ZeroCore API Online", "version": "3.0.0"}

@app.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user