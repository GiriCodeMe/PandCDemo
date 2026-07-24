import { getStore } from '../db/FileStore';

export interface CobraElection {
  planCode: string;
  planName: string;
  coverageType: string;
  monthlyPremiumEmployee: number;
  adminFeeRate: number;
  monthlyCobraCost: number;
  electionStatus: string;
  electedDate: string | null;
  declinedDate?: string | null;
  coverageStartDate?: string | null;
  coverageEndDate?: string | null;
  paymentsReceived?: number;
  paymentsDue?: number;
  lastPaymentDate?: string | null;
}

export interface CobraEvent {
  cobraEventId: string;
  employeeId: string;
  employerName: string;
  firstName: string;
  lastName: string;
  email: string;
  qualifyingEventType: string;
  qualifyingEventDate: string;
  coverageLossDate: string;
  noticeGeneratedDate: string;
  noticeSentDate: string;
  electionDeadline: string;
  electionStatus: string;
  coverageTypes: string[];
  elections: CobraElection[];
}

export interface AuditEvent {
  auditId: string;
  timestamp: string;
  eventType: string;
  actor: string;
  entityType: string;
  entityId: string;
  employeeId: string | null;
  description: string;
  status: string;
  complianceNote: string;
}

function cobraEvents(): CobraEvent[] {
  return getStore().readArray<CobraEvent>('cobra/cobraEvents');
}

function auditEvents(): AuditEvent[] {
  return getStore().readArray<AuditEvent>('cobra/complianceAudit');
}

export const cobraService = {
  getAll(filters?: { electionStatus?: string }): CobraEvent[] {
    let events = cobraEvents();
    if (filters?.electionStatus) {
      events = events.filter((e) => e.electionStatus === filters.electionStatus);
    }
    return events;
  },

  getById(id: string): CobraEvent | null {
    return cobraEvents().find((e) => e.cobraEventId === id) ?? null;
  },

  getByEmployee(employeeId: string): CobraEvent[] {
    return cobraEvents().filter((e) => e.employeeId === employeeId);
  },

  getStats() {
    const events = cobraEvents();
    const byStatus: Record<string, number> = {};
    for (const e of events) {
      byStatus[e.electionStatus] = (byStatus[e.electionStatus] ?? 0) + 1;
    }
    const activeElections = events.filter((e) => e.electionStatus === 'Elected');
    const totalMonthlyCost = activeElections.reduce((sum, e) => {
      return sum + e.elections.reduce((s, el) => s + (el.electionStatus === 'Active' ? el.monthlyCobraCost : 0), 0);
    }, 0);
    return {
      total: events.length,
      byStatus,
      pending: byStatus['Pending'] ?? 0,
      elected: byStatus['Elected'] ?? 0,
      declined: byStatus['Declined'] ?? 0,
      lapsed: byStatus['Lapsed'] ?? 0,
      totalMonthlyCobraCost: Math.round(totalMonthlyCost * 100) / 100,
    };
  },

  getAuditLog(filters?: { eventType?: string; employeeId?: string }): AuditEvent[] {
    let events = auditEvents();
    if (filters?.eventType) {
      events = events.filter((e) => e.eventType === filters.eventType);
    }
    if (filters?.employeeId) {
      events = events.filter((e) => e.employeeId === filters.employeeId);
    }
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getComplianceAlerts() {
    const events = cobraEvents();
    const alerts: { severity: string; message: string; cobraEventId: string; employeeId: string }[] = [];
    const now = new Date();

    for (const e of events) {
      if (e.electionStatus === 'Pending') {
        const deadline = new Date(e.electionDeadline);
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 14 && daysLeft > 0) {
          alerts.push({
            severity: 'warning',
            message: `${e.firstName} ${e.lastName} COBRA election window closes in ${daysLeft} days`,
            cobraEventId: e.cobraEventId,
            employeeId: e.employeeId,
          });
        } else if (daysLeft <= 0) {
          alerts.push({
            severity: 'error',
            message: `${e.firstName} ${e.lastName} COBRA election window has expired`,
            cobraEventId: e.cobraEventId,
            employeeId: e.employeeId,
          });
        }
      }
      if (e.electionStatus === 'Lapsed') {
        alerts.push({
          severity: 'error',
          message: `${e.firstName} ${e.lastName} COBRA coverage lapsed due to non-payment`,
          cobraEventId: e.cobraEventId,
          employeeId: e.employeeId,
        });
      }
      for (const el of e.elections) {
        if ((el.paymentsDue ?? 0) > 0) {
          alerts.push({
            severity: 'warning',
            message: `${e.firstName} ${e.lastName} has ${el.paymentsDue} overdue COBRA payment(s) for ${el.coverageType}`,
            cobraEventId: e.cobraEventId,
            employeeId: e.employeeId,
          });
        }
      }
    }

    return alerts;
  },
};
