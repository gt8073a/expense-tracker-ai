'use client';

import { Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';

interface CategoryChartProps {
  totals: Record<Category, number>;
}

export default function CategoryChart({ totals }: CategoryChartProps) {
  const entries = Object.entries(totals) as [Category, number][];
  const sorted = entries
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a);

  const grandTotal = sorted.reduce((sum, [, v]) => sum + v, 0);

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No spending data yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map(([category, amount]) => {
        const pct = grandTotal > 0 ? (amount / grandTotal) * 100 : 0;
        const cat = CATEGORIES[category];
        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">
                  {category}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {pct.toFixed(1)}%
                </span>
                <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
