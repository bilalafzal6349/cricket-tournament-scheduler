import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '@/services/tournamentService';
import { toast } from 'sonner';

export function useMatches(tournamentId: string) {
  return useQuery({
    queryKey: ['matches', tournamentId],
    queryFn: () => tournamentService.getMatches(tournamentId),
    enabled: !!tournamentId,
  });
}

export function useScheduleGenerator(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const start = Date.now();
      console.log(`[SCHEDULE] Generating schedule for tournament ${tournamentId}...`);
      const result = await tournamentService.generateSchedule(tournamentId);
      const duration = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`[SCHEDULE] Generation completed in ${duration}s:`, result);
      return { ...result, duration };
    },
    onSuccess: () => {
      // Invalidate both matches AND tournament to get fresh data
      queryClient.invalidateQueries({ queryKey: ['matches', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      // Only toast on manual success handling in component usually, but here is fine too or specific component handled
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to generate schedule');
    },
  });
}

export function useClearSchedule(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => tournamentService.clearSchedule(tournamentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', tournamentId] });
      toast.success('Schedule cleared');
    },
    onError: () => {
      toast.error('Failed to clear schedule');
    },
  });
}
