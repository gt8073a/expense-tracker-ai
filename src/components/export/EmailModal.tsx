'use client';

import { useState } from 'react';
import { Expense } from '@/lib/types';
import { ExportTemplate, TEMPLATE_META, addExportRecord, ExportRecord } from '@/lib/exportHistory';
import { formatCurrency } from '@/lib/utils';

interface Props {
  expenses: Expense[];
  template: ExportTemplate;
  onClose: () => void;
  onComplete: (record: ExportRecord) => void;
}

type Step = 'compose' | 'sending' | 'sent';

export default function EmailModal({ expenses, template, onClose, onComplete }: Props) {
  const [step, setStep] = useState<Step>('compose');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(`Expense Report — ${TEMPLATE_META[template].label}`);
  const [message, setMessage] = useState('Please find the attached expense report.');
  const [includeCSV, setIncludeCSV] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [errors, setErrors] = useState<{ to?: string }>({});
  const meta = TEMPLATE_META[template];
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  async function handleSend() {
    const errs: { to?: string } = {};
    if (!to.trim()) errs.to = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) errs.to = 'Enter a valid email address';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStep('sending');
    await new Promise((r) => setTimeout(r, 1600));

    const record = addExportRecord({
      template,
      destination: 'email',
      recordCount: expenses.length,
      totalAmount: total,
      status: 'success',
      label: `${meta.label} → Email (${to.trim()})`,
    });
    onComplete(record);
    setStep('sent');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={step !== 'sending' ? onClose : undefined} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📧</span>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Email Export</h2>
              <p className="text-xs text-gray-400">{meta.icon} {meta.label}</p>
            </div>
          </div>
          {step !== 'sending' && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {step === 'compose' && (
          <div className="p-6 space-y-4">
            {/* Attachment preview */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">📎</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-900 truncate">{meta.label.toLowerCase().replace(/ /g, '_')}.csv</p>
                <p className="text-xs text-blue-600">{expenses.length} records · {formatCurrency(total)}</p>
              </div>
              <div className="text-xs text-blue-500">Ready</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
              <input
                type="email"
                value={to}
                onChange={(e) => { setTo(e.target.value); setErrors({}); }}
                placeholder="recipient@example.com"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.to ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.to && <p className="text-xs text-red-500 mt-1">{errors.to}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Message <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600">Attachments</label>
              <CheckOption label="CSV file attachment" checked={includeCSV} onChange={setIncludeCSV} />
              <CheckOption label="Inline HTML summary" checked={includeSummary} onChange={setIncludeSummary} />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSend} className="flex-1 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </button>
            </div>
          </div>
        )}

        {step === 'sending' && (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
            <div>
              <p className="text-sm font-semibold text-gray-900">Sending email...</p>
              <p className="text-xs text-gray-400 mt-1">Attaching {expenses.length} records</p>
            </div>
          </div>
        )}

        {step === 'sent' && (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl">📬</div>
            <div>
              <p className="text-base font-semibold text-gray-900">Email sent!</p>
              <p className="text-sm text-gray-500 mt-1">Report delivered to</p>
              <p className="text-sm font-medium text-indigo-600">{to}</p>
            </div>
            <button onClick={onClose} className="mt-2 px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Done
            </button>
            <p className="text-xs text-gray-400">This is a demo — no email was actually sent.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-xs text-gray-600">{label}</span>
    </label>
  );
}
