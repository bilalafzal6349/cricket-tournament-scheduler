import type { Match } from '@/types';
import { ScheduleGenerator } from './ScheduleGenerator';
import { ScheduleCalendar } from './ScheduleCalendar';
import { Card } from '@/components/ui/Card';
import { LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';

interface ScheduleViewProps {
  tournamentId: string;
  matches: Match[];
  hasTeams: boolean;
  hasVenues: boolean;
  isLoading: boolean;
  isAdmin?: boolean;
}

export function ScheduleView({ 
  tournamentId, 
  matches, 
  hasTeams, 
  hasVenues,
  isAdmin = false,
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const hasMatches = matches && matches.length > 0;

  return (
    <div className="space-y-8">
      {/* 1. Generator Section - Admin Only */}
      {isAdmin && (
        <section>
          <ScheduleGenerator 
            tournamentId={tournamentId} 
            hasTeams={hasTeams} 
            hasVenues={hasVenues}
            hasMatches={hasMatches}
          />
        </section>
      )}

      {/* 2. Schedule Display (if matches exist) */}
      {hasMatches && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Tournament Schedule
              <span className="ml-2 px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {matches.length} Matches
              </span>
            </h2>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                List
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {viewMode === 'calendar' ? (
              <ScheduleCalendar matches={matches} />
            ) : (
              <Card className="p-6">
                {/* Simple List View as fallback/alternative */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Match #</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Teams</th>
                                <th className="px-4 py-3">Venue</th>
                                <th className="px-4 py-3">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {matches.map((match) => (
                                <tr key={match.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{match.match_number}</td>
                                    <td className="px-4 py-3">{new Date(match.scheduled_start).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-gray-900">{match.team1?.code}</span> vs <span className="font-semibold text-gray-900">{match.team2?.code}</span>
                                    </td>
                                    <td className="px-4 py-3">{match.venue?.name}</td>
                                    <td className="px-4 py-3">{new Date(match.scheduled_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* 3. Empty State - No Matches */}
      {!hasMatches && !isAdmin && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedule Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The tournament schedule hasn't been generated yet. Please check back later or contact the tournament administrator.
          </p>
        </div>
      )}
    </div>
  );
}
