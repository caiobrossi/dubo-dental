"use client";
/*
 * Documentation:
 * Segment control — https://app.subframe.com/e50163b8c1bc/library?component=Segment+control_55b22a30-a618-46c4-ad5b-eb8c333c6dff
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: "default";
  className?: string;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  {
    active = false,
    disabled = false,
    icon = null,
    children,
    variant = "default",
    className,
    ...otherProps
  }: ItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/96fe59ea flex h-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 transition-colors",
        {
          // Rest state: transparent bg, hover adds light bg
          "bg-transparent hover:bg-neutral-50": !active,
          // Active state: neutral-100 bg with border, hover changes to default-background
          "bg-neutral-100 border border-neutral-border hover:bg-default-background": active,
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-body-medium font-body-medium transition-colors",
            {
              // Rest state: neutral-400, hover changes to default-font
              "text-neutral-400 group-hover/96fe59ea:text-default-font": !active && !disabled,
              // Active state: default-font color always
              "text-default-font": active && !disabled,
              // Disabled state
              "text-neutral-400 group-hover/96fe59ea:text-neutral-400": disabled,
            }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {children ? (
        <span
          className={SubframeUtils.twClassNames(
            "line-clamp-1 text-body-large font-body-large transition-colors",
            {
              // Rest state: neutral-400, hover changes to default-font
              "text-neutral-400 group-hover/96fe59ea:text-default-font": !active && !disabled,
              // Active state: default-font color always
              "text-default-font": active && !disabled,
              // Disabled state
              "text-neutral-400 group-hover/96fe59ea:text-neutral-400": disabled,
            }
          )}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface SegmentControlRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: "default";
  variant2?: "default" | "light-bg";
  className?: string;
}

const SegmentControlRoot = React.forwardRef<
  HTMLDivElement,
  SegmentControlRootProps
>(function SegmentControlRoot(
  {
    children,
    variant = "default",
    variant2 = "default",
    className,
    ...otherProps
  }: SegmentControlRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/55b22a30 flex h-[40px] w-full items-center justify-center rounded-full px-0.5 py-0.5",
        { "border-none bg-transparent": variant2 === "light-bg" },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {children ? (
        <div className="flex items-start self-stretch">{children}</div>
      ) : null}
      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 self-stretch border-b border-solid border-neutral-border" />
    </div>
  );
});

export const SegmentControl = Object.assign(SegmentControlRoot, {
  Item,
});
