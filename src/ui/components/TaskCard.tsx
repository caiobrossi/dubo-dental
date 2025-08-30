"use client";
/*
 * Documentation:
 * Badge — https://app.subframe.com/e50163b8c1bc/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 * Icon Button — https://app.subframe.com/e50163b8c1bc/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * task card — https://app.subframe.com/e50163b8c1bc/library?component=task+card_46080b57-6592-42de-9e17-27e191af8070
 */

import React from "react";
import { FeatherClock } from "@subframe/core";
import { FeatherMoreVertical } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Badge } from "./Badge";
import { IconButton } from "./IconButton";

interface TaskCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  text?: React.ReactNode;
  className?: string;
}

const TaskCardRoot = React.forwardRef<HTMLDivElement, TaskCardRootProps>(
  function TaskCardRoot(
    { image, text, className, ...otherProps }: TaskCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/46080b57 flex w-full cursor-pointer items-center justify-between border-b border-solid border-neutral-border px-1 py-4 hover:bg-neutral-50",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex items-center gap-2">
          {image ? (
            <img className="h-10 w-10 flex-none object-cover" src={image} />
          ) : null}
          {text ? (
            <span className="text-body-large font-body-large text-default-font">
              {text}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" icon={<FeatherClock />} iconRight={null}>
            Due 23/12 
          </Badge>
          <IconButton
            disabled={false}
            variant="neutral-tertiary"
            size="medium"
            icon={<FeatherMoreVertical />}
            loading={false}
          />
        </div>
      </div>
    );
  }
);

export const TaskCard = TaskCardRoot;
