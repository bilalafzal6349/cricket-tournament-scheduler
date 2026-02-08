# 🏏 Cricket Tournament Scheduler - AI-Powered Scheduling System

An intelligent tournament management system that uses AI (constraint programming with Google OR-Tools) to automatically generate conflict-free match schedules for cricket tournaments.

## 🚀 Features

### Core Features
- ✅ **AI-Powered Scheduling**: Uses Google OR-Tools constraint programming solver
- ✅ **Conflict-Free Schedules**: No team plays multiple matches simultaneously
- ✅ **Venue Management**: No double-booking of venues
- ✅ **Rest Period Enforcement**: Configurable minimum rest between matches
- ✅ **Multiple Tournament Formats**: Round-robin, knockout, double round-robin, league
- ✅ **Real-time Schedule Generation**: Generate schedules in seconds
- ✅ **Manual Override**: Edit and adjust AI-generated schedules
- ✅ **RESTful API**: Complete FastAPI backend with auto-generated docs

### Smart Constraints
1. **Hard Constraints** (Must be satisfied):
   - No team plays multiple matches at the same time
   - No venue double-booking
   - Each match pair plays exactly once (based on format)

2. **Soft Constraints** (Optimized):
   - Minimum rest period between matches
   - Fair distribution across time slots
   - Compact tournament duration

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Relational database
- **Google OR-Tools** - AI scheduling engine
- **Pydantic** - Data validation
- **Redis** - Caching (optional)

## 📦 Installation & Setup

### Option 1: Docker (Recommended for Hackathon)

```bash
# Clone the repository
git clone <your-repo-url>
cd cricket-tournament-scheduler

# Start all services with Docker Compose
docker-compose up -d

# The backend will be available at http://localhost:8000
# API docs at http://localhost:8000/api/docs
```

### Option 2: Local Development

#### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis (optional)

#### Setup Steps

```bash
# 1. Set up PostgreSQL database
createdb cricket_tournament_db

# 2. Navigate to backend directory
cd backend

# 3. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file
cp .env.example .env

# 6. Update .env with your database credentials
# DATABASE_URL=postgresql://your_user:your_password@localhost:5432/cricket_tournament_db

# 7. Run the application
uvicorn app.main:app --reload

# Backend runs at http://localhost:8000
# API docs at http://localhost:8000/api/docs
```

## 🎯 Quick Start Guide

### 1. Create a Tournament

```bash
curl -X POST "http://localhost:8000/api/v1/tournaments/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IPL 2024",
    "description": "Indian Premier League 2024",
    "format": "round_robin",
    "start_date": "2024-03-15T00:00:00",
    "end_date": "2024-05-30T00:00:00",
    "match_duration_hours": 4,
    "min_rest_hours": 24,
    "slots_per_day": 3
  }'
```

### 2. Add Teams

```bash
# Add multiple teams
curl -X POST "http://localhost:8000/api/v1/tournaments/{tournament_id}/teams" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mumbai Indians",
    "code": "MI"
  }'

curl -X POST "http://localhost:8000/api/v1/tournaments/{tournament_id}/teams" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chennai Super Kings",
    "code": "CSK"
  }'

# Add more teams...
```

### 3. Add Venues

```bash
curl -X POST "http://localhost:8000/api/v1/tournaments/{tournament_id}/venues" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wankhede Stadium",
    "city": "Mumbai",
    "capacity": 33000,
    "latitude": 18.9388,
    "longitude": 72.8258
  }'
```

### 4. Generate AI Schedule 🤖

```bash
curl -X POST "http://localhost:8000/api/v1/tournaments/{tournament_id}/generate-schedule"
```

### 5. View Schedule

```bash
curl -X GET "http://localhost:8000/api/v1/tournaments/{tournament_id}/matches"
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key Endpoints

#### Tournaments
- `POST /api/v1/tournaments/` - Create tournament
- `GET /api/v1/tournaments/` - List all tournaments
- `GET /api/v1/tournaments/{id}` - Get tournament details
- `PUT /api/v1/tournaments/{id}` - Update tournament
- `DELETE /api/v1/tournaments/{id}` - Delete tournament

#### Teams
- `POST /api/v1/tournaments/{id}/teams` - Add team
- `GET /api/v1/tournaments/{id}/teams` - List teams
- `PUT /api/v1/teams/{id}` - Update team
- `DELETE /api/v1/teams/{id}` - Delete team

#### Venues
- `POST /api/v1/tournaments/{id}/venues` - Add venue
- `GET /api/v1/tournaments/{id}/venues` - List venues
- `PUT /api/v1/venues/{id}` - Update venue
- `DELETE /api/v1/venues/{id}` - Delete venue

#### Schedule (AI-Powered) 🌟
- `POST /api/v1/tournaments/{id}/generate-schedule` - **Generate AI schedule**
- `GET /api/v1/tournaments/{id}/matches` - View schedule
- `PUT /api/v1/matches/{id}` - Update/reschedule match
- `DELETE /api/v1/tournaments/{id}/matches` - Clear schedule

## 🧪 Testing the AI Scheduler

### Test with Sample Data

```python
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1"

