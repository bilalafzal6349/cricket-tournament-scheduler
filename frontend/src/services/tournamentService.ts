import { api } from './api';
import type { 
  Tournament, 
  TournamentCreate, 
  TournamentWithDetails, 
  TeamCreate, 
  VenueCreate,
  ScheduleGenerateResponse,
  Match
} from '@/types';

export const tournamentService = {
  // Tournaments
  getAll: async () => {
    const { data } = await api.get<Tournament[]>('/tournaments/');
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await api.get<TournamentWithDetails>(`/tournaments/${id}`);
    return data;
  },
  
  create: async (tournament: TournamentCreate) => {
    const { data } = await api.post<Tournament>('/tournaments/', tournament);
    return data;
  },
  
  update: async (id: string, updates: Partial<TournamentCreate>) => {
    const { data } = await api.put<Tournament>(`/tournaments/${id}`, updates);
    return data;
  },
  
  delete: async (id: string) => {
    const { data } = await api.delete<{ success: boolean }>(`/tournaments/${id}`);
    return data;
  },

  // Teams
  addTeam: async (tournamentId: string, team: TeamCreate) => {
    const { data } = await api.post(`/tournaments/${tournamentId}/teams`, team);
    return data;
  },

  deleteTeam: async (teamId: string) => {
    const { data } = await api.delete(`/tournaments/teams/${teamId}`);
    return data;
  },

  // Venues
  addVenue: async (tournamentId: string, venue: VenueCreate) => {
    const { data } = await api.post(`/tournaments/${tournamentId}/venues`, venue);
    return data;
  },

  deleteVenue: async (venueId: string) => {
    const { data } = await api.delete(`/tournaments/venues/${venueId}`);
    return data;
  },
  
  // 🤖 AI SCHEDULING
  generateSchedule: async (id: string) => {
    const { data } = await api.post<ScheduleGenerateResponse>(`/tournaments/${id}/generate-schedule`);
    return data;
  },
  
  getMatches: async (id: string) => {
    const { data } = await api.get<Match[]>(`/tournaments/${id}/matches`);
    return data;
  },

  clearSchedule: async (id: string) => {
    const { data } = await api.delete(`/tournaments/${id}/matches`);
    return data;
  }
};
