'use client';

import Link from 'next/link';
import { Expense } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (expense: Expense) => void;
}

export default function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  const cat = CATEGORIES[expense.category];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center gap-4">
        {/* Category icon */}
        <div
          className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl ${cat.bgLight}`}
        >
          <span className="text-xl">{cat.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {expense.description}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cat.bgLight} ${cat.textColor}`}
                >
                  {expense.category}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(expense.date)}
                </span>
              </div>
              {expense.notes && (
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {expense.notes}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="flex-shrink-0 text-right">
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1">
          <Link
            href={`/expenses/${expense.id}`}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit expense"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>
          <button
            onClick={() => onDelete(expense)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete expense"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
