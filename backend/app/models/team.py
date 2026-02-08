from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tournament_id = Column(UUID(as_uuid=True), ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    code = Column(String(10), nullable=False)  # Short code like "MI", "CSK"
    logo_url = Column(String(500), nullable=True)
    
    # Team details
    home_venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="teams")
    home_venue = relationship("Venue", foreign_keys=[home_venue_id])
    home_matches = relationship("Match", foreign_keys="Match.team1_id", back_populates="team1")
    away_matches = relationship("Match", foreign_keys="Match.team2_id", back_populates="team2")
