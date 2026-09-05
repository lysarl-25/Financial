-- Financial app Supabase schema
-- Run this in the Supabase SQL editor or with the Supabase CLI.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  profile_name text,
  currency text not null default 'USD',
  date_format text not null default 'DD/MM/YYYY',
  theme text not null default 'light',
  notifications jsonb not null default '{"budgetAlerts":true,"weeklySummary":true,"largeTransactions":false}'::jsonb
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  description text not null,
  type text not null check (type in ('income', 'expense')),
  category_id uuid references public.categories(id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  payment_method text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  month text not null,
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

create index if not exists categories_user_id_idx on public.categories(user_id);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_category_id_idx on public.transactions(category_id);
create index if not exists transactions_date_idx on public.transactions(date desc);
create index if not exists budgets_user_id_idx on public.budgets(user_id);
create index if not exists budgets_month_idx on public.budgets(month);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists profiles_delete on public.profiles;

drop policy if exists categories_select on public.categories;
drop policy if exists categories_insert on public.categories;
drop policy if exists categories_update on public.categories;
drop policy if exists categories_delete on public.categories;

drop policy if exists transactions_select on public.transactions;
drop policy if exists transactions_insert on public.transactions;
drop policy if exists transactions_update on public.transactions;
drop policy if exists transactions_delete on public.transactions;

drop policy if exists budgets_select on public.budgets;
drop policy if exists budgets_insert on public.budgets;
drop policy if exists budgets_update on public.budgets;
drop policy if exists budgets_delete on public.budgets;

create policy profiles_select
  on public.profiles
  for select
  using (id = auth.uid());

create policy profiles_insert
  on public.profiles
  for insert
  with check (id = auth.uid());

create policy profiles_update
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_delete
  on public.profiles
  for delete
  using (id = auth.uid());

create policy categories_select
  on public.categories
  for select
  using (user_id = auth.uid());

create policy categories_insert
  on public.categories
  for insert
  with check (user_id = auth.uid());

create policy categories_update
  on public.categories
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy categories_delete
  on public.categories
  for delete
  using (user_id = auth.uid());

create policy transactions_select
  on public.transactions
  for select
  using (user_id = auth.uid());

create policy transactions_insert
  on public.transactions
  for insert
  with check (user_id = auth.uid());

create policy transactions_update
  on public.transactions
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy transactions_delete
  on public.transactions
  for delete
  using (user_id = auth.uid());

create policy budgets_select
  on public.budgets
  for select
  using (user_id = auth.uid());

create policy budgets_insert
  on public.budgets
  for insert
  with check (user_id = auth.uid());

create policy budgets_update
  on public.budgets
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy budgets_delete
  on public.budgets
  for delete
  using (user_id = auth.uid());
