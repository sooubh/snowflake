'use client';

import { NotificationsDropdown } from './NotificationsDropdown';

interface TopBarProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

export function TopBar({ onMenuClick, onSearchClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm dark:border-neutral-800 dark:bg-[#1f1e0b]/80">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-200"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search Button */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors group"
          title="Search stocks (Ctrl+K)"
        >
          <span className="material-symbols-outlined text-neutral-600 dark:text-neutral-400 group-hover:text-primary">search</span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400 hidden lg:inline">Search...</span>
          <kbd className="hidden lg:inline-flex px-2 py-0.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded">⌘K</kbd>
        </button>
        <NotificationsDropdown />
      </div>
    </header>
  );
}
