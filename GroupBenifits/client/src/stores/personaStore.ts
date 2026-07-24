import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Persona } from '../types';

interface PersonaState {
  currentPersona: Persona | null;
  token: string | null;
  setPersona: (persona: Persona, token: string) => void;
  clearPersona: () => void;
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set) => ({
      currentPersona: null,
      token: null,
      setPersona: (persona, token) => {
        sessionStorage.setItem('persona_token', token);
        set({ currentPersona: persona, token });
      },
      clearPersona: () => {
        sessionStorage.removeItem('persona_token');
        set({ currentPersona: null, token: null });
      },
    }),
    { name: 'persona-store', storage: createJSONStorage(() => sessionStorage) },
  ),
);
