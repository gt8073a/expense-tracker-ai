export type ExportDestination =
  | 'csv_download'
  | 'json_download'
  | 'email'
  | 'google_sheets'
  | 'dropbox'
  | 'onedrive'
  | 'share_link';

export type ExportTemplate =
  | 'full_export'
  | 'tax_report'
  | 'monthly_summary'
  | 'category_analysis';

export interface ExportRecord {
  id: string;
  timestamp: string;         // ISO string
  template: ExportTemplate;
  destination: ExportDestination;
  recordCount: number;
  totalAmount: number;
  status: 'success' | 'pending' | 'failed';
  label: string;             // human-readable name shown in history
  shareUrl?: string;
}

export interface ScheduledExport {
  id: string;
  enabled: boolean;
  frequency: 'weekly' | 'monthly';
  destination: ExportDestination;
  template: ExportTemplate;
  nextRun: string;           // ISO date string
  lastRun?: string;
}

const HISTORY_KEY = 'expense-tracker-export-history';
const SCHEDULE_KEY = 'expense-tracker-export-schedule';
const INTEGRATIONS_KEY = 'expense-tracker-integrations';

export type IntegrationId = 'google_sheets' | 'dropbox' | 'onedrive' | 'email';
export type IntegrationStatus = 'connected' | 'disconnected' | 'connecting';

export interface Integration {
  id: IntegrationId;
  status: IntegrationStatus;
  connectedAs?: string;
  connectedAt?: string;
}

// ── History ───────────────────────────────────────────────────────────────────
export function getExportHistory(): ExportRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function addExportRecord(record: Omit<ExportRecord, 'id' | 'timestamp'>): ExportRecord {
  const full: ExportRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  const history = getExportHistory();
  localStorage.setItem(HISTORY_KEY, JSON.stringify([full, ...history].slice(0, 50)));
  return full;
}

export function clearExportHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// ── Schedules ─────────────────────────────────────────────────────────────────
export function getSchedules(): ScheduledExport[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SCHEDULE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveSchedule(schedule: ScheduledExport): void {
  const all = getSchedules();
  const idx = all.findIndex((s) => s.id === schedule.id);
  if (idx >= 0) all[idx] = schedule;
  else all.push(schedule);
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(all));
}

export function deleteSchedule(id: string): void {
  const all = getSchedules().filter((s) => s.id !== id);
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(all));
}

export function createSchedule(
  frequency: 'weekly' | 'monthly',
  destination: ExportDestination,
  template: ExportTemplate
): ScheduledExport {
  const next = new Date();
  if (frequency === 'weekly') next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);

  const schedule: ScheduledExport = {
    id: crypto.randomUUID(),
    enabled: true,
    frequency,
    destination,
    template,
    nextRun: next.toISOString().split('T')[0],
  };
  saveSchedule(schedule);
  return schedule;
}

// ── Integrations ──────────────────────────────────────────────────────────────
const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: 'google_sheets', status: 'disconnected' },
  { id: 'dropbox', status: 'disconnected' },
  { id: 'onedrive', status: 'disconnected' },
  { id: 'email', status: 'disconnected' },
];

export function getIntegrations(): Integration[] {
  if (typeof window === 'undefined') return DEFAULT_INTEGRATIONS;
  try {
    const stored = JSON.parse(localStorage.getItem(INTEGRATIONS_KEY) ?? 'null');
    return stored ?? DEFAULT_INTEGRATIONS;
  } catch {
    return DEFAULT_INTEGRATIONS;
  }
}

export function saveIntegration(integration: Integration): void {
  const all = getIntegrations();
  const idx = all.findIndex((i) => i.id === integration.id);
  if (idx >= 0) all[idx] = integration;
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(all));
}

// ── Share links ───────────────────────────────────────────────────────────────
export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function buildShareUrl(token: string): string {
  return `https://expensetracker.app/shared/${token}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export const TEMPLATE_META: Record<
  ExportTemplate,
  { label: string; description: string; icon: string; columns: string[]; color: string }
> = {
  full_export: {
    label: 'Full Export',
    description: 'All expenses with every field — date, amount, category, description, notes.',
    icon: '📦',
    columns: ['Date', 'Category', 'Amount', 'Description', 'Notes'],
    color: 'indigo',
  },
  tax_report: {
    label: 'Tax Report',
    description: 'Organized by category with subtotals — ready to hand to your accountant.',
    icon: '🧾',
    columns: ['Date', 'Category', 'Amount', 'Description'],
    color: 'green',
  },
  monthly_summary: {
    label: 'Monthly Summary',
    description: 'Grouped by month with category breakdowns and running totals.',
    icon: '📅',
    columns: ['Month', 'Category', 'Total', 'Count'],
    color: 'blue',
  },
  category_analysis: {
    label: 'Category Analysis',
    description: 'Spending patterns, averages, and trends per category over time.',
    icon: '📊',
    columns: ['Category', 'Total', 'Avg/Month', '% of Spend'],
    color: 'purple',
  },
};

export const DESTINATION_META: Record<
  ExportDestination,
  { label: string; icon: string }
> = {
  csv_download: { label: 'CSV Download', icon: '⬇️' },
  json_download: { label: 'JSON Download', icon: '{ }' },
  email: { label: 'Email', icon: '📧' },
  google_sheets: { label: 'Google Sheets', icon: '📗' },
  dropbox: { label: 'Dropbox', icon: '📦' },
  onedrive: { label: 'OneDrive', icon: '☁️' },
  share_link: { label: 'Share Link', icon: '🔗' },
};
