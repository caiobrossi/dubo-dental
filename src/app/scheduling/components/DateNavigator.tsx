import React, { useState } from 'react';
import { IconButton } from "@/ui/components/IconButton";
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
  onProfessionalChange
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
    <div className="flex w-full flex-wrap items-center justify-between py-2 px-8">
      {/* View mode and professional filters */}
      <div className="flex items-center gap-2">
        <TestSegmentControl 
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
        <ProfessionalFilter
          selectedProfessional={selectedProfessional}
          onProfessionalChange={onProfessionalChange}
        />
      </div>

      {/* Date display with calendar popup */}
      <SubframeCore.Popover.Root open={calendarOpen} onOpenChange={setCalendarOpen} modal={false}>
        <SubframeCore.Popover.Trigger asChild={true}>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-['Urbanist'] text-[24px] font-[400] leading-[28px] text-default-font">
              {period.dates}
            </span>
            <span className="text-heading-2 font-heading-2 text-default-font">
              {period.monthYear}
            </span>
            <IconButton
              disabled={false}
              variant="neutral-tertiary"
              size="medium"
              icon={<FeatherChevronDown />}
              loading={false}
              onClick={() => {}}
            />
          </div>
        </SubframeCore.Popover.Trigger>
        
        <SubframeCore.Popover.Portal>
          <SubframeCore.Popover.Content
            side="bottom"
            align="center"
            sideOffset={4}
            asChild={true}
            style={{ zIndex: 999999 }}
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

      {/* Navigation controls (prev/today/next) and action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <SegmentControl className="h-10 w-auto flex-none" variant="default">
          <SegmentControl.Item 
            icon={<FeatherChevronLeft />} 
            onClick={() => handleNavigation('prev')}
          />
          <SegmentControl.Item 
            active={true}
            onClick={() => handleNavigation('today')}
          >
            Today
          </SegmentControl.Item>
          <SegmentControl.Item 
            icon={<FeatherChevronRight />}
            onClick={() => handleNavigation('next')}
          />
        </SegmentControl>
        
        <IconButton
          disabled={false}
          variant="neutral-secondary"
          size="large"
          icon={<FeatherSettings />}
          loading={false}
          onClick={() => {
            // TODO: Implement settings functionality
          }}
        />
        
        <IconButton
          disabled={false}
          variant="neutral-secondary"
          size="large"
          icon={<FeatherCalendar />}
          loading={false}
          onClick={() => {
            // TODO: Implement calendar functionality
          }}
        />
      </div>
    </div>
  );
};