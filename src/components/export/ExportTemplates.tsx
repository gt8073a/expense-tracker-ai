'use client';

import { useState } from 'react';
import { Expense, Category } from '@/lib/types';
import { CATEGORY_LIST } from '@/lib/categories';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ExportTemplate,
  ExportDestination,
  ExportRecord,
  TEMPLATE_META,
  DESTINATION_META,
  addExportRecord,
  generateShareToken,
  buildShareUrl,
} from '@/lib/exportHistory';
import type { Integration, IntegrationId } from '@/lib/exportHistory';
import ShareModal from './ShareModal';
import EmailModal from './EmailModal';

interface Props {
  expenses: Expense[];
  integrations: Integration[];
  onExportComplete: (record: ExportRecord) => void;
}

const TEMPLATE_ORDER: ExportTemplate[] = ['full_export', 'tax_report', 'monthly_summary', 'category_analysis'];

const COLOR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
};
const ICON_BG: Record<string, string> = {
  indigo: 'bg-indigo-100',
  green: 'bg-green-100',
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
};

type ModalType = 'share' | 'email' | null;

export default function ExportTemplates({ expenses, integrations, onExportComplete }: Props) {
  const [selected, setSelected] = useState<ExportTemplate>('full_export');
  const [destination, setDestination] = useState<ExportDestination>('csv_download');
  const [modal, setModal] = useState<ModalType>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  const meta = TEMPLATE_META[selected];
  const preview = buildPreview(expenses, selected);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleExport() {
    if (destination === 'share_link') {
      const token = generateShareToken();
      const url = buildShareUrl(token);
      setShareUrl(url);
      setModal('share');
      return;
    }
    if (destination === 'email') {
      setModal('email');
      return;
    }

    setExporting(true);
    await new Promise((r) => setTimeout(r, 1000));

    // For cloud destinations, simulate the push
    if (destination === 'csv_download' || destination === 'json_download') {
      triggerLocalDownload(expenses, selected, destination);
    }

    const record = addExportRecord({
      template: selected,
      destination,
      recordCount: preview.length,
      totalAmount: expenses.reduce((s, e) => s + e.amount, 0),
      status: 'success',
      label: `${meta.label} → ${DESTINATION_META[destination].label}`,
    });
    onExportComplete(record);
    setExporting(false);
    showToast(
      destination === 'google_sheets'
        ? 'Synced to Google Sheets ✓'
        : destination === 'dropbox'
        ? 'Uploaded to Dropbox ✓'
        : destination === 'onedrive'
        ? 'Saved to OneDrive ✓'
        : 'Export complete ✓'
    );
  }

  const connectedIntegrations = integrations.filter((i) => i.status === 'connected').map((i) => i.id);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-lg animate-fade-in">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: template picker + destination */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Choose Template</h2>
            <div className="space-y-2">
              {TEMPLATE_ORDER.map((tpl) => {
                const m = TEMPLATE_META[tpl];
                const active = selected === tpl;
                return (
                  <button
                    key={tpl}
                    onClick={() => setSelected(tpl)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      active
                        ? `${COLOR_MAP[m.color]} border-current`
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${active ? ICON_BG[m.color] : 'bg-gray-100'}`}>
                        {m.icon}
                      </span>
                      <div>
                        <p className={`text-sm font-semibold ${active ? '' : 'text-gray-800'}`}>{m.label}</p>
                        <p className="text-xs text-gray-400 leading-tight mt-0.5 line-clamp-1">{m.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Send To</h2>
            <div className="space-y-1.5">
              {(Object.keys(DESTINATION_META) as ExportDestination[]).map((dest) => {
                const dm = DESTINATION_META[dest];
                const needsConnection = ['google_sheets', 'dropbox', 'onedrive'].includes(dest);
                const isConnected = connectedIntegrations.includes(dest as IntegrationId);
                const disabled = needsConnection && !isConnected;
                return (
                  <button
                    key={dest}
                    onClick={() => !disabled && setDestination(dest)}
                    disabled={disabled}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm ${
                      destination === dest
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : disabled
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{dm.icon}</span>
                      <span className="font-medium">{dm.label}</span>
                    </span>
                    {disabled && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Connect first
                      </span>
                    )}
                    {destination === dest && !disabled && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export {meta.label}
              </>
            )}
          </button>
        </div>

        {/* Right: preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{meta.icon}</span>
                <span className="text-sm font-semibold text-gray-800">{meta.label} Preview</span>
              </div>
              <span className="text-xs text-gray-400">{preview.length} rows</span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {meta.columns.map((col) => (
                      <th key={col} className="px-4 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {preview.slice(0, 8).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-2.5 text-gray-700 whitespace-nowrap max-w-[180px] truncate">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {preview.length > 8 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
                + {preview.length - 8} more rows in export
              </div>
            )}

            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Columns: <span className="font-medium text-gray-700">{meta.columns.join(', ')}</span>
              </span>
              <span className="text-xs font-semibold text-gray-700">
                Total: {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {modal === 'share' && (
        <ShareModal
          url={shareUrl}
          expenses={expenses}
          template={selected}
          onClose={() => setModal(null)}
          onComplete={(record) => { onExportComplete(record); showToast('Share link copied ✓'); }}
        />
      )}
      {modal === 'email' && (
        <EmailModal
          expenses={expenses}
          template={selected}
          onClose={() => setModal(null)}
          onComplete={(record) => { onExportComplete(record); showToast('Email sent ✓'); }}
        />
      )}
    </div>
  );
}

// ── Preview builders ──────────────────────────────────────────────────────────
function buildPreview(expenses: Expense[], template: ExportTemplate): string[][] {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  if (template === 'full_export') {
    return sorted.map((e) => [formatDate(e.date), e.category, formatCurrency(e.amount), e.description, e.notes ?? '']);
  }

  if (template === 'tax_report') {
    const byCategory: Record<string, Expense[]> = {};
    for (const e of sorted) {
      if (!byCategory[e.category]) byCategory[e.category] = [];
      byCategory[e.category].push(e);
    }
    const rows: string[][] = [];
    for (const [cat, exps] of Object.entries(byCategory)) {
      for (const e of exps) rows.push([formatDate(e.date), cat, formatCurrency(e.amount), e.description]);
      rows.push(['', `${cat} Subtotal`, formatCurrency(exps.reduce((s, e) => s + e.amount, 0)), '']);
    }
    return rows;
  }

  if (template === 'monthly_summary') {
    const byMonth: Record<string, Record<string, number>> = {};
    for (const e of sorted) {
      const month = e.date.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = {};
      byMonth[month][e.category] = (byMonth[month][e.category] ?? 0) + e.amount;
    }
    const rows: string[][] = [];
    for (const [month, cats] of Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a))) {
      const label = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      for (const [cat, total] of Object.entries(cats)) {
        const count = sorted.filter((e) => e.date.startsWith(month) && e.category === cat).length;
        rows.push([label, cat, formatCurrency(total), String(count)]);
      }
    }
    return rows;
  }

  // category_analysis
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const months = new Set(expenses.map((e) => e.date.substring(0, 7))).size || 1;
  const rows: string[][] = [];
  for (const cat of CATEGORY_LIST as Category[]) {
    const catExps = expenses.filter((e) => e.category === cat);
    if (catExps.length === 0) continue;
    const catTotal = catExps.reduce((s, e) => s + e.amount, 0);
    rows.push([
      cat,
      formatCurrency(catTotal),
      formatCurrency(catTotal / months),
      `${((catTotal / total) * 100).toFixed(1)}%`,
    ]);
  }
  return rows.sort((a, b) => parseFloat(b[1].replace(/[^0-9.]/g, '')) - parseFloat(a[1].replace(/[^0-9.]/g, '')));
}

function triggerLocalDownload(expenses: Expense[], template: ExportTemplate, dest: 'csv_download' | 'json_download') {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const filename = `${template}-${new Date().toISOString().split('T')[0]}`;

  if (dest === 'csv_download') {
    const meta = TEMPLATE_META[template];
    const preview = buildPreview(expenses, template);
    const csv = [meta.columns.join(','), ...preview.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    const data = { exportedAt: new Date().toISOString(), template, expenses: sorted };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
