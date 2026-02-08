import type { Tournament } from '@/types';
import { TournamentCard } from './TournamentCard';
import { Spinner } from '@/components/ui/Spinner';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface TournamentListProps {
  tournaments?: Tournament[];
  isLoading: boolean;
}

export function TournamentList({ tournaments, isLoading }: TournamentListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <PlusCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No tournaments found</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Get started by creating your first cricket tournament. It only takes a minute.
        </p>
        <Link to="/tournaments/new">
          <Button>Create Tournament</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  );
}
