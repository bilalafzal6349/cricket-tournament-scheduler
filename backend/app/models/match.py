from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base, MatchStatus

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tournament_id = Column(UUID(as_uuid=True), ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    
    # Teams
    team1_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    team2_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    
    # Venue and timing
    venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="SET NULL"), nullable=True)
    scheduled_start = Column(DateTime, nullable=True)
    scheduled_end = Column(DateTime, nullable=True)
    
    # Actual timing (for tracking)
    actual_start = Column(DateTime, nullable=True)
    actual_end = Column(DateTime, nullable=True)
    
    # Match details
    match_number = Column(Integer, nullable=True)
    round = Column(String(50), nullable=True)  # "Round 1", "Quarter Final", etc.
    status = Column(Enum(MatchStatus), default=MatchStatus.SCHEDULED, nullable=False)
    
    # Results
    winner_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    team1_score = Column(String(50), nullable=True)
    team2_score = Column(String(50), nullable=True)
    
    # Metadata
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="matches")
    team1 = relationship("Team", foreign_keys=[team1_id], back_populates="home_matches")
    team2 = relationship("Team", foreign_keys=[team2_id], back_populates="away_matches")
    venue = relationship("Venue", back_populates="matches")
    winner = relationship("Team", foreign_keys=[winner_id])
