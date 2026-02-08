import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { TeamCreate } from '@/types';
import { useEffect } from 'react';

const teamSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2).max(10, 'Code must be between 2 and 10 characters').regex(/^[A-Z0-9]+$/, 'Code must be uppercase alphanumeric'),
  logo_url: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamFormProps {
  onSubmit: (data: TeamCreate) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function TeamForm({ onSubmit, isLoading, onCancel }: TeamFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
  });

  // Auto-uppercase code
  const codeValue = watch('code');
  useEffect(() => {
    if (codeValue) {
      setValue('code', codeValue.toUpperCase());
    }
  }, [codeValue, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <Input
        label="Team Name"
        placeholder="e.g. Mumbai Indians"
        error={errors.name?.message}
        {...register('name')}
      />
      
      <Input
        label="Team Code (Abbreviation)"
        placeholder="e.g. MI"
        error={errors.code?.message}
        {...register('code')}
      />
      
      <Input
        label="Logo URL (Optional)"
        placeholder="https://..."
        error={errors.logo_url?.message}
        {...register('logo_url')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Add Team
        </Button>
      </div>
    </form>
  );
}
