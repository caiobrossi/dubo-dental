"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('dubo-sidebar-collapsed');
      console.log('🔄 Loading sidebar state from localStorage:', savedState);
      if (savedState !== null) {
        const parsed = JSON.parse(savedState);
        setIsCollapsed(parsed);
        console.log('✅ Sidebar state loaded:', parsed);
      }
    } catch (error) {
      console.warn('⚠️ Error loading sidebar state:', error);
    }
    setIsInitialized(true);
  }, []);

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
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setSidebarCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};