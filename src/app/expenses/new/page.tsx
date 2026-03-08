import Link from 'next/link';
import ExpenseForm from '@/components/ExpenseForm';

export default function NewExpensePage() {
  return (
    <div className="max-w-lg mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/expenses" className="hover:text-gray-700 transition-colors">
          Expenses
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">New</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Add New Expense</h1>
          <p className="text-sm text-gray-500 mt-1">
            Record a new expense to keep track of your spending.
          </p>
        </div>

        <ExpenseForm />
      </div>
    </div>
  );
}
