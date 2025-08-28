"use client";
/*
 * Documentation:
 * Segment control2 — https://app.subframe.com/e50163b8c1bc/library?component=Segment+control2_8aae6c2b-13d7-4f09-8f63-99d346444d89
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
        "group/f9a7a794 flex h-full cursor-pointer items-center justify-center gap-2 rounded-full bg-new-white-6 px-4 hover:px-4 hover:py-0.5",
        {
          "rounded-full border-0 border-solid border-new-white-100 bg-new-white-70 px-4 py-0 shadow-md hover:border-none hover:bg-new-white-100":
            active,
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-body-medium font-body-medium text-subtext-color group-hover/f9a7a794:text-default-font",
            {
              "text-neutral-400 group-hover/f9a7a794:text-neutral-400":
                disabled,
              "text-brand-700 group-hover/f9a7a794:text-brand-700": active,
            }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {children ? (
        <span
          className={SubframeUtils.twClassNames(
            "line-clamp-1 text-body-large font-body-large text-subtext-color group-hover/f9a7a794:text-default-font",
            {
              "text-neutral-400 group-hover/f9a7a794:text-neutral-400":
                disabled,
              "text-default-font group-hover/f9a7a794:text-default-font":
                active,
            }
          )}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface SegmentControl2RootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: "default";
  variant2?: "default" | "light-bg";
  className?: string;
}

const SegmentControl2Root = React.forwardRef<
  HTMLDivElement,
  SegmentControl2RootProps
>(function SegmentControl2Root(
  {
    children,
    variant = "default",
    variant2 = "default",
    className,
    ...otherProps
  }: SegmentControl2RootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/8aae6c2b flex h-10 w-full items-center justify-center rounded-full border border-solid border-neutral-border bg-new-gray-4 px-0.5 py-0.5",
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

export const SegmentControl2 = Object.assign(SegmentControl2Root, {
  Item,
});
