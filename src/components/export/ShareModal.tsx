'use client';

import { useState } from 'react';
import { Expense } from '@/lib/types';
import { ExportTemplate, TEMPLATE_META, addExportRecord, ExportRecord } from '@/lib/exportHistory';
import { formatCurrency } from '@/lib/utils';

interface Props {
  url: string;
  expenses: Expense[];
  template: ExportTemplate;
  onClose: () => void;
  onComplete: (record: ExportRecord) => void;
}

export default function ShareModal({ url, expenses, template, onClose, onComplete }: Props) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const meta = TEMPLATE_META[template];
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback: select input
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (!saved) {
      const record = addExportRecord({
        template,
        destination: 'share_link',
        recordCount: expenses.length,
        totalAmount: total,
        status: 'success',
        label: `${meta.label} → Share Link`,
        shareUrl: url,
      });
      onComplete(record);
      setSaved(true);
    }
  }

  // Simple SVG QR code placeholder (visual representation, not a real QR)
  const qrCells = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) => {
      // Finder patterns in corners
      const inFinder =
        (row < 2 && col < 2) ||
        (row < 2 && col > 4) ||
        (row > 4 && col < 2) ||
        (row === 0 || row === 6 || col === 0 || col === 6);
      // Random fill for data area
      const seed = (row * 13 + col * 7 + url.length) % 3;
      return inFinder || (row > 1 && row < 5 && col > 1 && col < 5 && seed === 0);
    })
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold">Share Export Link</h2>
              <p className="text-indigo-200 text-xs mt-0.5">{meta.icon} {meta.label} · {expenses.length} records · {formatCurrency(total)}</p>
            </div>
            <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* URL field */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Shareable Link</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono"
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  copied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {copied ? (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Copied!</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                )}
              </button>
            </div>
          </div>

          {/* QR code */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <p className="text-xs font-semibold text-gray-600 mb-2">QR Code</p>
              <div className="w-20 h-20 bg-white border border-gray-200 rounded-xl p-2 grid grid-cols-7 gap-0.5">
                {qrCells.flat().map((filled, i) => (
                  <div key={i} className={`aspect-square rounded-sm ${filled ? 'bg-gray-900' : 'bg-white'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">Scan to open</p>
            </div>

            {/* Link details */}
            <div className="flex-1 space-y-2">
              <InfoRow icon="🔒" label="Access" value="View only, no account required" />
              <InfoRow icon="⏱️" label="Expires" value="30 days from creation" />
              <InfoRow icon="👁️" label="Views" value="Unlimited views allowed" />
              <InfoRow icon="📊" label="Format" value="Interactive table view" />
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            This is a demo — no data is actually uploaded to a server.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-sm leading-none mt-0.5">{icon}</span>
      <div>
        <span className="text-xs font-medium text-gray-700">{label}: </span>
        <span className="text-xs text-gray-500">{value}</span>
      </div>
    </div>
  );
}
