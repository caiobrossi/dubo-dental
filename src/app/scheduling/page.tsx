import { Suspense } from "react";
import SchedulingPage from "./components/SchedulingPage";

// This file now simply exports the refactored component wrapped in Suspense
// All the logic has been moved to ./components/SchedulingPage.tsx
// following modern React patterns and best practices

/**
 * Main scheduling page route component
 * 
 * This file has been completely refactored to follow modern React best practices:
 * - Separated into focused, reusable components
 * - Custom hooks for data fetching and state management
 * - Proper TypeScript typing throughout
 * - Performance optimizations with React.memo and useMemo
 * - Clean separation of concerns
 * 
 * The original monolithic component has been broken down into:
 * - SchedulingPage: Main container component
 * - SchedulingHeader: Header with search and actions
 * - ViewModeSelector: View mode toggle (day/5days/week)
 * - DateNavigator: Date navigation and calendar
 * - SchedulingGrid: Main calendar grid
 * - TimeSlot: Individual time slot component
 * 
 * Plus supporting files:
 * - types.ts: TypeScript interfaces and types
 * - hooks/useSchedulingData: Data fetching hook
 * - hooks/useSchedulingModal: Modal state management hook
 * - utils/dateUtils: Date manipulation utilities
 * - utils/timeUtils: Time formatting and slot logic utilities
 */

function SchedulingPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <SchedulingPage />
    </Suspense>
  );
}

export default SchedulingPageWrapper;