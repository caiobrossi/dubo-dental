import { useSettings } from '@/contexts/SettingsContext';

/**
 * Hook to provide menu layout classes based on user preference
 */
export const useMenuLayout = () => {
  const { settings } = useSettings();
  
  const isCompact = settings.menuLayout === 'compact';
  const isRoomy = settings.menuLayout === 'roomy';
  
  // Classes for menu items/buttons
  const menuItemClasses = isCompact 
    ? 'py-1 px-2 text-sm min-h-8' // Compact spacing
    : 'py-2 px-3 text-base min-h-10'; // Roomy spacing (default)
  
  // Classes for menu containers
  const menuContainerClasses = isCompact
    ? 'gap-1 py-2' // Compact container spacing
    : 'gap-2 py-4'; // Roomy container spacing
  
  // Classes for sidebar
  const sidebarClasses = isCompact
    ? 'px-2 py-2' // Compact sidebar padding
    : 'px-4 py-4'; // Roomy sidebar padding
  
  // Classes for navigation items
  const navItemClasses = isCompact
    ? 'h-8 text-sm' // Compact nav height
    : 'h-10 text-base'; // Roomy nav height
  
  // Icon sizes
  const iconSize = isCompact ? 'w-4 h-4' : 'w-5 h-5';
  
  return {
    isCompact,
    isRoomy,
    menuItemClasses,
    menuContainerClasses,
    sidebarClasses,
    navItemClasses,
    iconSize,
    // Helper functions
    getMenuItemPadding: () => isCompact ? 'py-1 px-2' : 'py-2 px-3',
    getTextSize: () => isCompact ? 'text-sm' : 'text-base',
    getSpacing: () => isCompact ? 'gap-1' : 'gap-2',
    getVerticalPadding: () => isCompact ? 'py-2' : 'py-4',
    getHorizontalPadding: () => isCompact ? 'px-2' : 'px-4',
  };
};