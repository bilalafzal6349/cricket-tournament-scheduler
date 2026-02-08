from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.models import Match, Tournament, User
from app.api import deps
from app.schemas.schemas import (
    Match as MatchSchema,
    MatchWithDetails,
    MatchCreate,
    MatchUpdate,
    MessageResponse,
    ScheduleGenerateRequest,
    ScheduleGenerateResponse
)
from app.services.scheduler import generate_tournament_schedule

router = APIRouter()


@router.post("/{tournament_id}/generate-schedule", response_model=ScheduleGenerateResponse)
def generate_schedule(
    tournament_id: UUID,
    request: Optional[ScheduleGenerateRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """
    Generate AI-powered schedule for the tournament.
    This is the core feature - uses constraint programming to create conflict-free schedules.
    """
    # Check if tournament exists
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    try:
        result = generate_tournament_schedule(db, str(tournament_id), request)
        
        if result["success"]:
            return ScheduleGenerateResponse(
                success=True,
                message=result["message"],
                matches_scheduled=result["matches_scheduled"],
                schedule_summary={
                    "total_matches": result["matches_scheduled"],
                    "status": result.get("status", "completed")
                }
            )
        else:
            return ScheduleGenerateResponse(
                success=False,
                message=result["message"],
                matches_scheduled=0,
                conflicts=result.get("conflicts", [])
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate schedule: {str(e)}"
        )


@router.get("/{tournament_id}/matches", response_model=List[MatchWithDetails])
def get_tournament_schedule(
    tournament_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all matches for a tournament with full details."""
    matches = db.query(Match).filter(
        Match.tournament_id == tournament_id
    ).options(
        joinedload(Match.team1),
        joinedload(Match.team2),
        joinedload(Match.venue)
    ).order_by(Match.scheduled_start).all()
    
    return matches


@router.post("/{tournament_id}/matches", response_model=MatchSchema, status_code=status.HTTP_201_CREATED)
def create_match(
    tournament_id: UUID,
    match: MatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Manually create a match (for overrides or manual scheduling)."""
    # Check if tournament exists
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    db_match = Match(**match.dict(), tournament_id=tournament_id)
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match


@router.get("/matches/{match_id}", response_model=MatchWithDetails)
def get_match(
    match_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get a specific match with full details."""
    match = db.query(Match).filter(Match.id == match_id).options(
        joinedload(Match.team1),
        joinedload(Match.team2),
        joinedload(Match.venue)
    ).first()
    
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    return match


@router.put("/matches/{match_id}", response_model=MatchSchema)
def update_match(
    match_id: UUID,
    match_update: MatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Update a match (reschedule, update status, record results, etc.)."""
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if not db_match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    
    update_data = match_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_match, field, value)
    
    db.commit()
    db.refresh(db_match)
    return db_match


@router.delete("/matches/{match_id}", response_model=MessageResponse)
def delete_match(
    match_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Delete a match."""
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if not db_match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    
    db.delete(db_match)
    db.commit()
    return MessageResponse(
        message="Match deleted successfully",
        success=True
    )


@router.delete("/{tournament_id}/matches", response_model=MessageResponse)
def clear_schedule(
    tournament_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Clear all matches for a tournament (useful for regenerating schedule)."""
    deleted_count = db.query(Match).filter(
        Match.tournament_id == tournament_id
    ).delete()
    
    db.commit()
    return MessageResponse(
        message=f"Cleared {deleted_count} matches from schedule",
        success=True,
        data={"deleted_count": deleted_count}
    )
