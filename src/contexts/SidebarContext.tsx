"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isLoading: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const { settings } = useSettings();
  
  // Default state based on menu layout preference
  const getDefaultCollapsedState = () => {
    return settings.menuLayout === 'compact'; // compact = collapsed, roomy = expanded
  };
  
  const [isCollapsed, setIsCollapsed] = useState(getDefaultCollapsedState());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load sidebar state from localStorage on mount, but respect settings preference as fallback
  useEffect(() => {
    const loadSidebarState = () => {
      try {
        const savedState = localStorage.getItem('dubo-sidebar-collapsed');
        console.log('🔄 Loading sidebar state from localStorage:', savedState);
        if (savedState !== null) {
          const parsed = JSON.parse(savedState);
          setIsCollapsed(parsed);
          console.log('✅ Sidebar state loaded:', parsed);
        } else {
          // No saved state, use settings preference
          const defaultState = getDefaultCollapsedState();
          setIsCollapsed(defaultState);
          console.log('🎛️ Using default state from settings:', defaultState, '(menuLayout:', settings.menuLayout, ')');
        }
      } catch (error) {
        console.warn('⚠️ Error loading sidebar state:', error);
        // Fallback to settings preference
        setIsCollapsed(getDefaultCollapsedState());
      }
      setIsInitialized(true);
      // Set loading to false after a short delay to allow smooth transition
      setTimeout(() => setIsLoading(false), 100);
    };
    
    loadSidebarState();
  }, [settings.menuLayout]);

  // Update sidebar state when menu layout preference changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const shouldBeCollapsed = getDefaultCollapsedState();
    console.log('🎛️ Menu layout changed to:', settings.menuLayout, '- Setting sidebar to:', shouldBeCollapsed ? 'collapsed' : 'expanded');
    setIsCollapsed(shouldBeCollapsed);
  }, [settings.menuLayout, isInitialized]);

  // Save sidebar state to localStorage when it changes (but not on initial load)
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      localStorage.setItem('dubo-sidebar-collapsed', JSON.stringify(isCollapsed));
      console.log('💾 Sidebar state saved to localStorage:', isCollapsed);
    } catch (error) {
      console.warn('⚠️ Error saving sidebar state:', error);
    }
  }, [isCollapsed, isInitialized]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      console.log('🔄 Toggling sidebar from', prev, 'to', newState);
      return newState;
    });
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    console.log('🔧 Setting sidebar collapsed to:', collapsed);
    setIsCollapsed(collapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setSidebarCollapsed, isLoading }}>
      {children}
    </SidebarContext.Provider>
  );
};