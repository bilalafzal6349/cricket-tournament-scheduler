from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


# Enums
class TournamentFormatEnum(str, Enum):
    ROUND_ROBIN = "round_robin"
    KNOCKOUT = "knockout"
    LEAGUE = "league"
    DOUBLE_ROUND_ROBIN = "double_round_robin"


class TournamentStatusEnum(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MatchStatusEnum(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"


# Base Schemas
class TeamBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=2, max_length=10)
    logo_url: Optional[str] = None


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    code: Optional[str] = Field(None, min_length=2, max_length=10)
    logo_url: Optional[str] = None


class Team(TeamBase):
    id: UUID
    tournament_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# Venue Schemas
class VenueBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    capacity: Optional[int] = Field(None, ge=0)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    address: Optional[str] = None
    available_slots: Optional[List[Dict[str, Any]]] = []


class VenueCreate(VenueBase):
    pass


class VenueUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    capacity: Optional[int] = Field(None, ge=0)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    address: Optional[str] = None
    available_slots: Optional[List[Dict[str, Any]]] = None


class Venue(VenueBase):
    id: UUID
    tournament_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# Match Schemas
class MatchBase(BaseModel):
    team1_id: UUID
    team2_id: UUID
    venue_id: Optional[UUID] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    match_number: Optional[int] = None
    round: Optional[str] = None
    status: MatchStatusEnum = MatchStatusEnum.SCHEDULED
    notes: Optional[str] = None


class MatchCreate(MatchBase):
    @validator('team2_id')
    def teams_must_be_different(cls, v, values):
        if 'team1_id' in values and v == values['team1_id']:
            raise ValueError('team1_id and team2_id must be different')
        return v


class MatchUpdate(BaseModel):
    team1_id: Optional[UUID] = None
    team2_id: Optional[UUID] = None
    venue_id: Optional[UUID] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    match_number: Optional[int] = None
    round: Optional[str] = None
    status: Optional[MatchStatusEnum] = None
    team1_score: Optional[str] = None
    team2_score: Optional[str] = None
    winner_id: Optional[UUID] = None
    notes: Optional[str] = None


class Match(MatchBase):
    id: UUID
    tournament_id: UUID
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    winner_id: Optional[UUID] = None
    team1_score: Optional[str] = None
    team2_score: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MatchWithDetails(Match):
    team1: Optional[Team] = None
    team2: Optional[Team] = None
    venue: Optional[Venue] = None
    winner: Optional[Team] = None
    
    class Config:
        from_attributes = True


# Tournament Schemas
class TournamentBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    format: TournamentFormatEnum = TournamentFormatEnum.ROUND_ROBIN
    start_date: datetime
    end_date: datetime
    match_duration_hours: int = Field(default=4, ge=1, le=12)
    min_rest_hours: int = Field(default=24, ge=0, le=168)
    slots_per_day: int = Field(default=3, ge=1, le=10)
    settings: Optional[Dict[str, Any]] = {}
    
    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class TournamentCreate(TournamentBase):
    pass


class TournamentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    format: Optional[TournamentFormatEnum] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    match_duration_hours: Optional[int] = Field(None, ge=1, le=12)
    min_rest_hours: Optional[int] = Field(None, ge=0, le=168)
    slots_per_day: Optional[int] = Field(None, ge=1, le=10)
    status: Optional[TournamentStatusEnum] = None
    settings: Optional[Dict[str, Any]] = None


class Tournament(TournamentBase):
    id: UUID
    status: TournamentStatusEnum
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TournamentWithDetails(Tournament):
    teams: List[Team] = []
    venues: List[Venue] = []
    matches: List[MatchWithDetails] = []
    
    class Config:
        from_attributes = True


# Schedule Generation Request
class ScheduleGenerateRequest(BaseModel):
    tournament_id: UUID
    optimize_for: Optional[str] = "balanced"  # "balanced", "minimize_travel", "fairness"
    allow_back_to_back: bool = False
    preferred_start_hour: int = Field(default=10, ge=0, le=23)


class ScheduleGenerateResponse(BaseModel):
    success: bool
    message: str
    matches_scheduled: int
    conflicts: List[str] = []
    warnings: List[str] = []
    schedule_summary: Optional[Dict[str, Any]] = None


# Generic Response
class MessageResponse(BaseModel):
    message: str
    success: bool = True               
    data: Optional[Any] = None
