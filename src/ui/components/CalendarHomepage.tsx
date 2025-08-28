"use client";
/*
 * Documentation:
 * Avatar — https://app.subframe.com/e50163b8c1bc/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Calendar homepage — https://app.subframe.com/e50163b8c1bc/library?component=Calendar+homepage_ecf14bc9-e00f-4028-8c0d-8137d2212794
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { Avatar } from "./Avatar";

interface CalendarHomepageRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  text?: React.ReactNode;
  text2?: React.ReactNode;
  text3?: React.ReactNode;
  text4?: React.ReactNode;
  variant?: "default";
  variant2?: "default" | "confirmed";
  className?: string;
}

const CalendarHomepageRoot = React.forwardRef<
  HTMLDivElement,
  CalendarHomepageRootProps
>(function CalendarHomepageRoot(
  {
    text,
    text2,
    text3,
    text4,
    variant = "default",
    variant2 = "default",
    className,
    ...otherProps
  }: CalendarHomepageRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/ecf14bc9 flex w-full cursor-pointer items-start gap-4 border-b border-solid border-neutral-border px-4 py-4 hover:bg-new-white-80",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex flex-col items-end gap-1">
        {text ? (
          <span className="font-body-medium-/-bold text-default-font">
            {text}
          </span>
        ) : null}
        {text2 ? (
          <span className="text-body-small font-body-small text-subtext-color">
            {text2}
          </span>
        ) : null}
      </div>
      <div
        className={SubframeUtils.twClassNames(
          "flex w-1 flex-none flex-col items-center gap-2 self-stretch overflow-hidden rounded-md bg-brand-600",
          { "bg-success-600": variant2 === "confirmed" }
        )}
      />
      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
        {text3 ? (
          <span className="w-full text-heading-4 font-heading-4 text-default-font">
            {text3}
          </span>
        ) : null}
        {text4 ? (
          <span
            className={SubframeUtils.twClassNames(
              "w-full text-body-medium font-body-medium text-brand-600",
              { "text-success-700": variant2 === "confirmed" }
            )}
          >
            {text4}
          </span>
        ) : null}
      </div>
      <Avatar
        size="small"
        image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif"
      >
        A
      </Avatar>
    </div>
  );
});

export const CalendarHomepage = CalendarHomepageRoot;
