import React, { memo, useState, useEffect, useRef } from 'react';
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherSearch, FeatherPlus, FeatherX } from "@subframe/core";
import { AppointmentModalType, Appointment } from '../types';
import { useSchedulingSearch } from '../hooks/useSchedulingSearch';
import { SearchDropdown } from './SearchDropdown';

interface SchedulingHeaderProps {
  searchTerm: string;
  appointments: Appointment[];
  onSearchChange: (value: string) => void;
  onAddClick: (type: AppointmentModalType) => void;
  onAppointmentSelect: (appointment: Appointment) => void;
}

/**
 * Header component with title, search, and action buttons
 */
export const SchedulingHeader = memo<SchedulingHeaderProps>(({
  searchTerm,
  appointments,
  onSearchChange,
  onAddClick,
  onAppointmentSelect
}) => {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { searchAppointments, isOpen, openDropdown, closeDropdown } = useSchedulingSearch(appointments);
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchAppointments>>([]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onSearchChange(value);
    
    // Update search results
    const results = searchAppointments(value);
    setSearchResults(results);
    
    if (results.length > 0 && value.length >= 2) {
      openDropdown();
    } else {
      closeDropdown();
    }
  };

  const handleSearchFocus = () => {
    if (searchTerm.length >= 2 && searchResults.length > 0) {
      openDropdown();
    }
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    onAppointmentSelect(appointment);
    onSearchChange(''); // Clear search
    setSearchResults([]);
  };

  const handleClearSearch = () => {
    onSearchChange('');
    setSearchResults([]);
    closeDropdown();
  };

  return (
    <div className="flex w-full flex-none items-center px-8 py-2 bg-default-background">
      <div className="flex flex-col items-start gap-2 flex-[0.9]">
        <span className="text-heading-2 font-heading-2 text-default-font">
          Scheduling
        </span>
      </div>
      
      <div ref={searchContainerRef} className="relative h-12 max-w-[1080px] flex-[1.2] px-6">
        <div className="relative h-full w-full">
          <TextField
            className="h-full w-full [&>div]:rounded-full [&>div]:bg-neutral-100 [&>div]:hover:bg-neutral-200 [&>div]:transition-colors [&>div]:border-0 [&>div]:shadow-none [&>div:focus-within]:!bg-white [&>div:focus-within]:ring-0 [&>div:focus-within]:outline-none"
            label=""
            helpText=""
            icon={<FeatherSearch />}
          >
            <TextField.Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="rounded-full bg-transparent border-0 focus:outline-none focus:ring-0 pr-10 text-base py-3"
            />
          </TextField>
          
          {/* Clear button */}
          {searchTerm && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
              <IconButton
                size="small"
                variant="neutral-tertiary"
                icon={<FeatherX />}
                onClick={handleClearSearch}
                disabled={false}
                loading={false}
              />
            </div>
          )}
        </div>
        
        <SearchDropdown
          results={searchResults}
          isOpen={isOpen}
          onSelect={handleAppointmentSelect}
          onClose={closeDropdown}
        />
      </div>
      
      <div className="flex items-center justify-end gap-2 flex-[0.9]">
        <Button
          disabled={false}
          variant="neutral-secondary"
          size="large"
          iconRight={null}
          loading={false}
          onClick={() => {
            // TODO: Implement actions dropdown functionality
          }}
        >
          Actions
        </Button>
        
        <Button
          disabled={false}
          variant="brand-primary"
          size="large"
          icon={<FeatherPlus />}
          iconRight={null}
          loading={false}
          onClick={() => onAddClick('appointment')}
        >
          Add
        </Button>
      </div>
    </div>
  );
});