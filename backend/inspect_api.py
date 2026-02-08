import urllib.request
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def get_tournaments():
    url = f"{BASE_URL}/tournaments/"
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode("utf-8"))

def inspect():
    print("Fetching tournaments...", flush=True)
    try:
        tournaments = get_tournaments()
    except Exception as e:
        print(f"Failed to fetch tournaments: {e}", flush=True)
        return

    if not tournaments:
        print("No tournaments found.", flush=True)
        return

    print(f"Found {len(tournaments)} tournaments.", flush=True)

    found = False
    for t in tournaments:
        t_id = t['id']
        try:
            matches = get_matches(t_id)
        except Exception as e:
            print(f"Failed to fetch matches for {t_id}: {e}", flush=True)
            continue
            
        if len(matches) > 0:
            print(f"FOUND MATCHES in tournament: {t['name']} ({t_id})", flush=True)
            print(f"Count: {len(matches)}", flush=True)
            
            m = matches[0]
            print("\n--- First Match Data ---", flush=True)
            print(json.dumps(m, indent=2), flush=True)
            
            print("\n--- Relationship Checks ---", flush=True)
            print(f"team1 present? {'team1' in m}", flush=True)
            print(f"team1 value: {m.get('team1')}", flush=True)
            print(f"venue present? {'venue' in m}", flush=True)
            print(f"venue value: {m.get('venue')}", flush=True)
            
            found = True
            break
            
    if not found:
        print("No matches found in any tournament.", flush=True)
