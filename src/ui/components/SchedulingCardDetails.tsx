"use client";
/*
 * Documentation:
 * Icon Button — https://app.subframe.com/e50163b8c1bc/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Scheduling card details — https://app.subframe.com/e50163b8c1bc/library?component=Scheduling+card+details_1569aa96-7969-45f4-b49b-e9de7f376e30
 * Select — https://app.subframe.com/e50163b8c1bc/library?component=Select_bb88f90b-8c43-4b73-9c2f-3558ce7838f3
 */

import React from "react";
import { FeatherCommand } from "@subframe/core";
import { FeatherMoreVertical } from "@subframe/core";
import { FeatherNotebookPen } from "@subframe/core";
import { FeatherPhone } from "@subframe/core";
import { FeatherRepeat } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconButton } from "./IconButton";
import { Select } from "./Select";

interface AppointmentStatusBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  timeSlot?: React.ReactNode;
  select?: React.ReactNode;
  variant?: "default" | "booked" | "cancelled" | "variation";
  className?: string;
}

const AppointmentStatusBar = React.forwardRef<
  HTMLDivElement,
  AppointmentStatusBarProps
>(function AppointmentStatusBar(
  {
    timeSlot,
    select,
    variant = "default",
    className,
    ...otherProps
  }: AppointmentStatusBarProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/7eb2f251 flex w-full items-center justify-between rounded-md bg-success-600 pl-4 pr-2",
        {
          "bg-error-600": variant === "variation" || variant === "cancelled",
          "bg-brand-600": variant === "booked",
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {timeSlot ? (
        <span className="text-body-medium font-body-medium text-white">
          {timeSlot}
        </span>
      ) : null}
      {select ? (
        <div className="flex items-center justify-between">{select}</div>
      ) : null}
    </div>
  );
});

interface SchedulingCardDetailsRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "booked"
    | "confirmed"
    | "cancelled"
    | "no-show"
    | "arrived"
    | "waiting"
    | "in-progress"
    | "completed";
  className?: string;
}

const SchedulingCardDetailsRoot = React.forwardRef<
  HTMLDivElement,
  SchedulingCardDetailsRootProps
>(function SchedulingCardDetailsRoot(
  {
    variant = "booked",
    className,
    ...otherProps
  }: SchedulingCardDetailsRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/1569aa96 flex w-80 flex-col items-start gap-2 rounded-lg bg-neutral-50 px-2 py-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <AppointmentStatusBar
        timeSlot="08:00 - 08:30"
        select={
          <Select label="" placeholder="Booked" helpText="">
            <Select.Item value="Item 1">Item 1</Select.Item>
            <Select.Item value="Item 2">Item 2</Select.Item>
            <Select.Item value="Item 3">Item 3</Select.Item>
          </Select>
        }
        variant={
          variant === "cancelled"
            ? "cancelled"
            : variant === "confirmed"
            ? "default"
            : "booked"
        }
      />
      <div className="flex w-full items-start justify-between px-2 py-2">
        <div className="flex flex-col items-start justify-end gap-1">
          <span className="text-heading-3 font-heading-3 text-default-font">
            Rosemary Wilson
          </span>
          <span className="text-body-medium font-body-medium text-default-font">
            Scale and Polish
          </span>
        </div>
        <IconButton
          disabled={false}
          variant="neutral-secondary"
          icon={<FeatherMoreVertical />}
          loading={false}
        />
      </div>
      <div className="flex w-full flex-col items-start rounded-lg bg-default-background">
        <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-2 py-3">
          <FeatherPhone className="text-heading-3 font-heading-3 text-neutral-400" />
          <span className="text-body-medium font-body-medium text-brand-700">
            +351 954 345 245
          </span>
        </div>
        <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-2 py-3">
          <FeatherUser className="text-heading-3 font-heading-3 text-neutral-400" />
          <span className="text-body-medium font-body-medium text-default-font">
            Dr Rafael Rodrigues
          </span>
        </div>
        <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-2 py-3">
          <FeatherCommand className="text-heading-3 font-heading-3 text-neutral-400" />
          <span className="text-body-medium font-body-medium text-default-font">
            Room 03
          </span>
        </div>
        <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-2 py-3">
          <FeatherRepeat className="text-heading-3 font-heading-3 text-neutral-400" />
          <span className="text-body-medium font-body-medium text-default-font">
            Return on 23/11/25 at 14:30
          </span>
        </div>
        <div className="flex w-full items-center gap-2 px-2 py-3">
          <FeatherNotebookPen className="text-heading-3 font-heading-3 text-neutral-400" />
          <span className="line-clamp-2 whitespace-pre-wrap text-body-medium font-body-medium text-default-font">
            {
              "When patient arrives, offer botox and get their friends doinf a lot of botox"
            }
          </span>
        </div>
      </div>
    </div>
  );
});

export const SchedulingCardDetails = Object.assign(SchedulingCardDetailsRoot, {
  AppointmentStatusBar,
});
