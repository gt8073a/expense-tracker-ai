'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Expense, ExpenseFilters } from '@/lib/types';
import { getExpenses, deleteExpense } from '@/lib/storage';
import { filterAndSortExpenses, formatCurrency } from '@/lib/utils';
import { CATEGORY_LIST } from '@/lib/categories';
import ExpenseCard from './ExpenseCard';
import DeleteModal from './DeleteModal';
import ExportButton from './ExportButton';

const defaultFilters: ExpenseFilters = {
  search: '',
  category: 'All',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const loadExpenses = useCallback(() => {
    setExpenses(getExpenses());
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const filtered = filterAndSortExpenses(expenses, filters);
  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  function handleFilterChange(key: keyof ExpenseFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleDelete(expense: Expense) {
    setDeleteTarget(expense);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteExpense(deleteTarget.id);
    loadExpenses();
    setDeleteTarget(null);
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  const hasActiveFilters =
    filters.search ||
    filters.category !== 'All' ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div>
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="All">All categories</option>
              {CATEGORY_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Date from */}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="From"
          />

          {/* Date to */}
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="To"
          />

          {/* Sort */}
          <div className="relative">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setFilters((prev) => ({
                  ...prev,
                  sortBy: by as ExpenseFilters['sortBy'],
                  sortOrder: order as ExpenseFilters['sortOrder'],
                }));
              }}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="date-desc">Date (newest)</option>
              <option value="date-asc">Date (oldest)</option>
              <option value="amount-desc">Amount (high)</option>
              <option value="amount-asc">Amount (low)</option>
              <option value="category-asc">Category (A-Z)</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Export */}
          <ExportButton expenses={filtered} />

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Expense list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          {expenses.length === 0 ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-indigo-50 mb-4">
                <svg
                  className="w-8 h-8 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No expenses yet
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Start tracking your spending by adding your first expense.
              </p>
              <Link
                href="/expenses/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add First Expense
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gray-50 mb-4">
                <svg
                  className="w-8 h-8 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No results found
              </h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your search or filters.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Footer summary */}
          <div className="mt-4 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Showing{' '}
              <span className="font-medium text-gray-900">
                {filtered.length}
              </span>{' '}
              {filtered.length === 1 ? 'expense' : 'expenses'}
            </span>
            <span className="font-semibold text-gray-900">
              Total: {formatCurrency(totalAmount)}
            </span>
          </div>
        </>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          expense={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
