import React from "react";
import GroupPageClient from "./GroupPageClient";

// Generate static params for all possible groups
export async function generateStaticParams() {
  // Define all possible group names that should be statically generated
  const groups = [
    'aesthetics-patients',
    'patients-over-65',
    'kids',
    'dental-patients'
  ];

  return groups.map((groupName) => ({
    groupName: groupName,
  }));
}

// Server component that receives params and passes to client component
export default function GroupPage({ params }: { params: { groupName: string } }) {
  return <GroupPageClient groupName={params.groupName} />;
}