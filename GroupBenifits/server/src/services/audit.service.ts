import { v4 as uuidv4 } from 'uuid';
import { AuditEvent } from '../db/schema';

const events: AuditEvent[] = [];

export const auditService = {
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const e: AuditEvent = { ...event, id: uuidv4(), timestamp: new Date().toISOString() };
    events.push(e);
    return e;
  },
  getAll(): AuditEvent[] {
    return [...events];
  },
  getByEmployer(employerId: string): AuditEvent[] {
    return events.filter(e => e.employerId === employerId);
  },
  clear(): void {
    events.length = 0;
  },
};
