'use client';

import { Expense } from '@/lib/types';
import { exportToCSV } from '@/lib/utils';

interface ExportButtonProps {
  expenses: Expense[];
}

export default function ExportButton({ expenses }: ExportButtonProps) {
  return (
    <button
      onClick={() => exportToCSV(expenses)}
      disabled={expenses.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export CSV
    </button>
  );
}
