import type { Team } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trash2, Users } from 'lucide-react';
import { useDeleteTeam } from '@/hooks/useTeams';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';

interface TeamListProps {
  teams: Team[];
  tournamentId: string;
  isAdmin?: boolean;
}

export function TeamList({ teams, tournamentId, isAdmin = false }: TeamListProps) {
  const { mutate: deleteTeam, isPending } = useDeleteTeam(tournamentId);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const handleDelete = () => {
    if (teamToDelete) {
      deleteTeam(teamToDelete.id, {
        onSuccess: () => {
          setTeamToDelete(null);
        }
      });
    }
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No teams added yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="p-4 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  team.code.substring(0, 2)
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{team.name}</h4>
                <p className="text-xs text-gray-500 font-mono">{team.code}</p>
              </div>
            </div>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTeamToDelete(team)}
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
        isOpen={!!teamToDelete}
        onClose={() => setTeamToDelete(null)}
        onConfirm={handleDelete}
        title="Remove Team"
        message={`Are you sure you want to remove "${teamToDelete?.name}" from this tournament? This action cannot be undone and will affect any existing schedules.`}
        confirmText="Yes, Remove Team"
        cancelText="Cancel"
        variant="danger"
        isLoading={isPending}
      />
    </>
  );
}
