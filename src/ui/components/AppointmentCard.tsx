"use client";
/*
 * Documentation:
 * AppointmentCard — https://app.subframe.com/e50163b8c1bc/library?component=AppointmentCard_d3e96d75-9193-48f3-9e05-9074a589bb19
 */

import React from "react";
import { FeatherPlus } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface AppointmentCardRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  patientName?: React.ReactNode;
  appointmentDetails?: React.ReactNode;
  timeSlot?: React.ReactNode;
  variant?:
    | "default"
    | "variation"
    | "variation-2"
    | "variation-3"
    | "variation-4";
  variant2?: "default";
  className?: string;
}

const AppointmentCardRoot = React.forwardRef<
  HTMLDivElement,
  AppointmentCardRootProps
>(function AppointmentCardRoot(
  {
    patientName,
    appointmentDetails,
    timeSlot,
    variant = "default",
    variant2 = "default",
    className,
    ...otherProps
  }: AppointmentCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/d3e96d75 flex h-full w-full cursor-pointer flex-col items-start justify-between rounded-sm border-2 border-solid border-brand-100 bg-brand-50 px-2 py-2 hover:bg-brand-100",
        {
          "border-2 border-solid border-warning-100 bg-warning-50":
            variant === "variation-2",
          "border-2 border-solid border-error-100 bg-error-50":
            variant === "variation",
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full flex-col items-start gap-2">
        {patientName ? (
          <span className="font-['Urbanist'] text-[16px] font-[500] leading-[20px] text-default-font">
            {patientName}
          </span>
        ) : null}
        {appointmentDetails ? (
          <span className="text-body-medium font-body-medium text-brand-primary">
            {appointmentDetails}
          </span>
        ) : null}
      </div>
      <div className="flex w-full items-center justify-between">
        {timeSlot ? (
          <span className="text-body-medium font-body-medium text-subtext-color">
            {timeSlot}
          </span>
        ) : null}
        <div className="flex items-end justify-between">
          <FeatherPlus className="text-body-medium font-body-medium text-default-font" />
          <FeatherPlus className="text-body-medium font-body-medium text-default-font" />
        </div>
      </div>
    </div>
  );
});

export const AppointmentCard = AppointmentCardRoot;
