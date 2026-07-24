import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, ArrowRight, LayoutDashboard, Users, Building2, FileText, ClipboardCheck, BookOpen, BarChart3, Monitor, ShieldCheck, Briefcase } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { searchApi } from '../../api/search';
import type { SearchResult } from '../../types';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';

const QUICK_ACTIONS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, keys: ['dash', 'home'] },
  { label: 'Employers', href: '/employers', icon: Building2, keys: ['emp', 'employer'] },
  { label: 'Employees', href: '/employees', icon: Users, keys: ['people', 'staff'] },
  { label: 'Plans', href: '/plans', icon: FileText, keys: ['plan', 'benefit'] },
  { label: 'Enrollment', href: '/enrollment', icon: ClipboardCheck, keys: ['enroll'] },
  { label: 'Requirements', href: '/requirements', icon: BookOpen, keys: ['req', 'doc', 'ai'] },
  { label: 'Reports', href: '/reports', icon: BarChart3, keys: ['report'] },
  { label: 'Audit Trail', href: '/audit', icon: ShieldCheck, keys: ['audit', 'log'] },
  { label: 'Small Business', href: '/small-business', icon: Briefcase, keys: ['small', 'smb', 'group', 'wizard'] },
  { label: 'Demo Center', href: '/demo', icon: Monitor, keys: ['demo'] },
];

function resultTypeBadgeVariant(type: SearchResult['type']): 'default' | 'info' | 'success' | 'warning' {
  switch (type) {
    case 'employer': return 'info';
    case 'employee': return 'success';
    case 'plan': return 'warning';
    default: return 'default';
  }
}

interface ListItem {
  id: string;
  kind: 'quick' | 'result';
  href: string;
  label: string;
  sub?: string;
  type?: string;
  Icon?: React.ComponentType<{ className?: string }>;
}

export default function SearchCommand() {
  const { searchOpen, closeSearch } = useUiStore();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIdx(0);
    } else {
      setQuery('');
      setActiveIdx(0);
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && searchOpen) closeSearch();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, closeSearch]);

  const { data, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: searchOpen && query.length >= 2,
    staleTime: 15_000,
  });

  const apiResults = data?.results ?? [];

  // Build unified item list
  const q = query.toLowerCase().trim();
  const quickMatches = query.length === 0
    ? QUICK_ACTIONS.slice(0, 6)
    : QUICK_ACTIONS.filter((a) => a.keys.some((k) => k.startsWith(q)) || a.label.toLowerCase().includes(q));

  const items: ListItem[] = [
    ...quickMatches.map((a) => ({ id: `quick-${a.href}`, kind: 'quick' as const, href: a.href, label: a.label, Icon: a.icon })),
    ...apiResults.map((r) => ({ id: `result-${r.id}`, kind: 'result' as const, href: r.href, label: r.name, sub: r.subtitle, type: r.type })),
  ];

  const handleSelect = useCallback((item: ListItem) => {
    navigate(item.href);
    closeSearch();
  }, [navigate, closeSearch]);

  function handleKeyboardNav(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const item = items[activeIdx];
      if (item) handleSelect(item);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) closeSearch();
  }

  if (!searchOpen) return null;

  const showQuickSection = quickMatches.length > 0 && apiResults.length === 0;
  const showApiSection = apiResults.length > 0;
  const showEmpty = query.length >= 2 && !isFetching && apiResults.length === 0 && quickMatches.length === 0;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={handleKeyboardNav}
            placeholder="Search or jump to... (type / for quick actions)"
            className="w-full bg-transparent text-gray-900 placeholder-gray-400 p-4 text-base focus:outline-none"
            aria-label="Search"
          />
          {isFetching && <Spinner size="sm" className="mr-3 flex-shrink-0" />}
          <button
            onClick={closeSearch}
            className="p-2 mr-2 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto">
          {showEmpty && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          <ul ref={listRef} className="py-1">
            {/* Quick navigation section */}
            {showQuickSection && (
              <>
                <li className="px-4 pt-2 pb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    {query.length === 0 ? 'Quick Navigation' : 'Matching Pages'}
                  </span>
                </li>
                {quickMatches.map((a, relIdx) => {
                  const globalIdx = relIdx;
                  const Icon = a.icon;
                  return (
                    <li key={a.href} data-idx={globalIdx}>
                      <button
                        onClick={() => handleSelect({ id: `quick-${a.href}`, kind: 'quick', href: a.href, label: a.label })}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === globalIdx ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${activeIdx === globalIdx ? 'bg-brand-100' : 'bg-gray-100'}`}>
                          <Icon className={`w-3.5 h-3.5 ${activeIdx === globalIdx ? 'text-brand-600' : 'text-gray-500'}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{a.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                      </button>
                    </li>
                  );
                })}
              </>
            )}

            {/* API results section */}
            {showApiSection && (
              <>
                {query.length >= 2 && quickMatches.length > 0 && (
                  <li className="px-4 pt-3 pb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pages</span>
                  </li>
                )}
                {quickMatches.map((a, relIdx) => {
                  const globalIdx = relIdx;
                  const Icon = a.icon;
                  return (
                    <li key={`qa-${a.href}`} data-idx={globalIdx}>
                      <button
                        onClick={() => handleSelect({ id: `quick-${a.href}`, kind: 'quick', href: a.href, label: a.label })}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${activeIdx === globalIdx ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                      >
                        <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{a.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                      </button>
                    </li>
                  );
                })}

                <li className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Records</span>
                </li>
                {apiResults.map((result, relIdx) => {
                  const globalIdx = quickMatches.length + relIdx;
                  return (
                    <li key={result.id} data-idx={globalIdx}>
                      <button
                        onClick={() => handleSelect({ id: `result-${result.id}`, kind: 'result', href: result.href, label: result.name })}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeIdx === globalIdx ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                      >
                        <Badge variant={resultTypeBadgeVariant(result.type)} className="flex-shrink-0 capitalize">
                          {result.type}
                        </Badge>
                        <span className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-gray-900 truncate">{result.name}</span>
                          {result.subtitle && (
                            <span className="text-xs text-gray-500 truncate">{result.subtitle}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-3 text-xs text-gray-400">
          <span><kbd className="font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">↵</kbd> select</span>
          <span><kbd className="font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Esc</kbd> close</span>
          <span className="ml-auto"><kbd className="font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Ctrl K</kbd> open</span>
        </div>
      </div>
    </div>
  );
}
