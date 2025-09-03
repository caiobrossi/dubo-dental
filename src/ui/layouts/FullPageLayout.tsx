"use client";

import { ToastProvider } from "@/contexts/ToastContext";

interface FullPageLayoutProps {
  children: React.ReactNode;
}

export function FullPageLayout({ children }: FullPageLayoutProps) {
  return (
    <div className="h-screen w-screen bg-default-background overflow-hidden">
      <ToastProvider>
        {children}
      </ToastProvider>
    </div>
  );
}