import React, { useEffect } from 'react';
import { IconButton } from "@/ui/components/IconButton";
import { FeatherX } from "@subframe/core";
import { EnhancedCalendar } from './EnhancedCalendar';

interface CalendarSidesheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  professionalId: string;
}

export const CalendarSidesheet: React.FC<CalendarSidesheetProps> = ({
  open,
  onOpenChange,
  selectedDate,
  onDateSelect,
  professionalId
}) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
      onOpenChange(false);
    }
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when sidesheet is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Sidesheet */}
      <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-lg border-l border-neutral-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-border">
          <h2 className="text-heading-2 font-heading-2 text-default-font">
            Select Date
          </h2>
          <IconButton
            variant="neutral-tertiary"
            size="medium"
            icon={<FeatherX />}
            onClick={() => onOpenChange(false)}
          />
        </div>
        
        {/* Calendar Content */}
        <div className="flex-1 p-4 overflow-auto">
          <EnhancedCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onClose={() => onOpenChange(false)}
            professionalId={professionalId}
          />
        </div>
      </div>
    </>
  );
};