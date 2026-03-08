'use client';

import { useState, useEffect, useMemo } from 'react';
import { Expense, Category } from '@/lib/types';
import { CATEGORIES, CATEGORY_LIST } from '@/lib/categories';
import { formatCurrency, formatDate, getTodayString } from '@/lib/utils';
import {
  ExportFormat,
  ExportOptions,
  filterExpensesForExport,
  exportAsCSV,
  exportAsJSON,
  exportAsPDF,
} from '@/lib/exportUtils';

interface ExportModalProps {
  expenses: Expense[];
  onClose: () => void;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: string; description: string }[] = [
  { value: 'csv', label: 'CSV', icon: '📊', description: 'Spreadsheet-compatible, works with Excel & Google Sheets' },
  { value: 'json', label: 'JSON', icon: '{ }', description: 'Structured data format, ideal for developers' },
  { value: 'pdf', label: 'PDF', icon: '📄', description: 'Formatted report with summary and category breakdown' },
];

type Step = 'configure' | 'preview' | 'exporting' | 'done';

export default function ExportModal({ expenses, onClose }: ExportModalProps) {
  const [step, setStep] = useState<Step>('configure');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState(`expenses-${getTodayString()}`);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [filenameError, setFilenameError] = useState('');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = useMemo(
    () => filterExpensesForExport(expenses, { dateFrom, dateTo, categories: selectedCategories }),
    [expenses, dateFrom, dateTo, selectedCategories]
  );

  const totalAmount = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function validateAndPreview() {
    if (!filename.trim()) {
      setFilenameError('Filename is required');
      return;
    }
    if (filtered.length === 0) return;
    setFilenameError('');
    setStep('preview');
  }

  async function runExport() {
    setStep('exporting');
    // Small delay for UX — shows the loading state
    await new Promise((r) => setTimeout(r, 800));

    const opts: ExportOptions = { format, filename: filename.trim(), dateFrom, dateTo, categories: selectedCategories };
    if (opts.format === 'csv') exportAsCSV(filtered, opts.filename);
    else if (opts.format === 'json') exportAsJSON(filtered, opts.filename);
    else exportAsPDF(filtered, opts.filename);

    setStep('done');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step !== 'configure' && (
              <button
                onClick={() => setStep(step === 'preview' ? 'configure' : 'preview')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                disabled={step === 'exporting' || step === 'done'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {step === 'configure' && 'Export Data'}
                {step === 'preview' && 'Preview Export'}
                {step === 'exporting' && 'Exporting...'}
                {step === 'done' && 'Export Complete'}
              </h2>
              <StepIndicator step={step} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {step === 'configure' && (
            <ConfigureStep
              format={format} setFormat={setFormat}
              filename={filename} setFilename={setFilename} filenameError={filenameError}
              dateFrom={dateFrom} setDateFrom={setDateFrom}
              dateTo={dateTo} setDateTo={setDateTo}
              selectedCategories={selectedCategories} toggleCategory={toggleCategory}
              filtered={filtered} totalAmount={totalAmount}
            />
          )}
          {step === 'preview' && (
            <PreviewStep filtered={filtered} totalAmount={totalAmount} format={format} />
          )}
          {step === 'exporting' && <ExportingStep />}
          {step === 'done' && <DoneStep count={filtered.length} format={format} filename={filename} />}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {step === 'configure' && (
              <span>
                <span className="font-semibold text-gray-900">{filtered.length}</span> record{filtered.length !== 1 ? 's' : ''} · <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(step === 'done' || step === 'configure') && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {step === 'done' ? 'Close' : 'Cancel'}
              </button>
            )}
            {step === 'configure' && (
              <button
                onClick={validateAndPreview}
                disabled={filtered.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Preview
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {step === 'preview' && (
              <button
                onClick={runExport}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export {format.toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: Step }) {
  const steps = ['configure', 'preview', 'exporting', 'done'];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1 mt-0.5">
      {['Configure', 'Preview', 'Export'].map((label, i) => (
        <span key={label} className="flex items-center gap-1">
          <span className={`text-xs font-medium ${i <= idx - (step === 'done' ? 0 : 0) && i < idx ? 'text-indigo-600' : i === idx || (step === 'done' && i === 2) ? 'text-indigo-600' : 'text-gray-300'}`}>
            {label}
          </span>
          {i < 2 && <span className="text-gray-200 text-xs">›</span>}
        </span>
      ))}
    </div>
  );
}

// ── Configure step ────────────────────────────────────────────────────────────
interface ConfigureStepProps {
  format: ExportFormat; setFormat: (f: ExportFormat) => void;
  filename: string; setFilename: (v: string) => void; filenameError: string;
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  selectedCategories: Category[]; toggleCategory: (c: Category) => void;
  filtered: Expense[]; totalAmount: number;
}

function ConfigureStep({
  format, setFormat, filename, setFilename, filenameError,
  dateFrom, setDateFrom, dateTo, setDateTo,
  selectedCategories, toggleCategory, filtered, totalAmount,
}: ConfigureStepProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Summary banner */}
      <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-900">
            {filtered.length === 0
              ? 'No records match your filters'
              : `${filtered.length} record${filtered.length !== 1 ? 's' : ''} selected`}
          </p>
          <p className="text-xs text-indigo-600 mt-0.5">
            {filtered.length > 0 ? `Total: ${formatCurrency(totalAmount)}` : 'Adjust filters below to include data'}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${filtered.length > 0 ? 'bg-indigo-600' : 'bg-gray-200'}`}>
          {filtered.length > 0 ? '✓' : '—'}
        </div>
      </div>

      {/* Format */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Export Format</label>
        <div className="grid grid-cols-3 gap-3">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFormat(opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                format === opt.value
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="text-xl mb-1">{opt.icon}</div>
              <div className={`text-sm font-semibold ${format === opt.value ? 'text-indigo-700' : 'text-gray-800'}`}>
                {opt.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filename */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Filename</label>
        <div className="flex items-center gap-0">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className={`flex-1 px-3 py-2 text-sm border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${filenameError ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="my-expenses"
          />
          <span className="px-3 py-2 text-sm bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
            .{format}
          </span>
        </div>
        {filenameError && <p className="text-xs text-red-500 mt-1">{filenameError}</p>}
      </div>

      {/* Date range */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date Range <span className="text-gray-400 font-normal">(optional)</span></label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Categories <span className="text-gray-400 font-normal">(all if none selected)</span>
          </label>
          {selectedCategories.length > 0 && (
            <button onClick={() => CATEGORY_LIST.forEach(() => {})} className="text-xs text-indigo-600 hover:text-indigo-700">
              {/* clear all via direct state — handled in parent */}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_LIST.map((cat) => {
            const meta = CATEGORIES[cat];
            const selected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selected
                    ? `${meta.color} text-white border-transparent`
                    : `${meta.bgLight} ${meta.textColor} border-transparent hover:border-current`
                }`}
              >
                <span>{meta.icon}</span>
                {cat}
                {selected && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Preview step ──────────────────────────────────────────────────────────────
function PreviewStep({ filtered, totalAmount, format }: { filtered: Expense[]; totalAmount: number; format: ExportFormat }) {
  const preview = filtered.slice(0, 8);
  const remaining = filtered.length - preview.length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{Math.min(filtered.length, 8)}</span> of{' '}
          <span className="font-semibold text-gray-900">{filtered.length}</span> records
        </p>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
          {format.toUpperCase()}
        </span>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {preview.map((e) => {
              const cat = CATEGORIES[e.category];
              return (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap text-xs">{formatDate(e.date)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cat.bgLight} ${cat.textColor}`}>
                      {cat.icon} {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 truncate max-w-[160px]">{e.description}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(e.amount)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-gray-600">
                {remaining > 0 ? `+ ${remaining} more record${remaining !== 1 ? 's' : ''} not shown` : 'Total'}
              </td>
              <td className="px-4 py-2.5 text-right font-bold text-indigo-600">{formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {format === 'pdf' && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          PDF opens a print dialog — use &quot;Save as PDF&quot; in your browser&apos;s print settings.
        </p>
      )}
    </div>
  );
}

// ── Exporting step ────────────────────────────────────────────────────────────
function ExportingStep() {
  return (
    <div className="p-12 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900">Preparing your export</p>
        <p className="text-xs text-gray-500 mt-1">Processing records...</p>
      </div>
    </div>
  );
}

// ── Done step ─────────────────────────────────────────────────────────────────
function DoneStep({ count, format, filename }: { count: number; format: ExportFormat; filename: string }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900">Export successful!</p>
        <p className="text-sm text-gray-500 mt-1">
          {format === 'pdf'
            ? 'Your PDF report has been opened for printing.'
            : `${filename}.${format} has been downloaded.`}
        </p>
        <p className="text-xs text-gray-400 mt-2">{count} record{count !== 1 ? 's' : ''} exported</p>
      </div>
    </div>
  );
}
