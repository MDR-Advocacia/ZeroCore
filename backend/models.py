import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    """
    Tabela de usuários para autenticação e controle de acesso.
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, index=True, nullable=False) # Login do AD
    email = Column(String, unique=True, index=True)
    role = Column(String, nullable=False, default="user") # estagiario, advogado, supervisor, etc.
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, default=datetime.utcnow)
    
    # Vinculação com o perfil operacional
    employee = relationship("Employee", back_populates="user", uselist=False)

class Employee(Base):
    """
    Tabela de funcionários para dados de RH e Setor.
    """
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    
    full_name = Column(String, nullable=False)
    cpf = Column(String, unique=True, index=True)
    department = Column(String) # Setor (Extraído do ZC_DEPT_)
    location = Column(String)   # Unidade (Extraído do ZC_LOC_)
    title = Column(String)      # Cargo (Extraído do AD)
    
    # Metadata para flexibilidade futura (evita mudar o schema toda hora)
    meta = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="employee")