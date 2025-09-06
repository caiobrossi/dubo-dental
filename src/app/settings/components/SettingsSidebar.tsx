"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChatChannelsMenu } from "@/ui/components/ChatChannelsMenu";
import { IconButton } from "@/ui/components/IconButton";
import { useMenuLayout } from "@/hooks/useMenuLayout";
import { FeatherCalendar } from "@subframe/core";
import { FeatherCheckCircle } from "@subframe/core";
import { FeatherCoins } from "@subframe/core";
import { FeatherFile } from "@subframe/core";
import { FeatherHospital } from "@subframe/core";
import { FeatherMegaphone } from "@subframe/core";
import { FeatherMenu } from "@subframe/core";
import { FeatherPill } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherShapes } from "@subframe/core";
import { FeatherSparkle } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherX } from "@subframe/core";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  icon2?: React.ReactNode;
  available?: boolean;
}

export const SettingsSidebar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { sidebarClasses, menuContainerClasses, getTextSize } = useMenuLayout();


  const menuItems: MenuItem[] = [
    { 
      id: "general", 
      label: "General Settings", 
      href: "/settings",
      icon: <FeatherShapes />, 
      icon2: <FeatherSettings />, 
      available: true 
    },
    { 
      id: "scheduling", 
      label: "Scheduling settings", 
      href: "/settings/scheduling",
      icon2: <FeatherCalendar />, 
      available: true 
    },
    { 
      id: "roles", 
      label: "Roles and Permissions", 
      href: "/settings/roles",
      icon: <FeatherUsers />, 
      icon2: <FeatherCheckCircle />, 
      available: false 
    },
    { 
      id: "templates", 
      label: "Templates", 
      href: "/settings/templates",
      icon2: <FeatherFile />, 
      available: false 
    },
    { 
      id: "insurance", 
      label: "Service list and Insurance", 
      href: "/settings/insurance",
      icon2: <FeatherHospital />, 
      available: true 
    },
    { 
      id: "medication", 
      label: "Medication List", 
      href: "/settings/medication",
      icon2: <FeatherPill />, 
      available: false 
    },
    { 
      id: "marketing", 
      label: "Marketing settings", 
      href: "/settings/marketing",
      icon2: <FeatherMegaphone />, 
      available: false 
    },
    { 
      id: "sales", 
      label: "Sales", 
      href: "/settings/sales",
      icon2: <FeatherCoins />, 
      available: false 
    },
    { 
      id: "automation", 
      label: "Automation and AI", 
      href: "/settings/automation",
      icon2: <FeatherSparkle />, 
      available: false 
    },
    { 
      id: "addons", 
      label: "Add-on and integrations", 
      href: "/settings/addons",
      icon2: <FeatherPlus />, 
      available: false 
    },
    { 
      id: "marketplace", 
      label: "Marketplace",
      href: "/settings/marketplace",
      available: false 
    }
  ];

  const getSelectedTitle = () => {
    const item = menuItems.find(item => item.href === pathname);
    return item ? item.label : "Settings";
  };

  return (
    <>
      {/* Mobile menu toggle */}
      <div className="lg:hidden flex items-center justify-between w-full px-4 py-3 border-b border-neutral-border">
        <span className="text-heading-3 font-heading-3 text-default-font">
          {getSelectedTitle()}
        </span>
        <IconButton
          icon={mobileMenuOpen ? <FeatherX /> : <FeatherMenu />}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          variant="neutral-secondary"
        />
      </div>

      {/* Sidebar Menu - Desktop always visible, Mobile toggleable */}
      <div className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} 
        lg:block 
        w-full lg:w-64
        absolute lg:relative 
        top-[60px] lg:top-0 
        left-0 
        z-50 lg:z-auto
        bg-white lg:bg-white
        shadow-lg lg:shadow-none
        flex flex-col items-start  
        lg:self-stretch 
        border-b lg:border-b-0 lg:border-r 
        border-solid border-neutral-border 
        lg:pl-4 lg:pr-8 
        ${sidebarClasses} ${menuContainerClasses}
      `} style={{ minHeight: '500px', backgroundColor: '#f3f4f6' }}>
        <ChatChannelsMenu>
          {menuItems.map(item => {
            const isSelected = item.href === pathname;
            const isAvailable = item.available !== false;
            
            const menuItem = (
              <ChatChannelsMenu.Item
                key={item.id}
                icon={item.icon}
                icon2={item.icon2}
                selected={isSelected}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full lg:w-auto ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`${getTextSize()}`}>{item.label}</span>
              </ChatChannelsMenu.Item>
            );

            if (!isAvailable) {
              return (
                <div key={item.id} className="w-full lg:w-auto">
                  {menuItem}
                </div>
              );
            }

            return (
              <Link key={item.id} href={item.href} className="w-full lg:w-auto">
                {menuItem}
              </Link>
            );
          })}
        </ChatChannelsMenu>
      </div>
    </>
  );
};