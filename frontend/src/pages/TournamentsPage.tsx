import { useState } from 'react';
import { useTournaments } from '@/hooks/useTournaments';
import { TournamentList } from '@/components/tournaments/TournamentList';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TournamentsPage() {
  const { data: tournaments, isLoading } = useTournaments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTournaments = tournaments?.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tournaments</h1>
          <p className="text-gray-500">Manage your cricket leagues and schedules</p>
        </div>
        <Link to="/tournaments/new">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search tournaments..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
      </div>

      <TournamentList tournaments={filteredTournaments} isLoading={isLoading} />
    </div>
  );
}
