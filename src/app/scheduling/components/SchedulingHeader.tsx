import React, { memo } from 'react';
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { FeatherSearch, FeatherPlus } from "@subframe/core";
import { AppointmentModalType } from '../types';

interface SchedulingHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: (type: AppointmentModalType) => void;
}

/**
 * Header component with title, search, and action buttons
 */
export const SchedulingHeader = memo<SchedulingHeaderProps>(({
  searchTerm,
  onSearchChange,
  onAddClick
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="flex w-full flex-none items-center justify-between px-8 py-2 bg-default-background border-b border-solid border-neutral-border">
      <div className="flex flex-col items-start gap-2">
        <span className="text-heading-2 font-heading-2 text-default-font">
          Scheduling
        </span>
      </div>
      
      <TextField
        className="h-10 max-w-[768px] grow shrink-0 basis-0"
        label=""
        helpText=""
        icon={<FeatherSearch />}
      >
        <TextField.Input
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </TextField>
      
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