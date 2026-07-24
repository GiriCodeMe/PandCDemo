import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Employer, PlanYear } from '../types';

interface EmployerState {
  currentEmployer: Employer | null;
  currentPlanYear: PlanYear | null;
  setEmployer: (employer: Employer) => void;
  setPlanYear: (planYear: PlanYear) => void;
  clear: () => void;
}

export const useEmployerStore = create<EmployerState>()(
  persist(
    (set) => ({
      currentEmployer: null,
      currentPlanYear: null,
      setEmployer: (employer) => set({ currentEmployer: employer }),
      setPlanYear: (planYear) => set({ currentPlanYear: planYear }),
      clear: () => set({ currentEmployer: null, currentPlanYear: null }),
    }),
    { name: 'employer-store', storage: createJSONStorage(() => sessionStorage) },
  ),
);
