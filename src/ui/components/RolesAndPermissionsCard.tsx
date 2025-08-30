"use client";
/*
 * Documentation:
 * Icon Button — https://app.subframe.com/e50163b8c1bc/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * roles and permissions card — https://app.subframe.com/e50163b8c1bc/library?component=roles+and+permissions+card_02b0195d-8bee-43aa-99cd-f6ce5fec2d51
 */

import React from "react";
import { FeatherMoreVertical } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconButton } from "./IconButton";

interface RolesAndPermissionsCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  menuActions?: React.ReactNode;
  stats?: React.ReactNode;
  className?: string;
}

const RolesAndPermissionsCardRoot = React.forwardRef<
  HTMLDivElement,
  RolesAndPermissionsCardRootProps
>(function RolesAndPermissionsCardRoot(
  {
    title,
    menuActions,
    stats,
    className,
    ...otherProps
  }: RolesAndPermissionsCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/02b0195d flex h-32 w-full cursor-pointer flex-col items-start justify-between rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm hover:bg-neutral-50",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full items-center gap-2">
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
      {stats ? (
        <div className="flex w-full flex-col items-start gap-2">{stats}</div>
      ) : null}
    </div>
  );
});

export const RolesAndPermissionsCard = RolesAndPermissionsCardRoot;
