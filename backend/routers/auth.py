from datetime import timedelta, datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from auth.security import create_access_token, get_current_user
from auth.ad_service import ADService
from models import User, Employee

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Autenticação AD
    ad_user = ADService.authenticate(form_data.username, form_data.password)
    
    if not ad_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas ou usuário não encontrado no AD.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Sincronia Banco Local
    db_user = db.query(User).filter(User.username == ad_user["username"]).first()
    dept_string = ", ".join(ad_user["depts"])

    if not db_user:
        db_user = User(
            username=ad_user["username"],
            email=ad_user["email"],
            role=ad_user["role"],
            is_active=True
        )
        db.add(db_user)
        db.flush() 

        db_employee = Employee(
            user_id=db_user.id,
            full_name=ad_user["full_name"],
            department=dept_string,
            location=ad_user["location"],
            title=ad_user["title"]
        )
        db.add(db_employee)
    else:
        db_user.role = ad_user["role"]
        db_user.last_login = datetime.utcnow()
        if db_user.employee:
            db_user.employee.department = dept_string
            db_user.employee.title = ad_user["title"]
            db_user.employee.location = ad_user["location"]
            db_user.employee.full_name = ad_user["full_name"]

    db.commit()
    db.refresh(db_user)

    # 3. Token JWT
    access_token_expires = timedelta(minutes=120)
    access_token = create_access_token(
        data={
            "sub": ad_user["username"],
            "role": ad_user["role"],
            "depts": ad_user["depts"],
            "permissions": ad_user["permissions"], 
            "name": ad_user["full_name"],
            "id": str(db_user.id)
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user": ad_user
    }

@router.get("/departments", response_model=List[str])
async def get_ad_departments(current_user: dict = Depends(get_current_user)):
    """
    Retorna a lista de todos os departamentos disponíveis no AD (Grupos ZC_DEPT_*).
    Usado para popular dropdowns de seleção.
    """
    # Apenas usuários logados podem ver a lista de departamentos
    depts = ADService.list_all_departments()
    
    # Se não configurou o Bind User, retorna uma lista genérica de fallback para não quebrar o front
    if not depts:
        return ["Geral", "TI", "RH", "Administrativo"] # Fallback mínimo
        
    return depts