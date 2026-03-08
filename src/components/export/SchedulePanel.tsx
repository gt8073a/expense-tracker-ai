'use client';

import { useState } from 'react';
import {
  ScheduledExport,
  ExportDestination,
  ExportTemplate,
  TEMPLATE_META,
  DESTINATION_META,
  createSchedule,
  deleteSchedule,
  saveSchedule,
  getSchedules,
} from '@/lib/exportHistory';
import type { Integration } from '@/lib/exportHistory';

interface Props {
  schedules: ScheduledExport[];
  integrations: Integration[];
  onUpdate: (schedules: ScheduledExport[]) => void;
}

const FREQUENCIES = [
  { value: 'weekly' as const, label: 'Weekly', description: 'Every 7 days' },
  { value: 'monthly' as const, label: 'Monthly', description: 'On the 1st of each month' },
];

export default function SchedulePanel({ schedules, integrations, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [template, setTemplate] = useState<ExportTemplate>('monthly_summary');
  const [destination, setDestination] = useState<ExportDestination>('csv_download');
  const [saving, setSaving] = useState(false);

  const connectedDestinations = new Set([
    'csv_download', 'json_download', 'share_link', 'email',
    ...integrations.filter((i) => i.status === 'connected').map((i) => i.id),
  ]);

  async function handleCreate() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    createSchedule(frequency, destination, template);
    onUpdate(getSchedules());
    setSaving(false);
    setShowForm(false);
  }

  function toggleEnabled(schedule: ScheduledExport) {
    const updated = { ...schedule, enabled: !schedule.enabled };
    saveSchedule(updated);
    onUpdate(getSchedules());
  }

  function handleDelete(id: string) {
    deleteSchedule(id);
    onUpdate(getSchedules());
  }

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
        <span className="text-xl flex-shrink-0">⏰</span>
        <div>
          <p className="text-sm font-semibold text-amber-900">Automated Exports</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Set up recurring exports and never manually download your data again. Exports run automatically and appear in your History tab.
          </p>
        </div>
      </div>

      {/* Scheduled exports list */}
      {schedules.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">⏰</div>
          <p className="text-sm font-medium text-gray-700">No scheduled exports</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Set up recurring exports to automate your data management.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => {
            const tplMeta = TEMPLATE_META[schedule.template];
            const destMeta = DESTINATION_META[schedule.destination];
            return (
              <div key={schedule.id} className={`bg-white rounded-xl border-2 p-4 transition-all ${schedule.enabled ? 'border-green-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{tplMeta.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tplMeta.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {schedule.frequency === 'weekly' ? 'Weekly' : 'Monthly'} → {destMeta.icon} {destMeta.label}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">
                          Next run: <span className="font-medium text-gray-600">{new Date(schedule.nextRun + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                        {schedule.lastRun && (
                          <span className="text-xs text-gray-400">
                            Last: <span className="font-medium text-gray-600">{new Date(schedule.lastRun).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleEnabled(schedule)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${schedule.enabled ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${schedule.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {schedule.enabled && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Active — will run {schedule.frequency === 'weekly' ? 'next week' : 'next month'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border-2 border-indigo-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">New Scheduled Export</h3>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Frequency</label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${frequency === f.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <p className={`text-sm font-semibold ${frequency === f.value ? 'text-indigo-700' : 'text-gray-800'}`}>{f.label}</p>
                  <p className="text-xs text-gray-400">{f.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as ExportTemplate)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {(Object.keys(TEMPLATE_META) as ExportTemplate[]).map((t) => (
                <option key={t} value={t}>{TEMPLATE_META[t].icon} {TEMPLATE_META[t].label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Destination</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value as ExportDestination)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {(Object.keys(DESTINATION_META) as ExportDestination[]).map((d) => {
                const available = connectedDestinations.has(d);
                return (
                  <option key={d} value={d} disabled={!available}>
                    {DESTINATION_META[d].icon} {DESTINATION_META[d].label}{!available ? ' (connect first)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : 'Create Schedule'}
            </button>
          </div>
        </div>
      )}

      {schedules.length > 0 && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-dashed border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Schedule
        </button>
      )}
    </div>
  );
}
