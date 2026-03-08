import { Expense, Category } from './types';

const STORAGE_KEY = 'expense-tracker-expenses';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Expense[];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    console.error('Failed to save expenses to localStorage');
  }
}

export function addExpense(
  expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>
): Expense {
  const expenses = getExpenses();
  const now = new Date().toISOString();
  const newExpense: Expense = {
    ...expense,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
}

export function updateExpense(
  id: string,
  updates: Partial<Omit<Expense, 'id' | 'createdAt'>>
): Expense | null {
  const expenses = getExpenses();
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return null;
  const updated: Expense = {
    ...expenses[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  expenses[index] = updated;
  saveExpenses(expenses);
  return updated;
}

export function deleteExpense(id: string): boolean {
  const expenses = getExpenses();
  const filtered = expenses.filter((e) => e.id !== id);
  if (filtered.length === expenses.length) return false;
  saveExpenses(filtered);
  return true;
}

export function getExpenseById(id: string): Expense | null {
  const expenses = getExpenses();
  return expenses.find((e) => e.id === id) ?? null;
}

// Seed some sample data for a better first-run experience
export function seedSampleData(): void {
  const existing = getExpenses();
  if (existing.length > 0) return;

  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return fmt(d);
  };

  const samples: Array<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>> = [
    { amount: 12.5, date: daysAgo(1), category: 'Food' as Category, description: 'Lunch at deli', notes: 'Turkey sandwich' },
    { amount: 45.0, date: daysAgo(2), category: 'Transportation' as Category, description: 'Monthly bus pass', notes: '' },
    { amount: 89.99, date: daysAgo(3), category: 'Shopping' as Category, description: 'New headphones', notes: 'On sale' },
    { amount: 15.0, date: daysAgo(4), category: 'Entertainment' as Category, description: 'Movie ticket', notes: '' },
    { amount: 120.0, date: daysAgo(5), category: 'Bills' as Category, description: 'Electric bill', notes: 'Monthly utility' },
    { amount: 30.0, date: daysAgo(6), category: 'Health' as Category, description: 'Pharmacy', notes: 'Vitamins' },
    { amount: 22.75, date: daysAgo(7), category: 'Food' as Category, description: 'Grocery run', notes: '' },
    { amount: 9.99, date: daysAgo(10), category: 'Entertainment' as Category, description: 'Streaming subscription', notes: '' },
    { amount: 55.0, date: daysAgo(12), category: 'Other' as Category, description: 'Home supplies', notes: 'Cleaning products' },
    { amount: 200.0, date: daysAgo(15), category: 'Bills' as Category, description: 'Internet bill', notes: 'Quarterly payment' },
  ];

  const now = new Date().toISOString();
  const seeded: Expense[] = samples.map((s) => ({
    ...s,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }));
  saveExpenses(seeded);
}
