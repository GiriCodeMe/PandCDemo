const BASE = 'http://localhost:3001/api/notifications';
const AUTH = { Authorization: 'Bearer P-001' };

export interface NotificationTemplate {
  templateId: string;
  name: string;
  category: string;
  channel: string;
  subject: string;
  bodyPreview: string;
  variables: string[];
  status: string;
  lastModified: string;
  useCount: number;
}

export interface Notification {
  notificationId: string;
  templateId: string;
  templateName: string;
  category: string;
  employeeId: string;
  employeeName: string;
  channel: string;
  subject: string;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  scheduledFor?: string | null;
  errorMessage: string | null;
}

export interface NotificationStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  sent: number;
  failed: number;
  scheduled: number;
  deliveryRate: number;
  openRate: number;
  totalTemplates: number;
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { headers: AUTH });
  const json = await r.json();
  if (!json.success) throw new Error(json.error?.message ?? 'Request failed');
  return json.data as T;
}

export const notificationsApi = {
  getStats: () => get<NotificationStats>('/stats'),
  getTemplates: (filters?: { category?: string; channel?: string }) => {
    const p = new URLSearchParams();
    if (filters?.category) p.set('category', filters.category);
    if (filters?.channel) p.set('channel', filters.channel);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return get<NotificationTemplate[]>(`/templates${qs}`);
  },
  getTemplateById: (id: string) => get<NotificationTemplate>(`/templates/${id}`),
  getNotifications: (filters?: { status?: string; category?: string; employeeId?: string }) => {
    const p = new URLSearchParams();
    if (filters?.status) p.set('status', filters.status);
    if (filters?.category) p.set('category', filters.category);
    if (filters?.employeeId) p.set('employeeId', filters.employeeId);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return get<Notification[]>(`/${qs}`);
  },
};
