"use client";
/*
 * Documentation:
 * Chips — https://app.subframe.com/e50163b8c1bc/library?component=Chips_f8a7b626-07c6-416d-b2a3-b35d153f0eda
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ChipsRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "brand" | "neutral" | "error" | "warning" | "success";
  icon?: React.ReactNode;
  children?: React.ReactNode;
  iconRight?: React.ReactNode;
  size?: "default" | "large";
  className?: string;
}

const ChipsRoot = React.forwardRef<HTMLDivElement, ChipsRootProps>(
  function ChipsRoot(
    {
      variant = "brand",
      icon = null,
      children,
      iconRight = null,
      size = "default",
      className,
      ...otherProps
    }: ChipsRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/f8a7b626 flex h-6 items-center gap-1 rounded-full border border-solid border-brand-100 bg-brand-100 px-2",
          {
            "h-8 w-auto rounded-sm px-3 py-0": size === "large",
            "border border-solid border-success-100 bg-success-100":
              variant === "success",
            "border border-solid border-warning-100 bg-warning-100":
              variant === "warning",
            "border border-solid border-error-100 bg-error-100":
              variant === "error",
            "border border-solid border-neutral-100 bg-neutral-100":
              variant === "neutral",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <span
          className={SubframeUtils.twClassNames(
            "font-['Urbanist'] text-[16px] font-[600] leading-[20px] text-brand-700",
            {
              "text-body-large-/-bold font-body-large-/-bold": size === "large",
              "text-success-800": variant === "success",
              "text-warning-800": variant === "warning",
              "inline-flex text-error-700": variant === "error",
              "text-neutral-700": variant === "neutral",
            }
          )}
        />
        {children ? (
          <span
            className={SubframeUtils.twClassNames(
              "whitespace-nowrap text-caption font-caption text-brand-800",
              {
                "text-body-medium font-body-medium": size === "large",
                "text-success-800": variant === "success",
                "text-warning-800": variant === "warning",
                "text-error-800": variant === "error",
                "text-neutral-700": variant === "neutral",
              }
            )}
          >
            {children}
          </span>
        ) : null}
        {iconRight ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "font-['Urbanist'] text-[16px] font-[600] leading-[20px] text-brand-700",
              {
                "text-body-large-/-bold font-body-large-/-bold":
                  size === "large",
                "text-success-800": variant === "success",
                "text-warning-800": variant === "warning",
                "text-error-700": variant === "error",
                "text-neutral-700": variant === "neutral",
              }
            )}
          >
            {iconRight}
          </SubframeCore.IconWrapper>
        ) : null}
      </div>
    );
  }
);

export const Chips = ChipsRoot;
