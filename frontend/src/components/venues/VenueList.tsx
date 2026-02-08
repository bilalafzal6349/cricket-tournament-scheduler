import type { Venue } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trash2, MapPin } from 'lucide-react';
import { useDeleteVenue } from '@/hooks/useVenues';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';

interface VenueListProps {
  venues: Venue[];
  tournamentId: string;
  isAdmin?: boolean;
}

export function VenueList({ venues, tournamentId, isAdmin = false }: VenueListProps) {
  const { mutate: deleteVenue, isPending } = useDeleteVenue(tournamentId);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  const handleDelete = () => {
    if (venueToDelete) {
      deleteVenue(venueToDelete.id, {
        onSuccess: () => {
          setVenueToDelete(null);
        }
      });
    }
  };

  if (venues.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No venues added yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((venue) => (
          <Card key={venue.id} className="p-4 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{venue.name}</h4>
                <p className="text-xs text-gray-500">{venue.city} • Capacity: {venue.capacity?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVenueToDelete(venue)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-danger-500 hover:text-danger-700 hover:bg-danger-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </Card>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!venueToDelete}
        onClose={() => setVenueToDelete(null)}
        onConfirm={handleDelete}
        title="Remove Venue"
        message={`Are you sure you want to remove "${venueToDelete?.name}" from this tournament? This action cannot be undone and will affect any existing schedules.`}
        confirmText="Yes, Remove Venue"
        cancelText="Cancel"
        variant="danger"
        isLoading={isPending}
      />
    </>
  );
}
