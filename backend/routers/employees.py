from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import Optional, List, Dict
from datetime import datetime
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
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    e = user.employee
    # Formata as datas para YYYY-MM-DD para o frontend
    format_date = lambda d: d.strftime("%Y-%m-%d") if d else ""

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
        "cpf": e.cpf or "",
        "admission_date": format_date(e.admission_date),
        "termination_date": format_date(e.termination_date),
        "birth_date": format_date(e.birth_date),
        "phone": e.meta.get("phone", ""),
        "emergency_name": e.meta.get("emergency_name", ""),
        "emergency_phone": e.meta.get("emergency_phone", "")
    }

@router.put("/{username}")
async def update_employee_profile(
    username: str,
    payload: Dict = Body(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == username).first()
    if not user: raise HTTPException(status_code=404)

    # 🔥 REGRAS DE ACESSO
    is_hr = current_user["role"] in ["admin", "diretoria"] or "RH" in [d.upper() for d in current_user.get("depts", [])]
    is_self = current_user["username"] == username

    if not is_hr and not is_self:
        raise HTTPException(status_code=403, detail="Sem permissão para editar este perfil.")

    emp = user.employee
    parse_date = lambda d: datetime.strptime(d, "%Y-%m-%d") if d else None
    ad_synced = True

    # 🔴 CAMPOS RESTRITOS (Apenas DP/Admin)
    if is_hr:
        if "title" in payload: emp.title = payload["title"].upper()
        if "department" in payload: emp.department = payload["department"].upper()
        if "cpf" in payload: emp.cpf = payload["cpf"]
        if "admission_date" in payload: emp.admission_date = parse_date(payload["admission_date"])
        if "termination_date" in payload: emp.termination_date = parse_date(payload["termination_date"])
        
        if "depts" in payload:
            new_depts = [d.upper() for d in payload["depts"]]
            meta = dict(emp.meta) if emp.meta else {}
            meta["depts"] = new_depts
            emp.meta = meta
            ad_synced = ADService.set_user_groups(user.username, new_depts)

    # 🟢 CAMPOS LIVRES (A própria pessoa ou o RH editam)
    if is_self or is_hr:
        if "birth_date" in payload: emp.birth_date = parse_date(payload["birth_date"])
        
        meta = dict(emp.meta) if emp.meta else {}
        if "phone" in payload: meta["phone"] = payload["phone"]
        if "emergency_name" in payload: meta["emergency_name"] = payload["emergency_name"]
        if "emergency_phone" in payload: meta["emergency_phone"] = payload["emergency_phone"]
        emp.meta = meta

    db.commit()

    if is_hr and not ad_synced:
        return {"message": "Salvo localmente. O AD está offline."}
        
    return {"message": "Perfil atualizado com sucesso."}

@router.post("/sync")
async def sync_ad_to_db(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acesso Negado")

    ad_users = ADService.list_all_users()
    if not ad_users:
        raise HTTPException(status_code=503, detail="Não foi possível conectar ao AD.")

    synced_count = 0
    for ad_u in ad_users:
        db_user = db.query(User).filter(User.username == ad_u["username"]).first()
        
        if not db_user:
            db_user = User(
                id=uuid.uuid4(),
                username=ad_u["username"],
                email=ad_u["email"],
                role="user",
                is_active=ad_u["is_active"]
            )
            db.add(db_user)
            db.flush()
            
            emp = Employee(
                id=uuid.uuid4(),
                user_id=db_user.id,
                full_name=ad_u["full_name"],
                department=ad_u["primary_dept"],
                title=ad_u["title"],
                location="Matriz",
                meta={"depts": ad_u["depts"]}
            )
            db.add(emp)
        else:
            db_user.is_active = ad_u["is_active"]
            if db_user.employee:
                db_user.employee.full_name = ad_u["full_name"]
                db_user.employee.department = ad_u["primary_dept"]
                db_user.employee.title = ad_u["title"]
                
                meta = dict(db_user.employee.meta) if db_user.employee.meta else {}
                meta["depts"] = ad_u["depts"]
                db_user.employee.meta = meta
                
        synced_count += 1
    
    db.commit()
    return {"message": f"{synced_count} colaboradores sincronizados do AD."}