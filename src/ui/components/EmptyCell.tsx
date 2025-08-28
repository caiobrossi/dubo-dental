"use client";
/*
 * Documentation:
 * EmptyCell — https://app.subframe.com/e50163b8c1bc/library?component=EmptyCell_db8f1ee6-b048-4d91-a1f1-807a2fc993a8
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface EmptyCellRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const EmptyCellRoot = React.forwardRef<HTMLDivElement, EmptyCellRootProps>(
  function EmptyCellRoot(
    { className, ...otherProps }: EmptyCellRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/db8f1ee6 flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 border-r border-b border-solid border-neutral-border px-2 py-2 hover:flex hover:items-center hover:justify-center",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <span className="hidden text-body-small font-body-small text-subtext-color group-hover/db8f1ee6:inline">
          Add new appointment
        </span>
      </div>
    );
  }
);

export const EmptyCell = EmptyCellRoot;
