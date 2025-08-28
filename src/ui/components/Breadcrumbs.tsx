"use client";
/*
 * Documentation:
 * Breadcrumbs — https://app.subframe.com/e50163b8c1bc/library?component=Breadcrumbs_8898334b-a66f-4ee8-8bd1-afcfa8e37cc0
 */

import React from "react";
import { FeatherChevronRight } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  active?: boolean;
  className?: string;
}

const Item = React.forwardRef<HTMLSpanElement, ItemProps>(function Item(
  { children, active = false, className, ...otherProps }: ItemProps,
  ref
) {
  return children ? (
    <span
      className={SubframeUtils.twClassNames(
        "group/bbdc1640 line-clamp-1 cursor-pointer break-words text-body-medium font-body-medium text-subtext-color hover:text-default-font",
        { "text-default-font": active },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {children}
    </span>
  ) : null;
});

interface DividerProps
  extends React.ComponentProps<typeof FeatherChevronRight> {
  className?: string;
}

const Divider = React.forwardRef<
  React.ElementRef<typeof FeatherChevronRight>,
  DividerProps
>(function Divider({ className, ...otherProps }: DividerProps, ref) {
  return (
    <FeatherChevronRight
      className={SubframeUtils.twClassNames(
        "text-body-medium font-body-medium text-subtext-color",
        className
      )}
      ref={ref}
      {...otherProps}
    />
  );
});

interface BreadcrumbsRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const BreadcrumbsRoot = React.forwardRef<HTMLDivElement, BreadcrumbsRootProps>(
  function BreadcrumbsRoot(
    { children, className, ...otherProps }: BreadcrumbsRootProps,
    ref
  ) {
    return children ? (
      <div
        className={SubframeUtils.twClassNames(
          "flex items-center gap-2",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {children}
      </div>
    ) : null;
  }
);

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Item,
  Divider,
});
