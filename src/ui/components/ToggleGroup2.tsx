"use client";
/*
 * Documentation:
 * Toggle Group2 — https://app.subframe.com/e50163b8c1bc/library?component=Toggle+Group2_d21b360e-56da-4180-b7ac-5de999c65526
 */

import React from "react";
import { FeatherStar } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ItemProps
  extends React.ComponentProps<typeof SubframeCore.ToggleGroup.Item> {
  disabled?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(
  {
    disabled = false,
    children,
    icon = <FeatherStar />,
    className,
    ...otherProps
  }: ItemProps,
  ref
) {
  return (
    <SubframeCore.ToggleGroup.Item asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "group/de27c1ed flex h-7 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-1 active:bg-neutral-100 aria-[checked=true]:h-full aria-[checked=true]:w-full aria-[checked=true]:bg-default-background aria-[checked=true]:px-3 aria-[checked=true]:py-1 aria-[checked=true]:shadow-sm hover:aria-[checked=true]:bg-default-background active:aria-[checked=true]:bg-default-background",
          { "hover:bg-transparent active:bg-transparent": disabled },
          className
        )}
        ref={ref}
      >
        {icon ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-body-medium font-body-medium text-subtext-color group-hover/de27c1ed:text-default-font group-active/de27c1ed:text-default-font group-aria-[checked=true]/de27c1ed:text-default-font",
              {
                "text-neutral-400 group-hover/de27c1ed:text-neutral-400 group-active/de27c1ed:text-neutral-400":
                  disabled,
              }
            )}
          >
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        {children ? (
          <span
            className={SubframeUtils.twClassNames(
              "whitespace-nowrap text-body-medium font-body-medium text-subtext-color group-hover/de27c1ed:text-default-font group-active/de27c1ed:text-default-font group-aria-[checked=true]/de27c1ed:text-body-large group-aria-[checked=true]/de27c1ed:font-body-large group-aria-[checked=true]/de27c1ed:text-default-font",
              {
                "text-neutral-400 group-hover/de27c1ed:text-neutral-400 group-active/de27c1ed:text-neutral-400":
                  disabled,
              }
            )}
          >
            {children}
          </span>
        ) : null}
      </div>
    </SubframeCore.ToggleGroup.Item>
  );
});

interface ToggleGroup2RootProps
  extends React.ComponentProps<typeof SubframeCore.ToggleGroup.Root> {
  children?: React.ReactNode;
  variant?: "default";
  boolean?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const ToggleGroup2Root = React.forwardRef<
  HTMLDivElement,
  ToggleGroup2RootProps
>(function ToggleGroup2Root(
  {
    children,
    variant = "default",
    boolean = false,
    className,
    ...otherProps
  }: ToggleGroup2RootProps,
  ref
) {
  return children ? (
    <SubframeCore.ToggleGroup.Root asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex h-10 items-center gap-0.5 overflow-hidden rounded-full border border-solid border-neutral-border bg-new-gray-4 px-0.5 py-0.5",
          className
        )}
        ref={ref}
      >
        {children}
      </div>
    </SubframeCore.ToggleGroup.Root>
  ) : null;
});

export const ToggleGroup2 = Object.assign(ToggleGroup2Root, {
  Item,
});
