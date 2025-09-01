import React, { useState } from 'react';
import { IconButton } from "@/ui/components/IconButton";
import { Button } from "@/ui/components/Button";
import { SegmentControl } from "@/ui/components/SegmentControl";
import * as SubframeCore from "@subframe/core";
import {
  FeatherCalendar,
  FeatherChevronDown,
  FeatherChevronLeft,
  FeatherChevronRight,
  FeatherSettings
} from "@subframe/core";
import { ViewMode } from '../types';
import { formatPeriod } from '../utils/timeUtils';
import { navigateDate, jumpToFuture } from '../utils/dateUtils';
import { ViewModeSelector } from './ViewModeSelector';
import { TestSegmentControl } from './TestSegmentControl';
import { ProfessionalFilter } from './ProfessionalFilter';
import { EnhancedCalendar } from './EnhancedCalendar';

interface DateNavigatorProps {
  selectedDate: Date;
  viewMode: ViewMode;
  selectedProfessional: string;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onProfessionalChange: (professionalId: string) => void;
  onCalendarPanelToggle: () => void;
}

/**
 * Component for navigating and selecting dates
 * Layout: [day 5days week] | [date picker] | [calendar controls] | [button1 button2]
 */
export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  viewMode,
  selectedProfessional,
  onDateChange,
  onViewModeChange,
  onProfessionalChange,
  onCalendarPanelToggle
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const period = formatPeriod(selectedDate, viewMode);

  const handleNavigation = (direction: 'prev' | 'next' | 'today') => {
    const newDate = navigateDate(selectedDate, direction, viewMode);
    onDateChange(newDate);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      setCalendarOpen(false);
    }
  };

  return (
    <div className="flex w-full items-center py-2 px-8">
      {/* Left: Professional Filter */}
      <div className="flex items-center flex-[0.9]">
        <ProfessionalFilter
          selectedProfessional={selectedProfessional}
          onProfessionalChange={onProfessionalChange}
        />
      </div>

      {/* Center: Date Navigation */}
      <div className="flex items-center justify-center gap-2 flex-[1.2] px-6">
        {/* Previous week button */}
        <IconButton
          disabled={false}
          variant="neutral-secondary"
          size="medium"
          icon={<FeatherChevronLeft />}
          loading={false}
          onClick={() => handleNavigation('prev')}
        />
        
        {/* Date display with calendar popup */}
        <SubframeCore.Popover.Root open={calendarOpen} onOpenChange={setCalendarOpen} modal={false}>
          <SubframeCore.Popover.Trigger asChild={true}>
            <div className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md hover:bg-neutral-50 transition-colors">
              <span className="font-['Urbanist'] text-[20px] font-[400] leading-[24px] text-default-font">
                {period.dates}
              </span>
              <span className="font-['Urbanist'] text-[20px] font-bold leading-[24px] text-default-font">
                {period.monthYear}
              </span>
              <FeatherChevronDown className="w-4 h-4 text-subtext-color" />
            </div>
          </SubframeCore.Popover.Trigger>
          
          <SubframeCore.Popover.Portal>
            <SubframeCore.Popover.Content
              side="bottom"
              align="center"
              sideOffset={4}
              asChild={true}
              style={{ zIndex: 999999, minWidth: '800px', maxWidth: '900px' }}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onInteractOutside={(e) => {
                // Allow interactions with the calendar content
                const target = e.target as HTMLElement;
                if (target.closest('.enhanced-calendar-container')) {
                  e.preventDefault();
                }
              }}
            >
              <EnhancedCalendar
                selectedDate={selectedDate}
                onDateSelect={handleCalendarSelect}
                onClose={() => setCalendarOpen(false)}
                professionalId={selectedProfessional}
              />
            </SubframeCore.Popover.Content>
          </SubframeCore.Popover.Portal>
        </SubframeCore.Popover.Root>

        {/* Next week button */}
        <IconButton
          disabled={false}
          variant="neutral-secondary"
          size="medium"
          icon={<FeatherChevronRight />}
          loading={false}
          onClick={() => handleNavigation('next')}
        />

        {/* Today button */}
        <Button
          variant="neutral-secondary"
          size="medium"
          onClick={() => onDateChange(new Date())}
          disabled={false}
          loading={false}
        >
          Today
        </Button>
      </div>

      {/* Right: Week Filter and Calendar Button */}
      <div className="flex items-center justify-end gap-2 flex-[0.9]">
        <TestSegmentControl 
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
        <IconButton
          disabled={false}
          variant="neutral-secondary"
          size="medium"
          icon={<FeatherCalendar />}
          loading={false}
          onClick={onCalendarPanelToggle}
        />
      </div>
    </div>
  );
};