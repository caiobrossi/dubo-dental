"use client";
/*
 * Documentation:
 * Icon Button — https://app.subframe.com/e50163b8c1bc/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * PatientGroupCard — https://app.subframe.com/e50163b8c1bc/library?component=PatientGroupCard_fc5bb1ea-03bd-43ca-a79c-c7bfda53004d
 */

import React from "react";
import { FeatherMoreVertical } from "@subframe/core";
import { FeatherShare2 } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconButton } from "./IconButton";

interface PatientGroupCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: string;
  title?: React.ReactNode;
  patientCount?: React.ReactNode;
  menuActions?: React.ReactNode;
  className?: string;
}

const PatientGroupCardRoot = React.forwardRef<
  HTMLDivElement,
  PatientGroupCardRootProps
>(function PatientGroupCardRoot(
  {
    icon,
    title,
    patientCount,
    menuActions,
    className,
    ...otherProps
  }: PatientGroupCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/fc5bb1ea flex h-32 w-full cursor-pointer flex-col items-start justify-between rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm hover:bg-neutral-50",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full items-center gap-2">
        {icon ? (
          <img
            className="h-8 w-8 flex-none object-cover [clip-path:circle()]"
            src={icon}
          />
        ) : null}
        {title ? (
          <span className="line-clamp-2 grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
            {title}
          </span>
        ) : null}
        <SubframeCore.DropdownMenu.Root>
          <SubframeCore.DropdownMenu.Trigger asChild={true}>
            <IconButton size="small" icon={<FeatherMoreVertical />} />
          </SubframeCore.DropdownMenu.Trigger>
          <SubframeCore.DropdownMenu.Portal>
            <SubframeCore.DropdownMenu.Content
              side="bottom"
              align="end"
              sideOffset={4}
              asChild={true}
            >
              {menuActions ? (
                <div className="flex items-start justify-between">
                  {menuActions}
                </div>
              ) : null}
            </SubframeCore.DropdownMenu.Content>
          </SubframeCore.DropdownMenu.Portal>
        </SubframeCore.DropdownMenu.Root>
      </div>
      <div className="flex w-full flex-col items-start gap-1">
        <div className="flex w-full items-center gap-2">
          <FeatherUser className="text-body-medium font-body-medium text-subtext-color" />
          {patientCount ? (
            <span className="text-body-small font-body-small text-subtext-color">
              {patientCount}
            </span>
          ) : null}
        </div>
        <div className="hidden w-full items-center gap-2">
          <FeatherShare2 className="text-body-medium font-body-medium text-subtext-color" />
          {patientCount ? (
            <span className="text-body-small font-body-small text-subtext-color">
              {patientCount}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export const PatientGroupCard = PatientGroupCardRoot;
