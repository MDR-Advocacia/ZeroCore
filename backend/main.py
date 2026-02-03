from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ZeroCore API", version="3.0.0")

# Configuração de CORS - Essencial para o Frontend (Next.js) conseguir falar com o Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, mudaremos para o domínio do Coolify
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {
        "status": "online",
        "system": "ZeroCore ERP",
        "message": "Cérebro operacional do MDR Advocacia funcionando."
    }

@app.get("/auth/ad-status")
async def ad_status():
    # Placeholder para a lógica de integração que você já tem
    return {"module": "Active Directory", "status": "Ready for sync"}