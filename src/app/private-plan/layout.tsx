"use client";

import { ToastProvider } from "@/contexts/ToastContext";

export default function PrivatePlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-default-background overflow-hidden">
      <ToastProvider>
        {children}
      </ToastProvider>
    </div>
  );
}