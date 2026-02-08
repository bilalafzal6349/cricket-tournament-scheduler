from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base

class Venue(Base):
    __tablename__ = "venues"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tournament_id = Column(UUID(as_uuid=True), ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=True)
    
    # Location data
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    
    # Availability
    available_slots = Column(JSON, default=[])  # Custom time slots if needed
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="venues")
    matches = relationship("Match", back_populates="venue")
