"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { FeatherBox } from "@subframe/core";
import { FeatherBuilding } from "@subframe/core";
import { FeatherCalendar1 } from "@subframe/core";
import { FeatherChartPie } from "@subframe/core";
import { FeatherPanelLeftOpen } from "@subframe/core";
import { FeatherHome } from "@subframe/core";
import { FeatherMegaphone } from "@subframe/core";
import { FeatherMicroscope } from "@subframe/core";
import { FeatherSettings2 } from "@subframe/core";
import { FeatherUsers2 } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { Avatar } from "./Avatar";
import * as SubframeUtils from "../utils";
import { useSidebar } from "@/contexts/SidebarContext";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  selected?: boolean;
  tooltipContent?: string;
  className?: string;
}

const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(function NavItem(
  {
    icon,
    selected = false,
    tooltipContent,
    className,
    ...otherProps
  }: NavItemProps,
  ref
) {
  return (
    <SubframeCore.Tooltip.Provider delayDuration={150}>
      <SubframeCore.Tooltip.Root>
        <SubframeCore.Tooltip.Trigger asChild>
          <div
            className={SubframeUtils.twClassNames(
              "flex w-12 h-12 cursor-pointer items-center justify-center rounded-lg hover:bg-neutral-100 active:bg-neutral-100 transition-colors",
              {
                "bg-brand-50 hover:bg-brand-100 active:bg-brand-100": selected,
              },
              className
            )}
            ref={ref}
            {...otherProps}
          >
            {icon ? (
              <SubframeCore.IconWrapper
                className={SubframeUtils.twClassNames(
                  "text-[20px] text-neutral-600",
                  { "text-brand-700": selected }
                )}
              >
                {icon}
              </SubframeCore.IconWrapper>
            ) : null}
          </div>
        </SubframeCore.Tooltip.Trigger>
        {tooltipContent ? (
          <SubframeCore.Tooltip.Portal>
            <SubframeCore.Tooltip.Content
              side="right"
              align="center"
              sideOffset={10}
              className="z-50 rounded-md bg-black px-2 py-1 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            >
              {tooltipContent}
            </SubframeCore.Tooltip.Content>
          </SubframeCore.Tooltip.Portal>
        ) : null}
      </SubframeCore.Tooltip.Root>
    </SubframeCore.Tooltip.Provider>
  );
});

interface CollapsedSidebarProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export const CollapsedSidebar = React.forwardRef<HTMLElement, CollapsedSidebarProps>(
  function CollapsedSidebar({ className, ...otherProps }: CollapsedSidebarProps, ref) {
    const pathname = usePathname();
    const router = useRouter();
    
    // Use try-catch to handle context outside provider
    let toggleSidebar = () => {};
    try {
      const sidebarContext = useSidebar();
      toggleSidebar = sidebarContext.toggleSidebar;
    } catch (e) {
      // Context not available, use empty function
    }

    // Function to check if a path is active
    const isActive = (path: string) => {
      if (path === '/') {
        return pathname === '/' || pathname === '/homepage';
      }
      if (path === '/patients') {
        return pathname.startsWith('/patients') || pathname.startsWith('/patient-groups');
      }
      return pathname.startsWith(path);
    };

    // Navigation function
    const navigateTo = (path: string) => {
      router.push(path);
    };

    return (
      <nav
        className={SubframeUtils.twClassNames(
          "flex h-full w-16 flex-col items-center bg-neutral-50 border-r border-solid border-neutral-border py-4",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {/* Header with logo and toggle button */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          
          {/* Toggle button */}
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
            title="Expand sidebar"
          >
            <FeatherPanelLeftOpen className="text-[16px]" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <NavItem
            icon={<FeatherHome />}
            selected={isActive('/')}
            tooltipContent="Home"
            onClick={() => navigateTo('/')}
          />
          <NavItem
            icon={<FeatherUsers2 />}
            selected={isActive('/patients')}
            tooltipContent="Patients"
            onClick={() => navigateTo('/patients')}
          />
          <NavItem
            icon={<FeatherCalendar1 />}
            selected={isActive('/scheduling')}
            tooltipContent="Scheduling"
            onClick={() => navigateTo('/scheduling')}
          />
          <NavItem
            icon={<FeatherMicroscope />}
            selected={isActive('/labs')}
            tooltipContent="Labs Order"
            onClick={() => navigateTo('/labs')}
          />
          <NavItem
            icon={<FeatherMegaphone />}
            selected={isActive('/marketing')}
            tooltipContent="Marketing"
            onClick={() => navigateTo('/marketing')}
          />
          <NavItem
            icon={<FeatherChartPie />}
            selected={isActive('/reports')}
            tooltipContent="Reports"
            onClick={() => navigateTo('/reports')}
          />
          <NavItem
            icon={<FeatherBox />}
            selected={isActive('/inventory')}
            tooltipContent="Inventory"
            onClick={() => navigateTo('/inventory')}
          />
          <NavItem
            icon={<FeatherBuilding />}
            selected={isActive('/admin')}
            tooltipContent="Admin"
            onClick={() => navigateTo('/admin')}
          />
          <NavItem
            icon={<FeatherSettings2 />}
            selected={isActive('/settings')}
            tooltipContent="Settings"
            onClick={() => navigateTo('/settings')}
          />
        </div>

        {/* Footer with user avatar */}
        <div className="mt-auto">
          <SubframeCore.Tooltip.Provider delayDuration={150}>
            <SubframeCore.Tooltip.Root>
              <SubframeCore.Tooltip.Trigger asChild>
                <div className="cursor-pointer">
                  <Avatar
                    variant="brand"
                    image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif"
                    square={false}
                    className="w-10 h-10"
                  >
                    A
                  </Avatar>
                </div>
              </SubframeCore.Tooltip.Trigger>
              <SubframeCore.Tooltip.Portal>
                <SubframeCore.Tooltip.Content
                  side="right"
                  align="center"
                  sideOffset={10}
                  className="z-50 rounded-md bg-black px-2 py-1 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                >
                  Susan Miller - Front Desk
                </SubframeCore.Tooltip.Content>
              </SubframeCore.Tooltip.Portal>
            </SubframeCore.Tooltip.Root>
          </SubframeCore.Tooltip.Provider>
        </div>
      </nav>
    );
  }
);