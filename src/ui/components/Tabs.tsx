"use client";
/*
 * Documentation:
 * Tabs — https://app.subframe.com/e50163b8c1bc/library?component=Tabs_e1ad5091-8ad8-4319-b1f7-3e47f0256c20
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: "default" | "true";
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
        "group/d5612535 flex h-10 cursor-pointer items-center justify-center gap-2 border-b border-solid border-neutral-border px-4 py-0.5",
        {
          "border-b-2 border-solid border-brand-600 px-4 pt-0.5 pb-px hover:border-b-2 hover:border-solid hover:border-brand-600":
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
            "text-body-medium font-body-medium text-subtext-color group-hover/d5612535:text-default-font",
            {
              "text-neutral-400 group-hover/d5612535:text-neutral-400":
                disabled,
              "text-brand-700 group-hover/d5612535:text-brand-700": active,
            }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {children ? (
        <span
          className={SubframeUtils.twClassNames(
            "text-body-large font-body-large text-subtext-color group-hover/d5612535:text-default-font",
            {
              "text-brand-700": variant === "true",
              "text-neutral-400 group-hover/d5612535:text-neutral-400":
                disabled,
              "text-brand-700 group-hover/d5612535:text-brand-700": active,
            }
          )}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface TabsRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: "default" | "variation";
  className?: string;
}

const TabsRoot = React.forwardRef<HTMLDivElement, TabsRootProps>(
  function TabsRoot(
    { children, variant = "default", className, ...otherProps }: TabsRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/e1ad5091 flex w-full items-end",
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
  }
);

export const Tabs = Object.assign(TabsRoot, {
  Item,
});
