'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Expense } from '@/lib/types';
import { getExpenseById } from '@/lib/storage';
import ExpenseForm from '@/components/ExpenseForm';

export default function EditExpensePage() {
  const params = useParams();
  const id = params?.id as string;
  const [expense, setExpense] = useState<Expense | null | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const found = getExpenseById(id);
      setExpense(found);
    }
  }, [id]);

  if (expense === undefined) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (expense === null) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Expense not found
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          This expense may have been deleted.
        </p>
        <Link
          href="/expenses"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Back to Expenses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/expenses" className="hover:text-gray-700 transition-colors">
          Expenses
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">
          {expense.description}
        </span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Edit Expense</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update the details for this expense.
          </p>
        </div>

        <ExpenseForm expense={expense} />
      </div>
    </div>
  );
}
