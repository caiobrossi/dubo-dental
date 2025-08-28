"use client";
/*
 * Documentation:
 * DayHeader — https://app.subframe.com/e50163b8c1bc/library?component=DayHeader_97cfabd3-9096-462e-847b-c0dc7142b206
 * Dropdown Menu — https://app.subframe.com/e50163b8c1bc/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 */

import React from "react";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { DropdownMenu } from "./DropdownMenu";

interface DayHeaderRootProps extends React.HTMLAttributes<HTMLDivElement> {
  day?: React.ReactNode;
  className?: string;
}

const DayHeaderRoot = React.forwardRef<HTMLDivElement, DayHeaderRootProps>(
  function DayHeaderRoot(
    { day, className, ...otherProps }: DayHeaderRootProps,
    ref
  ) {
    return (
      <SubframeCore.DropdownMenu.Root>
        <SubframeCore.DropdownMenu.Trigger asChild={true}>
          <div
            className={SubframeUtils.twClassNames(
              "group/97cfabd3 flex cursor-pointer items-center gap-2 rounded-full pl-3 pr-2 py-2 hover:bg-new-gray-4 hover:pl-3 hover:pr-2 hover:py-2",
              className
            )}
            ref={ref}
            {...otherProps}
          >
            {day ? (
              <span className="font-['Urbanist'] text-[20px] font-[400] leading-[24px] text-default-font">
                {day}
              </span>
            ) : null}
            <FeatherChevronDown className="text-body-medium font-body-medium text-default-font" />
          </div>
        </SubframeCore.DropdownMenu.Trigger>
        <SubframeCore.DropdownMenu.Portal>
          <SubframeCore.DropdownMenu.Content
            side="bottom"
            align="center"
            sideOffset={4}
            asChild={true}
          >
            <DropdownMenu className="group-hover/97cfabd3:h-auto group-hover/97cfabd3:w-auto group-hover/97cfabd3:flex-none">
              <DropdownMenu.DropdownItem icon={<FeatherStar />}>
                Favorite
              </DropdownMenu.DropdownItem>
              <DropdownMenu.DropdownItem icon={<FeatherPlus />}>
                Add
              </DropdownMenu.DropdownItem>
              <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>
                Edit
              </DropdownMenu.DropdownItem>
              <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
                Delete
              </DropdownMenu.DropdownItem>
            </DropdownMenu>
          </SubframeCore.DropdownMenu.Content>
        </SubframeCore.DropdownMenu.Portal>
      </SubframeCore.DropdownMenu.Root>
    );
  }
);

export const DayHeader = DayHeaderRoot;
