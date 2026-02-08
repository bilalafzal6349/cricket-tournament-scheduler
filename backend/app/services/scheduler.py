from ortools.sat.python import cp_model
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from app.models import Tournament, Team, Venue, Match, MatchStatus
from app.schemas.schemas import ScheduleGenerateRequest

logger = logging.getLogger(__name__)


class CricketScheduler:
    """
    AI-powered constraint programming scheduler for cricket tournaments.
    Uses Google OR-Tools CP-SAT solver to find optimal conflict-free schedules.
    """
    
    def __init__(self, db: Session, tournament_id: str):
        self.db = db
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        
        # Load tournament data
        # Ensure tournament_id is UUID for SQLAlchemy
        self.tournament_id = UUID(tournament_id) if isinstance(tournament_id, str) else tournament_id
        
        self.tournament = db.query(Tournament).filter(Tournament.id == self.tournament_id).first()
        if not self.tournament:
            raise ValueError(f"Tournament {tournament_id} not found")
        
        self.teams = db.query(Team).filter(Team.tournament_id == self.tournament_id).all()
        self.venues = db.query(Venue).filter(Venue.tournament_id == self.tournament_id).all()
        
        if len(self.teams) < 2:
            raise ValueError("At least 2 teams required for scheduling")
        if len(self.venues) < 1:
            raise ValueError("At least 1 venue required for scheduling")
        
        self.num_teams = len(self.teams)
        self.num_venues = len(self.venues)
        
        # Calculate time slots
        self.time_slots = self._calculate_time_slots()
        self.num_slots = len(self.time_slots)
        
        logger.info(f"Initialized scheduler: {self.num_teams} teams, {self.num_venues} venues, {self.num_slots} slots")
    
    def _calculate_time_slots(self) -> List[datetime]:
        """Calculate all available time slots based on tournament dates and settings."""
        slots = []
        current_date = self.tournament.start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = self.tournament.end_date
        
        slots_per_day = self.tournament.slots_per_day
        match_duration = self.tournament.match_duration_hours
        
        # Default slot start times (can be customized)
        slot_hours = []
        if slots_per_day == 1:
            slot_hours = [14]  # 2 PM
        elif slots_per_day == 2:
            slot_hours = [10, 18]  # 10 AM, 6 PM
        elif slots_per_day == 3:
            slot_hours = [10, 14, 18]  # 10 AM, 2 PM, 6 PM
        else:
            # Distribute evenly from 9 AM to 9 PM
            slot_hours = [9 + i * (12 // slots_per_day) for i in range(slots_per_day)]
        
        while current_date <= end_date:
            for hour in slot_hours:
                slot_time = current_date.replace(hour=hour)
                if slot_time <= end_date:
                    slots.append(slot_time)
            current_date += timedelta(days=1)
        
        return slots
    
    def _generate_match_pairs(self) -> List[Tuple[int, int]]:
        """Generate all match pairs based on tournament format."""
        pairs = []
        
        if self.tournament.format.value in ["round_robin", "league"]:
            # Each team plays each other team once
            for i in range(self.num_teams):
                for j in range(i + 1, self.num_teams):
                    pairs.append((i, j))
        
        elif self.tournament.format.value == "double_round_robin":
            # Each team plays each other team twice (home and away)
            for i in range(self.num_teams):
                for j in range(self.num_teams):
                    if i != j:
                        pairs.append((i, j))
        
        elif self.tournament.format.value == "knockout":
            # Simple knockout (single elimination)
            # For hackathon, we'll do a simple bracket
            num_matches = self.num_teams - 1
            for i in range(num_matches):
                # This is simplified; real knockout needs proper bracket logic
                team1_idx = i % self.num_teams
                team2_idx = (i + 1) % self.num_teams
                if team1_idx != team2_idx:
                    pairs.append((team1_idx, team2_idx))
        
        return pairs
    
    def _validate_feasibility(self, num_matches: int) -> Tuple[bool, List[str]]:
        """
        Pre-validate if scheduling is feasible before running the solver.
        Returns (is_feasible, list_of_issues)
        """
        issues = []
        
        # Check 1: Enough time slots for all matches
        if num_matches > self.num_slots * self.num_venues:
            issues.append(
                f"Not enough time slots: {num_matches} matches need {num_matches} slots, "
                f"but only {self.num_slots * self.num_venues} available "
                f"({self.num_slots} slots × {self.num_venues} venues)"
            )
            issues.append(f"💡 Solution: Extend tournament to {self.tournament.end_date + timedelta(days=2)} or add more venues")
        
        # Check 2: Minimum slots needed considering rest periods
        min_rest_slots = max(1, self.tournament.min_rest_hours // self.tournament.match_duration_hours)
        matches_per_team = {}
        match_pairs = self._generate_match_pairs()
        
        for t1, t2 in match_pairs:
            matches_per_team[t1] = matches_per_team.get(t1, 0) + 1
            matches_per_team[t2] = matches_per_team.get(t2, 0) + 1
        
        max_team_matches = max(matches_per_team.values()) if matches_per_team else 0
        min_slots_needed = max_team_matches * (1 + min_rest_slots)
        
        if min_slots_needed > self.num_slots:
            issues.append(
                f"Rest period too strict: Teams need {min_slots_needed} slots with {self.tournament.min_rest_hours}h rest, "
                f"but only {self.num_slots} available"
            )
            issues.append(f"💡 Solution: Reduce rest period to {self.tournament.match_duration_hours * 2}h or extend tournament")
        
        # Check 3: At least 2 teams and 1 venue (already checked in __init__, but double-check)
        if self.num_teams < 2:
            issues.append("Need at least 2 teams for a tournament")
        
        if self.num_venues < 1:
            issues.append("Need at least 1 venue for matches")
        
        # Check 4: Warn if very tight constraints
        utilization = (num_matches / (self.num_slots * self.num_venues)) * 100
        if utilization > 80:
            issues.append(
                f"⚠️  Warning: High utilization ({utilization:.1f}%) - schedule may be very tight"
            )
        
        return (len(issues) == 0 or all('Warning' in issue or '💡' in issue for issue in issues), issues)

    
    def generate_schedule(self, request: Optional[ScheduleGenerateRequest] = None) -> Dict:
        """
        Generate optimal schedule using constraint programming.
        Returns dict with success status and scheduled matches.
        """
        try:
            match_pairs = self._generate_match_pairs()
            num_matches = len(match_pairs)
            
            logger.info(f"Generating schedule for {num_matches} matches")
            
            # PRE-VALIDATION: Check if schedule is feasible
            is_feasible, issues = self._validate_feasibility(num_matches)
            if not is_feasible:
                logger.warning(f"Feasibility check failed: {issues}")
                return {
                    "success": False,
                    "message": "Schedule not feasible with current constraints",
                    "matches_scheduled": 0,
                    "conflicts": issues
                }
            
            # Log warnings but continue
            for issue in issues:
                if '⚠️' in issue or '💡' in issue:
                    logger.info(issue)

            
            # Create decision variables
            # match_vars[m, s, v] = 1 if match m is scheduled at slot s in venue v
            match_vars = {}
            for m in range(num_matches):
                for s in range(self.num_slots):
                    for v in range(self.num_venues):
                        match_vars[(m, s, v)] = self.model.NewBoolVar(f'match_{m}_slot_{s}_venue_{v}')
            
            # CONSTRAINT 1: Each match is scheduled exactly once
            logger.info("Adding constraint: Each match scheduled exactly once")
            for m in range(num_matches):
                self.model.Add(
                    sum(match_vars[(m, s, v)] 
                        for s in range(self.num_slots) 
                        for v in range(self.num_venues)) == 1
                )
            
            # CONSTRAINT 2: At most one match per venue per time slot
            logger.info("Adding constraint: No venue double-booking")
            for s in range(self.num_slots):
                for v in range(self.num_venues):
                    self.model.Add(
                        sum(match_vars[(m, s, v)] for m in range(num_matches)) <= 1
                    )
            
            # CONSTRAINT 3: No team plays multiple matches at the same time
            logger.info("Adding constraint: No team plays simultaneously")
            for s in range(self.num_slots):
                for team_idx in range(self.num_teams):
                    # Find all matches involving this team
                    team_matches = []
                    for m, (t1, t2) in enumerate(match_pairs):
                        if t1 == team_idx or t2 == team_idx:
                            for v in range(self.num_venues):
                                team_matches.append(match_vars[(m, s, v)])
                    
                    if team_matches:
                        self.model.Add(sum(team_matches) <= 1)
            
            # CONSTRAINT 4: Minimum rest period between matches for each team
            # Improved logic: Only prevent scheduling within rest window
            min_rest_slots = max(1, self.tournament.min_rest_hours // self.tournament.match_duration_hours)
            
            logger.info(f"Applying rest period constraint: {self.tournament.min_rest_hours}h ({min_rest_slots} slots)")
            
            for team_idx in range(self.num_teams):
                # Get all matches for this team
                team_match_indices = []
                for m, (t1, t2) in enumerate(match_pairs):
                    if t1 == team_idx or t2 == team_idx:
                        team_match_indices.append(m)
                
                # For each pair of matches involving this team
                for i, m1 in enumerate(team_match_indices):
                    for m2 in team_match_indices[i+1:]:
                        # Ensure matches are separated by at least min_rest_slots
                        for s1 in range(self.num_slots):
                            for v1 in range(self.num_venues):
                                # If m1 is scheduled at slot s1
                                # Then m2 cannot be scheduled in slots [s1 - min_rest_slots, s1 + min_rest_slots]
                                forbidden_slots = range(
                                    max(0, s1 - min_rest_slots),
                                    min(self.num_slots, s1 + min_rest_slots + 1)
                                )
                                
                                for s2 in forbidden_slots:
                                    if s1 == s2:
                                        continue  # Same slot already prevented by constraint 3
                                    
                                    for v2 in range(self.num_venues):
                                        # If m1 at (s1, v1), then NOT m2 at (s2, v2)
                                        self.model.AddBoolOr([
                                            match_vars[(m1, s1, v1)].Not(),
                                            match_vars[(m2, s2, v2)].Not()
                                        ])

            
            # OBJECTIVE: Minimize total span of tournament (optional optimization)
            # This encourages compact scheduling
            max_slot_used = self.model.NewIntVar(0, self.num_slots - 1, 'max_slot')
            for s in range(self.num_slots):
                is_slot_used = self.model.NewBoolVar(f'slot_{s}_used')
                self.model.Add(
                    sum(match_vars[(m, s, v)] 
                        for m in range(num_matches) 
                        for v in range(self.num_venues)) >= 1
                ).OnlyEnforceIf(is_slot_used)
                self.model.Add(
                    sum(match_vars[(m, s, v)] 
                        for m in range(num_matches) 
                        for v in range(self.num_venues)) == 0
                ).OnlyEnforceIf(is_slot_used.Not())
            
            # Solve the model
            logger.info("🚀 Starting CP-SAT solver (max 30 seconds)...")
            self.solver.parameters.max_time_in_seconds = 30.0  # 30 second timeout
            status = self.solver.Solve(self.model)
            
            solve_time = self.solver.WallTime()
            logger.info(f"⏱️  Solver completed in {solve_time:.2f}s, Status: {self.solver.StatusName(status)}")
            
            if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
                # Extract solution
                scheduled_matches = self._extract_solution(match_vars, match_pairs)
                
                # POST-VALIDATION: Verify zero conflicts
                is_valid, validation_conflicts = self._validate_solution(scheduled_matches)
                if not is_valid:
                    logger.error(f"Solution validation failed: {validation_conflicts}")
                    return {
                        "success": False,
                        "message": "Generated schedule has conflicts (solver error)",
                        "matches_scheduled": 0,
                        "conflicts": validation_conflicts
                    }
                
                # Save to database
                self._save_schedule_to_db(scheduled_matches)
                
                logger.info(f"✅ Schedule validated: {len(scheduled_matches)} matches, zero conflicts")
                
                return {
                    "success": True,
                    "message": "Schedule generated successfully with zero conflicts",
                    "matches_scheduled": len(scheduled_matches),
                    "status": "optimal" if status == cp_model.OPTIMAL else "feasible",
                    "schedule": scheduled_matches,
                    "validation": "✅ Zero conflicts verified"
                }
            else:
                # Solver failed - provide detailed error
                error_msg = "Could not find valid schedule"
                suggestions = []
                
                if status == cp_model.INFEASIBLE:
                    error_msg = "Schedule is mathematically impossible with current constraints"
                    suggestions = [
                        "💡 Try extending the tournament by 1-2 days",
                        "💡 Add more venues to allow parallel matches",
                        f"💡 Reduce rest period from {self.tournament.min_rest_hours}h to {self.tournament.match_duration_hours * 2}h",
                        "💡 Reduce number of matches (change tournament format)"
                    ]
                elif status == cp_model.MODEL_INVALID:
                    error_msg = "Scheduling model has errors"
                    suggestions = ["⚠️ Please contact support - this is a system error"]
                
                logger.warning(f"Solver status: {status}, message: {error_msg}")
                
                return {
                    "success": False,
                    "message": error_msg,
                    "matches_scheduled": 0,
                    "conflicts": suggestions if suggestions else ["No feasible schedule found"]
                }
        
        except Exception as e:
            logger.error(f"Scheduling error: {str(e)}", exc_info=True)
            return {
                "success": False,
                "message": f"Scheduling failed: {str(e)}",
                "matches_scheduled": 0
            }
    
    def _extract_solution(self, match_vars: Dict, match_pairs: List[Tuple[int, int]]) -> List[Dict]:
        """Extract the scheduled matches from the solution."""
        scheduled = []
        
        for m, (team1_idx, team2_idx) in enumerate(match_pairs):
            for s in range(self.num_slots):
                for v in range(self.num_venues):
                    if self.solver.Value(match_vars[(m, s, v)]) == 1:
                        scheduled.append({
                            "match_number": m + 1,
                            "team1_id": self.teams[team1_idx].id,
                            "team2_id": self.teams[team2_idx].id,
                            "team1_name": self.teams[team1_idx].name,
                            "team2_name": self.teams[team2_idx].name,
                            "venue_id": self.venues[v].id,
                            "venue_name": self.venues[v].name,
                            "scheduled_start": self.time_slots[s],
                            "scheduled_end": self.time_slots[s] + timedelta(hours=self.tournament.match_duration_hours),
                            "slot_index": s,
                            "venue_index": v
                        })
                        break
        
        # Sort by scheduled time
        scheduled.sort(key=lambda x: x["scheduled_start"])
        
        # Update match numbers sequentially
        for idx, match in enumerate(scheduled):
            match["match_number"] = idx + 1
        
        return scheduled
    
    def _validate_solution(self, scheduled_matches: List[Dict]) -> Tuple[bool, List[str]]:
        """
        Validate the generated schedule has absolutely zero conflicts.
        Returns (is_valid, list_of_conflicts)
        """
        conflicts = []
        
        # Check 1: No team plays multiple matches at the same time
        time_team_map = {}
        for match in scheduled_matches:
            start_time = match["scheduled_start"]
            team1_id = str(match["team1_id"])
            team2_id = str(match["team2_id"])
            
            if start_time not in time_team_map:
                time_team_map[start_time] = set()
            
            if team1_id in time_team_map[start_time]:
                conflicts.append(f"❌ Team {match['team1_name']} plays multiple matches at {start_time}")
            if team2_id in time_team_map[start_time]:
                conflicts.append(f"❌ Team {match['team2_name']} plays multiple matches at {start_time}")
            
            time_team_map[start_time].add(team1_id)
            time_team_map[start_time].add(team2_id)
        
        # Check 2: No venue double-booking
        time_venue_map = {}
        for match in scheduled_matches:
            start_time = match["scheduled_start"]
            venue_id = str(match["venue_id"])
            
            if start_time not in time_venue_map:
                time_venue_map[start_time] = set()
            
            if venue_id in time_venue_map[start_time]:
                conflicts.append(f"❌ Venue {match['venue_name']} double-booked at {start_time}")
            
            time_venue_map[start_time].add(venue_id)
        
        # Check 3: Adequate rest periods
        team_matches = {}
        for match in scheduled_matches:
            team1_id = str(match["team1_id"])
            team2_id = str(match["team2_id"])
            
            if team1_id not in team_matches:
                team_matches[team1_id] = []
            if team2_id not in team_matches:
                team_matches[team2_id] = []
            
            team_matches[team1_id].append(match)
            team_matches[team2_id].append(match)
        
        min_rest_hours = self.tournament.min_rest_hours
        for team_id, matches in team_matches.items():
            sorted_matches = sorted(matches, key=lambda x: x["scheduled_start"])
            for i in range(len(sorted_matches) - 1):
                time_diff = (sorted_matches[i+1]["scheduled_start"] - sorted_matches[i]["scheduled_end"]).total_seconds() / 3600
                if time_diff < min_rest_hours:
                    team_name = sorted_matches[i]["team1_name"] if str(sorted_matches[i]["team1_id"]) == team_id else sorted_matches[i]["team2_name"]
                    conflicts.append(
                        f"❌ Team {team_name} has only {time_diff:.1f}h rest "
                        f"(minimum: {min_rest_hours}h) between matches"
                    )
        
        return (len(conflicts) == 0, conflicts)

    
    def _save_schedule_to_db(self, scheduled_matches: List[Dict]):
        """Save the generated schedule to the database."""
        # Delete existing matches for this tournament
        self.db.query(Match).filter(Match.tournament_id == self.tournament_id).delete()
        
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
        logger.info(f"Saved {len(scheduled_matches)} matches to database")


def generate_tournament_schedule(db: Session, tournament_id: str, request: Optional[ScheduleGenerateRequest] = None) -> Dict:
    """
    Main function to generate schedule for a tournament.
    """
    scheduler = CricketScheduler(db, tournament_id)
    return scheduler.generate_schedule(request)
