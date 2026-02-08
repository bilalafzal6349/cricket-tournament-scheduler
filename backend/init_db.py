"""
Database Initialization and Seed Data Script
Run this to set up the database with sample tournament data
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.session import engine, Base, SessionLocal
from app.models import Tournament, Team, Venue, TournamentFormat, TournamentStatus, User, UserRole
from app.core.security import get_password_hash

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created!")


def seed_sample_data(db: Session):
    """Add sample tournament data for testing"""
    print("\nSeeding sample data...")
    
    # Check if data already exists
    existing = db.query(Tournament).first()
    if existing:
        print("⚠️  Database already has tournament data. Skipping tournament seed.")
    
    # Seed Users
    admin_email = "admin@example.com"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if not existing_admin:
        admin_user = User(
            email=admin_email,
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        print("✅ Created Admin user: admin@example.com / admin123")
    
    user_email = "user@example.com"
    existing_user = db.query(User).filter(User.email == user_email).first()
    if not existing_user:
        normal_user = User(
            email=user_email,
            hashed_password=get_password_hash("user123"),
            role=UserRole.USER,
            is_active=True
        )
        db.add(normal_user)
        print("✅ Created Standard user: user@example.com / user123")
        
    db.commit()

    if existing:
        return
    
    # Create sample tournament
    tournament = Tournament(
        name="IPL 2025",
        description="Official Indian Premier League 2025 Schedule",
        format=TournamentFormat.ROUND_ROBIN,
        status=TournamentStatus.DRAFT,
        start_date=datetime.now() + timedelta(days=7),
        end_date=datetime.now() + timedelta(days=45),
        match_duration_hours=4,
        min_rest_hours=24,
        slots_per_day=3
    )
    db.add(tournament)
    db.flush()  # Get tournament ID
    
    print(f"✅ Created tournament: {tournament.name}")
    
    # Add teams
    teams_data = [
        {"name": "Mumbai Indians", "code": "MI"},
        {"name": "Chennai Super Kings", "code": "CSK"},
        {"name": "Royal Challengers Bangalore", "code": "RCB"},
        {"name": "Kolkata Knight Riders", "code": "KKR"},
        {"name": "Delhi Capitals", "code": "DC"},
        {"name": "Rajasthan Royals", "code": "RR"},
        {"name": "Punjab Kings", "code": "PBKS"},
        {"name": "Sunrisers Hyderabad", "code": "SRH"},
    ]
    
    for team_data in teams_data:
        team = Team(
            tournament_id=tournament.id,
            name=team_data["name"],
            code=team_data["code"]
        )
        db.add(team)
    
    print(f"✅ Added {len(teams_data)} teams")
    
    # Add venues
    venues_data = [
        {
            "name": "Wankhede Stadium",
            "city": "Mumbai",
            "capacity": 33000,
            "latitude": 18.9388,
            "longitude": 72.8258
        },
        {
            "name": "M. A. Chidambaram Stadium",
            "city": "Chennai",
            "capacity": 50000,
            "latitude": 13.0627,
            "longitude": 80.2792
        },
        {
            "name": "Eden Gardens",
            "city": "Kolkata",
            "capacity": 66000,
            "latitude": 22.5645,
            "longitude": 88.3433
        },
        {
            "name": "M. Chinnaswamy Stadium",
            "city": "Bangalore",
            "capacity": 40000,
            "latitude": 12.9792,
            "longitude": 77.5993
        }
    ]
    
    for venue_data in venues_data:
        venue = Venue(
            tournament_id=tournament.id,
            **venue_data
        )
        db.add(venue)
    
    print(f"✅ Added {len(venues_data)} venues")
    
    db.commit()
    
    print("\n" + "="*60)
    print("🎉 Sample data seeded successfully!")
    print("="*60)
    print(f"\nTournament ID: {tournament.id}")
    print(f"Teams: {len(teams_data)}")
    print(f"Venues: {len(venues_data)}")
    print("\nNext steps:")
    print("1. Start the backend: uvicorn app.main:app --reload")
    print("2. Open API docs: http://localhost:8000/api/docs")
    print(f"3. Generate schedule: POST /api/v1/tournaments/{tournament.id}/generate-schedule")
    print("="*60 + "\n")


def main():
    """Main function"""
    print("="*60)
    print("Cricket Tournament Scheduler - Database Setup")
    print("="*60)
    
    # Initialize database
    init_db()
    
    # Seed sample data
    db = SessionLocal()
    try:
        seed_sample_data(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
