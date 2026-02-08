import { useScheduleGenerator } from '@/hooks/useScheduleGenerator';
import { toast } from 'sonner';
import { Loader2, Sparkles, AlertTriangle, Minus, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Tournament } from '@/types';

interface ScheduleGeneratorProps {
  tournamentId: string;
  hasTeams: boolean;
  hasVenues: boolean;
  hasMatches: boolean;
  tournament: Tournament;
}

export function ScheduleGenerator({ 
  tournamentId, 
  hasTeams, 
  hasVenues,
  hasMatches,
  tournament
}: ScheduleGeneratorProps) {
  const { mutate, isPending } = useScheduleGenerator(tournamentId);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [restHours, setRestHours] = useState(tournament?.min_rest_hours || 24);
  const queryClient = useQueryClient();

  // Update rest hours when tournament changes
  useEffect(() => {
    if (tournament?.min_rest_hours !== undefined) {
      setRestHours(tournament.min_rest_hours);
    }
  }, [tournament?.min_rest_hours]);

  // Mutation to update rest period
  const updateRestPeriod = useMutation({
    mutationFn: async (newRestHours: number) => {
      console.log(`[REST PERIOD] Updating to ${newRestHours} hours for tournament ${tournamentId}`);
      const response = await api.put(`/tournaments/${tournamentId}`, {
        min_rest_hours: newRestHours
      });
      console.log('[REST PERIOD] Update successful:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] });
      console.log('[REST PERIOD] Tournament query invalidated, data will refresh');
      toast.success('Rest period updated', {
        description: `Set to ${restHours} hours`,
        duration: 2000,
      });
    },
    onError: (error: any) => {
      console.error('[REST PERIOD] Update failed:', error);
      toast.error('Failed to update rest period');
      setRestHours(tournament?.min_rest_hours || 24);
    }
  });

  const handleRestHoursChange = (delta: number) => {
    const newValue = Math.max(0, Math.min(72, restHours + delta));
    setRestHours(newValue);
    updateRestPeriod.mutate(newValue);
  };

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
          
          // Separate problems from solutions
          const problems = data.conflicts?.filter((c: string) => !c.includes('💡') && !c.includes('Solution:')) || [];
          const solutions = data.conflicts?.filter((c: string) => c.includes('💡') || c.includes('Solution:')) || [];
          
          // Show detailed modal with conflicts
          setTimeout(() => {
            const modal = document.createElement('div');
            modal.innerHTML = `
              <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style="z-index: 9999;">
                <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
                  <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 border-b border-red-100">
                    <h3 class="text-xl font-bold text-white flex items-center gap-3">
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Scheduling Not Possible</span>
                    </h3>
                    <p class="text-red-50 text-sm mt-1">${data.message || 'The current tournament configuration cannot produce a valid schedule'}</p>
                  </div>
                  
                  <div class="p-6 overflow-y-auto max-h-[calc(85vh-180px)] space-y-5">
                    ${problems.length > 0 ? `
                      <div class="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                        <h4 class="font-bold text-red-900 mb-3 flex items-center gap-2 text-base">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                          </svg>
                          Problems Detected:
                        </h4>
                        <ul class="space-y-2">
                          ${problems.map((problem: string) => `
                            <li class="flex items-start gap-2 text-sm text-red-800">
                              <span class="text-red-600 font-bold mt-0.5 text-base">×</span>
                              <span class="leading-relaxed">${problem}</span>
                            </li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : ''}
                    
                    ${solutions.length > 0 ? `
                      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border-l-4 border-blue-500 shadow-sm">
                        <h4 class="font-bold text-blue-900 mb-3 flex items-center gap-2 text-base">
                          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Suggested Solutions:
                        </h4>
                        <ul class="space-y-3">
                          ${solutions.map((solution: string) => {
                            const cleanSolution = solution.replace('💡 Solution:', '').replace('💡', '').trim();
                            return `
                              <li class="flex items-start gap-3 bg-white rounded-md p-3 shadow-sm border border-blue-100">
                                <span class="text-2xl mt-0.5">💡</span>
                                <span class="text-sm text-gray-800 leading-relaxed font-medium">${cleanSolution}</span>
                              </li>
                            `;
                          }).join('')}
                        </ul>
                      </div>
                    ` : ''}
                    
                    ${problems.length === 0 && solutions.length === 0 ? `
                      <div class="text-center py-4 text-gray-500">
                        <p>No specific details available. Please check your tournament configuration.</p>
                      </div>
                    ` : ''}
                  </div>
                  
                  <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button onclick="this.closest('.fixed').remove()" class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg">
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
        <p className="text-center text-gray-600 mb-4 max-w-md">
          Use our AI engine to automatically generate a conflict-free schedule optimized for team rest and venue availability.
        </p>
        
        {/* Rest Period Control */}
        <div className="mb-6 w-full max-w-sm">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Minimum Rest Period
              </label>
              <span className="text-xs text-gray-500">Between matches</span>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => handleRestHoursChange(-2)}
                disabled={restHours <= 0 || updateRestPeriod.isPending}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
                title="Decrease by 2 hours"
              >
                <Minus className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="flex-1 text-center">
                <div className="text-3xl font-bold text-blue-600">{restHours}</div>
                <div className="text-xs text-gray-500 mt-1">hours</div>
              </div>
              
              <button
                onClick={() => handleRestHoursChange(2)}
                disabled={restHours >= 72 || updateRestPeriod.isPending}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-blue-300"
                title="Increase by 2 hours"
              >
                <Plus className="w-5 h-5 text-blue-700" />
              </button>
            </div>
            
            <div className="mt-3 text-xs text-center text-gray-500">
              Teams must rest at least {restHours}h between matches
            </div>
          </div>
        </div>
        
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
