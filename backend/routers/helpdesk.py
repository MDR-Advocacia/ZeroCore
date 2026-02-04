# Local: ZeroCore/backend/routers/helpdesk.py
from fastapi import APIRouter
from typing import List, Dict

router = APIRouter()

# Simulação de base de dados para o bônus
@router.get("/")
async def list_tickets() -> List[Dict]:
    """
    Retorna a lista de chamados com os pesos e pontos 
    calculados para o sistema de bônus ZeroCore.
    """
    return [
        {
            "id": 1, 
            "task": "Ajuste de Ponto Murilo", 
            "status": "Em Execução", 
            "categoria": "Lvl 1",
            "peso_base": 1.0,
            "pontos_estimados": 10,
            "tecnico": "Cleyton"
        },
        {
            "id": 2, 
            "task": "Erro de Autenticação PJE", 
            "status": "Aberto", 
            "categoria": "Lvl 3",
            "peso_base": 2.5,
            "pontos_estimados": 45,
            "tecnico": "Neto"
        },
        {
            "id": 3, 
            "task": "Sincronização Massiva AD", 
            "status": "Concluído", 
            "categoria": "Lvl 2",
            "peso_base": 1.5,
            "pontos_reais": 25,
            "tecnico": "Pedro"
        }
    ]

@router.get("/stats")
async def get_helpdesk_stats():
    """
    Retorna estatísticas globais para o Dashboard principal.
    """
    return {
        "tickets_abertos": 12,
        "sla_medio": "1h 14min",
        "bonus_pool_acumulado": 1850.50,
        "uptime_sistemas": "99.9%"
    }