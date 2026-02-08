"""
Quick test script for Cricket Tournament Scheduler API
Run this after starting the backend to test the AI scheduling
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api/v1"


def print_response(response: requests.Response, action: str):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"Action: {action}")
    print(f"Status: {response.status_code}")
    if response.status_code < 400:
        print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")
    else:
        print(f"Error: {response.text}")
    print(f"{'='*60}")


def test_tournament_scheduler():
    """Test the complete tournament scheduling flow"""
    
    print("\n🏏 Cricket Tournament Scheduler - API Test\n")
    
    # Step 1: Create Tournament
    print("Step 1: Creating Tournament...")
    tournament_data = {
        "name": "IPL Test Tournament 2024",
        "description": "Test tournament for AI scheduling",
        "format": "round_robin",
        "start_date": (datetime.now() + timedelta(days=7)).isoformat(),
        "end_date": (datetime.now() + timedelta(days=45)).isoformat(),
        "match_duration_hours": 4,
        "min_rest_hours": 24,
        "slots_per_day": 3
    }
    
    response = requests.post(f"{BASE_URL}/tournaments/", json=tournament_data)
    print_response(response, "Create Tournament")
    
    if response.status_code != 201:
        print("❌ Failed to create tournament. Exiting.")
        return
    
    tournament_id = response.json()["id"]
    print(f"\n✅ Tournament created with ID: {tournament_id}")
    
    # Step 2: Add Teams
    print("\n\nStep 2: Adding Teams...")
    teams = [
        {"name": "Mumbai Indians", "code": "MI"},
        {"name": "Chennai Super Kings", "code": "CSK"},
        {"name": "Royal Challengers Bangalore", "code": "RCB"},
        {"name": "Kolkata Knight Riders", "code": "KKR"},
        {"name": "Delhi Capitals", "code": "DC"},
        {"name": "Rajasthan Royals", "code": "RR"},
    ]
    
    team_ids = []
    for team_data in teams:
        response = requests.post(
            f"{BASE_URL}/tournaments/{tournament_id}/teams",
            json=team_data
        )
        if response.status_code == 201:
            team_ids.append(response.json()["id"])
            print(f"✅ Added team: {team_data['name']}")
        else:
            print(f"❌ Failed to add team: {team_data['name']}")
    
    print(f"\n✅ Added {len(team_ids)} teams")
    
    # Step 3: Add Venues
    print("\n\nStep 3: Adding Venues...")
    venues = [
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
        }
    ]
    
    venue_ids = []
    for venue_data in venues:
        response = requests.post(
            f"{BASE_URL}/tournaments/{tournament_id}/venues",
            json=venue_data
        )
        if response.status_code == 201:
            venue_ids.append(response.json()["id"])
            print(f"✅ Added venue: {venue_data['name']}")
        else:
            print(f"❌ Failed to add venue: {venue_data['name']}")
    
    print(f"\n✅ Added {len(venue_ids)} venues")
    
    # Step 4: Generate AI Schedule 🤖
    print("\n\nStep 4: Generating AI Schedule... 🤖")
    print("This may take a few seconds...")
    
    response = requests.post(
        f"{BASE_URL}/tournaments/{tournament_id}/generate-schedule"
    )
    print_response(response, "Generate AI Schedule")
    
    if response.status_code != 200:
        print("❌ Failed to generate schedule")
        return
    
    schedule_result = response.json()
    print(f"\n✅ Schedule Generation Result:")
    print(f"   Success: {schedule_result['success']}")
    print(f"   Matches Scheduled: {schedule_result['matches_scheduled']}")
    print(f"   Message: {schedule_result['message']}")
    
    # Step 5: View Generated Schedule
    print("\n\nStep 5: Viewing Generated Schedule...")
    response = requests.get(f"{BASE_URL}/tournaments/{tournament_id}/matches")
    
    if response.status_code == 200:
        matches = response.json()
        print(f"\n✅ Retrieved {len(matches)} matches")
        
        print("\n📅 First 10 Matches:")
        print("-" * 80)
        for match in matches[:10]:
            print(f"Match #{match['match_number']}")
            print(f"  Time: {match['scheduled_start']}")
            print(f"  Status: {match['status']}")
            print("-" * 80)
    else:
        print("❌ Failed to retrieve matches")
    
    # Step 6: Get Tournament Details
    print("\n\nStep 6: Getting Complete Tournament Details...")
    response = requests.get(f"{BASE_URL}/tournaments/{tournament_id}")
    
    if response.status_code == 200:
        tournament = response.json()
        print(f"\n✅ Tournament Details:")
        print(f"   Name: {tournament['name']}")
        print(f"   Format: {tournament['format']}")
        print(f"   Teams: {len(tournament['teams'])}")
        print(f"   Venues: {len(tournament['venues'])}")
        print(f"   Matches: {len(tournament['matches'])}")
        print(f"   Status: {tournament['status']}")
    
    print("\n\n" + "="*60)
    print("🎉 Test Completed Successfully!")
    print("="*60)
    print(f"\nTournament ID: {tournament_id}")
    print(f"View in Swagger UI: http://localhost:8000/api/docs")
    print("="*60 + "\n")


if __name__ == "__main__":
    try:
        # Test health endpoint first
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Backend is running")
            test_tournament_scheduler()
        else:
            print("❌ Backend health check failed")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running?")
        print("Start backend with: docker-compose up -d")
        print("Or: uvicorn app.main:app --reload")
