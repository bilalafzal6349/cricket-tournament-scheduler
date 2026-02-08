from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, Boolean, JSON, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.session import Base


class TournamentFormat(str, enum.Enum):
    ROUND_ROBIN = "round_robin"
    KNOCKOUT = "knockout"
    LEAGUE = "league"
    DOUBLE_ROUND_ROBIN = "double_round_robin"


class MatchStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"


class TournamentStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


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
