-- Saved/wishlisted designs feature. Safe to re-run.

create table if not exists saved_designs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  design_id uuid not null references designs (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_id, design_id)
);

alter table saved_designs enable row level security;

drop policy if exists "admin can read all saved_designs" on saved_designs;
create policy "admin can read all saved_designs" on saved_designs
  for select using (is_admin());

drop policy if exists "clients can read own saved_designs" on saved_designs;
create policy "clients can read own saved_designs" on saved_designs
  for select using (
    exists (
      select 1 from clients
      where clients.id = saved_designs.client_id and clients.user_id = auth.uid()
    )
  );
