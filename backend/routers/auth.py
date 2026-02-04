from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import User, Employee
from auth.ad_service import ADService
from auth.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Validação no Active Directory
    user_info = ADService.authenticate(form_data.username, form_data.password)
    
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais do AD inválidas.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Sincronização com o Banco de Dados (PostgreSQL)
    # Procura o usuário pelo username (sAMAccountName)
    db_user = db.query(User).filter(User.username == user_info["username"]).first()

    if not db_user:
        # Cria novo usuário se não existir
        db_user = User(
            username=user_info["username"],
            email=user_info["email"],
            role=user_info["role"],
            is_active=True
        )
        db.add(db_user)
        db.flush() # Para obter o ID do usuário para o perfil de funcionário

        # Cria o perfil de funcionário vinculado
        db_employee = Employee(
            user_id=db_user.id,
            full_name=user_info["full_name"],
            cpf=user_info["cpf"],
            department=", ".join(user_info["departments"]),
            location=user_info["location"],
            title=user_info["title"]
        )
        db.add(db_employee)
    else:
        # Atualiza dados existentes (Caso o cargo ou setor tenha mudado no AD)
        db_user.role = user_info["role"]
        db_user.last_login = datetime.utcnow()
        
        if db_user.employee:
            db_user.employee.department = ", ".join(user_info["departments"])
            db_user.employee.title = user_info["title"]
            db_user.employee.location = user_info["location"]

    db.commit()
    db.refresh(db_user)

    # 3. Geração do Token JWT
    access_token = create_access_token(
        data={
            "sub": db_user.username,
            "name": user_info["full_name"],
            "role": db_user.role,
            "depts": user_info["departments"]
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": db_user.username,
            "name": user_info["full_name"],
            "role": db_user.role,
            "dept": user_info["departments"][0] if user_info["departments"] else "Geral"
        }
    }