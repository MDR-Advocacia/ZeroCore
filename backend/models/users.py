import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    role = Column(String, nullable=False, default="user")
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos com String para evitar Circular Import
    employee = relationship("Employee", back_populates="user", uselist=False)
    announcements = relationship("Announcement", back_populates="author")

class Employee(Base):
    __tablename__ = "employees"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    full_name = Column(String, nullable=False)
    cpf = Column(String, unique=True, index=True)
    department = Column(String)
    location = Column(String)
    title = Column(String)
    
    # 🔥 Novas colunas de RH adicionadas
    admission_date = Column(DateTime, nullable=True)
    termination_date = Column(DateTime, nullable=True)
    birth_date = Column(DateTime, nullable=True)
    
    meta = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="employee")