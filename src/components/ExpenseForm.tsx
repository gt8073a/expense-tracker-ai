'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Expense, Category } from '@/lib/types';
import { CATEGORY_LIST } from '@/lib/categories';
import { CATEGORIES } from '@/lib/categories';
import { addExpense, updateExpense } from '@/lib/storage';
import { getTodayString } from '@/lib/utils';

interface ExpenseFormProps {
  expense?: Expense;
}

interface FormValues {
  amount: string;
  date: string;
  category: Category;
  description: string;
  notes: string;
}

interface FormErrors {
  amount?: string;
  date?: string;
  description?: string;
}

export default function ExpenseForm({ expense }: ExpenseFormProps) {
  const router = useRouter();
  const isEditing = !!expense;

  const [values, setValues] = useState<FormValues>({
    amount: expense ? String(expense.amount) : '',
    date: expense ? expense.date : getTodayString(),
    category: expense ? expense.category : 'Food',
    description: expense ? expense.description : '',
    notes: expense ? (expense.notes ?? '') : '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    const amt = parseFloat(values.amount);
    if (!values.amount || isNaN(amt) || amt <= 0) {
      errs.amount = 'Please enter a valid amount greater than $0.';
    }
    if (!values.date) {
      errs.date = 'Please select a date.';
    }
    if (!values.description.trim()) {
      errs.description = 'Please enter a description.';
    }
    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(parseFloat(values.amount).toFixed(2)),
        date: values.date,
        category: values.category,
        description: values.description.trim(),
        notes: values.notes.trim() || undefined,
      };

      if (isEditing && expense) {
        updateExpense(expense.id, payload);
      } else {
        addExpense(payload);
      }

      router.push('/expenses');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Amount */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500 font-medium pointer-events-none">
            $
          </span>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={values.amount}
            onChange={handleChange}
            placeholder="0.00"
            className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
              errors.amount ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <input
          id="description"
          name="description"
          type="text"
          value={values.description}
          onChange={handleChange}
          placeholder="What did you spend on?"
          className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
            errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Category
        </label>
        <div className="relative">
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={handleChange}
            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
          >
            {CATEGORY_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORIES[cat].icon} {cat}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
      </div>

      {/* Date */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={values.date}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
            errors.date ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
          }`}
        />
        {errors.date && (
          <p className="mt-1 text-xs text-red-600">{errors.date}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Notes{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Any additional details..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? 'Saving...'
            : isEditing
              ? 'Save Changes'
              : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
