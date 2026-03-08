'use client';

import { clearExportHistory, TEMPLATE_META } from '@/lib/exportHistory';
import type { ExportRecord } from '@/lib/exportHistory';
import { formatCurrency } from '@/lib/utils';

interface Props {
  history: ExportRecord[];
  onClear: () => void;
}

export default function ExportHistoryPanel({ history, onClear }: Props) {
  function handleClear() {
    clearExportHistory();
    onClear();
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🕓</div>
        <p className="text-sm font-medium text-gray-700">No export history yet</p>
        <p className="text-xs text-gray-400 mt-1">Your exports will appear here after you run them.</p>
      </div>
    );
  }

  const totalExports = history.length;
  const successCount = history.filter((r) => r.status === 'success').length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{totalExports}</p>
          <p className="text-xs text-gray-500">Total Exports</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-green-600">{successCount}</p>
          <p className="text-xs text-gray-500">Successful</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-gray-900">
            {history.reduce((s, r) => s + r.recordCount, 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Records Exported</p>
        </div>
      </div>

      {/* History list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Export Log</p>
          <button
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            Clear history
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {history.map((record) => {
            const tplMeta = TEMPLATE_META[record.template];
            const date = new Date(record.timestamp);
            const isToday = new Date().toDateString() === date.toDateString();
            const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const dateStr = isToday
              ? `Today at ${timeStr}`
              : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` at ${timeStr}`;

            return (
              <div key={record.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${
                  record.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {tplMeta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{record.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{dateStr}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-gray-700">{record.recordCount} records</p>
                  <p className="text-xs text-gray-400">{formatCurrency(record.totalAmount)}</p>
                </div>
                <StatusDot status={record.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: ExportRecord['status'] }) {
  const colors = {
    success: 'bg-green-500',
    pending: 'bg-yellow-400 animate-pulse',
    failed: 'bg-red-500',
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status]}`} title={status} />;
}
