import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { employersApi } from '../../api/employers';
import { useEmployerStore } from '../../stores/employerStore';
import type { Employer, PlanYear } from '../../types';
import Badge from '../ui/Badge';

function planYearStatusVariant(status: PlanYear['status']): 'default' | 'success' | 'warning' | 'info' {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'OPEN_ENROLLMENT': return 'warning';
    case 'DRAFT':
    case 'CONFIGURATION': return 'info';
    default: return 'default';
  }
}

export default function ContextSwitcher() {
  const [employerOpen, setEmployerOpen] = useState(false);
  const [planYearOpen, setPlanYearOpen] = useState(false);
  const employerRef = useRef<HTMLDivElement>(null);
  const planYearRef = useRef<HTMLDivElement>(null);

  const { currentEmployer, currentPlanYear, setEmployer, setPlanYear } = useEmployerStore();

  const { data: employers = [] } = useQuery({
    queryKey: ['employers'],
    queryFn: employersApi.list,
    staleTime: 5 * 60 * 1000,
  });

  const { data: planYears = [] } = useQuery({
    queryKey: ['plan-years', currentEmployer?.employerId],
    queryFn: () => employersApi.planYears(currentEmployer!.employerId),
    enabled: !!currentEmployer,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!currentEmployer && employers.length > 0) {
      const acme = employers.find((e) => e.employerId === 'ACM-001') ?? employers[0];
      setEmployer(acme);
    }
  }, [employers, currentEmployer, setEmployer]);

  useEffect(() => {
    if (!currentPlanYear && planYears.length > 0) {
      const openEnrollment =
        planYears.find((py) => py.status === 'OPEN_ENROLLMENT') ??
        planYears.find((py) => py.status === 'ACTIVE') ??
        planYears[0];
      if (openEnrollment) setPlanYear(openEnrollment);
    }
  }, [planYears, currentPlanYear, setPlanYear]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (employerRef.current && !employerRef.current.contains(e.target as Node)) {
        setEmployerOpen(false);
      }
      if (planYearRef.current && !planYearRef.current.contains(e.target as Node)) {
        setPlanYearOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelectEmployer(employer: Employer) {
    setEmployer(employer);
    setPlanYear(null as unknown as PlanYear);
    setEmployerOpen(false);
  }

  function handleSelectPlanYear(planYear: PlanYear) {
    setPlanYear(planYear);
    setPlanYearOpen(false);
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {/* Employer picker */}
      <div className="relative" ref={employerRef}>
        <button
          onClick={() => { setEmployerOpen((o) => !o); setPlanYearOpen(false); }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
          data-testid="employer-switcher"
        >
          <span className="font-medium">{currentEmployer?.name ?? 'Loading...'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {employerOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <ul className="py-1">
              {employers.map((emp) => (
                <li key={emp.employerId}>
                  <button
                    onClick={() => handleSelectEmployer(emp)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-700 flex-1 truncate">{emp.name}</span>
                    {currentEmployer?.employerId === emp.employerId && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <span className="text-gray-300 select-none px-1">|</span>

      {/* Plan year picker */}
      <div className="relative" ref={planYearRef}>
        <button
          onClick={() => { setPlanYearOpen((o) => !o); setEmployerOpen(false); }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
          data-testid="plan-year-switcher"
        >
          <span className="font-medium">
            {currentPlanYear ? `${currentPlanYear.year} Plan Year` : 'Select Year'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {planYearOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <ul className="py-1">
              {planYears.map((py) => (
                <li key={py.planYearId}>
                  <button
                    onClick={() => handleSelectPlanYear(py)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-700 flex-1">{py.year}</span>
                    <Badge variant={planYearStatusVariant(py.status)}>
                      {py.status.replace(/_/g, ' ')}
                    </Badge>
                    {currentPlanYear?.planYearId === py.planYearId && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
