from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Announcement, User
from auth.security import get_current_user

router = APIRouter(prefix="/announcements", tags=["Mural de Avisos"])

@router.get("/")
async def list_announcements(
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """
    Lista avisos baseada na Role e Setor do usuário.
    Implementa a lógica de visibilidade granular solicitada.
    """
    role = current_user.get("role")
    user_depts = current_user.get("depts", [])
    
    query = db.query(Announcement)

    # 1. Avisos GERAIS e TÉCNICOS: Todos vêm.
    # 2. GESTÃO OPERACIONAL: Diretores, Coordenadores e Supervisores vêm.
    # 3. GESTÃO ESTRATÉGICA: Apenas Diretores e Coordenadores vêm.
    # 4. SETOR: Apenas se o usuário pertencer ao target_dept.

    visible_categories = ["GENERAL", "TECH"]

    if role in ["admin", "diretoria", "coordenador", "supervisor"]:
        visible_categories.append("OPS_MGMT")
    
    if role in ["admin", "diretoria", "coordenador"]:
        visible_categories.append("STRAT_MGMT")

    # Filtro base por categorias permitidas para a Role ou por Setor específico
    announcements = query.filter(
        (Announcement.category.in_(visible_categories)) |
        ((Announcement.category == "SECTOR") & (Announcement.target_dept.in_(user_depts)))
    ).order_by(Announcement.created_at.desc()).all()

    return announcements

@router.post("/")
async def create_announcement(
    ann: dict, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """
    Valida permissão de POST baseada no cargo e setor.
    """
    role = current_user.get("role")
    user_depts = current_user.get("depts", [])
    category = ann.get("category")

    # Lógica de permissão de escrita
    can_post = False
    
    if role in ["admin", "diretoria", "coordenador"]:
        can_post = True
    elif category == "GENERAL" and (role == "supervisor" or "RH" in user_depts or "DP" in user_depts or "Marketing" in user_depts):
        can_post = True
    elif category == "TECH" and ("TI" in user_depts or role == "admin"):
        can_post = True
    elif category == "OPS_MGMT" and role == "supervisor":
        can_post = True
    elif category == "SECTOR" and (role == "supervisor" and ann.get("target_dept") in user_depts):
        can_post = True
    elif category == "SECTOR" and ("RH" in user_depts or "DP" in user_depts):
        can_post = True

    if not can_post:
        raise HTTPException(status_code=403, detail="Você não tem permissão para postar nesta categoria.")

    new_ann = Announcement(
        title=ann["title"],
        content=ann["content"],
        category=category,
        target_dept=ann.get("target_dept"),
        created_by=current_user["id"] if "id" in current_user else None # Assumindo ID no token ou via busca
    )
    
    db.add(new_ann)
    db.commit()
    return {"message": "Aviso publicado com sucesso."}