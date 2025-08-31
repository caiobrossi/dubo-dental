import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Hook for managing calendar panel state with URL persistence
 */
export const useCalendarPanel = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL
  const [isOpen, setIsOpen] = useState(() => {
    return searchParams.get('panel') === 'calendar';
  });
  
  // Update URL when panel state changes
  const updateURL = useCallback((open: boolean) => {
    const params = new URLSearchParams(window.location.search);
    
    if (open) {
      params.set('panel', 'calendar');
    } else {
      params.delete('panel');
    }
    
    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newURL, { scroll: false });
  }, [router]);
  
  const togglePanel = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    updateURL(newIsOpen);
  }, [isOpen, updateURL]);
  
  const closePanel = useCallback(() => {
    setIsOpen(false);
    updateURL(false);
  }, [updateURL]);
  
  const openPanel = useCallback(() => {
    setIsOpen(true);
    updateURL(true);
  }, [updateURL]);
  
  // Sync with URL changes (for back/forward navigation)
  useEffect(() => {
    const urlHasPanel = searchParams.get('panel') === 'calendar';
    if (urlHasPanel !== isOpen) {
      setIsOpen(urlHasPanel);
    }
  }, [searchParams]); // Removed isOpen from dependencies to prevent loop
  
  return {
    isOpen,
    togglePanel,
    closePanel,
    openPanel
  };
};