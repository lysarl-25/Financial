-- Financial demo seed data
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
    ('cat-inc-salary', 'Salary', 'income', 'Wallet', '#0f9d70'),
    ('cat-inc-freelance', 'Freelance', 'income', 'Laptop', '#2e5b54'),
    ('cat-inc-business', 'Business', 'income', 'Briefcase', '#3f716a'),
    ('cat-inc-investment', 'Investment', 'income', 'TrendingUp', '#0b7a58'),
    ('cat-inc-bonus', 'Bonus', 'income', 'Gift', '#5f8f85'),
    ('cat-inc-other', 'Other', 'income', 'CircleDollarSign', '#8fb4ac'),
    ('cat-exp-food', 'Food', 'expense', 'UtensilsCrossed', '#e0603f'),
    ('cat-exp-transport', 'Transportation', 'expense', 'Car', '#b8482c'),
    ('cat-exp-shopping', 'Shopping', 'expense', 'ShoppingBag', '#d9784f'),
    ('cat-exp-bills', 'Bills', 'expense', 'Receipt', '#c25a38'),
    ('cat-exp-entertainment', 'Entertainment', 'expense', 'Film', '#e2825f'),
    ('cat-exp-health', 'Health', 'expense', 'HeartPulse', '#cf6845'),
    ('cat-exp-education', 'Education', 'expense', 'GraduationCap', '#a8492e'),
    ('cat-exp-rent', 'Rent', 'expense', 'Home', '#9c4429'),
    ('cat-exp-travel', 'Travel', 'expense', 'Plane', '#e6957a'),
    ('cat-exp-other', 'Other', 'expense', 'MoreHorizontal', '#c99280')
    ) as seed_categories(old_id, name, type, icon, color);

    with seed_budgets(old_category_id, amount, month) as (
      values
    ('bud-0001', 'cat-exp-food', 500, '2026-08'),
    ('bud-0002', 'cat-exp-transport', 200, '2026-08'),
    ('bud-0003', 'cat-exp-shopping', 250, '2026-08'),
    ('bud-0004', 'cat-exp-bills', 220, '2026-08'),
    ('bud-0005', 'cat-exp-entertainment', 120, '2026-08'),
    ('bud-0006', 'cat-exp-health', 150, '2026-08'),
    ('bud-0007', 'cat-exp-rent', 1200, '2026-08'),
    ('bud-0008', 'cat-exp-other', 100, '2026-08')
    ),
    mapped_categories as (
      select s.old_id, i.id
      from (
        values
    ('cat-inc-salary', 'Salary', 'income', 'Wallet', '#0f9d70'),
    ('cat-inc-freelance', 'Freelance', 'income', 'Laptop', '#2e5b54'),
    ('cat-inc-business', 'Business', 'income', 'Briefcase', '#3f716a'),
    ('cat-inc-investment', 'Investment', 'income', 'TrendingUp', '#0b7a58'),
    ('cat-inc-bonus', 'Bonus', 'income', 'Gift', '#5f8f85'),
    ('cat-inc-other', 'Other', 'income', 'CircleDollarSign', '#8fb4ac'),
    ('cat-exp-food', 'Food', 'expense', 'UtensilsCrossed', '#e0603f'),
    ('cat-exp-transport', 'Transportation', 'expense', 'Car', '#b8482c'),
    ('cat-exp-shopping', 'Shopping', 'expense', 'ShoppingBag', '#d9784f'),
    ('cat-exp-bills', 'Bills', 'expense', 'Receipt', '#c25a38'),
    ('cat-exp-entertainment', 'Entertainment', 'expense', 'Film', '#e2825f'),
    ('cat-exp-health', 'Health', 'expense', 'HeartPulse', '#cf6845'),
    ('cat-exp-education', 'Education', 'expense', 'GraduationCap', '#a8492e'),
    ('cat-exp-rent', 'Rent', 'expense', 'Home', '#9c4429'),
    ('cat-exp-travel', 'Travel', 'expense', 'Plane', '#e6957a'),
    ('cat-exp-other', 'Other', 'expense', 'MoreHorizontal', '#c99280')
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
      values
    ('txn-0125', '2026-08-05', 'Weekly Groceries', 'expense', 'cat-exp-food', 140.22, 'Bank Transfer', '', '2026-08-05T09:00:00.000Z', '2026-08-05T09:00:00.000Z'),
    ('txn-0128', '2026-08-04', 'Weekly Groceries', 'expense', 'cat-exp-food', 82.24, 'Bank Transfer', '', '2026-08-04T09:00:00.000Z', '2026-08-04T09:00:00.000Z'),
    ('txn-0122', '2026-08-03', 'Restaurant Dinner', 'expense', 'cat-exp-food', 88.33, 'Bank Transfer', '', '2026-08-03T09:00:00.000Z', '2026-08-03T09:00:00.000Z'),
    ('txn-0126', '2026-08-03', 'Restaurant Dinner', 'expense', 'cat-exp-food', 38.68, 'Bank Transfer', '', '2026-08-03T09:00:00.000Z', '2026-08-03T09:00:00.000Z'),
    ('txn-0129', '2026-08-03', 'Metro Pass', 'expense', 'cat-exp-transport', 32.21, 'Cash', '', '2026-08-03T09:00:00.000Z', '2026-08-03T09:00:00.000Z'),
    ('txn-0130', '2026-08-22', 'Ride Share', 'expense', 'cat-exp-transport', 14.02, 'Bank Transfer', '', '2026-08-22T09:00:00.000Z', '2026-08-22T09:00:00.000Z'),
    ('txn-0135', '2026-08-20', 'Books', 'expense', 'cat-exp-education', 16.72, 'Bank Transfer', '', '2026-08-20T09:00:00.000Z', '2026-08-20T09:00:00.000Z'),
    ('txn-0133', '2026-08-18', 'Concert Tickets', 'expense', 'cat-exp-entertainment', 147.93, 'Debit Card', '', '2026-08-18T09:00:00.000Z', '2026-08-18T09:00:00.000Z'),
    ('txn-0132', '2026-08-17', 'Electronics Purchase', 'expense', 'cat-exp-shopping', 166.41, 'Bank Transfer', '', '2026-08-17T09:00:00.000Z', '2026-08-17T09:00:00.000Z'),
    ('txn-0114', '2026-08-15', 'Freelance Project', 'income', 'cat-inc-freelance', 504.63, 'Bank Transfer', '', '2026-08-15T09:00:00.000Z', '2026-08-15T09:00:00.000Z'),
    ('txn-0115', '2026-08-12', 'Performance Bonus', 'income', 'cat-inc-bonus', 216.73, 'Bank Transfer', '', '2026-08-12T09:00:00.000Z', '2026-08-12T09:00:00.000Z'),
    ('txn-0124', '2026-08-11', 'Restaurant Dinner', 'expense', 'cat-exp-food', 71.56, 'Cash', '', '2026-08-11T09:00:00.000Z', '2026-08-11T09:00:00.000Z'),
    ('txn-0120', '2026-08-10', 'Water Bill', 'expense', 'cat-exp-bills', 28.84, 'Bank Transfer', '', '2026-08-10T09:00:00.000Z', '2026-08-10T09:00:00.000Z'),
    ('txn-0131', '2026-08-09', 'Ride Share', 'expense', 'cat-exp-transport', 18.76, 'Debit Card', '', '2026-08-09T09:00:00.000Z', '2026-08-09T09:00:00.000Z'),
    ('txn-0121', '2026-08-08', 'Restaurant Dinner', 'expense', 'cat-exp-food', 84.8, 'Debit Card', '', '2026-08-08T09:00:00.000Z', '2026-08-08T09:00:00.000Z'),
    ('txn-0118', '2026-08-05', 'Electricity Bill', 'expense', 'cat-exp-bills', 103.43, 'Cash', '', '2026-08-05T09:00:00.000Z', '2026-08-05T09:00:00.000Z'),
    ('txn-0134', '2026-08-04', 'Streaming Subscription', 'expense', 'cat-exp-entertainment', 19.27, 'Credit Card', '', '2026-08-04T09:00:00.000Z', '2026-08-04T09:00:00.000Z'),
    ('txn-0119', '2026-08-03', 'Phone Bill', 'expense', 'cat-exp-bills', 47.05, 'Bank Transfer', '', '2026-08-03T09:00:00.000Z', '2026-08-03T09:00:00.000Z'),
    ('txn-0117', '2026-08-02', 'Internet Bill', 'expense', 'cat-exp-bills', 35.0, 'Cash', '', '2026-08-02T09:00:00.000Z', '2026-08-02T09:00:00.000Z'),
    ('txn-0127', '2026-08-02', 'Grocery Shopping', 'expense', 'cat-exp-food', 78.25, 'Credit Card', '', '2026-08-02T09:00:00.000Z', '2026-08-02T09:00:00.000Z'),
    ('txn-0113', '2026-08-01', 'Salary', 'income', 'cat-inc-salary', 2093, 'Credit Card', '', '2026-08-01T09:00:00.000Z', '2026-08-01T09:00:00.000Z'),
    ('txn-0116', '2026-08-01', 'Monthly Rent', 'expense', 'cat-exp-rent', 1200, 'Credit Card', '', '2026-08-01T09:00:00.000Z', '2026-08-01T09:00:00.000Z'),
    ('txn-0123', '2026-08-01', 'Restaurant Dinner', 'expense', 'cat-exp-food', 81.7, 'Debit Card', '', '2026-08-01T09:00:00.000Z', '2026-08-01T09:00:00.000Z'),
    ('txn-0108', '2026-07-28', 'Clothing Store', 'expense', 'cat-exp-shopping', 112.5, 'Bank Transfer', '', '2026-07-28T09:00:00.000Z', '2026-07-28T09:00:00.000Z'),
    ('txn-0109', '2026-07-28', 'Concert Tickets', 'expense', 'cat-exp-entertainment', 93.74, 'Credit Card', '', '2026-07-28T09:00:00.000Z', '2026-07-28T09:00:00.000Z'),
    ('txn-0101', '2026-07-27', 'Coffee Shop', 'expense', 'cat-exp-food', 5.26, 'Debit Card', '', '2026-07-27T09:00:00.000Z', '2026-07-27T09:00:00.000Z'),
    ('txn-0102', '2026-07-26', 'Metro Pass', 'expense', 'cat-exp-transport', 44.47, 'Debit Card', '', '2026-07-26T09:00:00.000Z', '2026-07-26T09:00:00.000Z'),
    ('txn-0096', '2026-07-25', 'Coffee Shop', 'expense', 'cat-exp-food', 7.66, 'Credit Card', '', '2026-07-25T09:00:00.000Z', '2026-07-25T09:00:00.000Z'),
    ('txn-0111', '2026-07-21', 'Books', 'expense', 'cat-exp-education', 49.7, 'Bank Transfer', '', '2026-07-21T09:00:00.000Z', '2026-07-21T09:00:00.000Z'),
    ('txn-0097', '2026-07-20', 'Grocery Shopping', 'expense', 'cat-exp-food', 40.93, 'Debit Card', '', '2026-07-20T09:00:00.000Z', '2026-07-20T09:00:00.000Z'),
    ('txn-0103', '2026-07-18', 'Gas Station', 'expense', 'cat-exp-transport', 56.71, 'Credit Card', '', '2026-07-18T09:00:00.000Z', '2026-07-18T09:00:00.000Z'),
    ('txn-0110', '2026-07-14', 'Movie Tickets', 'expense', 'cat-exp-entertainment', 17.31, 'Debit Card', '', '2026-07-14T09:00:00.000Z', '2026-07-14T09:00:00.000Z'),
    ('txn-0112', '2026-07-14', 'Miscellaneous', 'expense', 'cat-exp-other', 48.62, 'Bank Transfer', '', '2026-07-14T09:00:00.000Z', '2026-07-14T09:00:00.000Z'),
    ('txn-0099', '2026-07-12', 'Coffee Shop', 'expense', 'cat-exp-food', 5.06, 'Debit Card', '', '2026-07-12T09:00:00.000Z', '2026-07-12T09:00:00.000Z'),
    ('txn-0100', '2026-07-12', 'Grocery Shopping', 'expense', 'cat-exp-food', 127.93, 'Bank Transfer', '', '2026-07-12T09:00:00.000Z', '2026-07-12T09:00:00.000Z'),
    ('txn-0107', '2026-07-11', 'Home Goods', 'expense', 'cat-exp-shopping', 41.06, 'Bank Transfer', '', '2026-07-11T09:00:00.000Z', '2026-07-11T09:00:00.000Z'),
    ('txn-0092', '2026-07-10', 'Internet Bill', 'expense', 'cat-exp-bills', 35.0, 'Debit Card', '', '2026-07-10T09:00:00.000Z', '2026-07-10T09:00:00.000Z'),
    ('txn-0106', '2026-07-10', 'Home Goods', 'expense', 'cat-exp-shopping', 35.54, 'Cash', '', '2026-07-10T09:00:00.000Z', '2026-07-10T09:00:00.000Z'),
    ('txn-0095', '2026-07-08', 'Water Bill', 'expense', 'cat-exp-bills', 25.97, 'Cash', '', '2026-07-08T09:00:00.000Z', '2026-07-08T09:00:00.000Z'),
    ('txn-0094', '2026-07-07', 'Phone Bill', 'expense', 'cat-exp-bills', 35.11, 'Cash', '', '2026-07-07T09:00:00.000Z', '2026-07-07T09:00:00.000Z'),
    ('txn-0098', '2026-07-07', 'Grocery Shopping', 'expense', 'cat-exp-food', 47.33, 'Debit Card', '', '2026-07-07T09:00:00.000Z', '2026-07-07T09:00:00.000Z'),
    ('txn-0093', '2026-07-06', 'Electricity Bill', 'expense', 'cat-exp-bills', 65.56, 'Cash', '', '2026-07-06T09:00:00.000Z', '2026-07-06T09:00:00.000Z'),
    ('txn-0090', '2026-07-05', 'Freelance Project', 'income', 'cat-inc-freelance', 526.3, 'Credit Card', '', '2026-07-05T09:00:00.000Z', '2026-07-05T09:00:00.000Z'),
    ('txn-0104', '2026-07-04', 'Metro Pass', 'expense', 'cat-exp-transport', 57.27, 'Bank Transfer', '', '2026-07-04T09:00:00.000Z', '2026-07-04T09:00:00.000Z'),
    ('txn-0105', '2026-07-04', 'Ride Share', 'expense', 'cat-exp-transport', 15.14, 'Bank Transfer', '', '2026-07-04T09:00:00.000Z', '2026-07-04T09:00:00.000Z'),
    ('txn-0089', '2026-07-02', 'Salary', 'income', 'cat-inc-salary', 2010, 'Bank Transfer', '', '2026-07-02T09:00:00.000Z', '2026-07-02T09:00:00.000Z'),
    ('txn-0091', '2026-07-01', 'Monthly Rent', 'expense', 'cat-exp-rent', 1200, 'Cash', '', '2026-07-01T09:00:00.000Z', '2026-07-01T09:00:00.000Z'),
    ('txn-0076', '2026-06-28', 'Weekly Groceries', 'expense', 'cat-exp-food', 140.8, 'Cash', '', '2026-06-28T09:00:00.000Z', '2026-06-28T09:00:00.000Z'),
    ('txn-0082', '2026-06-26', 'Metro Pass', 'expense', 'cat-exp-transport', 57.06, 'Bank Transfer', '', '2026-06-26T09:00:00.000Z', '2026-06-26T09:00:00.000Z'),
    ('txn-0078', '2026-06-25', 'Grocery Shopping', 'expense', 'cat-exp-food', 136.9, 'Bank Transfer', '', '2026-06-25T09:00:00.000Z', '2026-06-25T09:00:00.000Z'),
    ('txn-0083', '2026-06-23', 'Car Maintenance', 'expense', 'cat-exp-transport', 98.49, 'Cash', '', '2026-06-23T09:00:00.000Z', '2026-06-23T09:00:00.000Z'),
    ('txn-0077', '2026-06-18', 'Grocery Shopping', 'expense', 'cat-exp-food', 45.06, 'Bank Transfer', '', '2026-06-18T09:00:00.000Z', '2026-06-18T09:00:00.000Z'),
    ('txn-0085', '2026-06-18', 'Clothing Store', 'expense', 'cat-exp-shopping', 99.5, 'Cash', '', '2026-06-18T09:00:00.000Z', '2026-06-18T09:00:00.000Z'),
    ('txn-0087', '2026-06-17', 'Gym Membership', 'expense', 'cat-exp-health', 57.18, 'Debit Card', '', '2026-06-17T09:00:00.000Z', '2026-06-17T09:00:00.000Z'),
    ('txn-0079', '2026-06-16', 'Restaurant Dinner', 'expense', 'cat-exp-food', 31.64, 'Bank Transfer', '', '2026-06-16T09:00:00.000Z', '2026-06-16T09:00:00.000Z'),
    ('txn-0068', '2026-06-14', 'Dividend Payout', 'income', 'cat-inc-investment', 138.57, 'Debit Card', '', '2026-06-14T09:00:00.000Z', '2026-06-14T09:00:00.000Z'),
    ('txn-0080', '2026-06-13', 'Weekly Groceries', 'expense', 'cat-exp-food', 81.37, 'Debit Card', '', '2026-06-13T09:00:00.000Z', '2026-06-13T09:00:00.000Z'),
    ('txn-0067', '2026-06-10', 'Freelance Project', 'income', 'cat-inc-freelance', 674.87, 'Debit Card', '', '2026-06-10T09:00:00.000Z', '2026-06-10T09:00:00.000Z'),
    ('txn-0084', '2026-06-10', 'Car Maintenance', 'expense', 'cat-exp-transport', 76.32, 'Debit Card', '', '2026-06-10T09:00:00.000Z', '2026-06-10T09:00:00.000Z'),
    ('txn-0074', '2026-06-09', 'Restaurant Dinner', 'expense', 'cat-exp-food', 49.53, 'Debit Card', '', '2026-06-09T09:00:00.000Z', '2026-06-09T09:00:00.000Z'),
    ('txn-0071', '2026-06-07', 'Electricity Bill', 'expense', 'cat-exp-bills', 48.94, 'Debit Card', '', '2026-06-07T09:00:00.000Z', '2026-06-07T09:00:00.000Z'),
    ('txn-0073', '2026-06-05', 'Water Bill', 'expense', 'cat-exp-bills', 26.22, 'Bank Transfer', '', '2026-06-05T09:00:00.000Z', '2026-06-05T09:00:00.000Z'),
    ('txn-0070', '2026-06-03', 'Internet Bill', 'expense', 'cat-exp-bills', 35.0, 'Credit Card', '', '2026-06-03T09:00:00.000Z', '2026-06-03T09:00:00.000Z'),
    ('txn-0072', '2026-06-03', 'Phone Bill', 'expense', 'cat-exp-bills', 50.01, 'Credit Card', '', '2026-06-03T09:00:00.000Z', '2026-06-03T09:00:00.000Z'),
    ('txn-0075', '2026-06-03', 'Weekly Groceries', 'expense', 'cat-exp-food', 84.98, 'Bank Transfer', '', '2026-06-03T09:00:00.000Z', '2026-06-03T09:00:00.000Z'),
    ('txn-0088', '2026-06-03', 'Online Course', 'expense', 'cat-exp-education', 105.13, 'Cash', '', '2026-06-03T09:00:00.000Z', '2026-06-03T09:00:00.000Z'),
    ('txn-0066', '2026-06-02', 'Salary', 'income', 'cat-inc-salary', 2097, 'Bank Transfer', '', '2026-06-02T09:00:00.000Z', '2026-06-02T09:00:00.000Z'),
    ('txn-0086', '2026-06-02', 'Concert Tickets', 'expense', 'cat-exp-entertainment', 74.5, 'Bank Transfer', '', '2026-06-02T09:00:00.000Z', '2026-06-02T09:00:00.000Z'),
    ('txn-0069', '2026-06-01', 'Monthly Rent', 'expense', 'cat-exp-rent', 1200, 'Bank Transfer', '', '2026-06-01T09:00:00.000Z', '2026-06-01T09:00:00.000Z'),
    ('txn-0081', '2026-06-01', 'Grocery Shopping', 'expense', 'cat-exp-food', 56.46, 'Bank Transfer', '', '2026-06-01T09:00:00.000Z', '2026-06-01T09:00:00.000Z'),
    ('txn-0056', '2026-05-28', 'Restaurant Dinner', 'expense', 'cat-exp-food', 38.55, 'Bank Transfer', '', '2026-05-28T09:00:00.000Z', '2026-05-28T09:00:00.000Z'),
    ('txn-0061', '2026-05-19', 'Gas Station', 'expense', 'cat-exp-transport', 43.52, 'Bank Transfer', '', '2026-05-19T09:00:00.000Z', '2026-05-19T09:00:00.000Z'),
    ('txn-0054', '2026-05-18', 'Grocery Shopping', 'expense', 'cat-exp-food', 137.8, 'Bank Transfer', '', '2026-05-18T09:00:00.000Z', '2026-05-18T09:00:00.000Z'),
    ('txn-0057', '2026-05-18', 'Weekly Groceries', 'expense', 'cat-exp-food', 156.44, 'Bank Transfer', '', '2026-05-18T09:00:00.000Z', '2026-05-18T09:00:00.000Z'),
    ('txn-0059', '2026-05-17', 'Metro Pass', 'expense', 'cat-exp-transport', 37.52, 'Bank Transfer', '', '2026-05-17T09:00:00.000Z', '2026-05-17T09:00:00.000Z'),
    ('txn-0053', '2026-05-16', 'Grocery Shopping', 'expense', 'cat-exp-food', 48.57, 'Debit Card', '', '2026-05-16T09:00:00.000Z', '2026-05-16T09:00:00.000Z'),
    ('txn-0055', '2026-05-16', 'Restaurant Dinner', 'expense', 'cat-exp-food', 28.99, 'Credit Card', '', '2026-05-16T09:00:00.000Z', '2026-05-16T09:00:00.000Z'),
    ('txn-0058', '2026-05-13', 'Restaurant Dinner', 'expense', 'cat-exp-food', 69.91, 'Debit Card', '', '2026-05-13T09:00:00.000Z', '2026-05-13T09:00:00.000Z'),
    ('txn-0051', '2026-05-12', 'Grocery Shopping', 'expense', 'cat-exp-food', 51.19, 'Credit Card', '', '2026-05-12T09:00:00.000Z', '2026-05-12T09:00:00.000Z'),
    ('txn-0049', '2026-05-10', 'Phone Bill', 'expense', 'cat-exp-bills', 43.48, 'Debit Card', '', '2026-05-10T09:00:00.000Z', '2026-05-10T09:00:00.000Z'),
    ('txn-0052', '2026-05-08', 'Coffee Shop', 'expense', 'cat-exp-food', 5.92, 'Credit Card', '', '2026-05-08T09:00:00.000Z', '2026-05-08T09:00:00.000Z'),
    ('txn-0060', '2026-05-08', 'Car Maintenance', 'expense', 'cat-exp-transport', 70.57, 'Bank Transfer', '', '2026-05-08T09:00:00.000Z', '2026-05-08T09:00:00.000Z'),
    ('txn-0063', '2026-05-08', 'Home Goods', 'expense', 'cat-exp-shopping', 83.11, 'Debit Card', '', '2026-05-08T09:00:00.000Z', '2026-05-08T09:00:00.000Z'),
    ('txn-0050', '2026-05-07', 'Water Bill', 'expense', 'cat-exp-bills', 42.96, 'Debit Card', '', '2026-05-07T09:00:00.000Z', '2026-05-07T09:00:00.000Z'),
    ('txn-0065', '2026-05-07', 'Doctor Visit', 'expense', 'cat-exp-health', 110.28, 'Credit Card', '', '2026-05-07T09:00:00.000Z', '2026-05-07T09:00:00.000Z'),
    ('txn-0047', '2026-05-05', 'Internet Bill', 'expense', 'cat-exp-bills', 35.0, 'Cash', '', '2026-05-05T09:00:00.000Z', '2026-05-05T09:00:00.000Z'),
    ('txn-0048', '2026-05-04', 'Electricity Bill', 'expense', 'cat-exp-bills', 54.93, 'Debit Card', '', '2026-05-04T09:00:00.000Z', '2026-05-04T09:00:00.000Z'),
    ('txn-0045', '2026-05-03', 'Salary', 'income', 'cat-inc-salary', 1995, 'Credit Card', '', '2026-05-03T09:00:00.000Z', '2026-05-03T09:00:00.000Z'),
    ('txn-0064', '2026-05-03', 'Movie Tickets', 'expense', 'cat-exp-entertainment', 36.49, 'Credit Card', '', '2026-05-03T09:00:00.000Z', '2026-05-03T09:00:00.000Z'),
    ('txn-0046', '2026-05-01', 'Monthly Rent', 'expense', 'cat-exp-rent', 1200, 'Debit Card', '', '2026-05-01T09:00:00.000Z', '2026-05-01T09:00:00.000Z'),
    ('txn-0062', '2026-05-01', 'Ride Share', 'expense', 'cat-exp-transport', 23.89, 'Debit Card', '', '2026-05-01T09:00:00.000Z', '2026-05-01T09:00:00.000Z'),
    ('txn-0040', '2026-04-28', 'Electronics Purchase', 'expense', 'cat-exp-shopping', 389.59, 'Bank Transfer', '', '2026-04-28T09:00:00.000Z', '2026-04-28T09:00:00.000Z'),
    ('txn-0042', '2026-04-25', 'Home Goods', 'expense', 'cat-exp-shopping', 108.48, 'Credit Card', '', '2026-04-25T09:00:00.000Z', '2026-04-25T09:00:00.000Z'),
    ('txn-0031', '2026-04-21', 'Weekly Groceries', 'expense', 'cat-exp-food', 148.47, 'Cash', '', '2026-04-21T09:00:00.000Z', '2026-04-21T09:00:00.000Z'),
    ('txn-0033', '2026-04-18', 'Restaurant Dinner', 'expense', 'cat-exp-food', 72.15, 'Debit Card', '', '2026-04-18T09:00:00.000Z', '2026-04-18T09:00:00.000Z'),
    ('txn-0030', '2026-04-16', 'Coffee Shop', 'expense', 'cat-exp-food', 5.7, 'Credit Card', '', '2026-04-16T09:00:00.000Z', '2026-04-16T09:00:00.000Z'),
    ('txn-0039', '2026-04-15', 'Car Maintenance', 'expense', 'cat-exp-transport', 151.3, 'Debit Card', '', '2026-04-15T09:00:00.000Z', '2026-04-15T09:00:00.000Z'),
    ('txn-0034', '2026-04-14', 'Coffee Shop', 'expense', 'cat-exp-food', 9.98, 'Bank Transfer', '', '2026-04-14T09:00:00.000Z', '2026-04-14T09:00:00.000Z'),
    ('txn-0023', '2026-04-13', 'Dividend Payout', 'income', 'cat-inc-investment', 90.85, 'Debit Card', '', '2026-04-13T09:00:00.000Z', '2026-04-13T09:00:00.000Z'),
    ('txn-0038', '2026-04-13', 'Car Maintenance', 'expense', 'cat-exp-transport', 151.39, 'Bank Transfer', '', '2026-04-13T09:00:00.000Z', '2026-04-13T09:00:00.000Z'),
    ('txn-0025', '2026-04-10', 'Internet Bill', 'expense', 'cat-exp-bills', 35.0, 'Bank Transfer', '', '2026-04-10T09:00:00.000Z', '2026-04-10T09:00:00.000Z'),
    ('txn-0043', '2026-04-10', 'Concert Tickets', 'expense', 'cat-exp-entertainment', 77.42, 'Cash', '', '2026-04-10T09:00:00.000Z', '2026-04-10T09:00:00.000Z'),
    ('txn-0026', '2026-04-07', 'Electricity Bill', 'expense', 'cat-exp-bills', 59.27, 'Bank Transfer', '', '2026-04-07T09:00:00.000Z', '2026-04-07T09:00:00.000Z'),
    ('txn-0029', '2026-04-07', 'Weekly Groceries', 'expense', 'cat-exp-food', 86.77, 'Bank Transfer', '', '2026-04-07T09:00:00.000Z', '2026-04-07T09:00:00.000Z'),
    ('txn-0037', '2026-04-06', 'Gas Station', 'expense', 'cat-exp-transport', 36.11, 'Bank Transfer', '', '2026-04-06T09:00:00.000Z', '2026-04-06T09:00:00.000Z'),
    ('txn-0032', '2026-04-05', 'Weekly Groceries', 'expense', 'cat-exp-food', 74.29, 'Cash', '', '2026-04-05T09:00:00.000Z', '2026-04-05T09:00:00.000Z'),
    ('txn-0035', '2026-04-05', 'Weekly Groceries', 'expense', 'cat-exp-food', 96.2, 'Cash', '', '2026-04-05T09:00:00.000Z', '2026-04-05T09:00:00.000Z'),
    ('txn-0041', '2026-04-04', 'Clothing Store', 'expense', 'cat-exp-shopping', 111.63, 'Debit Card', '', '2026-04-04T09:00:00.000Z', '2026-04-04T09:00:00.000Z'),
    ('txn-0027', '2026-04-02', 'Phone Bill', 'expense', 'cat-exp-bills', 51.07, 'Debit Card', '', '2026-04-02T09:00:00.000Z', '2026-04-02T09:00:00.000Z'),
    ('txn-0028', '2026-04-02', 'Water Bill', 'expense', 'cat-exp-bills', 25.73, 'Cash', '', '2026-04-02T09:00:00.000Z', '2026-04-02T09:00:00.000Z'),
    ('txn-0036', '2026-04-02', 'Car Maintenance', 'expense', 'cat-exp-transport', 65.45, 'Bank Transfer', '', '2026-04-02T09:00:00.000Z', '2026-04-02T09:00:00.000Z'),
    ('txn-0022', '2026-04-01', 'Salary', 'income', 'cat-inc-salary', 2115, 'Cash', '', '2026-04-01T09:00:00.000Z', '2026-04-01T09:00:00.000Z'),
    ('txn-0024', '2026-04-01', 'Monthly Rent', 'expense', 'cat-exp-rent', 1200, 'Debit Card', '', '2026-04-01T09:00:00.000Z', '2026-04-01T09:00:00.000Z'),
    ('txn-0044', '2026-04-01', 'Streaming Subscription', 'expense', 'cat-exp-entertainment', 9.9, 'Cash', '', '2026-04-01T09:00:00.000Z', '2026-04-01T09:00:00.000Z'),
    ('txn-0019', '2026-03-28', 'Movie Tickets', 'expense', 'cat-exp-entertainment', 36.38, 'Bank Transfer', '', '2026-03-28T09:00:00.000Z', '2026-03-28T09:00:00.000Z'),
    ('txn-0016', '2026-03-27', 'Gas Station', 'expense', 'cat-exp-transport', 52.08, 'Credit Card', '', '2026-03-27T09:00:00.000Z', '2026-03-27T09:00:00.000Z'),
    ('txn-0011', '2026-03-25', 'Coffee Shop', 'expense', 'cat-exp-food', 5.24, 'Cash', '', '2026-03-25T09:00:00.000Z', '2026-03-25T09:00:00.000Z'),
    ('txn-0018', '2026-03-25', 'Clothing Store', 'expense', 'cat-exp-shopping', 109.35, 'Cash', '', '2026-03-25T09:00:00.000Z', '2026-03-25T09:00:00.000Z'),
    ('txn-0014', '2026-03-24', 'Metro Pass', 'expense', 'cat-exp-transport', 52.29, 'Cash', '', '2026-03-24T09:00:00.000Z', '2026-03-24T09:00:00.000Z'),
    ('txn-0017', '2026-03-23', 'Metro Pass', 'expense', 'cat-exp-transport', 43.09, 'Cash', '', '2026-03-23T09:00:00.000Z', '2026-03-23T09:00:00.000Z'),
    ('txn-0021', '2026-03-22', 'Miscellaneous', 'expense', 'cat-exp-other', 59.13, 'Bank Transfer', '', '2026-03-22T09:00:00.000Z', '2026-03-22T09:00:00.000Z'),
    ('txn-0008', '2026-03-19', 'Weekly Groceries', 'expense', 'cat-exp-food', 82.04, 'Bank Transfer', '', '2026-03-19T09:00:00.000Z', '2026-03-19T09:00:00.000Z'),
    ('txn-0020', '2026-03-15', 'Movie Tickets', 'expense', 'cat-exp-entertainment', 24.5, 'Cash', '', '2026-03-15T09:00:00.000Z', '2026-03-15T09:00:00.000Z'),
    ('txn-0012', '2026-03-13', 'Coffee Shop', 'expense', 'cat-exp-food', 4.82, 'Bank Transfer', '', '2026-03-13T09:00:00.000Z', '2026-03-13T09:00:00.000Z'),
    ('txn-0015', '2026-03-13', 'Car Maintenance', 'expense', 'cat-exp-transport', 141.16, 'Cash', '', '2026-03-13T09:00:00.000Z', '2026-03-13T09:00:00.000Z'),
    ('txn-0013', '2026-03-12', 'Grocery Shopping', 'expense', 'cat-exp-food', 75.9, 'Credit Card', '', '2026-03-12T09:00:00.000Z', '2026-03-12T09:00:00.000Z'),
    ('txn-0010', '2026-03-11', 'Restaurant Dinner', 'expense', 'cat-exp-food', 68.87, 'Debit Card', '', '2026-03-11T09:00:00.000Z', '2026-03-11T09:00:00.000Z'),
    ('txn-0002', '2026-03-08', 'Freelance Project', 'income', 'cat-inc-freelance', 309.18, 'Bank Transfer', '', '2026-03-08T09:00:00.000Z', '2026-03-08T09:00:00.000Z'),
    ('txn-0006', '2026-03-05', 'Phone Bill', 'expense', 'cat-exp-bills', 30.74, 'Cash', '', '2026-03-05T09:00:00.000Z', '2026-03-05T09:00:00.000Z'),
    ('txn-0004', '2026-03-03', 'Internet Bill', 'expense', 'cat-exp-bills', 35.0, 'Bank Transfer', '', '2026-03-03T09:00:00.000Z', '2026-03-03T09:00:00.000Z'),
    ('txn-0005', '2026-03-02', 'Electricity Bill', 'expense', 'cat-exp-bills', 83.38, 'Debit Card', '', '2026-03-02T09:00:00.000Z', '2026-03-02T09:00:00.000Z'),
    ('txn-0007', '2026-03-02', 'Water Bill', 'expense', 'cat-exp-bills', 25.82, 'Credit Card', '', '2026-03-02T09:00:00.000Z', '2026-03-02T09:00:00.000Z'),
    ('txn-0001', '2026-03-01', 'Salary', 'income', 'cat-inc-salary', 2113, 'Cash', '', '2026-03-01T09:00:00.000Z', '2026-03-01T09:00:00.000Z'),
    ('txn-0003', '2026-03-01', 'Monthly Rent', 'expense', 'cat-exp-rent', 1200, 'Credit Card', '', '2026-03-01T09:00:00.000Z', '2026-03-01T09:00:00.000Z'),
    ('txn-0009', '2026-03-01', 'Coffee Shop', 'expense', 'cat-exp-food', 10.48, 'Credit Card', '', '2026-03-01T09:00:00.000Z', '2026-03-01T09:00:00.000Z')
    ),
    mapped_categories as (
      select s.old_id, i.id
      from (
        values
    ('cat-inc-salary', 'Salary', 'income', 'Wallet', '#0f9d70'),
    ('cat-inc-freelance', 'Freelance', 'income', 'Laptop', '#2e5b54'),
    ('cat-inc-business', 'Business', 'income', 'Briefcase', '#3f716a'),
    ('cat-inc-investment', 'Investment', 'income', 'TrendingUp', '#0b7a58'),
    ('cat-inc-bonus', 'Bonus', 'income', 'Gift', '#5f8f85'),
    ('cat-inc-other', 'Other', 'income', 'CircleDollarSign', '#8fb4ac'),
    ('cat-exp-food', 'Food', 'expense', 'UtensilsCrossed', '#e0603f'),
    ('cat-exp-transport', 'Transportation', 'expense', 'Car', '#b8482c'),
    ('cat-exp-shopping', 'Shopping', 'expense', 'ShoppingBag', '#d9784f'),
    ('cat-exp-bills', 'Bills', 'expense', 'Receipt', '#c25a38'),
    ('cat-exp-entertainment', 'Entertainment', 'expense', 'Film', '#e2825f'),
    ('cat-exp-health', 'Health', 'expense', 'HeartPulse', '#cf6845'),
    ('cat-exp-education', 'Education', 'expense', 'GraduationCap', '#a8492e'),
    ('cat-exp-rent', 'Rent', 'expense', 'Home', '#9c4429'),
    ('cat-exp-travel', 'Travel', 'expense', 'Plane', '#e6957a'),
    ('cat-exp-other', 'Other', 'expense', 'MoreHorizontal', '#c99280')
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
