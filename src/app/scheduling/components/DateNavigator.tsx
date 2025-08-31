import React from 'react';
import { Button } from "@/ui/components/Button";
import { Calendar } from "@/ui/components/Calendar";
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

interface DateNavigatorProps {
  selectedDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Component for navigating and selecting dates
 * Layout: [day 5days week] | [date picker] | [calendar controls] | [button1 button2]
 */
export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  viewMode,
  onDateChange,
  onViewModeChange
}) => {
  const period = formatPeriod(selectedDate, viewMode);

  const handleNavigation = (direction: 'prev' | 'next' | 'today') => {
    const newDate = navigateDate(selectedDate, direction, viewMode);
    onDateChange(newDate);
  };

  const handleJumpToWeeks = (weeks: number) => {
    const newDate = jumpToFuture(weeks, 0);
    onDateChange(newDate);
  };

  const handleJumpToMonths = (months: number) => {
    const newDate = jumpToFuture(0, months);
    onDateChange(newDate);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
    }
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-between py-2 px-8">
      {/* Day/5days/Week selector */}
      <ViewModeSelector
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      {/* Date display with calendar popup */}
      <SubframeCore.Popover.Root>
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
            className="z-[100]"
          >
            <div className="flex flex-col items-start gap-4 rounded-md bg-new-white-30 px-3 py-3 shadow-lg backdrop-blur-md z-[100]">
              {/* Calendar grids */}
              <div className="flex w-full grow shrink-0 basis-0 items-start justify-center gap-20 px-2 py-2">
                <Calendar
                  className="h-auto grow shrink-0 basis-0 self-stretch"
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleCalendarSelect}
                />
                <Calendar
                  className="h-auto grow shrink-0 basis-0 self-stretch"
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleCalendarSelect}
                />
              </div>
              
              {/* Quick jump buttons */}
              <div className="flex items-start gap-1">
                <Button
                  variant="neutral-secondary"
                  size="medium"
                  onClick={() => handleJumpToWeeks(1)}
                >
                  In 1 week
                </Button>
                <Button
                  variant="neutral-secondary"
                  size="medium"
                  onClick={() => handleJumpToWeeks(2)}
                >
                  In 2 weeks
                </Button>
                <Button
                  variant="neutral-secondary"
                  size="medium"
                  onClick={() => handleJumpToWeeks(3)}
                >
                  In 3 weeks
                </Button>
                <Button
                  variant="neutral-secondary"
                  size="medium"
                  onClick={() => handleJumpToWeeks(4)}
                >
                  In 4 weeks
                </Button>
                <Button
                  variant="neutral-secondary"
                  size="medium"
                  onClick={() => handleJumpToMonths(3)}
                >
                  In 3 months
                </Button>
                <Button
                  variant="neutral-secondary"
                  size="medium"
                  onClick={() => handleJumpToMonths(6)}
                >
                  In 6 months
                </Button>
              </div>
            </div>
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