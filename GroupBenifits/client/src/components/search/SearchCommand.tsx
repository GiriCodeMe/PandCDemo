import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { searchApi } from '../../api/search';
import type { SearchResult } from '../../types';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';

function resultTypeBadgeVariant(type: SearchResult['type']): 'default' | 'info' | 'success' | 'warning' {
  switch (type) {
    case 'employer': return 'info';
    case 'employee': return 'success';
    case 'plan': return 'warning';
    default: return 'default';
  }
}

export default function SearchCommand() {
  const { searchOpen, closeSearch } = useUiStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
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

  const results = data?.results ?? [];

  function handleSelect(result: SearchResult) {
    navigate(result.href);
    closeSearch();
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) closeSearch();
  }

  if (!searchOpen) return null;

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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employers, employees, plans..."
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

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.length < 2 && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              Type at least 2 characters to search
            </div>
          )}

          {query.length >= 2 && !isFetching && results.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.length > 0 && (
            <ul className="py-2">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
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
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-3 text-xs text-gray-400">
          <span><kbd className="font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Esc</kbd> to close</span>
          <span><kbd className="font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">↵</kbd> to select</span>
        </div>
      </div>
    </div>
  );
}
