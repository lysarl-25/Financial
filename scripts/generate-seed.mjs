import { readFileSync, writeFileSync } from 'node:fs'
import { transformSync } from 'esbuild'

async function loadTsModule(relativePath) {
  const source = readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')
  const transformed = transformSync(source, {
    loader: 'ts',
    format: 'esm',
    target: 'es2020',
  })
  const dataUrl = `data:text/javascript;base64,${Buffer.from(transformed.code).toString('base64')}`
  return import(dataUrl)
}

function sql(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return `'${String(value).replace(/'/g, "''")}'`
}

const [{ categories }, { budgets }, { transactions }] = await Promise.all([
  loadTsModule('src/data/categories.ts'),
  loadTsModule('src/data/budgets.ts'),
  loadTsModule('src/data/transactions.ts'),
])

const categoryRows = categories.map((category) => [
  sql(category.id),
  sql(category.name),
  sql(category.type),
  sql(category.icon ?? null),
  sql(category.color ?? null),
])

const budgetRows = budgets.map((budget) => [
  sql(budget.categoryId),
  sql(budget.amount),
  sql(budget.month),
])

const transactionRows = transactions.map((transaction) => [
  sql(transaction.id),
  sql(transaction.date),
  sql(transaction.description),
  sql(transaction.type),
  sql(transaction.categoryId),
  sql(transaction.amount),
  sql(transaction.paymentMethod ?? null),
  sql(transaction.note ?? null),
  sql(transaction.createdAt),
  sql(transaction.updatedAt),
])

const categoryValuesSql = categoryRows.map((row) => `    (${row.join(', ')})`).join(',\n')
const budgetValuesSql = budgetRows.map((row) => `    (${row.join(', ')})`).join(',\n')
const transactionValuesSql = transactionRows.map((row) => `    (${row.join(', ')})`).join(',\n')

const seedSql = `-- Financial demo seed data
-- Run after the schema migration, then call:
-- select public.seed_financial_demo_data('<user-id>');

create or replace function public.seed_financial_demo_data(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, profile_name, currency, date_format, theme, notifications)
  values (
    target_user_id,
    'Demo User',
    'USD',
    'DD/MM/YYYY',
    'light',
    '{"budgetAlerts":true,"weeklySummary":true,"largeTransactions":false}'::jsonb
  )
  on conflict (id) do update
    set profile_name = excluded.profile_name,
        currency = excluded.currency,
        date_format = excluded.date_format,
        theme = excluded.theme,
        notifications = excluded.notifications;

  if not exists (
    select 1
    from public.categories
    where user_id = target_user_id
  ) then
    insert into public.categories (user_id, name, type, icon, color)
    select target_user_id, seed_categories.name, seed_categories.type, seed_categories.icon, seed_categories.color
    from (
      values
${categoryValuesSql}
    ) as seed_categories(old_id, name, type, icon, color);

    with seed_budgets(old_category_id, amount, month) as (
${budgetValuesSql}
    ),
    mapped_categories as (
      select s.old_id, i.id
      from (
        values
${categoryValuesSql}
      ) as s(old_id, name, type, icon, color)
      join public.categories i
        on i.user_id = target_user_id
       and i.name = s.name
       and i.type = s.type
       and coalesce(i.icon, '') = coalesce(s.icon, '')
       and coalesce(i.color, '') = coalesce(s.color, '')
    )
    insert into public.budgets (user_id, category_id, amount, month)
    select target_user_id, mapped_categories.id, seed_budgets.amount, seed_budgets.month
    from seed_budgets
    join mapped_categories on mapped_categories.old_id = seed_budgets.old_category_id;

    with seed_transactions(id, date, description, type, category_id, amount, payment_method, note, created_at, updated_at) as (
${transactionValuesSql}
    ),
    mapped_categories as (
      select s.old_id, i.id
      from (
        values
${categoryValuesSql}
      ) as s(old_id, name, type, icon, color)
      join public.categories i
        on i.user_id = target_user_id
       and i.name = s.name
       and i.type = s.type
       and coalesce(i.icon, '') = coalesce(s.icon, '')
       and coalesce(i.color, '') = coalesce(s.color, '')
    )
    insert into public.transactions (
      id,
      user_id,
      date,
      description,
      type,
      category_id,
      amount,
      payment_method,
      note,
      created_at,
      updated_at
    )
    select
      seed_transactions.id,
      target_user_id,
      seed_transactions.date,
      seed_transactions.description,
      seed_transactions.type,
      mapped_categories.id,
      seed_transactions.amount,
      seed_transactions.payment_method,
      seed_transactions.note,
      seed_transactions.created_at,
      seed_transactions.updated_at
    from seed_transactions
    join mapped_categories on mapped_categories.old_id = seed_transactions.category_id;
  end if;
end;
$$;
`

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), seedSql)
