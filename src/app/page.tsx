'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Expense } from '@/lib/types';
import { getExpenses, seedSampleData } from '@/lib/storage';
import {
  formatCurrency,
  formatDate,
  getMonthlyTotal,
  getWeeklyTotal,
  getTotalByCategory,
} from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';
import SummaryCard from '@/components/SummaryCard';
import CategoryChart from '@/components/CategoryChart';

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    seedSampleData();
    setExpenses(getExpenses());
    setLoaded(true);
  }, []);

  const now = new Date();
  const allTimeTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const monthTotal = getMonthlyTotal(expenses, now.getFullYear(), now.getMonth() + 1);
  const weekTotal = getWeeklyTotal(expenses);
  const categoryTotals = getTotalByCategory(expenses);
  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Track and manage your expenses</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-md mx-auto">
          <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-indigo-50 mb-5">
            <svg
              className="w-10 h-10 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Welcome to ExpenseTracker
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Start tracking your spending by adding your first expense. All data
            is stored securely in your browser.
          </p>
          <Link
            href="/expenses/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
            Add Your First Expense
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
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
          Add Expense
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total All Time"
          value={formatCurrency(allTimeTotal)}
          subtitle={`${expenses.length} expenses`}
          colorClass="indigo"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <SummaryCard
          title="This Month"
          value={formatCurrency(monthTotal)}
          subtitle={now.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
          colorClass="blue"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <SummaryCard
          title="This Week"
          value={formatCurrency(weekTotal)}
          subtitle="Current week"
          colorClass="green"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />
        <SummaryCard
          title="Total Expenses"
          value={String(expenses.length)}
          subtitle="All recorded"
          colorClass="gray"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />
      </div>

      {/* Bottom section: chart + recent */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Spending by Category
            </h2>
            <span className="text-xs text-gray-400">All time</span>
          </div>
          <CategoryChart totals={categoryTotals} />
        </div>

        {/* Recent expenses */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Expenses
            </h2>
            <Link
              href="/expenses"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View all →
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No recent expenses
            </p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const cat = CATEGORIES[expense.category];
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div
                      className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${cat.bgLight}`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-sm font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
