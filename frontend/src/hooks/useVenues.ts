import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '@/services/tournamentService';
import type { VenueCreate } from '@/types';
import { toast } from 'sonner';

export function useAddVenue(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (venue: VenueCreate) => tournamentService.addVenue(tournamentId, venue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] });
      toast.success('Venue added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add venue');
    },
  });
}

export function useDeleteVenue(tournamentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (venueId: string) => tournamentService.deleteVenue(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] });
      toast.success('Venue deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete venue');
    },
  });
}
