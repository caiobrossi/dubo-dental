import React, { memo } from 'react';
import { SegmentControl } from "@/ui/components/SegmentControl";
import { ViewMode } from '../types';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Component for selecting the calendar view mode (day, 5 days, week)
 */
export const ViewModeSelector = memo<ViewModeSelectorProps>(({
  viewMode,
  onViewModeChange
}) => {
  return (
    <SegmentControl className="h-10 w-auto flex-none" variant="default">
      <SegmentControl.Item 
        active={viewMode === 'day'}
        onClick={() => onViewModeChange('day')}
      >
        Day
      </SegmentControl.Item>
      
      <SegmentControl.Item 
        active={viewMode === '5days'}
        onClick={() => onViewModeChange('5days')}
      >
        5 days
      </SegmentControl.Item>
      
      <SegmentControl.Item 
        active={viewMode === 'week'}
        onClick={() => onViewModeChange('week')}
      >
        Week
      </SegmentControl.Item>
    </SegmentControl>
  );
});