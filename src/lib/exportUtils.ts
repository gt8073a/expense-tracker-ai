import { Expense, Category } from './types';
import { formatDate, formatCurrency } from './utils';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  dateFrom: string;
  dateTo: string;
  categories: Category[];
}

export function filterExpensesForExport(
  expenses: Expense[],
  options: Pick<ExportOptions, 'dateFrom' | 'dateTo' | 'categories'>
): Expense[] {
  return expenses
    .filter((e) => {
      if (options.dateFrom && e.date < options.dateFrom) return false;
      if (options.dateTo && e.date > options.dateTo) return false;
      if (options.categories.length > 0 && !options.categories.includes(e.category)) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function exportAsCSV(expenses: Expense[], filename: string): void {
  const headers = ['Date', 'Category', 'Amount', 'Description', 'Notes'];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
    `"${(e.notes ?? '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerDownload(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

export function exportAsJSON(expenses: Expense[], filename: string): void {
  const data = {
    exportedAt: new Date().toISOString(),
    totalRecords: expenses.length,
    totalAmount: expenses.reduce((s, e) => s + e.amount, 0),
    expenses: expenses.map((e) => ({
      id: e.id,
      date: e.date,
      category: e.category,
      amount: e.amount,
      description: e.description,
      notes: e.notes ?? '',
    })),
  };
  triggerDownload(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
}

export function exportAsPDF(expenses: Expense[], filename: string): void {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Group by category for summary
  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  }

  const categoryRows = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => `
      <tr>
        <td style="padding:6px 12px;color:#6b7280;">${cat}</td>
        <td style="padding:6px 12px;text-align:right;color:#111827;font-weight:500;">${formatCurrency(amt)}</td>
        <td style="padding:6px 12px;text-align:right;color:#6b7280;">${((amt / total) * 100).toFixed(1)}%</td>
      </tr>`)
    .join('');

  const expenseRows = expenses.map((e) => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:8px 12px;color:#6b7280;white-space:nowrap;">${formatDate(e.date)}</td>
      <td style="padding:8px 12px;color:#374151;">${e.category}</td>
      <td style="padding:8px 12px;color:#111827;">${e.description}</td>
      <td style="padding:8px 12px;text-align:right;font-weight:500;color:#111827;white-space:nowrap;">${formatCurrency(e.amount)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; padding: 40px; }
    h1 { font-size: 24px; font-weight: 700; color: #111827; }
    h2 { font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .meta { color: #6b7280; font-size: 13px; margin-top: 4px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .summary-card .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .summary-card .value { font-size: 20px; font-weight: 700; color: #4f46e5; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { background: #f9fafb; }
    thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    thead th:last-child { text-align: right; }
    .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Expense Report</h1>
  <p class="meta">Generated on ${now} &nbsp;·&nbsp; ${expenses.length} expense${expenses.length !== 1 ? 's' : ''}</p>
  <hr class="divider" />

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Total Amount</div>
      <div class="value">${formatCurrency(total)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Records</div>
      <div class="value">${expenses.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Categories</div>
      <div class="value">${Object.keys(byCategory).length}</div>
    </div>
  </div>

  <h2>By Category</h2>
  <table style="margin-bottom:32px;">
    <thead>
      <tr><th>Category</th><th style="text-align:right;">Amount</th><th style="text-align:right;">Share</th></tr>
    </thead>
    <tbody>${categoryRows}</tbody>
  </table>

  <h2>All Expenses</h2>
  <table>
    <thead>
      <tr><th>Date</th><th>Category</th><th>Description</th><th style="text-align:right;">Amount</th></tr>
    </thead>
    <tbody>${expenseRows}</tbody>
    <tfoot>
      <tr style="border-top:2px solid #e5e7eb;background:#f9fafb;">
        <td colspan="3" style="padding:10px 12px;font-weight:600;color:#374151;">Total</td>
        <td style="padding:10px 12px;text-align:right;font-weight:700;color:#4f46e5;">${formatCurrency(total)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">ExpenseTracker &nbsp;·&nbsp; ${filename}</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
