export interface Expense {
  id: string;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  category: Category;
  description: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Health'
  | 'Other';

export interface ExpenseFilters {
  search: string;
  category: Category | 'All';
  dateFrom: string;
  dateTo: string;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}
