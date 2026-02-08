from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models import Team, Tournament, User
from app.api import deps
from app.schemas.schemas import (
    Team as TeamSchema,
    TeamCreate,
    TeamUpdate,
    MessageResponse
)

router = APIRouter()


@router.post("/{tournament_id}/teams", response_model=TeamSchema, status_code=status.HTTP_201_CREATED)
def create_team(
    tournament_id: UUID,
    team: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Create a new team in a tournament."""
    # Check if tournament exists
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Check for duplicate team code in tournament
    existing_team = db.query(Team).filter(
        Team.tournament_id == tournament_id,
        Team.code == team.code
    ).first()
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Team with code '{team.code}' already exists in this tournament"
        )
    
    db_team = Team(**team.dict(), tournament_id=tournament_id)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team


@router.get("/{tournament_id}/teams", response_model=List[TeamSchema])
def list_teams(
    tournament_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all teams in a tournament."""
    teams = db.query(Team).filter(Team.tournament_id == tournament_id).all()
    return teams


@router.get("/teams/{team_id}", response_model=TeamSchema)
def get_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get a specific team."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    return team


@router.put("/teams/{team_id}", response_model=TeamSchema)
def update_team(
    team_id: UUID,
    team_update: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Update a team."""
    db_team = db.query(Team).filter(Team.id == team_id).first()
    if not db_team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    update_data = team_update.dict(exclude_unset=True)
    
    # Check for duplicate code if updating
    if "code" in update_data:
        existing = db.query(Team).filter(
            Team.tournament_id == db_team.tournament_id,
            Team.code == update_data["code"],
            Team.id != team_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team with code '{update_data['code']}' already exists in this tournament"
            )
    
    for field, value in update_data.items():
        setattr(db_team, field, value)
    
    db.commit()
    db.refresh(db_team)
    return db_team


@router.delete("/teams/{team_id}", response_model=MessageResponse)
def delete_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """Delete a team."""
    print(f"Attempting to delete team {team_id}", flush=True)
    try:
        db_team = db.query(Team).filter(Team.id == team_id).first()
        if not db_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )
        
        team_name = db_team.name
        db.delete(db_team)
        db.commit()
        print(f"Successfully deleted team {team_id}", flush=True)
        return MessageResponse(
            message=f"Team '{team_name}' deleted successfully",
            success=True
        )
    except Exception as e:
        print(f"Error deleting team {team_id}: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
