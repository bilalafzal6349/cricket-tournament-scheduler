from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, Boolean, JSON, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base, TournamentFormat, TournamentStatus

class Tournament(Base):
    __tablename__ = "tournaments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    format = Column(Enum(TournamentFormat), default=TournamentFormat.ROUND_ROBIN, nullable=False)
    status = Column(Enum(TournamentStatus), default=TournamentStatus.DRAFT, nullable=False)
    
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Scheduling configuration
    match_duration_hours = Column(Integer, default=4)
    min_rest_hours = Column(Integer, default=24)
    slots_per_day = Column(Integer, default=3)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Additional settings stored as JSON
    settings = Column(JSON, default={})
    
    # Relationships
    teams = relationship("Team", back_populates="tournament", cascade="all, delete-orphan")
    venues = relationship("Venue", back_populates="tournament", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")
    constraints = relationship("SchedulingConstraint", back_populates="tournament", cascade="all, delete-orphan")
