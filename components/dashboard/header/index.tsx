/**
 * Header Component - Main Orchestrator
 * Dashboard header with search, language selector, notifications, and user menu
 * Refactored into modular components for better maintainability
 */

'use client';

import { useState, useEffect } from 'react';
import { CommandPalette } from '../command-palette';
import { GlobalSearch } from '../global-search';
import { LanguageSelector } from './LanguageSelector';
import { NotificationsMenu } from './NotificationsMenu';
import { UserProfileMenu } from './UserProfileMenu';

export function Header() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Listen for ⌘K or Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-40">
        {/* Left: Global Search */}
        <GlobalSearch />

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-4">
          <LanguageSelector />
          <NotificationsMenu />
          <UserProfileMenu />
        </div>
      </header>
    </>
  );
}
