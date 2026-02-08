import { TournamentForm } from '@/components/tournaments/TournamentForm';
import { useCreateTournament } from '@/hooks/useTournaments';
import type { TournamentCreate } from '@/types';
import { useNavigate } from 'react-router-dom';

export function CreateTournamentPage() {
  const { mutate: createTournament, isPending } = useCreateTournament();
  const navigate = useNavigate();

  const handleSubmit = (data: TournamentCreate) => {
    console.log('Submitting tournament:', data);
    
    // Ensure dates are in ISO format with time
    const formattedData = {
      ...data,
      start_date: new Date(data.start_date).toISOString(),
      end_date: new Date(data.end_date).toISOString()
    };
    
    console.log('Formatted tournament data:', formattedData);

    createTournament(formattedData, {
      onSuccess: (newTournament) => {
        console.log('Tournament created successfully:', newTournament);
        if (newTournament && newTournament.id) {
          console.log(`Navigating to /tournaments/${newTournament.id}`);
          navigate(`/tournaments/${newTournament.id}`);
        } else {
          console.error('New tournament data missing ID:', newTournament);
        }
      },
      onError: (error) => {
        console.error('Create tournament failed:', error);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Tournament</h1>
        <p className="text-gray-500">Configure your tournament details and scheduling rules.</p>
      </div>

      <TournamentForm 
        onSubmit={handleSubmit} 
        isLoading={isPending} 
      />
    </div>
  );
}
