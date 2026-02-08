from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models import Tournament, TournamentStatus, User
from app.api import deps
from app.schemas.schemas import (
    Tournament as TournamentSchema,
    TournamentCreate,
    TournamentUpdate,
    TournamentWithDetails,
    MessageResponse
)

router = APIRouter()


@router.post("/", response_model=TournamentSchema, status_code=status.HTTP_201_CREATED)
def create_tournament(
    tournament: TournamentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Create a new tournament."""
    db_tournament = Tournament(**tournament.dict())
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament


@router.get("/", response_model=List[TournamentSchema])
def list_tournaments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all tournaments."""
    tournaments = db.query(Tournament).offset(skip).limit(limit).all()
    return tournaments


@router.get("/{tournament_id}", response_model=TournamentWithDetails)
def get_tournament(
    tournament_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get a specific tournament with all details."""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    return tournament


@router.put("/{tournament_id}", response_model=TournamentSchema)
def update_tournament(
    tournament_id: UUID,
    tournament_update: TournamentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Update a tournament."""
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    update_data = tournament_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tournament, field, value)
    
    db.commit()
    db.refresh(db_tournament)
    return db_tournament


@router.delete("/{tournament_id}", response_model=MessageResponse)
def delete_tournament(
    tournament_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Delete a tournament and all associated data."""
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    db.delete(db_tournament)
    db.commit()
    return MessageResponse(
        message=f"Tournament '{db_tournament.name}' deleted successfully",
        success=True
    )


@router.post("/{tournament_id}/start", response_model=TournamentSchema)
def start_tournament(
    tournament_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Mark tournament as in progress."""
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if db_tournament.status == TournamentStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is already in progress"
        )
    
    db_tournament.status = TournamentStatus.IN_PROGRESS
    db.commit()
    db.refresh(db_tournament)
    return db_tournament


@router.post("/{tournament_id}/complete", response_model=TournamentSchema)
def complete_tournament(
    tournament_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Mark tournament as completed."""
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    db_tournament.status = TournamentStatus.COMPLETED
    db.commit()
    db.refresh(db_tournament)
    return db_tournament
