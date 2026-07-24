import React, { useEffect } from 'react';
import { usePersonaStore } from '../../stores/personaStore';
import type { Persona } from '../../types';
import EmployeeEnrollmentView from './views/EmployeeEnrollmentView';
import HRAdminEnrollmentView from './views/HRAdminEnrollmentView';
import BenefitsAdminEnrollmentView from './views/BenefitsAdminEnrollmentView';
import PayrollEnrollmentView from './views/PayrollEnrollmentView';
import CarrierEnrollmentView from './views/CarrierEnrollmentView';
import ExecutiveEnrollmentView from './views/ExecutiveEnrollmentView';
import ComplianceEnrollmentView from './views/ComplianceEnrollmentView';

function PersonaEnrollmentView({ persona }: { persona: Persona }) {
  const { role } = persona;
  if (role === 'Employee') return <EmployeeEnrollmentView persona={persona} />;
  if (role === 'HR Administrator') return <HRAdminEnrollmentView />;
  if (role === 'Payroll Administrator') return <PayrollEnrollmentView />;
  if (role === 'Carrier Administrator') return <CarrierEnrollmentView />;
  if (role === 'Employer/Group Admin') return <ExecutiveEnrollmentView />;
  if (role === 'Benefits Analyst') return <ComplianceEnrollmentView />;
  return <BenefitsAdminEnrollmentView />;
}

const ROLE_SUBTITLE: Record<string, string> = {
  'Employee': 'Your benefits, enrollment wizard, and plan comparison.',
  'HR Administrator': 'Enrollment work queue — pending, exceptions, life events.',
  'Benefits Administrator': 'Plan year configuration, OE window, and enrollment progress.',
  'Payroll Administrator': 'Deduction changes, reconciliation issues, and payroll file status.',
  'Carrier Administrator': 'Carrier transaction status, failed records, and retry queue.',
  'Employer/Group Admin': 'Enrollment KPIs, completion rate, and key issues.',
  'Benefits Analyst': 'Eligibility audit trail, evidence, and compliance decisions.',
  'Business Analyst / Product Manager': 'Plan year configuration, OE window, and enrollment progress.',
};

export default function EnrollmentHub() {
  const { currentPersona } = usePersonaStore();

  useEffect(() => {
    if (currentPersona) {
      sessionStorage.setItem('benchat_context_key', `/enrollment:${currentPersona.role}`);
    }
    return () => {
      sessionStorage.removeItem('benchat_context_key');
    };
  }, [currentPersona?.role]);

  if (!currentPersona) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Enrollment</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {ROLE_SUBTITLE[currentPersona.role] ?? 'Enrollment management.'}
        </p>
      </div>

      <div data-testid="enrollment-view-container">
        <PersonaEnrollmentView persona={currentPersona} />
      </div>
    </div>
  );
}
