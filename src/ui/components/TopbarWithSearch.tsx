"use client";
/*
 * Documentation:
 * Topbar with search — https://app.subframe.com/e50163b8c1bc/library?component=Topbar+with+search_27f64edc-a451-416b-98b4-9bb1f95991e0
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  className?: string;
}

const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(function NavItem(
  { selected = false, className, ...otherProps }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/b6b25fe9 flex cursor-pointer items-start gap-4 rounded-md px-2 py-1",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <span
        className={SubframeUtils.twClassNames(
          "text-body-large font-body-large text-subtext-color group-hover/b6b25fe9:text-default-font",
          { "text-default-font": selected }
        )}
      >
        Label
      </span>
    </div>
  );
});

interface TopbarWithSearchRootProps extends React.HTMLAttributes<HTMLElement> {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

const TopbarWithSearchRoot = React.forwardRef<
  HTMLElement,
  TopbarWithSearchRootProps
>(function TopbarWithSearchRoot(
  { leftSlot, rightSlot, className, ...otherProps }: TopbarWithSearchRootProps,
  ref
) {
  return (
    <nav
      className={SubframeUtils.twClassNames(
        "flex w-full items-center gap-4 bg-default-background px-6 py-4",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {leftSlot ? (
        <div className="flex grow shrink-0 basis-0 items-center gap-6">
          {leftSlot}
        </div>
      ) : null}
      {rightSlot ? (
        <div className="flex grow shrink-0 basis-0 items-center justify-end gap-4">
          {rightSlot}
        </div>
      ) : null}
    </nav>
  );
});

export const TopbarWithSearch = Object.assign(TopbarWithSearchRoot, {
  NavItem,
});
