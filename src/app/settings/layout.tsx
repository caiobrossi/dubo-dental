"use client";

import React from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { SettingsSidebar } from "./components/SettingsSidebar";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <DefaultPageLayout>
      <div className="flex flex-col lg:flex-row w-full grow shrink-0 basis-0 items-start gap-0 lg:gap-6 rounded-lg bg-default-background lg:px-4 lg:py-4 overflow-auto">
        
        {/* Sidebar */}
        <SettingsSidebar />
        
        {/* Main Content */}
        {children}
        
      </div>
    </DefaultPageLayout>
  );
}