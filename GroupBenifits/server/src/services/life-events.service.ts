import { getStore } from '../db/FileStore';

export interface LifeEvent {
  lifeEventId: string;
  employeeId: string;
  eventType: string;
  eventDate: string;
  enrollmentWindowStart: string;
  enrollmentWindowEnd: string;
  status: string;
  documentsRequired: string[];
  documentsSubmitted: string[];
  submittedAt: string;
  processedAt: string | null;
  _notes?: string;
}

export interface DependentRule {
  ruleId: string;
  ruleType: string;
  description: string;
  ageLimit: number | null;
  ageLimitType: string | null;
  documentationRequired: string[];
  status: string;
}

const VALID_EVENT_TYPES = [
  'Marriage', 'Divorce', 'Birth', 'Adoption', 'Loss of Other Coverage',
  'Gain of Other Coverage', 'Death of Dependent', 'Domestic Partnership',
  'Child Age-Out', 'Other',
];

const DOC_MAP: Record<string, string[]> = {
  Marriage: ['Marriage Certificate'],
  Divorce: ['Divorce Decree'],
  Birth: ['Birth Certificate'],
  Adoption: ['Adoption Decree'],
  'Loss of Other Coverage': ['Carrier Termination Letter'],
  'Gain of Other Coverage': ['Proof of Other Coverage'],
  'Death of Dependent': ['Death Certificate'],
  'Domestic Partnership': ['Domestic Partnership Affidavit', 'Proof of joint residency'],
  'Child Age-Out': [],
  Other: ['Supporting Documentation'],
};

// In-memory store for newly submitted life events
const newEvents = new Map<string, LifeEvent>();
let nextId = 6;

function getSeedEvents(): LifeEvent[] {
  return getStore().readArray<LifeEvent>('enrollment/lifeEvents');
}

function allEvents(): LifeEvent[] {
  return [...getSeedEvents(), ...Array.from(newEvents.values())];
}

export const lifeEventsService = {
  getAll(filters?: { status?: string; employeeId?: string; eventType?: string }): LifeEvent[] {
    let events = allEvents();
    if (filters?.status) events = events.filter((e) => e.status === filters.status);
    if (filters?.employeeId) events = events.filter((e) => e.employeeId === filters.employeeId);
    if (filters?.eventType) events = events.filter((e) => e.eventType === filters.eventType);
    return events.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  getById(id: string): LifeEvent | null {
    return allEvents().find((e) => e.lifeEventId === id) ?? null;
  },

  getByEmployee(employeeId: string): LifeEvent[] {
    return allEvents()
      .filter((e) => e.employeeId === employeeId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  submit(employeeId: string, eventType: string, eventDate: string): LifeEvent {
    const windowStart = eventDate;
    const windowEnd = new Date(new Date(eventDate).getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const id = `LE-${String(nextId++).padStart(3, '0')}`;
    const event: LifeEvent = {
      lifeEventId: id,
      employeeId,
      eventType,
      eventDate,
      enrollmentWindowStart: windowStart,
      enrollmentWindowEnd: windowEnd,
      status: 'Pending Documentation',
      documentsRequired: DOC_MAP[eventType] ?? ['Supporting Documentation'],
      documentsSubmitted: [],
      submittedAt: new Date().toISOString(),
      processedAt: null,
    };
    newEvents.set(id, event);
    return event;
  },

  updateStatus(id: string, status: string): LifeEvent | null {
    const seedEvents = getSeedEvents();
    const inSeed = seedEvents.find((e) => e.lifeEventId === id);
    if (inSeed) {
      // Clone into new events map so status change is persisted in-memory
      const updated: LifeEvent = {
        ...inSeed,
        status,
        processedAt: ['Approved', 'Completed', 'Rejected'].includes(status)
          ? new Date().toISOString()
          : inSeed.processedAt,
      };
      newEvents.set(id, updated);
      return updated;
    }
    const inNew = newEvents.get(id);
    if (!inNew) return null;
    const updated: LifeEvent = {
      ...inNew,
      status,
      processedAt: ['Approved', 'Completed', 'Rejected'].includes(status)
        ? new Date().toISOString()
        : inNew.processedAt,
    };
    newEvents.set(id, updated);
    return updated;
  },

  submitDocument(id: string, documentName: string): LifeEvent | null {
    const existing = this.getById(id);
    if (!existing) return null;
    const docsSubmitted = Array.from(new Set([...existing.documentsSubmitted, documentName]));
    const allDocsIn = existing.documentsRequired.every((d) => docsSubmitted.includes(d));
    const updated: LifeEvent = {
      ...existing,
      documentsSubmitted: docsSubmitted,
      status: allDocsIn ? 'Submitted' : existing.status,
    };
    newEvents.set(id, updated);
    return updated;
  },

  getDependentRules(): DependentRule[] {
    return getStore().readArray<DependentRule>('eligibility/dependentRules');
  },

  getStats() {
    const events = allEvents();
    const counts: Record<string, number> = {};
    for (const e of events) {
      counts[e.status] = (counts[e.status] ?? 0) + 1;
    }
    const today = new Date().toISOString().split('T')[0];
    const expiringSoon = events.filter(
      (e) => e.status === 'Pending Documentation' && e.enrollmentWindowEnd >= today,
    ).length;
    return { total: events.length, ...counts, expiringSoon };
  },

  getEventTypes(): string[] {
    return VALID_EVENT_TYPES;
  },
};
