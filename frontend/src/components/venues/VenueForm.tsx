import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { VenueCreate } from '@/types';

const venueSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  city: z.string().min(2, 'City is required'),
  capacity: z.coerce.number().min(0).optional(),
  address: z.string().optional(),
});

type VenueFormData = z.infer<typeof venueSchema>;

interface VenueFormProps {
  onSubmit: (data: VenueCreate) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function VenueForm({ onSubmit, isLoading, onCancel }: VenueFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema) as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <Input
        label="Venue Name"
        placeholder="e.g. Wankhede Stadium"
        error={errors.name?.message}
        {...register('name')}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          placeholder="e.g. Mumbai"
          error={errors.city?.message}
          {...register('city')}
        />
        <Input
          type="number"
          label="Capacity"
          placeholder="e.g. 33000"
          error={errors.capacity?.message}
          {...register('capacity')}
        />
      </div>

      <Input
        label="Address (Optional)"
        placeholder="Full address..."
        error={errors.address?.message}
        {...register('address')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Add Venue
        </Button>
      </div>
    </form>
  );
}
