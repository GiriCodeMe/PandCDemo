import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import GlobalNav from './GlobalNav';
import Sidebar from './Sidebar';
import SearchCommand from '../search/SearchCommand';
import BenChat from '../help/BenChat';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { sidebarOpen, openSearch } = useUiStore();
  const [benchatOpen, setBenchatOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <GlobalNav />
      <div className="flex flex-row flex-1 overflow-hidden">
        <Sidebar />
        <main className={`flex-1 overflow-auto bg-gray-50 p-6 transition-all duration-200 ${sidebarOpen ? '' : ''}`}>
          {children}
        </main>
      </div>
      <SearchCommand />

      {/* BenChat floating trigger */}
      <button
        onClick={() => setBenchatOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Open BenChat assistant"
        title="Ask BenChat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <BenChat open={benchatOpen} onClose={() => setBenchatOpen(false)} />
    </div>
  );
}
