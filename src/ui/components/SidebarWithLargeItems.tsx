"use client";
/*
 * Documentation:
 * Sidebar with large items — https://app.subframe.com/e50163b8c1bc/library?component=Sidebar+with+large+items_70c3656e-47c2-460e-8007-e198804e8862
 */

import React from "react";
import { FeatherPlus, FeatherPanelLeftClose } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { useSidebar } from "@/contexts/SidebarContext";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  selected?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
}

const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(function NavItem(
  {
    icon = <FeatherPlus />,
    children,
    selected = false,
    rightSlot,
    className,
    ...otherProps
  }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/ca0dc365 flex w-full cursor-pointer items-center gap-4 rounded-full px-5 pt-3 pb-2.5 hover:bg-neutral-100 active:bg-neutral-100",
        {
          "bg-default-background shadow-sm hover:bg-brand-50 active:bg-brand-100":
            selected,
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-heading-2 font-heading-2 text-neutral-400",
            { "text-brand-700": selected }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {children ? (
        <span
          className={SubframeUtils.twClassNames(
            "line-clamp-1 grow shrink-0 basis-0 text-body-medium font-body-medium text-default-font",
            { "text-brand-700": selected }
          )}
        >
          {children}
        </span>
      ) : null}
      {rightSlot ? <div className="flex items-center">{rightSlot}</div> : null}
    </div>
  );
});

interface SidebarWithLargeItemsRootProps
  extends React.HTMLAttributes<HTMLElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const SidebarWithLargeItemsRoot = React.forwardRef<
  HTMLElement,
  SidebarWithLargeItemsRootProps
>(function SidebarWithLargeItemsRoot(
  {
    header,
    footer,
    children,
    className,
    ...otherProps
  }: SidebarWithLargeItemsRootProps,
  ref
) {
  // Use try-catch to handle context outside provider
  let toggleSidebar = () => {};
  try {
    const sidebarContext = useSidebar();
    toggleSidebar = sidebarContext.toggleSidebar;
  } catch (e) {
    // Context not available, use empty function
  }

  return (
    <nav
      className={SubframeUtils.twClassNames(
        "flex h-full w-60 flex-col items-start bg-neutral-50 border-r border-solid border-neutral-border",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {header ? (
        <div className="flex w-full flex-col items-start gap-2 px-8 pt-8 pb-6">
          {header}
        </div>
      ) : null}
      
      {/* Collapse button positioned to align with page header */}
      <div className="flex w-full justify-end px-4 -mt-2 mb-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
          title="Collapse sidebar"
        >
          <FeatherPanelLeftClose className="text-[18px]" />
        </button>
      </div>
      
      {children ? (
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-1 px-4 py-4 overflow-auto">
          {children}
        </div>
      ) : null}
      {footer ? (
        <div className="flex w-full flex-col items-start justify-end gap-2 px-4 py-4">
          {footer}
        </div>
      ) : null}
    </nav>
  );
});

export const SidebarWithLargeItems = Object.assign(SidebarWithLargeItemsRoot, {
  NavItem,
});