# 1. Create tournament
tournament_data = {
    "name": "Test Tournament 2024",
    "format": "round_robin",
    "start_date": (datetime.now() + timedelta(days=7)).isoformat(),
    "end_date": (datetime.now() + timedelta(days=37)).isoformat(),
    "match_duration_hours": 4,
    "min_rest_hours": 24,
    "slots_per_day": 3
}

response = requests.post(f"{BASE_URL}/tournaments/", json=tournament_data)
tournament_id = response.json()["id"]
print(f"Created tournament: {tournament_id}")

# 2. Add teams
teams = ["Team A", "Team B", "Team C", "Team D", "Team E", "Team F"]
for i, team_name in enumerate(teams):
    team_data = {
        "name": team_name,
        "code": f"T{i+1}"
    }
    requests.post(f"{BASE_URL}/tournaments/{tournament_id}/teams", json=team_data)

# 3. Add venues
venues = ["Venue 1", "Venue 2", "Venue 3"]
for venue_name in venues:
    venue_data = {
        "name": venue_name,
        "city": "Test City",
        "capacity": 50000
    }
    requests.post(f"{BASE_URL}/tournaments/{tournament_id}/venues", json=venue_data)

# 4. Generate schedule
response = requests.post(f"{BASE_URL}/tournaments/{tournament_id}/generate-schedule")
result = response.json()
print(f"Schedule generated: {result}")

# 5. View schedule
response = requests.get(f"{BASE_URL}/tournaments/{tournament_id}/matches")
matches = response.json()
print(f"Total matches scheduled: {len(matches)}")
for match in matches[:5]:  # Print first 5
    print(f"Match {match['match_number']}: {match['scheduled_start']}")
```

## 🎨 Project Structure

```
cricket-tournament-scheduler/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   │   ├── tournaments.py
│   │   │   ├── teams.py
│   │   │   ├── venues.py
│   │   │   └── schedule.py
│   │   ├── core/             # Core configuration
│   │   │   └── config.py
│   │   ├── db/               # Database setup
│   │   │   └── session.py
│   │   ├── models/           # SQLAlchemy models
│   │   │   └── models.py
│   │   ├── schemas/          # Pydantic schemas
│   │   │   └── schemas.py
│   │   ├── services/         # Business logic
│   │   │   └── scheduler.py  # 🤖 AI Scheduling Engine
│   │   └── main.py           # FastAPI app
│   ├── tests/                # Tests
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

Edit `.env` file to configure:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cricket_tournament_db

# API Settings
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Scheduling Settings
DEFAULT_MATCH_DURATION_HOURS=4
MIN_REST_HOURS_BETWEEN_MATCHES=24
DEFAULT_SLOTS_PER_DAY=3
```

## 🏆 How the AI Scheduling Works

The system uses **Constraint Programming (CP)** with Google OR-Tools:

1. **Problem Modeling**: Tournament scheduling as a CSP (Constraint Satisfaction Problem)
2. **Decision Variables**: Binary variables for each (match, time_slot, venue) combination
3. **Constraints**:
   - Each match scheduled exactly once
   - No venue double-booking
   - No team plays multiple matches simultaneously
   - Minimum rest period enforcement
4. **Optimization**: CP-SAT solver finds optimal solution in seconds
5. **Result**: Conflict-free schedule that satisfies all constraints

### Why Constraint Programming?
- Purpose-built for scheduling problems
- Handles complex constraints efficiently
- Fast optimization (seconds for 100+ matches)
- Proven in sports scheduling

## 🚀 Hackathon Demo Tips

1. **Quick Demo Setup**: Use Docker Compose - one command setup
2. **Show AI in Action**: Generate schedule for 8 teams, 3 venues - watch it work in real-time
3. **Highlight Conflicts**: Try scheduling with impossible constraints to show validation
4. **Manual Override**: Show how users can adjust AI-generated schedules
5. **Scale Test**: Generate schedule for 16 teams to show it handles complexity

## 📝 Example Tournament Formats

### Round Robin (All teams play each other once)
- 8 teams = 28 matches
- 10 teams = 45 matches
- 12 teams = 66 matches

### Double Round Robin (IPL-style)
- 8 teams = 56 matches
- 10 teams = 90 matches

## 🐛 Troubleshooting

**Issue**: Database connection error
```bash
# Check if PostgreSQL is running
docker-compose ps
# Restart services
docker-compose restart
```

**Issue**: Schedule generation fails
- Ensure tournament has at least 2 teams and 1 venue
- Check date range is sufficient for all matches
- Verify constraints aren't too restrictive

## 📄 License

MIT License - Feel free to use in your projects!

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

---

**Built with ❤️ for hackathons** | AI-Powered Sports Scheduling
