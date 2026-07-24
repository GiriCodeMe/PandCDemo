import { getStore } from '../db/FileStore';
import { Persona } from '../db/schema';

export const authService = {
  getAllPersonas(): Persona[] {
    return getStore().readArray<Persona>('auth/personas');
  },
  getPersonaById(personaId: string): Persona | undefined {
    return getStore().findOne<Persona & Record<string,unknown>>('auth/personas', 'personaId', personaId) as Persona | undefined;
  },
  login(personaId: string): { token: string; persona: Persona } | null {
    const persona = this.getPersonaById(personaId);
    if (!persona) return null;
    return { token: personaId, persona };
  },
};
