'use client';

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebarContent } from '@/components/dashboard/layout/sidebar';
// Context Definitions
interface SidebarContextType {
  isOpen: boolean;
  isPinned: boolean;
  toggle: () => void;
  setPinned: (pinned: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  isPinned: false,
  toggle: () => {},
  setPinned: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // State
  const [isOpen, setIsOpen] = useState(true);
  const [isPinned, setPinned] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- LOGIC UPDATE ---
  // Since this file is in app/dashboard/layout.tsx, we know we are in the dashboard.
  // We only need to check if we are on a specific page where we want to HIDE it.
  const isOnboardingPage = pathname === '/dashboard/onboarding-tour';
  const showSidebar = !isOnboardingPage;

  // Hydrate Sidebar State from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.isOpen === 'boolean') setIsOpen(parsed.isOpen);
      if (typeof parsed.isPinned === 'boolean') setPinned(parsed.isPinned);
    }
  }, []);

  // Persist Sidebar State
  useEffect(() => {
    localStorage.setItem('sidebar-state', JSON.stringify({ isOpen, isPinned }));
  }, [isOpen, isPinned]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sidebar Handlers
  const toggle = () => setIsOpen(!isOpen);
  const handleMouseEnter = () => {
    if (!isPinned) setIsOpen(true);
  };
  const handleMouseLeave = () => {
    if (!isPinned) setIsOpen(false);
  };
  const handleSetPinned = (pinned: boolean) => {
    setPinned(pinned);
    setIsOpen(true);
  };

  const contextValue = useMemo(
    () => ({
      isOpen,
      isPinned,
      toggle,
      setPinned: handleSetPinned,
    }),
    [isOpen, isPinned],
  );

  return (
    <AppSidebarContent isCollapsed={!isOpen}>{children}</AppSidebarContent>
  );
}
