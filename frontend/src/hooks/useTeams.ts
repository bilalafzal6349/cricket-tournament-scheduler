import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '@/services/tournamentService';
import type { TeamCreate } from '@/types';
import { toast } from 'sonner';

export function useAddTeam(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (team: TeamCreate) => tournamentService.addTeam(tournamentId, team),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] });
      toast.success('Team added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add team');
    },
  });
}

export function useDeleteTeam(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (teamId: string) => tournamentService.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] });
      toast.success('Team deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete team');
    },
  });
}
