"use client";
/*
 * Documentation:
 * MessageCard — https://app.subframe.com/e50163b8c1bc/library?component=MessageCard_5c99fe4e-13ff-427a-acae-4b0c689dc1ce
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface MessageCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  menuActions?: React.ReactNode;
  variant?: "default";
  children?: React.ReactNode;
  className?: string;
}

const MessageCardRoot = React.forwardRef<HTMLDivElement, MessageCardRootProps>(
  function MessageCardRoot(
    {
      title,
      description,
      menuActions,
      variant = "default",
      children,
      className,
      ...otherProps
    }: MessageCardRootProps,
    ref
  ) {
    return children ? (
      <div
        className={SubframeUtils.twClassNames(
          "group/5c99fe4e flex h-full w-full cursor-pointer flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm hover:bg-default-background hover:shadow-md",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {children}
      </div>
    ) : null;
  }
);

export const MessageCard = MessageCardRoot;
