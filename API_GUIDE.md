# API Usage Guide - Cricket Tournament Scheduler

Complete guide with curl examples for all API endpoints.

## Base URL
```
http://localhost:8000/api/v1
```

## 1. Tournament Management

### Create Tournament
```bash
curl -X POST "http://localhost:8000/api/v1/tournaments/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IPL 2024",
    "description": "Indian Premier League 2024 Season",
    "format": "round_robin",
    "start_date": "2024-03-15T00:00:00",
    "end_date": "2024-05-30T00:00:00",
    "match_duration_hours": 4,
    "min_rest_hours": 24,
    "slots_per_day": 3
  }'
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "IPL 2024",
  "format": "round_robin",
  "status": "draft",
  "start_date": "2024-03-15T00:00:00",
  "end_date": "2024-05-30T00:00:00",
  ...
}
```

### List All Tournaments
```bash
curl -X GET "http://localhost:8000/api/v1/tournaments/"
```

### Get Tournament Details
```bash
curl -X GET "http://localhost:8000/api/v1/tournaments/{tournament_id}"
```

### Update Tournament
```bash
curl -X PUT "http://localhost:8000/api/v1/tournaments/{tournament_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IPL 2024 - Updated",
    "status": "scheduled"
  }'
```

### Delete Tournament
```bash
curl -X DELETE "http://localhost:8000/api/v1/tournaments/{tournament_id}"
```

---

## 2. Team Management

### Add Team to Tournament
```bash
curl -X POST "http://localhost:8000/api/v1/tournaments/{tournament_id}/teams" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mumbai Indians",
    "code": "MI",
    "logo_url": "https://example.com/mi-logo.png"
  }'
```

### Bulk Add Teams (Script)
```bash
#!/bin/bash
TOURNAMENT_ID="your-tournament-id-here"

teams=(
  '{"name":"Mumbai Indians","code":"MI"}'
  '{"name":"Chennai Super Kings","code":"CSK"}'
  '{"name":"Royal Challengers Bangalore","code":"RCB"}'
  '{"name":"Kolkata Knight Riders","code":"KKR"}'
  '{"name":"Delhi Capitals","code":"DC"}'
  '{"name":"Rajasthan Royals","code":"RR"}'
  '{"name":"Punjab Kings","code":"PBKS"}'
  '{"name":"Sunrisers Hyderabad","code":"SRH"}'
)

for team in "${teams[@]}"; do
  curl -X POST "http://localhost:8000/api/v1/tournaments/$TOURNAMENT_ID/teams" \
    -H "Content-Type: application/json" \
    -d "$team"
  echo ""
done
```

### List Teams in Tournament
```bash
curl -X GET "http://localhost:8000/api/v1/tournaments/{tournament_id}/teams"
```

### Update Team
```bash
curl -X PUT "http://localhost:8000/api/v1/teams/{team_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mumbai Indians 2.0",
    "logo_url": "https://example.com/new-logo.png"
  }'
```

### Delete Team
```bash
curl -X DELETE "http://localhost:8000/api/v1/teams/{team_id}"
```

---

## 3. Venue Management

### Add Venue
```bash
curl -X POST "http://localhost:8000/api/v1/tournaments/{tournament_id}/venues" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wankhede Stadium",
    "city": "Mumbai",
    "capacity": 33000,
    "latitude": 18.9388,
    "longitude": 72.8258,
    "address": "D Road, Churchgate, Mumbai"
  }'
```

### Bulk Add Venues (Script)
```bash
#!/bin/bash
TOURNAMENT_ID="your-tournament-id-here"

venues=(
  '{"name":"Wankhede Stadium","city":"Mumbai","capacity":33000,"latitude":18.9388,"longitude":72.8258}'
  '{"name":"M. A. Chidambaram Stadium","city":"Chennai","capacity":50000,"latitude":13.0627,"longitude":80.2792}'
  '{"name":"Eden Gardens","city":"Kolkata","capacity":66000,"latitude":22.5645,"longitude":88.3433}'
  '{"name":"M. Chinnaswamy Stadium","city":"Bangalore","capacity":40000,"latitude":12.9792,"longitude":77.5993}'
)

for venue in "${venues[@]}"; do
  curl -X POST "http://localhost:8000/api/v1/tournaments/$TOURNAMENT_ID/venues" \
    -H "Content-Type: application/json" \
    -d "$venue"
  echo ""
done
```

### List Venues
```bash
curl -X GET "http://localhost:8000/api/v1/tournaments/{tournament_id}/venues"
```

---

## 4. Schedule Generation (AI-Powered) 🤖

### Generate Schedule
```bash
curl -X POST "http://localhost:8000/api/v1/tournaments/{tournament_id}/generate-schedule" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Schedule generated successfully",
  "matches_scheduled": 28,
  "conflicts": [],
  "warnings": [],
  "schedule_summary": {
    "total_matches": 28,
    "status": "optimal"
  }
}
```

### Get Generated Schedule
```bash
curl -X GET "http://localhost:8000/api/v1/tournaments/{tournament_id}/matches"
```

