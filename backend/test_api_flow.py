import urllib.request
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def log(msg):
    print(f"[TEST] {msg}")

def request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    req = urllib.request.Request(url, method=method, headers=headers)
    
    if data:
        json_data = json.dumps(data).encode("utf-8")
        req.data = json_data
        
    try:
        with urllib.request.urlopen(req) as response:
            return {
                "status": response.status,
                "body": json.loads(response.read().decode("utf-8")),
                "success": True
            }
    except urllib.error.HTTPError as e:
        return {
            "status": e.code,
            "body": e.read().decode("utf-8"),
            "success": False
        }
    except Exception as e:
        return {
            "status": 500,
            "body": str(e),
            "success": False
        }

def test_flow():
    # 1. Create Tournament
    log("Creating Tournament...")
    tournament_data = {
        "name": "API Test Tournament",
        "description": "Created via test script",
        "format": "round_robin",
        "start_date": "2024-06-01T00:00:00",
        "end_date": "2024-06-15T00:00:00",
        "match_duration_hours": 4,
        "min_rest_hours": 24,
        "slots_per_day": 3
    }
    
    res = request("POST", "/tournaments/", tournament_data)
    if not res["success"]:
        log(f"FAILED to create tournament: {res['status']} {res['body']}")
        return
    
    t_id = res["body"]["id"]
    log(f"Tournament created: {t_id}")
    
    # 2. Add Teams
    teams = ["Team A", "Team B", "Team C", "Team D"]
    for i, name in enumerate(teams):
        team_data = {"name": name, "code": f"T{i}"}
        res = request("POST", f"/tournaments/{t_id}/teams", team_data)
        if not res["success"]:
            log(f"FAILED to add team {name}: {res['body']}")
            return
    log(f"Added {len(teams)} teams")

    # 3. Add Venue
    venue_data = {
        "name": "Test Venue",
        "city": "Test City",
        "capacity": 10000,
        "latitude": 0,
        "longitude": 0
    }
    res = request("POST", f"/tournaments/{t_id}/venues", venue_data)
    if not res["success"]:
        log(f"FAILED to add venue: {res['body']}")
        return
    log("Added venue")

    # 4. Generate Schedule
    log("Generating Schedule...")
    res = request("POST", f"/tournaments/{t_id}/generate-schedule")
    if not res["success"]:
        log(f"FAILED to generate schedule: {res['status']} {res['body']}")
        return
        
    schedule = res["body"]
    if schedule.get("success"):
        log(f"SUCCESS! Scheduled {schedule['matches_scheduled']} matches.")
    else:
        log(f"Schedule generation returned success=False: {schedule}")

if __name__ == "__main__":
    test_flow()
