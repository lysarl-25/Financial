# Financial

A personal financial management dashboard built with Vue 3, TypeScript, and Vite. Track income, expenses, budgets, and trends with a clean, responsive interface that works on desktop, tablet, and mobile.

## Tech Stack

- Vue 3 (Composition API) + TypeScript
- Vite
- Vue Router
- Pinia (state management)
- Tailwind CSS
- Chart.js / vue-chartjs
- Supabase Auth + Postgres
- Lucide Vue icons

## Installation

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Other scripts:

```bash
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
npm run lint       # lint and auto-fix
```

## Environment Variables

Configured in `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

- `VITE_SUPABASE_URL` - your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` - the public anon key from your Supabase project settings.

## Project Structure

```
financial/
├── src/
│   ├── assets/          # global CSS (Tailwind layers + design tokens)
│   ├── components/
│   │   ├── layout/       # Sidebar, Header, MobileMenu
│   │   ├── dashboard/    # StatCard, charts, RecentTransactions
│   │   ├── transactions/ # Table, Form, Filters, Modal
│   │   ├── budgets/      # BudgetCard, BudgetForm
│   │   └── common/       # Button, Modal, Input, Select, Loading, EmptyState, ConfirmDialog, ToastHost
│   ├── data/             # mock transactions, categories, budgets
│   ├── layouts/          # DefaultLayout (sidebar + header shell)
│   ├── pages/            # one file per route
│   ├── router/           # Vue Router config
│   ├── services/         # Supabase-backed service layer with small mappers
│   ├── stores/           # Pinia stores
│   ├── types/            # shared TypeScript interfaces
│   ├── utils/            # calculations, formatting, date ranges, debounce, Chart.js setup
│   ├── App.vue
│   └── main.ts
├── public/
├── .env
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Available Routes

| Route          | Page                                             |
|----------------|---------------------------------------------------|
| `/`            | Redirects to `/dashboard`                          |
| `/dashboard`   | Overview: balance, income, expenses, savings, charts, budget progress |
| `/transactions`| All transactions with search, filters, sort, pagination |
| `/income`      | Income-only transactions and total                 |
| `/expenses`    | Expense-only transactions and total                 |
| `/budgets`     | Monthly category budgets with progress bars         |
| `/reports`     | Reports by date range: trends, cash flow, category breakdowns |
| `/categories`  | Manage income/expense categories, icons, and colors |
| `/settings`    | Profile, currency, date format, theme, notifications |

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor or with the Supabase CLI.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
4. Deploy the `delete-user` Edge Function (used by the admin panel to permanently delete users):
   ```bash
   supabase functions deploy delete-user
   ```
5. Start the app with `npm run dev` and sign up or sign in at `/login`.

Optional demo seeding:

1. Run `supabase/seed.sql`.
2. Call `select public.seed_financial_demo_data('<user-id>');` for the user you want to preload.
3. This inserts the mock categories, budgets, and transactions for that account.

## How The Data Layer Works

Every entity now has:

1. **A type** in `src/types/index.ts`.
2. **A service** in `src/services/*.ts` that talks to Supabase and keeps the existing `list`, `create`, `update`, `remove` API.
3. **A Pinia store** in `src/stores/*.ts` that holds state and exposes derived getters.

Financial calculations such as totals, balance, savings, and percentage change still live in `src/utils/calculations.ts`.

## Notes

- All CRUD operations (transactions, budgets, categories) now go through Supabase.
- Categories in use by existing transactions cannot be deleted; the store checks the database before removing them.
- Dashboard stats, budget progress, and charts still recompute reactively whenever transactions change.
- Profile settings are persisted in the `profiles` table and auth session state lives in Supabase Auth.
