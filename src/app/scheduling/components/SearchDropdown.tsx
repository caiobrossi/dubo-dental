import React, { memo } from 'react';
import { SearchResult } from '../hooks/useSchedulingSearch';
import { formatTimeHM } from '../utils/timeUtils';
import { formatPatientNameForDisplay } from '../utils/nameUtils';

interface SearchDropdownProps {
  results: SearchResult[];
  isOpen: boolean;
  onSelect: (appointment: SearchResult['appointment']) => void;
  onClose: () => void;
}

/**
 * Dropdown component showing search results
 */
export const SearchDropdown = memo<SearchDropdownProps>(({
  results,
  isOpen,
  onSelect,
  onClose
}) => {
  if (!isOpen || results.length === 0) {
    return null;
  }

  const handleSelect = (appointment: SearchResult['appointment']) => {
    onSelect(appointment);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Check if it's today or tomorrow for friendlier display
    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];
    
    const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (dateOnly === todayOnly) {
      return `Hoje, ${dayOfWeek}`;
    } else if (dateOnly === tomorrowOnly) {
      return `Amanhã, ${dayOfWeek}`;
    } else {
      return `${formattedDate}, ${dayOfWeek}`;
    }
  };

  return (
    <>
      {/* Backdrop to close dropdown */}
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose}
      />
      
      {/* Dropdown content */}
      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-neutral-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
        <div className="py-2">
          {results.map((result, index) => {
            const { appointment, matches } = result;
            const formattedDate = formatDate(appointment.appointment_date);
            const isToday = formattedDate.startsWith('Hoje');
            const isTomorrow = formattedDate.startsWith('Amanhã');
            
            return (
              <div
                key={appointment.id}
                className={`px-4 py-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-border last:border-b-0 ${
                  isToday ? 'bg-blue-25' : isTomorrow ? 'bg-yellow-25' : ''
                }`}
                onClick={() => handleSelect(appointment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Patient name - highlighted if matches */}
                    <div className={`font-semibold text-sm ${matches.patientName ? 'text-blue-700' : 'text-default-font'}`}>
                      {formatPatientNameForDisplay(appointment.patient_name)}
                    </div>
                    
                    {/* Procedure type - highlighted if matches */}
                    <div className={`text-sm mt-1 ${matches.procedureType ? 'text-blue-600' : 'text-subtext-color'}`}>
                      {appointment.appointment_type || 'Consulta'}
                    </div>
                    
                    {/* Professional */}
                    <div className="text-xs text-subtext-color mt-1">
                      {appointment.professional_name}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    {/* Date */}
                    <div className="text-default-font font-medium">
                      {formattedDate}
                    </div>
                    
                    {/* Time */}
                    <div className="text-subtext-color mt-1">
                      {formatTimeHM(appointment.start_time)} - {formatTimeHM(appointment.end_time)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {results.length === 8 && (
          <div className="px-4 py-2 text-xs text-subtext-color border-t border-neutral-border bg-neutral-25">
            Mostrando primeiros 8 resultados
          </div>
        )}
      </div>
    </>
  );
});