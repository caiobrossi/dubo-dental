"use client";
/*
 * Documentation:
 * Avatar — https://app.subframe.com/e50163b8c1bc/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Large Badge — https://app.subframe.com/e50163b8c1bc/library?component=Large+Badge_f003eb3b-6b6f-483f-8f2e-f6fcd63ad117
 */

import React from "react";
import { FeatherPlus } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Avatar } from "./Avatar";

interface LargeBadgeRootProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  badgeAvatar?: "default" | "default";
  className?: string;
}

const LargeBadgeRoot = React.forwardRef<HTMLDivElement, LargeBadgeRootProps>(
  function LargeBadgeRoot(
    {
      icon = <FeatherPlus />,
      children,
      badgeAvatar = "default",
      className,
      ...otherProps
    }: LargeBadgeRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/f003eb3b flex h-10 w-40 cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-solid border-neutral-border px-3 py-2 hover:bg-neutral-50 active:bg-neutral-100",
          {
            "h-10 w-auto bg-default-background pl-1 pr-3 py-2":
              badgeAvatar === "default",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {icon ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-heading-3 font-heading-3 text-brand-700",
              { hidden: badgeAvatar === "default" }
            )}
          >
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        <Avatar
          className={SubframeUtils.twClassNames("hidden", {
            flex: badgeAvatar === "default",
          })}
          variant="brand"
          size="medium"
          image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif"
          square={false}
        >
          A
        </Avatar>
        {children ? (
          <span className="text-body-small font-body-small text-default-font">
            {children}
          </span>
        ) : null}
        {icon ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "hidden text-heading-3 font-heading-3 text-brand-700",
              { "group-hover/f003eb3b:hidden": badgeAvatar === "default" }
            )}
          >
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        {icon ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "hidden text-heading-3 font-heading-3 text-brand-700",
              { "inline-flex": badgeAvatar === "default" }
            )}
          >
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
      </div>
    );
  }
);

export const LargeBadge = LargeBadgeRoot;
