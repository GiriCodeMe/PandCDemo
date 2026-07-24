import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import ContextSwitcher from './ContextSwitcher';
import PersonaSwitcher from './PersonaSwitcher';

export default function GlobalNav() {
  const { toggleSidebar, openSearch } = useUiStore();

  return (
    <header className="h-14 px-4 flex items-center gap-4 bg-white border-b border-gray-200 flex-shrink-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-base font-semibold text-brand-600 whitespace-nowrap select-none">
          Group Benefits
        </span>
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center">
        <ContextSwitcher />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={openSearch}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Open search (Ctrl+K)"
          title="Search (Ctrl+K)"
        >
          <Search className="w-5 h-5" />
        </button>
        <PersonaSwitcher />
      </div>
    </header>
  );
}
