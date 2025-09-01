import React from 'react';
import { Button } from "@/ui/components/Button";
import { FeatherList, FeatherArrowDown } from "@subframe/core";
import { TableMode } from '../hooks/useTableMode';

interface TableModeToggleProps {
  mode: TableMode;
  onModeChange: () => void;
}

export function TableModeToggle({ mode, onModeChange }: TableModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-600">View mode:</span>
      <div className="flex items-center bg-neutral-100 rounded-lg p-1">
        <Button
          variant={mode === 'paginated' ? "brand-primary" : "neutral-tertiary"}
          size="medium"
          icon={<FeatherList />}
          onClick={mode === 'infinite' ? onModeChange : undefined}
          className="text-xs"
        >
          Paginated
        </Button>
        <Button
          variant={mode === 'infinite' ? "brand-primary" : "neutral-tertiary"}
          size="medium"
          icon={<FeatherArrowDown />}
          onClick={mode === 'paginated' ? onModeChange : undefined}
          className="text-xs"
        >
          Infinite Scroll
        </Button>
      </div>
    </div>
  );
}