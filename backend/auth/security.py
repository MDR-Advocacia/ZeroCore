from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os

# Importamos get_db para a injeção de dependência
from database import get_db

# Configurações
# Em produção, use variáveis de ambiente para a SECRET_KEY
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Mantemos o oauth2_scheme apenas caso você queira usar o Swagger UI (/docs) no futuro,
# mas não o usaremos mais para as requisições do seu frontend (Next.js).
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- NOVA FUNÇÃO: Extrai o token de dentro do Cookie (HttpOnly) ---
def get_token_from_cookie(request: Request):
    token = request.cookies.get("zc_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado. Cookie ausente.",
        )
    return token

# --- ATUALIZADO: Agora depende de get_token_from_cookie em vez de oauth2_scheme ---
async def get_current_user(token: str = Depends(get_token_from_cookie), db: Session = Depends(get_db)):
    """
    Decodifica o token do cookie e recupera o usuário.
    Retorna um dicionário com dados do Banco + Dados do Token (AD).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Import tardio para evitar ciclo de importação com models
    from models.users import User 
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
        
    # Retorna um objeto combinado (Banco + Permissões do Token)
    return {
        "id": str(user.id),
        "username": user.username,
        "role": user.role,                 # Role do banco (fonte da verdade persistida)
        "depts": payload.get("depts", []), # Setores (vem do AD/Token)
        "permissions": payload.get("permissions", []) # Flags (vem do AD/Token)
    }