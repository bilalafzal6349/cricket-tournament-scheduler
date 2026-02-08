"""
SIMPLIFIED AI SCHEDULER - Better for Hackathon Demo
This version is easier to understand and more reliable for time-constrained demos
"""

from ortools.sat.python import cp_model
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session
import logging

from app.models.models import Tournament, Team, Venue, Match, MatchStatus
from app.schemas.schemas import ScheduleGenerateRequest

logger = logging.getLogger(__name__)


class SimplifiedCricketScheduler:
    """
    Simplified AI scheduler optimized for hackathon demos.
    Focus: Reliability over complexity
    """
    
    def __init__(self, db: Session, tournament_id: str):
        self.db = db
        self.tournament_id = tournament_id
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        
        # Load tournament data
        self.tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not self.tournament:
            raise ValueError(f"Tournament {tournament_id} not found")
        
        self.teams = db.query(Team).filter(Team.tournament_id == tournament_id).all()
        self.venues = db.query(Venue).filter(Venue.tournament_id == tournament_id).all()
        
        # Validation
        if len(self.teams) < 2:
            raise ValueError("Need at least 2 teams to create a schedule")
        if len(self.venues) < 1:
            raise ValueError("Need at least 1 venue to create a schedule")
        
        self.num_teams = len(self.teams)
        self.num_venues = len(self.venues)
        
        # Calculate time slots
        self.time_slots = self._calculate_time_slots()
        self.num_slots = len(self.time_slots)
        
        logger.info(f"Scheduler initialized: {self.num_teams} teams, {self.num_venues} venues, {self.num_slots} time slots")
    
    def _calculate_time_slots(self) -> List[datetime]:
        """Generate all available time slots."""
        slots = []
        current_date = self.tournament.start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = self.tournament.end_date
        
        # Slot times based on slots_per_day
        slot_start_hours = {
            1: [14],           # Single slot: 2 PM
            2: [10, 18],       # Two slots: 10 AM, 6 PM
            3: [10, 14, 18],   # Three slots: 10 AM, 2 PM, 6 PM
        }.get(self.tournament.slots_per_day, [10, 14, 18])
        
        # Generate slots for each day
        while current_date <= end_date:
            for hour in slot_start_hours:
                slot_time = current_date.replace(hour=hour)
                if slot_time <= end_date:
                    slots.append(slot_time)
            current_date += timedelta(days=1)
        
        logger.info(f"Generated {len(slots)} time slots")
        return slots
    
    def _generate_match_pairs(self) -> List[Tuple[int, int]]:
        """Generate match pairs based on tournament format."""
        pairs = []
        
        if self.tournament.format.value in ["round_robin", "league"]:
            # Each team plays every other team once
            for i in range(self.num_teams):
                for j in range(i + 1, self.num_teams):
                    pairs.append((i, j))
        
        elif self.tournament.format.value == "double_round_robin":
            # Each team plays every other team twice
            for i in range(self.num_teams):
                for j in range(self.num_teams):
                    if i != j:
                        pairs.append((i, j))
        
        elif self.tournament.format.value == "knockout":
            # Simple knockout bracket
            num_rounds = self.num_teams - 1
            for i in range(num_rounds):
                team1 = i % self.num_teams
                team2 = (i + 1) % self.num_teams
                if team1 != team2:
                    pairs.append((team1, team2))
        
        logger.info(f"Generated {len(pairs)} match pairs")
        return pairs
    
    def generate_schedule(self, request: Optional[ScheduleGenerateRequest] = None) -> Dict:
        """Generate the schedule using constraint programming."""
        try:
            match_pairs = self._generate_match_pairs()
            num_matches = len(match_pairs)
            
            if num_matches == 0:
                return {
                    "success": False,
                    "message": "No matches to schedule",
                    "matches_scheduled": 0
                }
            
            # Check if we have enough slots
            if num_matches > self.num_slots * self.num_venues:
                return {
                    "success": False,
                    "message": f"Not enough time slots! Need {num_matches} slots but only have {self.num_slots * self.num_venues}. Try extending tournament dates.",
                    "matches_scheduled": 0
                }
            
            logger.info(f"Starting schedule generation for {num_matches} matches")
            
            # Decision variables: match_vars[match_id, slot_id, venue_id]
            match_vars = {}
            for m in range(num_matches):
                for s in range(self.num_slots):
                    for v in range(self.num_venues):
                        match_vars[(m, s, v)] = self.model.NewBoolVar(f'm{m}_s{s}_v{v}')
            
            # CONSTRAINT 1: Each match is scheduled exactly once
            for m in range(num_matches):
                self.model.Add(
                    sum(match_vars[(m, s, v)] 
                        for s in range(self.num_slots) 
                        for v in range(self.num_venues)) == 1
                )
            
            # CONSTRAINT 2: At most one match per venue per time slot
            for s in range(self.num_slots):
                for v in range(self.num_venues):
                    self.model.Add(
                        sum(match_vars[(m, s, v)] for m in range(num_matches)) <= 1
                    )
            
            # CONSTRAINT 3: No team plays multiple matches in the same time slot
            for s in range(self.num_slots):
                for team_idx in range(self.num_teams):
                    team_matches_in_slot = []
                    for m, (t1, t2) in enumerate(match_pairs):
                        if t1 == team_idx or t2 == team_idx:
                            for v in range(self.num_venues):
                                team_matches_in_slot.append(match_vars[(m, s, v)])
                    
                    if team_matches_in_slot:
                        self.model.Add(sum(team_matches_in_slot) <= 1)
            
            # CONSTRAINT 4: Minimum rest between matches (simplified)
            # Calculate minimum slots between matches based on hours
            min_rest_slots = max(1, self.tournament.min_rest_hours // 
                                (24 // self.tournament.slots_per_day))
            
            for team_idx in range(self.num_teams):
                # Get all matches for this team
                team_match_indices = []
                for m, (t1, t2) in enumerate(match_pairs):
                    if t1 == team_idx or t2 == team_idx:
                        team_match_indices.append(m)
                
                # For each pair of matches this team plays
                for i, m1 in enumerate(team_match_indices):
                    for m2 in team_match_indices[i+1:]:
                        # Ensure minimum gap between matches
                        for s1 in range(self.num_slots):
                            for s2 in range(s1 + 1, min(s1 + min_rest_slots + 1, self.num_slots)):
                                # If m1 is in slot s1, m2 cannot be in slots s1 to s1+min_rest
                                for v1 in range(self.num_venues):
                                    for v2 in range(self.num_venues):
                                        self.model.AddBoolOr([
                                            match_vars[(m1, s1, v1)].Not(),
                                            match_vars[(m2, s2, v2)].Not()
                                        ])
            
            # Solve with timeout
            self.solver.parameters.max_time_in_seconds = 60.0  # 1 minute max
            logger.info("Starting CP-SAT solver...")
            status = self.solver.Solve(self.model)
            
            if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
                logger.info(f"Solution found! Status: {'OPTIMAL' if status == cp_model.OPTIMAL else 'FEASIBLE'}")
                
                # Extract solution
                scheduled_matches = self._extract_solution(match_vars, match_pairs)
                
                # Save to database
                self._save_schedule_to_db(scheduled_matches)
                
                return {
                    "success": True,
                    "message": f"Schedule generated successfully! {len(scheduled_matches)} matches scheduled.",
                    "matches_scheduled": len(scheduled_matches),
                    "status": "optimal" if status == cp_model.OPTIMAL else "feasible",
                    "conflicts": [],
                    "schedule_summary": {
                        "total_matches": len(scheduled_matches),
                        "venues_used": self.num_venues,
                        "days_used": len(set(m["scheduled_start"].date() for m in scheduled_matches))
                    }
                }
            else:
                # Solver failed
                status_name = {
                    cp_model.INFEASIBLE: "INFEASIBLE",
                    cp_model.MODEL_INVALID: "MODEL_INVALID",
                    cp_model.UNKNOWN: "UNKNOWN"
                }.get(status, "FAILED")
                
                logger.error(f"Solver failed with status: {status_name}")
                
                suggestions = []
                if status == cp_model.INFEASIBLE:
                    suggestions = [
                        "Try increasing the tournament duration (more days = more time slots)",
                        "Try adding more venues (more parallel matches possible)",
                        "Try reducing minimum rest hours between matches",
                        "Try increasing slots per day"
                    ]
                
                return {
                    "success": False,
                    "message": f"Could not generate valid schedule. The constraints might be too restrictive.",
                    "matches_scheduled": 0,
                    "conflicts": suggestions
                }
        
        except Exception as e:
            logger.error(f"Scheduling error: {str(e)}", exc_info=True)
            return {
                "success": False,
                "message": f"Scheduling failed: {str(e)}",
                "matches_scheduled": 0
            }
    
    def _extract_solution(self, match_vars: Dict, match_pairs: List[Tuple[int, int]]) -> List[Dict]:
        """Extract scheduled matches from the solution."""
        scheduled = []
        
        for m, (team1_idx, team2_idx) in enumerate(match_pairs):
            for s in range(self.num_slots):
                for v in range(self.num_venues):
                    if self.solver.Value(match_vars[(m, s, v)]) == 1:
                        scheduled_start = self.time_slots[s]
                        scheduled_end = scheduled_start + timedelta(hours=self.tournament.match_duration_hours)
                        
                        scheduled.append({
                            "match_number": m + 1,
                            "team1_id": str(self.teams[team1_idx].id),
                            "team2_id": str(self.teams[team2_idx].id),
                            "team1_name": self.teams[team1_idx].name,
                            "team2_name": self.teams[team2_idx].name,
                            "venue_id": str(self.venues[v].id),
                            "venue_name": self.venues[v].name,
                            "scheduled_start": scheduled_start,
                            "scheduled_end": scheduled_end,
                            "slot_index": s,
                            "venue_index": v
                        })
                        break
        
        # Sort by scheduled time
        scheduled.sort(key=lambda x: x["scheduled_start"])
        
        # Update match numbers to be sequential
        for idx, match in enumerate(scheduled):
            match["match_number"] = idx + 1
        
        return scheduled
    
    def _save_schedule_to_db(self, scheduled_matches: List[Dict]):
        """Save the generated schedule to database."""
        # Delete existing scheduled matches (not completed ones)
        self.db.query(Match).filter(
            Match.tournament_id == self.tournament_id,
            Match.status == MatchStatus.SCHEDULED
        ).delete()
        
        # Create new matches
        for match_data in scheduled_matches:
            match = Match(
                tournament_id=self.tournament_id,
                team1_id=match_data["team1_id"],
                team2_id=match_data["team2_id"],
                venue_id=match_data["venue_id"],
                scheduled_start=match_data["scheduled_start"],
                scheduled_end=match_data["scheduled_end"],
                match_number=match_data["match_number"],
                status=MatchStatus.SCHEDULED
            )
            self.db.add(match)
        
        self.db.commit()
        logger.info(f"Successfully saved {len(scheduled_matches)} matches to database")


def generate_tournament_schedule(db: Session, tournament_id: str, 
                                request: Optional[ScheduleGenerateRequest] = None) -> Dict:
    """
    Main entry point for schedule generation.
    """
    scheduler = SimplifiedCricketScheduler(db, tournament_id)
    return scheduler.generate_schedule(request)
