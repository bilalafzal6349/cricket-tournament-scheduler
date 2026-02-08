from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models import Venue, Tournament, User
from app.api import deps
from app.schemas.schemas import (
    Venue as VenueSchema,
    VenueCreate,
    VenueUpdate,
    MessageResponse
)

router = APIRouter()


@router.post("/{tournament_id}/venues", response_model=VenueSchema, status_code=status.HTTP_201_CREATED)
def create_venue(
    tournament_id: UUID,
    venue: VenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Create a new venue in a tournament."""
    # Check if tournament exists
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    db_venue = Venue(**venue.dict(), tournament_id=tournament_id)
    db.add(db_venue)
    db.commit()
    db.refresh(db_venue)
    return db_venue


@router.get("/{tournament_id}/venues", response_model=List[VenueSchema])
def list_venues(
    tournament_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all venues in a tournament."""
    venues = db.query(Venue).filter(Venue.tournament_id == tournament_id).all()
    return venues


@router.get("/venues/{venue_id}", response_model=VenueSchema)
def get_venue(
    venue_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get a specific venue."""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    return venue


@router.put("/venues/{venue_id}", response_model=VenueSchema)
def update_venue(
    venue_id: UUID,
    venue_update: VenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Update a venue."""
    db_venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not db_venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    
    update_data = venue_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_venue, field, value)
    
    db.commit()
    db.refresh(db_venue)
    return db_venue


@router.delete("/venues/{venue_id}", response_model=MessageResponse)
def delete_venue(
    venue_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Delete a venue."""
    db_venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not db_venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venue not found"
        )
    
    venue_name = db_venue.name
    db.delete(db_venue)
    db.commit()
    return MessageResponse(
        message=f"Venue '{venue_name}' deleted successfully",
        success=True
    )
