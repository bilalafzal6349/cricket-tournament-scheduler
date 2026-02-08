import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Match } from '@/types';
import { Card } from '@/components/ui/Card';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { format } from 'date-fns';

interface ScheduleCalendarProps {
  matches: Match[];
}

export function ScheduleCalendar({ matches }: ScheduleCalendarProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const events = matches.map((match) => {
    let title = `${match.team1?.code || 'T1'} vs ${match.team2?.code || 'T2'}`;
    if (!match.team1 && !match.team2) title = `Match #${match.match_number}`;

    // Color coding based on venue (simple hash)
    const venueColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
    const venueIndex = match.venue?.name.length ? match.venue.name.length % venueColors.length : 0;
    
    return {
      id: match.id,
      title: title,
      start: match.scheduled_start,
      end: match.scheduled_end,
      backgroundColor: venueColors[venueIndex],
      borderColor: venueColors[venueIndex],
      extendedProps: { match },
    };
  });

  const handleEventClick = (info: any) => {
    setSelectedMatch(info.event.extendedProps.match);
  };

  return (
    <>
      <Card className="p-4 bg-white">
        <style>{`
          .fc-event { cursor: pointer; border: none; }
          .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 700; }
          .fc-button-primary { background-color: #3b82f6 !important; border-color: #3b82f6 !important; }
          .fc-button-primary:hover { background-color: #2563eb !important; border-color: #2563eb !important; }
          .fc-button-active { background-color: #1d4ed8 !important; border-color: #1d4ed8 !important; }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          aspectRatio={1.8}
          navLinks={true}
          dayMaxEvents={true}
          nowIndicator={true}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
        />
      </Card>

      {/* Match Details Modal */}
      <Modal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        title={`Match #${selectedMatch?.match_number}`}
      >
        {selectedMatch && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-xl">
              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl mb-2">
                  {selectedMatch.team1?.code}
                </div>
                <h3 className="font-bold text-gray-900">{selectedMatch.team1?.name}</h3>
              </div>
              
              <div className="px-4 text-center">
                <span className="block text-2xl font-black text-gray-300">VS</span>
              </div>

              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold text-xl mb-2">
                  {selectedMatch.team2?.code}
                </div>
                <h3 className="font-bold text-gray-900">{selectedMatch.team2?.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4 flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(selectedMatch.scheduled_start), 'PPP')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedMatch.scheduled_start), 'p')} - {format(new Date(selectedMatch.scheduled_end), 'p')}
                  </p>
                </div>
              </Card>

              <Card className="p-4 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Venue</p>
                  <p className="font-semibold text-gray-900">{selectedMatch.venue?.name}</p>
                  <p className="text-sm text-gray-600">{selectedMatch.venue?.city}</p>
                </div>
              </Card>
            </div>

            <div className="pt-2">
               <p className="text-xs text-gray-400 text-center uppercase tracking-widest">Status: {selectedMatch.status}</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
