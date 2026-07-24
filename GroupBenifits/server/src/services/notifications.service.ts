import { getStore } from '../db/FileStore';

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

function templates(): NotificationTemplate[] {
  return getStore().readArray<NotificationTemplate>('notifications/templates');
}

function notifications(): Notification[] {
  return getStore().readArray<Notification>('notifications/notifications');
}

export const notificationsService = {
  getTemplates(filters?: { category?: string; channel?: string }): NotificationTemplate[] {
    let tpls = templates();
    if (filters?.category) tpls = tpls.filter((t) => t.category === filters.category);
    if (filters?.channel) tpls = tpls.filter((t) => t.channel === filters.channel);
    return tpls;
  },

  getTemplateById(id: string): NotificationTemplate | null {
    return templates().find((t) => t.templateId === id) ?? null;
  },

  getNotifications(filters?: { status?: string; category?: string; employeeId?: string }): Notification[] {
    let notifs = notifications();
    if (filters?.status) notifs = notifs.filter((n) => n.status === filters.status);
    if (filters?.category) notifs = notifs.filter((n) => n.category === filters.category);
    if (filters?.employeeId) notifs = notifs.filter((n) => n.employeeId === filters.employeeId);
    return notifs.sort((a, b) => {
      const tA = a.sentAt ?? a.scheduledFor ?? '';
      const tB = b.sentAt ?? b.scheduledFor ?? '';
      return tB.localeCompare(tA);
    });
  },

  getStats() {
    const notifs = notifications();
    const tpls = templates();
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    for (const n of notifs) {
      byStatus[n.status] = (byStatus[n.status] ?? 0) + 1;
      byCategory[n.category] = (byCategory[n.category] ?? 0) + 1;
    }
    const sent = byStatus['Sent'] ?? 0;
    const deliveryRate = sent > 0
      ? Math.round((notifs.filter((n) => n.deliveredAt).length / sent) * 100)
      : 100;
    const openRate = sent > 0
      ? Math.round((notifs.filter((n) => n.openedAt).length / sent) * 100)
      : 0;
    return {
      total: notifs.length,
      byStatus,
      byCategory,
      sent,
      failed: byStatus['Failed'] ?? 0,
      scheduled: byStatus['Scheduled'] ?? 0,
      deliveryRate,
      openRate,
      totalTemplates: tpls.length,
    };
  },
};
