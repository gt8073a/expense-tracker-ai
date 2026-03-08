'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/lib/types';
import { getExpenses } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';
import { getExportHistory, getSchedules, getIntegrations } from '@/lib/exportHistory';
import type { ExportRecord, ScheduledExport, Integration } from '@/lib/exportHistory';
import ExportTemplates from '@/components/export/ExportTemplates';
import IntegrationsPanel from '@/components/export/IntegrationsPanel';
import ExportHistoryPanel from '@/components/export/ExportHistoryPanel';
import SchedulePanel from '@/components/export/SchedulePanel';

type Tab = 'templates' | 'integrations' | 'schedule' | 'history';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'templates', label: 'Export Templates', icon: '📋' },
  { id: 'integrations', label: 'Integrations', icon: '🔌' },
  { id: 'schedule', label: 'Auto-Export', icon: '⏰' },
  { id: 'history', label: 'History', icon: '🕓' },
];

export default function ExportHub() {
  const [tab, setTab] = useState<Tab>('templates');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduledExport[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setExpenses(getExpenses());
    setHistory(getExportHistory());
    setSchedules(getSchedules());
    setIntegrations(getIntegrations());
    setLoaded(true);
  }, []);

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Export & Sync</h1>
            <p className="text-gray-500 mt-1 text-sm">Share your data, connect to cloud services, and automate exports.</p>
          </div>
          {/* Live data badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">Live data</span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <StatPill label="Expenses" value={String(expenses.length)} icon="📝" />
          <StatPill label="Total Spend" value={formatCurrency(totalSpend)} icon="💰" />
          <StatPill label="Connected Services" value={`${connectedCount} / ${integrations.length}`} icon="🔗" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-base leading-none">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
            {t.id === 'history' && history.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                {history.length}
              </span>
            )}
            {t.id === 'schedule' && schedules.filter((s) => s.enabled).length > 0 && (
              <span className="ml-1 w-2 h-2 rounded-full bg-green-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tab === 'templates' && (
        <ExportTemplates
          expenses={expenses}
          integrations={integrations}
          onExportComplete={(record) => setHistory((prev) => [record, ...prev])}
        />
      )}
      {tab === 'integrations' && (
        <IntegrationsPanel
          integrations={integrations}
          onUpdate={(updated) => setIntegrations(updated)}
        />
      )}
      {tab === 'schedule' && (
        <SchedulePanel
          schedules={schedules}
          integrations={integrations}
          onUpdate={(updated) => setSchedules(updated)}
        />
      )}
      {tab === 'history' && (
        <ExportHistoryPanel
          history={history}
          onClear={() => setHistory([])}
        />
      )}
    </div>
  );
}

function StatPill({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}
