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
import { FeatherUsers } from "@subframe/core";
import { FeatherComponent } from "@subframe/core";
import { FeatherSyringe } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherShield } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
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
  groupColor?: string;
  groupIcon?: string;
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
    groupColor,
    groupIcon,
    ...otherProps
  }: PatientGroupCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/fc5bb1ea flex w-full cursor-pointer flex-col items-start justify-between rounded-md bg-neutral-100 hover:bg-white hover:shadow-md hover:border hover:border-neutral-border p-4 transition-all min-h-[140px]",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full items-center gap-3 pb-4">
        {/* Colored icon badge replacing previous image */}
        <div
          className="h-8 w-8 flex-none rounded-full flex items-center justify-center"
          style={{
            backgroundColor: (
              {
                blue: "#3b82f6",
                green: "#10b981",
                red: "#ef4444",
                yellow: "#f59e0b",
                purple: "#8b5cf6",
                orange: "#f97316",
                pink: "#ec4899",
                gray: "#6b7280",
                indigo: "#6366f1",
                teal: "#14b8a6",
                cyan: "#06b6d4",
                emerald: "#10b981",
              } as Record<string, string>
            )[groupColor || "blue"] || "#3b82f6",
          }}
        >
          {(() => {
            const iconName = (groupIcon || "users").toLowerCase();
            const iconClass = "w-4 h-4 text-white";
            switch (iconName) {
              case "users":
                return <FeatherUsers className={iconClass} />;
              case "user":
                return <FeatherUser className={iconClass} />;
              case "component":
                return <FeatherComponent className={iconClass} />;
              case "syringe":
                return <FeatherSyringe className={iconClass} />;
              case "star":
                return <FeatherStar className={iconClass} />;
              case "heart":
                return <FeatherHeart className={iconClass} />;
              case "shield":
                return <FeatherShield className={iconClass} />;
              case "settings":
                return <FeatherSettings className={iconClass} />;
              default:
                return <FeatherUsers className={iconClass} />;
            }
          })()}
        </div>
        {title ? (
          <span className="line-clamp-2 grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
            {title}
          </span>
        ) : null}
        <SubframeCore.DropdownMenu.Root>
          <SubframeCore.DropdownMenu.Trigger asChild={true}>
            <IconButton size="medium" icon={<FeatherMoreVertical />} />
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
      <div className="flex w-full items-center gap-2">
        <FeatherUser className="text-body-medium font-body-medium text-subtext-color" />
        {patientCount ? (
          <span className="text-caption font-caption text-subtext-color">
            {patientCount}
          </span>
        ) : null}
      </div>
    </div>
  );
});

export const PatientGroupCard = PatientGroupCardRoot;
