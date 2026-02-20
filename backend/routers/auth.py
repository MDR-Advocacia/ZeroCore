from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models.users import User, Employee
from auth.ad_service import ADService
from auth.security import create_access_token
import uuid

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/token")
async def login_for_access_token(
    response: Response, 
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    ad_user = ADService.authenticate(form_data.username, form_data.password)
    if not ad_user:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos no AD")

    db_user = db.query(User).filter(User.username == ad_user["username"]).first()
    
    # Sincronização básica do usuário no Banco
    if not db_user:
        db_user = User(
            id=uuid.uuid4(),
            username=ad_user["username"],
            email=ad_user["email"],
            role=ad_user["role"],
            is_active=ad_user["is_active"]
        )
        db.add(db_user)
        db.flush()
        
        employee = Employee(
            id=uuid.uuid4(),
            user_id=db_user.id,
            full_name=ad_user["full_name"],
            department=ad_user["depts"][0] if ad_user["depts"] else "Geral",
            title=ad_user["title"],
            location="Matriz"
        )
        db.add(employee)
    else:
        db_user.is_active = ad_user["is_active"]
        if db_user.employee:
            db_user.employee.full_name = ad_user["full_name"]

    db.commit()

    access_token = create_access_token(data={
        "sub": db_user.username,
        "role": db_user.role,
        "depts": ad_user["depts"],
        "permissions": ad_user["permissions"]
    })

    # DEFINE O COOKIE HTTP-ONLY
    response.set_cookie(
        key="zc_token",
        value=access_token,
        httponly=True,
        max_age=18000,
        samesite="lax",
        secure=False, # Mude para True em produção com HTTPS
        path="/"
    )

    return {
        "user": {
            "username": db_user.username,
            "full_name": ad_user["full_name"],
            "role": db_user.role
        }
    }

@router.post("/logout")
async def logout(response: Response):
    """Apaga o cookie no navegador do usuário"""
    response.delete_cookie(key="zc_token", path="/")
    return {"message": "Sessão encerrada"}