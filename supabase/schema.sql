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

-- ============================================================
-- Users & activity tracking (admin management)
-- ============================================================

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null default 'app',
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists users_created_at_idx on public.users(created_at desc);
create index if not exists activity_user_idx on public.user_activity_log(user_id, created_at desc);
create index if not exists activity_time_idx on public.user_activity_log(created_at desc);

-- Auto-create a users row whenever a new auth user registers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper to check whether the current user is an admin.
-- Security definer avoids RLS recursion (the policy on public.users
-- cannot itself read public.users directly).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

alter table public.users enable row level security;
alter table public.user_activity_log enable row level security;

drop policy if exists users_select on public.users;
drop policy if exists users_update on public.users;
drop policy if exists users_admin_select on public.users;
drop policy if exists users_admin_update on public.users;

drop policy if exists activity_insert on public.user_activity_log;
drop policy if exists activity_user_select on public.user_activity_log;
drop policy if exists activity_admin_select on public.user_activity_log;

-- Users: everyone may read and update their own row; admins may read/update all.
create policy users_select
  on public.users
  for select
  using (id = auth.uid());

create policy users_update
  on public.users
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy users_admin_select
  on public.users
  for select
  using (public.is_admin());

create policy users_admin_update
  on public.users
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Activity log: users may insert their own entries and read their own history;
-- admins may read all history.
create policy activity_insert
  on public.user_activity_log
  for insert
  with check (user_id = auth.uid());

create policy activity_user_select
  on public.user_activity_log
  for select
  using (user_id = auth.uid());

create policy activity_admin_select
  on public.user_activity_log
  for select
  using (public.is_admin());

-- Backfill any users that registered before the trigger existed.
insert into public.users (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do nothing;

-- Promote the first admin. Replace YOUR_EMAIL with the admin's address.
-- update public.users set role = 'admin'
-- where id = (select id from auth.users where email = 'YOUR_EMAIL' limit 1);
