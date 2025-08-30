"use client";
/*
 * Documentation:
 * Charting card — https://app.subframe.com/e50163b8c1bc/library?component=Charting+card_74e0942c-d525-49db-834b-f6a6f601750c
 */

import React from "react";
import { FeatherChevronRight } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ChartingCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: React.ReactNode;
  className?: string;
}

const ChartingCardRoot = React.forwardRef<
  HTMLDivElement,
  ChartingCardRootProps
>(function ChartingCardRoot(
  { text, className, ...otherProps }: ChartingCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/74e0942c flex w-full cursor-pointer items-center justify-between rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 hover:bg-new-white-100 hover:shadow-md",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {text ? (
        <span className="text-body-medium font-body-medium text-default-font">
          {text}
        </span>
      ) : null}
      <FeatherChevronRight className="text-body-medium font-body-medium text-subtext-color group-hover/74e0942c:text-subtext-color" />
    </div>
  );
});

export const ChartingCard = ChartingCardRoot;
