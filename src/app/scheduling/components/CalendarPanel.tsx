import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/ui/components/Button';

interface CalendarPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarPanel: React.FC<CalendarPanelProps> = ({
  isOpen,
  onClose
}) => {
  // Handle keyboard navigation - close panel with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`
        ${isOpen ? 'w-80' : 'w-0'} 
        bg-white border-l border-neutral-200 overflow-hidden flex flex-col flex-shrink-0 transition-all duration-200 ease-in-out
      `}
      role="complementary"
      aria-label="Calendar filters and settings"
    >
        <div className="flex-1 overflow-y-auto">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">
              Calendar
            </h2>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="p-1 rounded-md hover:bg-neutral-100 transition-colors relative z-10 cursor-pointer"
              aria-label="Close calendar panel"
              type="button"
            >
              <X size={18} className="text-neutral-600" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="p-4 space-y-6">
            {/* Calendar Filters Section */}
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-3">
                Filters
              </h3>
              <div className="space-y-3">
                {/* Professional Filter */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Professional
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>All Professionals</option>
                    <option>Dr. Smith</option>
                    <option>Dr. Johnson</option>
                    <option>Dr. Williams</option>
                  </select>
                </div>

                {/* Appointment Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Appointment Type
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>All Types</option>
                    <option>Consultation</option>
                    <option>Cleaning</option>
                    <option>Treatment</option>
                    <option>Follow-up</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Status
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>All Statuses</option>
                    <option>Scheduled</option>
                    <option>Confirmed</option>
                    <option>Waiting</option>
                    <option>In Progress</option>
                    <option>Complete</option>
                    <option>Cancelled</option>
                    <option>No Show</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mini Month Picker */}
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-3">
                Quick Navigation
              </h3>
              <div className="bg-neutral-50 rounded-lg p-3">
                <div className="text-center mb-2">
                  <span className="text-sm font-medium text-neutral-900">
                    September 2024
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {/* Day headers */}
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-neutral-500 font-medium p-1">
                      {day}
                    </div>
                  ))}
                  {/* Calendar days (simplified placeholder) */}
                  {Array.from({ length: 30 }, (_, i) => (
                    <button
                      key={i}
                      className={`
                        text-center p-1 rounded hover:bg-neutral-200 transition-colors
                        ${i === 14 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-neutral-700'}
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Working Hours Section */}
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-3">
                Working Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Monday - Friday</span>
                  <span className="text-neutral-900">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Saturday</span>
                  <span className="text-neutral-900">9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Sunday</span>
                  <span className="text-neutral-900">Closed</span>
                </div>
              </div>
            </div>

            {/* View Options */}
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-3">
                View Options
              </h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Show blocked times</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Show weekend slots</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Compact view</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="border-t border-neutral-200 p-4">
          <Button
            variant="primary"
            size="small"
            className="w-full"
            onClick={() => {
              // Reset filters functionality
              console.log('Reset filters');
            }}
          >
            Reset Filters
          </Button>
        </div>
    </div>
  );
};