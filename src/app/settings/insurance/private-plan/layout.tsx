"use client";

import { FullPageLayout } from "../../../../ui/layouts/FullPageLayout";

export default function PrivatePlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use the reusable FullPageLayout template
  return (
    <FullPageLayout>
      {children}
    </FullPageLayout>
  );
}