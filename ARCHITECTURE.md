# Architecture & Implementation Notes

## Project Setup

Manually scaffolded Next.js 14 (couldn't use `create-next-app` interactively since the repo already had files). Chose **App Router** over Pages Router for better server/client component separation. No chart library, no UI component library — everything built with Tailwind CSS to keep the bundle lean.

## Data Layer (`src/lib/`)

**Decision: localStorage over a backend** — simple demo scope, no auth or server needed. All reads/writes go through `storage.ts` as a single access point so it's easy to swap in a real API later.

- `types.ts` — single source of truth for `Expense`, `Category`, and `ExpenseFilters` shapes
- `storage.ts` — CRUD functions + `seedSampleData()` that runs once on first visit so the dashboard isn't empty
- `utils.ts` — pure functions for formatting, aggregation, filtering/sorting, and CSV export
- `categories.ts` — category metadata (colors, Tailwind classes, emoji) centralized so every component references the same values

## Routing Structure

| Route | Rendering | Notes |
|---|---|---|
| `/` | Static | Dashboard reads data client-side |
| `/expenses` | Static | Same pattern |
| `/expenses/new` | Static | |
| `/expenses/[id]` | Dynamic (server-rendered) | Needs the ID param at request time |

## Component Architecture

**Key decision: keep `layout.tsx` a server component.** Navigation is extracted into its own `'use client'` component so the root layout stays server-rendered. All localStorage access lives in leaf components, not the layout.

```
layout.tsx (server)
  └── Navigation.tsx (client) ← usePathname for active link highlighting
  └── {page content}
      ├── page.tsx (server shell)
      │     └── client components that actually read localStorage
```

**Shared `ExpenseForm`** handles both add and edit — it accepts an optional `expense` prop. If present, it pre-fills and updates on submit; if absent, it creates a new expense.

## UI & Design Decisions

- **Indigo-600** as primary action color — professional, distinct from the per-category colors
- **Per-category color system** — each category has a consistent color used across badges, chart bars, and cards (defined once in `categories.ts`)
- **CSS-only bar chart** — horizontal bars sized with inline `width` percentages; no canvas or SVG needed
- **Sidebar on desktop, bottom nav on mobile** — standard mobile app pattern, handled with Tailwind `hidden`/`md:flex` breakpoints
- **Delete confirmation modal** — prevents accidental deletes by showing expense details before confirming

## What's Intentionally Absent

- No auth (out of scope for a demo)
- No backend/database (localStorage only)
- No animation library (Tailwind transitions only)
- No form library (manual validation to keep dependencies minimal)
