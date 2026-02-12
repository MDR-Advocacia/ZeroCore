from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.announcements import Announcement
from auth.security import get_current_user

router = APIRouter(prefix="/announcements", tags=["Mural de Avisos"])

@router.get("/")
async def list_announcements(
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role")
    user_depts = current_user.get("depts", [])
    
    query = db.query(Announcement)

    visible_categories = ["GENERAL", "TECH"]
    if role in ["admin", "diretoria", "coordenador", "supervisor"]:
        visible_categories.append("OPS_MGMT")
    if role in ["admin", "diretoria", "coordenador"]:
        visible_categories.append("STRAT_MGMT")

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
    role = current_user.get("role")
    user_depts = current_user.get("depts", [])
    permissions = current_user.get("permissions", []) 
    
    category = ann.get("category")
    can_post = False
    
    # 1. Poder Supremo
    if role == "admin": 
        can_post = True

    # 2. Avisos Gerais
    # Regra Nova: Só quem tem a flag 'post_general' (RH, TI, Mkt, Coord, Dir) pode postar.
    # Supervisores comuns NÃO TERÃO essa flag.
    elif category == "GENERAL" and "post_general" in permissions:
        can_post = True

    # 3. Avisos Técnicos
    elif category == "TECH" and ("post_tech" in permissions or "post_general" in permissions):
        can_post = True

    # 4. Gestão
    elif category == "OPS_MGMT" and role in ["diretoria", "coordenador", "supervisor"]:
        can_post = True

    # 5. Setor Específico
    elif category == "SECTOR":
        target = ann.get("target_dept")
        
        # Cenário A: Quem tem poder geral (RH/TI/Coord) pode postar em QUALQUER setor
        if "post_general" in permissions:
            can_post = True
            
        # Cenário B: Supervisor/Coord só pode postar no PRÓPRIO setor
        elif role in ["supervisor", "coordenador"] and target in user_depts:
            can_post = True

    if not can_post:
        raise HTTPException(
            status_code=403, 
            detail="Permissão negada: Você não pode postar nesta categoria ou para este setor."
        )

    new_ann = Announcement(
        title=ann["title"],
        content=ann["content"],
        category=category,
        target_dept=ann.get("target_dept"),
    )
    
    db.add(new_ann)
    db.commit()
    return {"message": "Aviso publicado com sucesso."}