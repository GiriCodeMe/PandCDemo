import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock, AlertCircle, FileText, Users, CheckCircle2, XCircle, Eye,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { enrollmentApi } from '../../../api/enrollment';
import type { Enrollment, Employee } from '../../../types';

function authHeaders() {
  const token = sessionStorage.getItem('persona_token') ?? 'P-001';
  return { Authorization: `Bearer ${token}` };
}

async function fetchEmployees(): Promise<Employee[]> {
  const resp = await fetch('/api/employees', { headers: authHeaders() });
  const json = await resp.json();
  return (Array.isArray(json.data) ? json.data : []) as Employee[];
}

interface LifeEvent {
  eventId: string;
  employeeId: string;
  eventType: string;
  status: string;
  eventDate: string;
  documentsRequired: string[];
}

async function fetchLifeEvents(): Promise<LifeEvent[]> {
  const resp = await fetch('/api/life-events', { headers: authHeaders() });
  const json = await resp.json();
  return (json.data?.events ?? []) as LifeEvent[];
}

const EXCEPTION_NOTES: Record<string, string> = {
  'ACM-E012': 'Carrier rejection blocking enrollment',
};

interface RowActionsProps {
  employeeId: string;
}

function RowActions({ employeeId }: RowActionsProps) {
  const [state, setState] = useState<'idle' | 'reviewed' | 'overridden' | 'rejected'>('idle');
  if (state !== 'idle') {
    const labels: Record<string, string> = { reviewed: 'Reviewed', overridden: 'Overridden', rejected: 'Rejected' };
    const colors: Record<string, string> = { reviewed: 'text-blue-700 bg-blue-50', overridden: 'text-amber-700 bg-amber-50', rejected: 'text-red-700 bg-red-50' };
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors[state]}`}>
        {labels[state]}
      </span>
    );
  }
  return (
    <div className="flex gap-1.5">
      <button onClick={() => setState('reviewed')} className="text-xs px-2.5 py-1 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">Review</button>
      <button onClick={() => setState('overridden')} className="text-xs px-2.5 py-1 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors">Override</button>
      <button onClick={() => setState('rejected')} className="text-xs px-2.5 py-1 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors">Reject</button>
    </div>
  );
}

export default function HRAdminEnrollmentView() {
  const { data: allEnrollments } = useQuery({
    queryKey: ['enrollment', 'all'],
    queryFn: () => enrollmentApi.getAll('ACM-001'),
    staleTime: 30_000,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: fetchEmployees,
    staleTime: 30_000,
  });

  const { data: lifeEvents = [] } = useQuery({
    queryKey: ['life-events', 'all'],
    queryFn: fetchLifeEvents,
    staleTime: 30_000,
  });

  const pendingEnrollments = (allEnrollments?.enrollments ?? []).filter(
    (e: Enrollment) => e.status !== 'Active'
  );

  const exceptions = employees.filter(
    (e: Employee) => e.eligibilityStatus !== 'Eligible'
  );

  const pendingLifeEvents = lifeEvents.filter(
    (e: LifeEvent) => e.status === 'Pending Documentation' || e.status === 'Submitted'
  );

  const missingDocs = pendingLifeEvents.filter(
    (e: LifeEvent) => e.documentsRequired?.length > 0
  );

  const stats = [
    { label: 'Pending Enrollments', value: pendingEnrollments.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Eligibility Exceptions', value: exceptions.length, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Life Events', value: pendingLifeEvents.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Missing Docs', value: missingDocs.length, icon: Users, color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  return (
    <div data-testid="enrollment-hr-view" className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-4">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Pending enrollments */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-800">Pending Enrollments</h3>
          <span
            data-testid="hr-pending-count"
            className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"
          >
            {pendingEnrollments.length}
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {pendingEnrollments.slice(0, 6).map((enr: Enrollment) => (
            <div key={enr.enrollmentId} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{enr.employeeId}</p>
                <p className="text-xs text-gray-400">Plan Year {enr.planYear}</p>
              </div>
              <Badge variant={enr.status === 'Processing' ? 'warning' : 'default'}>{enr.status}</Badge>
              <button className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">
                <Eye className="w-3.5 h-3.5" /> Review
              </button>
            </div>
          ))}
          {pendingEnrollments.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              No pending enrollments
            </div>
          )}
        </div>
      </Card>

      {/* Eligibility exceptions */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-gray-800">Eligibility Exceptions</h3>
        </div>
        <div data-testid="hr-exceptions-list" className="divide-y divide-gray-50">
          {exceptions.slice(0, 8).map((emp: Employee) => {
            const note = EXCEPTION_NOTES[emp.employeeId];
            return (
              <div
                key={emp.employeeId}
                data-testid={`hr-exception-row-${emp.employeeId}`}
                className={`px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors ${emp.employeeId === 'ACM-E012' ? 'bg-amber-50/60' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {emp.firstName} {emp.lastName}
                    {emp.employeeId === 'ACM-E012' && (
                      <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Demo</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{emp.employeeId} · {emp.employmentType ?? emp.jobClass ?? 'Standard'}</p>
                  {note && <p className="text-xs text-red-600 mt-0.5 font-medium">{note}</p>}
                </div>
                <Badge variant="error">{emp.eligibilityStatus}</Badge>
                <RowActions employeeId={emp.employeeId} />
              </div>
            );
          })}
          {exceptions.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              No eligibility exceptions
            </div>
          )}
        </div>
      </Card>

      {/* Life events */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-800">Pending Life Events</h3>
        </div>
        <div data-testid="hr-life-events-list" className="divide-y divide-gray-50">
          {pendingLifeEvents.slice(0, 6).map((ev: LifeEvent) => (
            <div key={ev.eventId} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{ev.employeeId}</p>
                <p className="text-xs text-gray-400">{ev.eventType} · {ev.eventDate}</p>
                {ev.documentsRequired?.length > 0 && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    Docs needed: {ev.documentsRequired.join(', ')}
                  </p>
                )}
              </div>
              <Badge variant={ev.status === 'Submitted' ? 'info' : 'warning'}>{ev.status}</Badge>
              <button className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">
                <Eye className="w-3.5 h-3.5" /> Review
              </button>
            </div>
          ))}
          {pendingLifeEvents.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              No pending life events
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
