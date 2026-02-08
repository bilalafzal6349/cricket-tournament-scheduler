import { Calendar, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Tournament } from '@/types';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-50 text-blue-700',
    in_progress: 'bg-warning-50 text-warning-700',
    completed: 'bg-success-50 text-success-700',
    cancelled: 'bg-danger-50 text-danger-700',
  };

  const statusLabels = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide",
            statusColors[tournament.status]
          )}>
            {statusLabels[tournament.status]}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            {tournament.format.replace(/_/g, ' ')}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {tournament.name}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}</span>
          </div>
          {/* Note: In a real app, you might want to fetch team count separately or include it in the list endpoint */}
        </div>
      </div>

      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <Link to={`/tournaments/${tournament.id}`} className="w-full">
          <Button variant="outline" className="w-full justify-between group">
            Manage
            <Trophy className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
