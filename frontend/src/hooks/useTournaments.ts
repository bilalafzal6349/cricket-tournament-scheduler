import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '@/services/tournamentService';
import type { TournamentCreate } from '@/types';
import { toast } from 'sonner';

export function useTournaments() {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: tournamentService.getAll,
  });
}

export function useTournament(id: string) {
  return useQuery({
    queryKey: ['tournaments', id],
    queryFn: () => tournamentService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TournamentCreate) => tournamentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success('Tournament created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create tournament');
    },
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tournamentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success('Tournament deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete tournament');
    },
  });
}
