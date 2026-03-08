# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (use to verify no TS/lint errors)
npm run lint     # ESLint
```

## Architecture

Next.js 14 App Router app. All data is stored in `localStorage` under the key `expense-tracker-expenses`. No backend or database.

### Route Structure
- `/` — Dashboard with summary cards, category chart, recent expenses
- `/expenses` — Full expense list with search/filter/sort
- `/expenses/new` — Add expense form
- `/expenses/[id]` — Edit expense form (dynamic route, server-rendered on demand)

### Key Layers

**`src/lib/`**
- `types.ts` — `Expense`, `Category`, `ExpenseFilters` interfaces
- `storage.ts` — All localStorage CRUD (`getExpenses`, `addExpense`, `updateExpense`, `deleteExpense`). Also contains `seedSampleData()` which populates sample data on first run (called from dashboard).
- `utils.ts` — `formatCurrency`, `formatDate`, `getMonthlyTotal`, `getWeeklyTotal`, `getTotalByCategory`, `exportToCSV`, `filterAndSortExpenses`
- `categories.ts` — Category metadata (colors, Tailwind classes, emoji icons) for all 7 categories

**`src/components/`**
- `Navigation.tsx` — Sidebar on desktop (`'use client'`), bottom nav on mobile
- `ExpenseForm.tsx` — Shared add/edit form with inline validation (`'use client'`)
- `ExpenseList.tsx` — List with search, category filter, date range, sort (`'use client'`)
- `ExpenseCard.tsx` — Individual expense row with edit/delete buttons
- `CategoryChart.tsx` — CSS-based horizontal bar chart for spending by category
- `SummaryCard.tsx` — Reusable stat card (total, monthly, weekly, count)
- `DeleteModal.tsx` — Confirmation overlay for expense deletion
- `ExportButton.tsx` — Triggers CSV download via `exportToCSV()`

### Conventions
- All components using localStorage or browser APIs must be `'use client'`
- `layout.tsx` is a server component; client interactivity is isolated to leaf components
- localStorage access is guarded with `typeof window === 'undefined'` checks for SSR safety
- Primary color: indigo-600 (`#4F46E5`)
- Categories: Food, Transportation, Entertainment, Shopping, Bills, Health, Other
