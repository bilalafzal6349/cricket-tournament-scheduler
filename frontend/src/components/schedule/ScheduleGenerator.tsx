import { useScheduleGenerator } from '@/hooks/useScheduleGenerator';
import { toast } from 'sonner';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';

interface ScheduleGeneratorProps {
  tournamentId: string;
  hasTeams: boolean;
  hasVenues: boolean;
  hasMatches: boolean;
}

export function ScheduleGenerator({ 
  tournamentId, 
  hasTeams, 
  hasVenues,
  hasMatches
}: ScheduleGeneratorProps) {
  const { mutate, isPending } = useScheduleGenerator(tournamentId);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleGenerateClick = () => {
    if (hasMatches) {
      setShowConfirmModal(true);
    } else {
      handleGenerate();
    }
  };

  const handleGenerate = () => {
    setShowConfirmModal(false);
    mutate(undefined, {
      onSuccess: (data) => {
        toast.dismiss(); // Clear pending toast
        
        if (data.success) {
          toast.success(`Success! Scheduled ${data.matches_scheduled} matches`, {
            description: data.schedule_summary?.status || 'Schedule generated successfully',
            duration: 5000,
          });
        } else {
          toast.error('Schedule Generation Failed', {
            description: data.message || 'Could not generate schedule',
            duration: 10000,
          });
          
          // Show detailed modal with conflicts
          setTimeout(() => {
            const modal = document.createElement('div');
            modal.innerHTML = `
              <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                  <div class="bg-red-50 px-6 py-4 border-b border-red-100">
                    <h3 class="text-xl font-bold text-red-900 flex items-center gap-2">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Scheduling Conflict Detected
                    </h3>
                  </div>
                  <div class="p-6 overflow-y-auto max-h-[60vh]">
                    <p class="text-gray-700 mb-4 font-medium">${data.message}</p>
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Issues Found:
                      </h4>
                      <ul class="space-y-2 text-sm">
                        ${data.conflicts?.map((conflict: string) => `
                          <li class="flex items-start gap-2 text-gray-700">
                            <span class="text-red-500 font-bold mt-0.5">•</span>
                            <span>${conflict}</span>
                          </li>
                        `).join('') || '<li>Unknown error occurred</li>'}
                      </ul>
                    </div>
                  </div>
                  <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button onclick="this.closest('.fixed').remove()" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                      Got it, I'll fix this
                    </button>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(modal);
          }, 500);
        }
      },
      onError: (error: any) => {
        toast.error('Scheduling Error', {
          description: error?.response?.data?.detail || 'An unexpected error occurred',
          duration: 8000,
        });
      }
    });
  };

  const canGenerate = hasTeams && hasVenues;
  
  if (!canGenerate) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <h3 className="font-semibold text-blue-800 mb-2">Ready to Schedule?</h3>
        <p className="text-sm text-blue-600 mb-4">
          Add at least 2 teams and 1 venue to generate a schedule.
        </p>
        <Button disabled variant="secondary" className="w-full sm:w-auto opacity-50 cursor-not-allowed">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate AI Schedule
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-blue-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2">AI Schedule Generator</h3>
        <p className="text-center text-gray-600 mb-6 max-w-md">
          Use our AI engine to automatically generate a conflict-free schedule optimized for team rest and venue availability.
        </p>
        
        <div className="relative group">
          <button
            onClick={handleGenerateClick}
            disabled={isPending}
            className={`
              relative px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all
              flex items-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0
              ${isPending
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white ring-4 ring-blue-50'
              }
            `}
          >
            {isPending ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 animate-pulse" />
                Generate Schedule with AI
              </>
            )}
          </button>
        </div>

        {hasMatches && (
          <p className="mt-4 text-xs text-orange-600 flex items-center bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning: This will replace the current schedule
          </p>
        )}
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Regenerate Schedule?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg flex gap-3 text-orange-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              This will <strong>permanently delete</strong> the existing schedule and generate a new one based on the current team and venue settings.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
            >
              Yes, Regenerate
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
