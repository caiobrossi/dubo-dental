"use client";
/*
 * Documentation:
 * Progress — https://app.subframe.com/e50163b8c1bc/library?component=Progress_60964db0-a1bf-428b-b9d5-f34cdf58ea77
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface IndicatorProps
  extends React.ComponentProps<typeof SubframeCore.Progress.Indicator> {
  variant?: "default" | "success" | "error";
  className?: string;
}

const Indicator = React.forwardRef<HTMLDivElement, IndicatorProps>(
  function Indicator(
    { variant = "default", className, ...otherProps }: IndicatorProps,
    ref
  ) {
    return (
      <SubframeCore.Progress.Indicator asChild={true} {...otherProps}>
        <div
          className={SubframeUtils.twClassNames(
            "group/641ca690 flex h-2 w-full flex-col items-start gap-2 rounded-full bg-brand-600",
            {
              "bg-error-600": variant === "error",
              "bg-success-600": variant === "success",
            },
            className
          )}
          ref={ref}
        />
      </SubframeCore.Progress.Indicator>
    );
  }
);

interface ProgressRootProps
  extends React.ComponentProps<typeof SubframeCore.Progress.Root> {
  value?: number;
  variant?: "default" | "income" | "expenses" | "balance";
  className?: string;
}

const ProgressRoot = React.forwardRef<HTMLDivElement, ProgressRootProps>(
  function ProgressRoot(
    {
      value = 30,
      variant = "default",
      className,
      ...otherProps
    }: ProgressRootProps,
    ref
  ) {
    return (
      <SubframeCore.Progress.Root asChild={true} value={value} {...otherProps}>
        <div
          className={SubframeUtils.twClassNames(
            "group/60964db0 flex w-full flex-col items-start gap-2 overflow-hidden rounded-full bg-neutral-100",
            {
              "bg-brand-100": variant === "balance",
              "bg-error-200": variant === "expenses",
              "bg-success-200": variant === "income",
            },
            className
          )}
          ref={ref}
        >
          <Indicator
            variant={
              variant === "expenses"
                ? "error"
                : variant === "income"
                ? "success"
                : undefined
            }
          />
        </div>
      </SubframeCore.Progress.Root>
    );
  }
);

export const Progress = Object.assign(ProgressRoot, {
  Indicator,
});
