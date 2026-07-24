import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, User } from 'lucide-react';
import { authApi } from '../../api/auth';
import { usePersonaStore } from '../../stores/personaStore';
import type { Persona } from '../../types';

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0]! + parts[parts.length - 1][0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function roleColor(role: string): string {
  if (role.includes('Benefits')) return 'bg-violet-100 text-violet-700';
  if (role.includes('HR')) return 'bg-blue-100 text-blue-700';
  if (role.includes('Employer') || role.includes('Group')) return 'bg-emerald-100 text-emerald-700';
  if (role.includes('Broker') || role.includes('Partner')) return 'bg-amber-100 text-amber-700';
  if (role.includes('Employee') || role.includes('Member')) return 'bg-rose-100 text-rose-700';
  return 'bg-gray-100 text-gray-700';
}

export default function PersonaSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { currentPersona, setPersona } = usePersonaStore();

  const { data: personas = [] } = useQuery({
    queryKey: ['personas'],
    queryFn: authApi.getPersonas,
    staleTime: 5 * 60 * 1000,
  });

  // Auto-load P-001 on first render
  useEffect(() => {
    if (!currentPersona && personas.length > 0) {
      const defaultPersona = personas.find((p) => p.personaId === 'P-001') ?? personas[0];
      authApi.login(defaultPersona.personaId).then((result) => {
        setPersona(result.persona, result.token);
      }).catch(console.error);
    }
  }, [personas, currentPersona, setPersona]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function handleSelect(persona: Persona) {
    try {
      const result = await authApi.login(persona.personaId);
      setPersona(result.persona, result.token);
      setOpen(false);
    } catch (err) {
      console.error('Login failed', err);
    }
  }

  const displayName = currentPersona?.name ?? 'Loading...';
  const displayRole = currentPersona?.role ?? '';
  const colorClass = displayRole ? roleColor(displayRole) : 'bg-gray-100 text-gray-500';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        data-testid="persona-switcher"
      >
        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${colorClass}`}>
          {currentPersona ? getInitials(displayName) : <User className="w-3 h-3" />}
        </span>
        <span className="font-medium leading-tight">{displayName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Switch Persona</p>
          </div>
          <ul role="listbox" className="py-1 max-h-80 overflow-y-auto">
            {personas.map((persona) => {
              const pColor = roleColor(persona.role);
              const isSelected = currentPersona?.personaId === persona.personaId;
              return (
                <li key={persona.personaId}>
                  <button
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(persona)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 ${pColor}`}>
                      {getInitials(persona.name)}
                    </span>
                    <span className="flex flex-col leading-tight min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 truncate">{persona.name}</span>
                      <span className="text-xs text-gray-500 truncate">{persona.role}</span>
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
