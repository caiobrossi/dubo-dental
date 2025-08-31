import React, { memo, useState, useEffect, useRef } from 'react';
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { FeatherSearch, FeatherPlus } from "@subframe/core";
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

  return (
    <div className="flex w-full flex-none items-center justify-between px-8 py-2 bg-default-background border-b border-solid border-neutral-border">
      <div className="flex flex-col items-start gap-2">
        <span className="text-heading-2 font-heading-2 text-default-font">
          Scheduling
        </span>
      </div>
      
      <div ref={searchContainerRef} className="relative h-10 max-w-[768px] grow shrink-0 basis-0">
        <TextField
          className="h-full w-full"
          label=""
          helpText=""
          icon={<FeatherSearch />}
        >
          <TextField.Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
          />
        </TextField>
        
        <SearchDropdown
          results={searchResults}
          isOpen={isOpen}
          onSelect={handleAppointmentSelect}
          onClose={closeDropdown}
        />
      </div>
      
      <div className="flex items-center gap-2">
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