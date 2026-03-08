import { Expense, Category } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateForInput(dateStr: string): string {
  // Ensure format is YYYY-MM-DD
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthlyTotal(
  expenses: Expense[],
  year: number,
  month: number
): number {
  return expenses
    .filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      return y === year && m === month;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getWeeklyTotal(expenses: Expense[]): number {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return expenses
    .filter((e) => {
      const [year, month, day] = e.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date >= startOfWeek;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getTotalByCategory(
  expenses: Expense[]
): Record<Category, number> {
  const totals: Record<Category, number> = {
    Food: 0,
    Transportation: 0,
    Entertainment: 0,
    Shopping: 0,
    Bills: 0,
    Health: 0,
    Other: 0,
  };

  for (const expense of expenses) {
    totals[expense.category] += expense.amount;
  }

  return totals;
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Notes'];
  const rows = expenses.map((e) => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.amount.toFixed(2),
    `"${(e.notes ?? '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${getTodayString()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function filterAndSortExpenses(
  expenses: Expense[],
  filters: {
    search: string;
    category: Category | 'All';
    dateFrom: string;
    dateTo: string;
    sortBy: 'date' | 'amount' | 'category';
    sortOrder: 'asc' | 'desc';
  }
): Expense[] {
  let result = [...expenses];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        (e.notes ?? '').toLowerCase().includes(q)
    );
  }

  if (filters.category !== 'All') {
    result = result.filter((e) => e.category === filters.category);
  }

  if (filters.dateFrom) {
    result = result.filter((e) => e.date >= filters.dateFrom);
  }

  if (filters.dateTo) {
    result = result.filter((e) => e.date <= filters.dateTo);
  }

  result.sort((a, b) => {
    let cmp = 0;
    if (filters.sortBy === 'date') {
      cmp = a.date.localeCompare(b.date);
    } else if (filters.sortBy === 'amount') {
      cmp = a.amount - b.amount;
    } else if (filters.sortBy === 'category') {
      cmp = a.category.localeCompare(b.category);
    }
    return filters.sortOrder === 'asc' ? cmp : -cmp;
  });

  return result;
}
