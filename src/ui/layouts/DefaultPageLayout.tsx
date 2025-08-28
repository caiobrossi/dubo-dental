"use client";
/*
 * Documentation:
 * Avatar — https://app.subframe.com/e50163b8c1bc/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Default Page Layout — https://app.subframe.com/e50163b8c1bc/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Sidebar with large items — https://app.subframe.com/e50163b8c1bc/library?component=Sidebar+with+large+items_70c3656e-47c2-460e-8007-e198804e8862
 */

import React from "react";
import { FeatherBox } from "@subframe/core";
import { FeatherBuilding } from "@subframe/core";
import { FeatherCalendar1 } from "@subframe/core";
import { FeatherChartPie } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";
import { FeatherHome } from "@subframe/core";
import { FeatherMegaphone } from "@subframe/core";
import { FeatherMicroscope } from "@subframe/core";
import { FeatherSettings2 } from "@subframe/core";
import { FeatherUsers2 } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { Avatar } from "../components/Avatar";
import { SidebarWithLargeItems } from "../components/SidebarWithLargeItems";
import * as SubframeUtils from "../utils";

interface DefaultPageLayoutRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const DefaultPageLayoutRoot = React.forwardRef<
  HTMLDivElement,
  DefaultPageLayoutRootProps
>(function DefaultPageLayoutRoot(
  { children, className, ...otherProps }: DefaultPageLayoutRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-screen w-full items-center",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <SidebarWithLargeItems
        className="h-auto w-52 flex-none self-stretch mobile:hidden"
        header={
          <img
            className="w-24 flex-none"
            src="https://res.cloudinary.com/subframe/image/upload/v1756287821/uploads/12900/jf4fwwfncjgr3ub56ckx.svg"
          />
        }
        footer={
          <SubframeCore.Popover.Root>
            <SubframeCore.Popover.Trigger asChild={true}>
              <div className="flex w-full items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2">
                  <Avatar
                    variant="brand"
                    image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif"
                    square={false}
                  >
                    A
                  </Avatar>
                  <div className="flex flex-col items-start gap-2">
                    <span className="font-['Instrument_Sans'] text-[16px] font-[500] leading-[20px] text-[#404040ff]">
                      Susan Miller
                    </span>
                    <span className="text-body-small font-body-small text-subtext-color">
                      Front Desk
                    </span>
                  </div>
                </div>
                <FeatherChevronRight className="text-heading-3 font-heading-3 text-default-font" />
              </div>
            </SubframeCore.Popover.Trigger>
            <SubframeCore.Popover.Portal>
              <SubframeCore.Popover.Content
                side="right"
                align="end"
                sideOffset={4}
                asChild={true}
              >
                <div className="flex flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-3 shadow-lg" />
              </SubframeCore.Popover.Content>
            </SubframeCore.Popover.Portal>
          </SubframeCore.Popover.Root>
        }
      >
        <SidebarWithLargeItems.NavItem icon={<FeatherHome />}>
          Home
        </SidebarWithLargeItems.NavItem>
        <SidebarWithLargeItems.NavItem icon={<FeatherUsers2 />}>
          Patients
        </SidebarWithLargeItems.NavItem>
        <SidebarWithLargeItems.NavItem icon={<FeatherCalendar1 />}>
          Scheduling
        </SidebarWithLargeItems.NavItem>
        <SidebarWithLargeItems.NavItem icon={<FeatherMicroscope />}>
          Labs Order
        </SidebarWithLargeItems.NavItem>
        <SidebarWithLargeItems.NavItem icon={<FeatherMegaphone />}>
          Marketing
        </SidebarWithLargeItems.NavItem>
        <SidebarWithLargeItems.NavItem icon={<FeatherChartPie />}>
          Reports
        </SidebarWithLargeItems.NavItem>
        <SidebarWithLargeItems.NavItem icon={<FeatherBox />}>
          Inventory
        </SidebarWithLargeItems.NavItem>
        <SidebarWithLargeItems.NavItem icon={<FeatherBuilding />}>
          Admin
        </SidebarWithLargeItems.NavItem>
        <SidebarWithLargeItems.NavItem icon={<FeatherSettings2 />}>
          Settings
        </SidebarWithLargeItems.NavItem>
      </SidebarWithLargeItems>
      {children ? (
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch overflow-y-auto bg-page-bg">
          {children}
        </div>
      ) : null}
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;