**Response:**
```json
[
  {
    "id": "match-id-1",
    "tournament_id": "tournament-id",
    "team1_id": "team1-id",
    "team2_id": "team2-id",
    "venue_id": "venue-id",
    "scheduled_start": "2024-03-15T10:00:00",
    "scheduled_end": "2024-03-15T14:00:00",
    "match_number": 1,
    "status": "scheduled",
    "team1": {
      "id": "team1-id",
      "name": "Mumbai Indians",
      "code": "MI"
    },
    "team2": {
      "id": "team2-id",
      "name": "Chennai Super Kings",
      "code": "CSK"
    },
    "venue": {
      "id": "venue-id",
      "name": "Wankhede Stadium",
      "city": "Mumbai"
    }
  },
  ...
]
```

### Clear Schedule (Regenerate)
```bash
curl -X DELETE "http://localhost:8000/api/v1/tournaments/{tournament_id}/matches"
```

---

## 5. Match Management

### Get Single Match
```bash
curl -X GET "http://localhost:8000/api/v1/matches/{match_id}"
```

### Update Match (Reschedule)
```bash
curl -X PUT "http://localhost:8000/api/v1/matches/{match_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_start": "2024-03-16T14:00:00",
    "scheduled_end": "2024-03-16T18:00:00",
    "venue_id": "different-venue-id"
  }'
```

### Update Match Status
```bash
curl -X PUT "http://localhost:8000/api/v1/matches/{match_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

### Update Match Results
```bash
curl -X PUT "http://localhost:8000/api/v1/matches/{match_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "team1_score": "180/7",
    "team2_score": "175/9",
    "winner_id": "team1-id"
  }'
```

### Manually Create Match
```bash
curl -X POST "http://localhost:8000/api/v1/tournaments/{tournament_id}/matches" \
  -H "Content-Type: application/json" \
  -d '{
    "team1_id": "team1-id",
    "team2_id": "team2-id",
    "venue_id": "venue-id",
    "scheduled_start": "2024-03-20T10:00:00",
    "scheduled_end": "2024-03-20T14:00:00",
    "match_number": 99,
    "round": "Final"
  }'
```

---

## 6. Complete Workflow Example

### Python Script - Complete Tournament Setup
```python
import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1"

# 1. Create Tournament
tournament = requests.post(f"{BASE_URL}/tournaments/", json={
    "name": "Test Tournament",
    "format": "round_robin",
    "start_date": (datetime.now() + timedelta(days=7)).isoformat(),
    "end_date": (datetime.now() + timedelta(days=30)).isoformat(),
    "match_duration_hours": 4,
    "min_rest_hours": 24,
    "slots_per_day": 2
}).json()

tournament_id = tournament["id"]
print(f"Created tournament: {tournament_id}")

# 2. Add Teams
teams_data = [
    {"name": "Team A", "code": "TA"},
    {"name": "Team B", "code": "TB"},
    {"name": "Team C", "code": "TC"},
    {"name": "Team D", "code": "TD"}
]

for team in teams_data:
    requests.post(
        f"{BASE_URL}/tournaments/{tournament_id}/teams",
        json=team
    )
    print(f"Added team: {team['name']}")

# 3. Add Venues
venues_data = [
    {"name": "Stadium 1", "city": "City A", "capacity": 50000},
    {"name": "Stadium 2", "city": "City B", "capacity": 40000}
]

for venue in venues_data:
    requests.post(
        f"{BASE_URL}/tournaments/{tournament_id}/venues",
        json=venue
    )
    print(f"Added venue: {venue['name']}")

# 4. Generate Schedule
result = requests.post(
    f"{BASE_URL}/tournaments/{tournament_id}/generate-schedule"
).json()

print(f"\nSchedule Generated:")
print(f"Success: {result['success']}")
print(f"Matches: {result['matches_scheduled']}")

# 5. Get Schedule
matches = requests.get(
    f"{BASE_URL}/tournaments/{tournament_id}/matches"
).json()

print(f"\nScheduled Matches: {len(matches)}")
for match in matches[:5]:
    print(f"Match {match['match_number']}: {match['scheduled_start']}")
```

---

## 7. Error Handling

### Validation Error Example
```bash
curl -X POST "http://localhost:8000/api/v1/tournaments/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "T",
    "end_date": "2024-01-01T00:00:00",
    "start_date": "2024-12-31T00:00:00"
  }'
```

**Response:**
```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "ensure this value has at least 3 characters",
      "type": "value_error.any_str.min_length"
    },
    {
      "loc": ["body", "end_date"],
      "msg": "end_date must be after start_date",
      "type": "value_error"
    }
  ]
}
```

---

## 8. Advanced Features

### Custom Scheduling Parameters
```bash
curl -X POST "http://localhost:8000/api/v1/tournaments/{tournament_id}/generate-schedule" \
  -H "Content-Type: application/json" \
  -d '{
    "optimize_for": "balanced",
    "allow_back_to_back": false,
    "preferred_start_hour": 14
  }'
```

### Tournament Formats
- `round_robin`: Each team plays every other team once
- `double_round_robin`: Each team plays every other team twice (home and away)
- `knockout`: Single elimination tournament
- `league`: Same as round_robin

---

## Health Check
```bash
curl -X GET "http://localhost:8000/health"
```

**Response:**
```json
{
  "status": "healthy",
  "service": "cricket-tournament-scheduler"
}
```

---

## Interactive API Documentation

Visit these URLs when the server is running:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

These provide:
- Interactive API testing
- Request/response schemas
- Example values
- Try it out functionality
