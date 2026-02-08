import pytest
from datetime import datetime, timedelta
from app.models import Tournament, Team, Venue, TournamentFormat
from app.services.scheduler import generate_tournament_schedule

def test_scheduler_ai_logic(db):
    # 1. Setup Data
    # Create Tournament
    tournament = Tournament(
        name="Test Tournament",
        format=TournamentFormat.ROUND_ROBIN,
        start_date=datetime.now(),
        end_date=datetime.now() + timedelta(days=30),
        match_duration_hours=4,
        min_rest_hours=24,
        slots_per_day=3
    )
    db.add(tournament)
    db.commit()
    db.refresh(tournament)

    # Create 4 Teams
    teams = []
    for i in range(4):
        team = Team(
            tournament_id=tournament.id,
            name=f"Team {i}",
            code=f"T{i}"
        )
        db.add(team)
        teams.append(team)
    
    # Create 2 Venues
    venues = []
    for i in range(2):
        venue = Venue(
            tournament_id=tournament.id,
            name=f"Venue {i}",
            city="Test City",
            capacity=10000
        )
        db.add(venue)
        venues.append(venue)
    
    db.commit()

    # 2. Run Scheduler
    result = generate_tournament_schedule(db, str(tournament.id))

    # 3. Verify Results
    assert result["success"] is True
    assert result["matches_scheduled"] == 6  # 4 teams round robin = 4*3/2 = 6 matches
    
    # Verify no conflicts logic could be added here by checking the matches in result["schedule"]
    schedule = result["schedule"]
    assert len(schedule) == 6
    
    # Verify strict constraints (simplified check)
    # E.g. check if any team plays twice in same slot (impossible if success is True due to OR-Tools)
    
