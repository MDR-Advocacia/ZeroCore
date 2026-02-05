from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, helpdesk, announcements
from auth.security import get_current_user

# Garante a criação das novas tabelas (Announcements)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ZeroCore v3.0 - MDR Advocacia")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos Roteadores
app.include_router(auth.router)
app.include_router(helpdesk.router)
app.include_router(announcements.router)

@app.get("/")
async def root():
    return {"message": "ZeroCore API Online", "version": "3.1.0"}

@app.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user