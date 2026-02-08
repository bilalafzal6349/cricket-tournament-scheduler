import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTournament } from '@/hooks/useTournaments';
import { useAddTeam } from '@/hooks/useTeams';
import { useAddVenue } from '@/hooks/useVenues';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TeamList } from '@/components/teams/TeamList';
import { TeamForm } from '@/components/teams/TeamForm';
import { VenueList } from '@/components/venues/VenueList';
import { VenueForm } from '@/components/venues/VenueForm';

import { ArrowLeft, Users, MapPin, Calendar, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleView } from '@/components/schedule/ScheduleView';

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: tournament, isLoading } = useTournament(id!);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'venues' | 'schedule'>('teams');
  
  // Modal states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);

  const { mutate: addTeam, isPending: isAddingTeam } = useAddTeam(id!);
  const { mutate: addVenue, isPending: isAddingVenue } = useAddVenue(id!);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!tournament) return <div>Tournament not found</div>;

  const tabs = [
    { id: 'teams', label: 'Teams', icon: Users, count: tournament.teams?.length || 0 },
    { id: 'venues', label: 'Venues', icon: MapPin, count: tournament.venues?.length || 0 },
    { id: 'schedule', label: 'Schedule', icon: Calendar, count: tournament.matches?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/tournaments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tournaments
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
            <p className="text-gray-500 mt-1">
              {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()} • {tournament.format.replace(/_/g, ' ')}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline">Edit Details</Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={cn(
                "ml-1 py-0.5 px-2 rounded-full text-xs",
                activeTab === tab.id ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-600"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'teams' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Participating Teams</h2>
              {isAdmin && (
                <Button onClick={() => setIsTeamModalOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Team
                </Button>
              )}
            </div>
            <TeamList teams={tournament.teams} tournamentId={tournament.id} isAdmin={isAdmin} />
          </div>
        )}

        {activeTab === 'venues' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Tournament Venues</h2>
              {isAdmin && (
                <Button onClick={() => setIsVenueModalOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Venue
                </Button>
              )}
            </div>
            <VenueList venues={tournament.venues} tournamentId={tournament.id} isAdmin={isAdmin} />
          </div>
        )}
        
        {activeTab === 'schedule' && (
          <ScheduleView 
            tournamentId={tournament.id}
            matches={tournament.matches || []}
            hasTeams={tournament.teams?.length >= 2}
            hasVenues={tournament.venues?.length >= 1}
            isLoading={isLoading}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
        title="Add New Team"
      >
        <TeamForm 
          onSubmit={(data) => {
            addTeam(data, { onSuccess: () => setIsTeamModalOpen(false) });
          }}
          isLoading={isAddingTeam}
          onCancel={() => setIsTeamModalOpen(false)}
        />
      </Modal>

      <Modal 
        isOpen={isVenueModalOpen} 
        onClose={() => setIsVenueModalOpen(false)} 
        title="Add New Venue"
      >
        <VenueForm 
          onSubmit={(data) => {
            addVenue(data, { onSuccess: () => setIsVenueModalOpen(false) });
          }}
          isLoading={isAddingVenue}
          onCancel={() => setIsVenueModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
