import React from 'react';
import { ViewMode } from '../types';
import { Button } from '@/ui/components/Button';
import { DropdownMenu } from '@/ui/components/DropdownMenu';
import { FeatherChevronDown } from '@subframe/core';
import * as SubframeCore from '@subframe/core';

interface TestSegmentControlProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const getViewModeDisplayText = (mode: ViewMode): string => {
  switch (mode) {
    case 'day':
      return 'Day';
    case '5days':
      return '5 days';
    case 'week':
      return 'Week';
    default:
      return 'Week';
  }
};

export const TestSegmentControl: React.FC<TestSegmentControlProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <SubframeCore.DropdownMenu.Root>
      <SubframeCore.DropdownMenu.Trigger asChild={true}>
        <Button
          variant="neutral-secondary"
          size="medium"
          iconRight={<FeatherChevronDown />}
          className="gap-1"
        >
          {getViewModeDisplayText(viewMode)}
        </Button>
      </SubframeCore.DropdownMenu.Trigger>
      <SubframeCore.DropdownMenu.Portal>
        <SubframeCore.DropdownMenu.Content
          side="bottom"
          align="start"
          sideOffset={4}
          asChild={true}
        >
          <DropdownMenu>
            <DropdownMenu.DropdownItem
              onClick={() => onViewModeChange('day')}
            >
              Day
            </DropdownMenu.DropdownItem>
            <DropdownMenu.DropdownItem
              onClick={() => onViewModeChange('5days')}
            >
              5 days
            </DropdownMenu.DropdownItem>
            <DropdownMenu.DropdownItem
              onClick={() => onViewModeChange('week')}
            >
              Week
            </DropdownMenu.DropdownItem>
          </DropdownMenu>
        </SubframeCore.DropdownMenu.Content>
      </SubframeCore.DropdownMenu.Portal>
    </SubframeCore.DropdownMenu.Root>
  );
};