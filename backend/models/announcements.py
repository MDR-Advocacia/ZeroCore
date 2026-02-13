import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Boolean, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

# Tabela associativa para Ciência (Quem leu o quê)
announcement_acknowledgments = Table(
    "announcement_acknowledgments",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
    Column("announcement_id", UUID(as_uuid=True), ForeignKey("announcements.id"), primary_key=True),
    Column("acknowledged_at", DateTime, default=datetime.utcnow)
)

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False) 
    target_dept = Column(String, nullable=True) 
    
    attachment_url = Column(String, nullable=True)
    attachment_name = Column(String, nullable=True)
    
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Relacionamentos
    author = relationship("User", back_populates="announcements")
    # Lista de usuários que deram ciência
    acknowledged_by = relationship(
        "User", 
        secondary=announcement_acknowledgments,
        backref="acknowledged_announcements"
    )