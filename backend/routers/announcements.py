import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, List
from database import get_db
from models.announcements import Announcement
from models.users import User, Employee
from auth.security import get_current_user

router = APIRouter(prefix="/announcements", tags=["Mural de Avisos"])

UPLOAD_DIR = "static/uploads/announcements"

@router.get("")
async def list_announcements(
    category: Optional[str] = Query(None),
    show_archived: bool = Query(False),
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """
    Lista os anúncios baseando-se em permissões, filtros de categoria e estado de arquivamento.
    """
    role = current_user.get("role")
    user_depts = current_user.get("depts", [])
    permissions = current_user.get("permissions", [])
    
    # 1. Filtro de Arquivados (Apenas gestores/TI/RH podem alternar para ver arquivados)
    can_see_archived = role in ["admin", "diretoria", "coordenador"] or \
                       "post_general" in permissions or \
                       "post_tech" in permissions

    is_archived_target = True if (show_archived and can_see_archived) else False
    
    # Inicia a query base filtrando pelo estado de arquivamento
    query = db.query(Announcement).filter(Announcement.is_archived == is_archived_target)

    # 2. Filtro de Categoria (opcional vindo do front-end)
    if category and category != "ALL":
        query = query.filter(Announcement.category == category)

    # 3. Regra de Visibilidade (O que o usuário PODE ver)
    visible_categories = ["GENERAL", "TECH"]
    if role in ["admin", "diretoria", "coordenador", "supervisor"]:
        visible_categories.append("OPS_MGMT")
    
    query = query.filter(
        or_(
            Announcement.category.in_(visible_categories),
            and_(Announcement.category == "SECTOR", Announcement.target_dept.in_(user_depts))
        )
    )

    announcements = query.order_by(Announcement.created_at.desc()).all()

    results = []
    for ann in announcements:
        has_acknowledged = any(str(u.id) == current_user["id"] for u in ann.acknowledged_by)
        results.append({
            "id": str(ann.id),
            "title": ann.title,
            "content": ann.content,
            "category": ann.category,
            "target_dept": ann.target_dept,
            "attachment_url": ann.attachment_url,
            "attachment_name": ann.attachment_name,
            "created_at": ann.created_at,
            "author_name": ann.author.employee.full_name if ann.author and ann.author.employee else "Sistema",
            "has_acknowledged": has_acknowledged,
            "ack_count": len(ann.acknowledged_by),
            "is_archived": ann.is_archived
        })
    return results

@router.post("")
async def create_announcement(
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form(...),
    target_dept: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """
    Cria um novo anúncio com suporte a upload.
    """
    role = current_user.get("role")
    permissions = current_user.get("permissions", [])
    user_depts = current_user.get("depts", [])

    can_post = False
    if role == "admin": can_post = True
    elif category == "GENERAL" and "post_general" in permissions: can_post = True
    elif category == "TECH" and ("post_tech" in permissions or "post_general" in permissions): can_post = True
    elif category == "SECTOR":
        if "post_general" in permissions: can_post = True
        elif (role in ["supervisor", "coordenador"]) and target_dept in user_depts: can_post = True

    if not can_post:
        raise HTTPException(status_code=403, detail="Sem permissão para publicar.")

    file_url, file_name = None, None
    if file:
        file_ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4()}{file_ext}"
        if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        with open(file_path, "wb") as buffer: buffer.write(await file.read())
        file_url, file_name = f"/static/uploads/announcements/{unique_name}", file.filename

    new_ann = Announcement(
        title=title, content=content, category=category, target_dept=target_dept,
        attachment_url=file_url, attachment_name=file_name, created_by=current_user["id"]
    )
    db.add(new_ann)
    db.commit()
    db.refresh(new_ann)
    return {"message": "Aviso publicado.", "id": str(new_ann.id)}

@router.post("{ann_id}/acknowledge")
async def acknowledge_announcement(
    ann_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not ann: raise HTTPException(status_code=404, detail="Aviso não encontrado.")
    if user not in ann.acknowledged_by:
        ann.acknowledged_by.append(user)
        db.commit()
    return {"message": "Ciência registrada."}

@router.post("{ann_id}/archive")
async def archive_announcement(
    ann_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Arquiva um aviso.
    """
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann: raise HTTPException(status_code=404)
    
    is_author = str(ann.created_by) == current_user["id"]
    is_privileged = current_user["role"] in ["admin", "diretoria", "coordenador"]
    
    if not (is_author or is_privileged):
        raise HTTPException(status_code=403, detail="Sem permissão para arquivar.")
        
    ann.is_archived = True
    db.commit()
    return {"message": "Aviso arquivado."}

@router.post("{ann_id}/unarchive")
async def unarchive_announcement(
    ann_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Desarquiva um aviso (Restaura para o mural principal).
    """
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann: raise HTTPException(status_code=404, detail="Aviso não encontrado.")
    
    # Mesma regra de permissão do arquivamento
    is_author = str(ann.created_by) == current_user["id"]
    is_privileged = current_user["role"] in ["admin", "diretoria", "coordenador"]
    
    if not (is_author or is_privileged):
        raise HTTPException(status_code=403, detail="Sem permissão para desarquivar este aviso.")
        
    ann.is_archived = False
    db.commit()
    return {"message": "Aviso restaurado com sucesso."}

@router.get("{ann_id}/logs")
async def get_announcement_logs(
    ann_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Retorna a lista de ciência com nomes completos.
    """
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann: raise HTTPException(status_code=404)

    # Acessamos u.employee.full_name sem qualquer manipulação de string para garantir o nome completo
    acknowledged = [
        {
            "name": u.employee.full_name if (u.employee and u.employee.full_name) else u.username, 
            "dept": u.employee.department if u.employee else "N/A"
        }
        for u in ann.acknowledged_by
    ]

    pending_query = db.query(User).join(Employee).filter(User.is_active == True)
    if ann.category == "SECTOR":
        pending_query = pending_query.filter(Employee.department.ilike(f"%{ann.target_dept}%"))
    
    all_target_users = pending_query.all()
    ack_ids = [u.id for u in ann.acknowledged_by]
    
    pending = [
        {
            "name": u.employee.full_name if (u.employee and u.employee.full_name) else u.username, 
            "dept": u.employee.department if u.employee else "N/A"
        }
        for u in all_target_users if u.id not in ack_ids
    ]

    return {"acknowledged": acknowledged, "pending": pending}