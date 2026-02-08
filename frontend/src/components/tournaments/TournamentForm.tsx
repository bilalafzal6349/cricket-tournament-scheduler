import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { TournamentCreate } from '@/types';
import { useNavigate } from 'react-router-dom';

const tournamentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  format: z.enum(['round_robin', 'knockout', 'double_round_robin', 'league']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  match_duration_hours: z.coerce.number().min(1).max(12),
  min_rest_hours: z.coerce.number().min(0).max(168),
  slots_per_day: z.coerce.number().min(1).max(10),
}).refine(data => new Date(data.end_date) >= new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

interface TournamentFormProps {
  initialData?: Partial<TournamentFormData>;
  onSubmit: (data: TournamentCreate) => void;
  isLoading: boolean;
  isEdit?: boolean;
}

export function TournamentForm({ initialData, onSubmit, isLoading, isEdit }: TournamentFormProps) {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema) as any,
    defaultValues: {
      match_duration_hours: 4,
      min_rest_hours: 24,
      slots_per_day: 3,
      format: 'round_robin',
      ...initialData,
    },
  });

  
  console.log('TournamentForm Errors:', errors);
  
  const onError = (errors: any) => {
    console.error('Form Validation Errors - onError triggered:', errors);
    alert('Form validation failed! Check console for details.'); 
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any, onError)} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <h4 className="font-bold mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside text-sm">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{key}: {(error as any).message}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
          Basic Information
        </h3>
        
        <Input
          label="Tournament Name"
          placeholder="e.g. Summer Cricket League 2026"
          error={errors.name?.message}
          {...register('name')}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            error={errors.start_date?.message}
            {...register('start_date')}
          />
          <Input
            type="date"
            label="End Date"
            error={errors.end_date?.message}
            {...register('end_date')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
          <select
            className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            {...register('format')}
          >
            <option value="round_robin">Round Robin</option>
            <option value="knockout">Knockout</option>
            <option value="double_round_robin">Double Round Robin</option>
            <option value="league">League</option>
          </select>
          {errors.format && <p className="mt-1 text-xs text-danger-500">{errors.format.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-y"
            placeholder="Details about the tournament..."
            {...register('description')}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
          Scheduling Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="number"
            label="Match Duration (Hours)"
            error={errors.match_duration_hours?.message}
            {...register('match_duration_hours')}
          />
          <Input
            type="number"
            label="Min Rest (Hours)"
            error={errors.min_rest_hours?.message}
            {...register('min_rest_hours')}
          />
          <Input
            type="number"
            label="Matches Per Day"
            error={errors.slots_per_day?.message}
            {...register('slots_per_day')}
          />
        </div>
        <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <strong>Tip:</strong> These settings help the AI generate the optimal schedule for your teams and venues.
        </p>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? 'Update Tournament' : 'Create Tournament'}
        </Button>
      </div>
    </form>
  );
}
