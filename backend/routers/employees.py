from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import Optional, List, Dict
from database import get_db
from models.users import User, Employee
from auth.ad_service import ADService
from auth.security import get_current_user
import uuid

router = APIRouter(prefix="/employees", tags=["Gestão de Colaboradores"])

@router.get("")
async def list_employees(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query("active"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Lista simplificada para a tabela principal."""
    query = db.query(Employee).join(User)
    
    if status == "active": 
        query = query.filter(User.is_active == True)
    elif status == "inactive": 
        query = query.filter(User.is_active == False)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Employee.full_name.ilike(search_filter)) | 
            (User.username.ilike(search_filter))
        )

    employees = query.order_by(Employee.full_name.asc()).all()
    
    return [
        {
            "id": str(e.id),
            "username": e.user.username,
            "full_name": e.full_name,
            "department": e.department,
            "title": e.title,
            "is_active": e.user.is_active,
            "email": e.user.email
        } for e in employees
    ]

@router.get("/{username}")
async def get_employee_detail(
    username: str, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Busca o perfil completo de um colaborador específico."""
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    e = user.employee
    return {
        "username": user.username,
        "full_name": e.full_name,
        "email": user.email,
        "department": e.department,
        "depts": e.meta.get("depts", [e.department]),
        "title": e.title,
        "location": e.location,
        "role": user.role,
        "last_login": user.last_login,
        "created_at": e.created_at,
        "phone": e.meta.get("phone", "")
    }

@router.put("/{username}")
async def update_employee_profile(
    username: str,
    payload: Dict = Body(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Atualiza dados do perfil e sincroniza grupos no AD."""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acesso Negado")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404)

    emp = user.employee
    
    if "title" in payload: emp.title = payload["title"].upper()
    if "location" in payload: emp.location = payload["location"].upper()
    if "department" in payload: emp.department = payload["department"].upper()
    
    if "depts" in payload:
        new_depts = [d.upper() for d in payload["depts"]]
        # Atualiza o JSON meta preservando outros campos
        meta = dict(emp.meta) if emp.meta else {}
        meta["depts"] = new_depts
        emp.meta = meta
        
        # Sincronização via de mão dupla com o AD
        ADService.set_user_groups(user.username, new_depts)

    db.commit()
    return {"message": "Perfil atualizado no sistema e no AD."}