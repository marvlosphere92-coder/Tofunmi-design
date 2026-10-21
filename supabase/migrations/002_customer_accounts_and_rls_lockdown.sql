-- Customer accounts (Google SSO) + RLS lockdown migration
-- Run this once in the Supabase SQL editor. Safe to re-run.
--
-- IMPORTANT: run this before (or immediately after) enabling Google sign-in,
-- and have Tofunmi sign out and back in to /admin afterwards — her admin
-- session needs a fresh token to pick up the new app_metadata role claim.

alter table clients add column if not exists user_id uuid references auth.users (id) unique;
alter table clients alter column phone drop not null;

-- Flag the one admin account via an app_metadata role claim (not her
-- email, so her self-service email change can't lock her out of admin).
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email = 'adegbayijesutofunmi@gmail.com';

create or replace function is_admin() returns boolean
language sql stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

drop policy if exists "authenticated can read all designs" on designs;
drop policy if exists "admin can read all designs" on designs;
create policy "admin can read all designs" on designs
  for select using (is_admin());

drop policy if exists "authenticated can read clients" on clients;
drop policy if exists "admin can read all clients" on clients;
drop policy if exists "clients can read own row" on clients;
create policy "admin can read all clients" on clients
  for select using (is_admin());
create policy "clients can read own row" on clients
  for select using (auth.uid() = user_id);

drop policy if exists "authenticated can read measurements" on measurements;
drop policy if exists "admin can read all measurements" on measurements;
drop policy if exists "clients can read own measurements" on measurements;
create policy "admin can read all measurements" on measurements
  for select using (is_admin());
create policy "clients can read own measurements" on measurements
  for select using (
    exists (
      select 1 from clients
      where clients.id = measurements.client_id and clients.user_id = auth.uid()
    )
  );

drop policy if exists "authenticated can read orders" on orders;
drop policy if exists "admin can read all orders" on orders;
drop policy if exists "clients can read own orders" on orders;
create policy "admin can read all orders" on orders
  for select using (is_admin());
create policy "clients can read own orders" on orders
  for select using (
    exists (
      select 1 from clients
      where clients.id = orders.client_id and clients.user_id = auth.uid()
    )
  );

drop policy if exists "authenticated can read order_status_events" on order_status_events;
drop policy if exists "admin can read all order_status_events" on order_status_events;
drop policy if exists "clients can read own order_status_events" on order_status_events;
create policy "admin can read all order_status_events" on order_status_events
  for select using (is_admin());
create policy "clients can read own order_status_events" on order_status_events
  for select using (
    exists (
      select 1 from orders
      join clients on clients.id = orders.client_id
      where orders.id = order_status_events.order_id and clients.user_id = auth.uid()
    )
  );

drop policy if exists "authenticated can read waitlist_entries" on waitlist_entries;
drop policy if exists "admin can read all waitlist_entries" on waitlist_entries;
create policy "admin can read all waitlist_entries" on waitlist_entries
  for select using (is_admin());
