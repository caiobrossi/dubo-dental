"use client";
/*
 * Documentation:
 * waitlist card — https://app.subframe.com/e50163b8c1bc/library?component=waitlist+card_31286342-879f-447a-952f-fef84f12c023
 */

import React from "react";
import { FeatherGripVertical } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface WaitlistCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  patientName?: React.ReactNode;
  procedure?: React.ReactNode;
  doctorAvatar?: React.ReactNode;
  className?: string;
}

const WaitlistCardRoot = React.forwardRef<
  HTMLDivElement,
  WaitlistCardRootProps
>(function WaitlistCardRoot(
  {
    patientName,
    procedure,
    doctorAvatar,
    className,
    ...otherProps
  }: WaitlistCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/31286342 flex w-full cursor-pointer items-start gap-4 border-b border-solid border-neutral-border px-4 py-4 hover:rounded-md hover:border-none hover:bg-default-background hover:shadow-md",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <FeatherGripVertical className="text-heading-3 font-heading-3 text-default-font" />
      <div className="flex w-1 flex-none flex-col items-center gap-2 self-stretch overflow-hidden rounded-md bg-brand-600" />
      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
        {patientName ? (
          <span className="w-full text-heading-4 font-heading-4 text-default-font">
            {patientName}
          </span>
        ) : null}
        {procedure ? (
          <span className="w-full text-body-medium font-body-medium text-brand-600">
            {procedure}
          </span>
        ) : null}
      </div>
      {doctorAvatar ? (
        <div className="flex items-start gap-4">{doctorAvatar}</div>
      ) : null}
    </div>
  );
});

export const WaitlistCard = WaitlistCardRoot;
