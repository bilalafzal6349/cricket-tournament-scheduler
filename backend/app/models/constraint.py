from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base

class SchedulingConstraint(Base):
    __tablename__ = "scheduling_constraints"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tournament_id = Column(UUID(as_uuid=True), ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    
    constraint_type = Column(String(50), nullable=False)  # 'rest_period', 'venue_preference', 'time_slot', etc.
    priority = Column(Integer, default=5)  # 1 (hard constraint) to 10 (soft/optional)
    
    # Constraint parameters stored as JSON
    parameters = Column(JSON, default={})
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="constraints")
