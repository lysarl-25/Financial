-- Financial admin seed
-- Creates a dedicated admin account (Admin / admin@financail.com) with the
-- seeded password and promotes it to admin. Run after supabase/schema.sql
-- (which creates public.users and the on_auth_user_created trigger).
--
-- Usage (SQL editor):
--   select public.seed_financial_admin();
--
-- If the auth user does not exist yet, the function creates it in
-- auth.users directly (dev/local seed only) with a confirmed email so the
-- seeded credentials can be used to sign in. If it already exists, the
-- password is reset to the seeded value and the role is promoted to admin.

create extension if not exists pgcrypto;

create or replace function public.seed_admin(admin_email text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
  v_full_name text;
begin
  select id, coalesce(nullif(raw_user_meta_data->>'full_name', ''), split_part(admin_email, '@', 1))
  into v_id, v_full_name
  from auth.users
  where email = admin_email
  limit 1;

  if v_id is null then
    raise exception 'No auth user with email %. Create the account first (app signup or Dashboard -> Authentication -> Add user).', admin_email;
  end if;

  insert into public.users (id, email, full_name, role, is_active)
  values (v_id, admin_email, v_full_name, 'admin', true)
  on conflict (id) do update
    set role = 'admin',
        is_active = true;

  return v_id;
end;
$$;

create or replace function public.seed_financial_admin()
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
  v_email text := 'admin@financail.com';
  v_password text := 'admin@12345';
  v_full_name text := 'Admin';
begin
  select id into v_id from auth.users where email = v_email limit 1;

  if v_id is null then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', v_full_name),
      now(),
      now()
    )
    returning id into v_id;
  else
    update auth.users
    set encrypted_password = crypt(v_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('full_name', v_full_name),
        updated_at = now()
    where id = v_id;
  end if;

  insert into public.users (id, email, full_name, role, is_active)
  values (v_id, v_email, v_full_name, 'admin', true)
  on conflict (id) do update
    set email = v_email,
        full_name = v_full_name,
        role = 'admin',
        is_active = true;

  return v_id;
end;
$$;