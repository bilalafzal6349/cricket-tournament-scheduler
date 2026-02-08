export type TournamentFormat = 
  | 'round_robin' 
  | 'knockout' 
  | 'double_round_robin' 
  | 'league';

export type TournamentStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export type MatchStatus = 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'postponed';

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: TournamentFormat;
  status: TournamentStatus;
  start_date: string;
  end_date: string;
  match_duration_hours: number;
  min_rest_hours: number;
  slots_per_day: number;
  created_at: string;
  updated_at: string;
  settings?: Record<string, any>;
}

export interface TournamentCreate {
  name: string;
  description?: string;
  format: TournamentFormat;
  start_date: string;
  end_date: string;
  match_duration_hours?: number;
  min_rest_hours?: number;
  slots_per_day?: number;
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  code: string;
  logo_url?: string;
  created_at: string;
}

export interface TeamCreate {
  name: string;
  code: string;
  logo_url?: string;
}

export interface Venue {
  id: string;
  tournament_id: string;
  name: string;
  city: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  created_at: string;
}

export interface VenueCreate {
  name: string;
  city: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  venue_id: string;
  scheduled_start: string;
  scheduled_end: string;
  match_number: number;
  round?: string;
  status: MatchStatus;
  team1_score?: string;
  team2_score?: string;
  winner_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Populated fields
  team1?: Team;
  team2?: Team;
  venue?: Venue;
}

export interface TournamentWithDetails extends Tournament {
  teams: Team[];
  venues: Venue[];
  matches: Match[];
}

export interface ScheduleGenerateResponse {
  success: boolean;
  message: string;
  matches_scheduled: number;
  conflicts?: string[];
  warnings?: string[];
  schedule_summary?: {
    total_matches: number;
    status: string;
    venues_used?: number;
    days_used?: number;
  };
}
