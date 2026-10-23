-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- Clients. Most are guest records tied to a phone number from a guest
-- order; user_id is set once/if that person signs in with Google and
-- links (or creates) their account.
create table clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  user_id uuid references auth.users (id) unique,
  created_at timestamptz not null default now()
);
create index clients_phone_idx on clients (phone);

-- Measurements: dual source (client-submitted vs designer-taken),
-- versioned by date rather than overwritten.
create table measurements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  source text not null check (source in ('client', 'designer')),
  verified boolean not null default false, -- true once she confirms/takes it herself
  bust numeric,
  waist numeric,
  hip numeric,
  shoulder numeric,
  sleeve_length numeric,
  back_length numeric,
  inseam numeric,
  notes text,
  taken_at date not null default current_date,
  created_at timestamptz not null default now()
);
create index measurements_client_idx on measurements (client_id, created_at desc);

-- Materials catalog
create table materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text, -- ankara, lace, silk, adire, etc.
  photo_url text,
  price_per_yard numeric not null,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

-- Designs (the lookbook)
create table designs (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique, -- e.g. MS-0042, shown to clients
  title text not null,
  category text not null, -- free text; she can type any category, not a fixed list
  description text,
  labour_price numeric, -- nullable: left blank until she sets a real price
  estimated_yards numeric,
  cover_photo_url text,
  photos jsonb not null default '[]'::jsonb, -- array of Cloudinary image URLs
  videos jsonb not null default '[]'::jsonb, -- array of Cloudinary video URLs
  active boolean not null default true,
  display_order integer not null default 0, -- lower sorts first; manual lookbook ordering
  created_at timestamptz not null default now()
);

-- Which materials suit which designs (optional tagging)
create table design_materials (
  design_id uuid not null references designs (id) on delete cascade,
  material_id uuid not null references materials (id) on delete cascade,
  primary key (design_id, material_id)
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique, -- e.g. ORD-0007
  client_id uuid not null references clients (id),
  design_id uuid references designs (id),
  measurement_id uuid references measurements (id), -- the exact version used
  material_id uuid references materials (id), -- null if client brings own fabric
  own_fabric boolean not null default false,
  event_date date,
  budget_note text,
  inspiration_photo_url text,
  estimated_price numeric,
  final_price numeric,
  deposit_note text, -- manual for now, no payment integration yet
  status text not null default 'requested' check (
    status in (
      'requested', 'confirmed', 'fabric_received', 'cutting',
      'sewing', 'ready_for_fitting', 'ready_for_pickup', 'completed', 'cancelled'
    )
  ),
  created_at timestamptz not null default now()
);
create index orders_client_idx on orders (client_id);
create index orders_status_idx on orders (status);

-- Order status history, so changes are auditable
create table order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

-- Waitlist entries for when she's at capacity
create table waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  design_reference text,
  notes text,
  contacted boolean not null default false,
  created_at timestamptz not null default now()
);

-- Reviews: either left by a signed-in buyer against one of their own
-- completed orders, or entered by the admin for a client who ordered
-- through WhatsApp/offline. Optionally tied to a design so it can also
-- show on that design's page, independent of showing site-wide.
create table reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients (id) on delete set null,
  order_id uuid references orders (id) on delete set null,
  design_id uuid references designs (id) on delete set null,
  reviewer_name text not null,
  rating int not null check (rating between 1 and 5),
  body text,
  photo_url text,
  source text not null check (source in ('buyer', 'admin')),
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create index reviews_design_idx on reviews (design_id);
-- One buyer review per order; admin-entered reviews aren't tied to an
-- order so this doesn't restrict those.
create unique index reviews_one_per_order on reviews (order_id) where order_id is not null;

-- A signed-in customer's saved/wishlisted designs
create table saved_designs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  design_id uuid not null references designs (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_id, design_id)
);

-- Simple capacity control she toggles from the admin
create table capacity_settings (
  id int primary key default 1,
  accepting_orders boolean not null default true,
  booked_until date,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into capacity_settings (id) values (1);

-- There's only one admin account, flagged via an app_metadata role claim
-- on her auth user (set once below) rather than a fixed email — so her
-- self-service "change email" feature can't accidentally lock her out.
-- Used by RLS policies below to distinguish her session from a customer's
-- own Google-authenticated session.
create or replace function is_admin() returns boolean
language sql stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- Row Level Security: public read on catalog data, everything else locked
-- down to the service role (used only from trusted server actions/admin),
-- plus narrow self-serve reads for a signed-in customer's own records.
alter table clients enable row level security;
alter table measurements enable row level security;
alter table materials enable row level security;
alter table designs enable row level security;
alter table design_materials enable row level security;
alter table orders enable row level security;
alter table order_status_events enable row level security;
alter table waitlist_entries enable row level security;
alter table capacity_settings enable row level security;
alter table reviews enable row level security;
alter table saved_designs enable row level security;

create policy "public can read active designs" on designs
  for select using (active = true);

create policy "public can read published reviews" on reviews
  for select using (published = true);
create policy "admin can read all reviews" on reviews
  for select using (is_admin());

-- The admin dashboard reads inactive/draft designs too (e.g. hidden
-- designs awaiting her edit), via the anon-key client as her logged-in
-- session specifically — not just any authenticated session, since
-- customers now have Google-authenticated sessions too.
create policy "admin can read all designs" on designs
  for select using (is_admin());

create policy "public can read materials" on materials
  for select using (true);

create policy "public can read design_materials" on design_materials
  for select using (true);

create policy "public can read capacity" on capacity_settings
  for select using (true);

-- Writes to clients, measurements, orders, order_status_events, and
-- waitlist_entries only ever happen via the service-role client inside
-- server actions, never directly from the browser. Reads are: the admin
-- dashboard (her session, anon-key client, subject to RLS) sees
-- everything; a signed-in customer's own session sees only rows linked
-- to their account via clients.user_id.
create policy "admin can read all clients" on clients
  for select using (is_admin());
create policy "clients can read own row" on clients
  for select using (auth.uid() = user_id);

create policy "admin can read all measurements" on measurements
  for select using (is_admin());
create policy "clients can read own measurements" on measurements
  for select using (
    exists (
      select 1 from clients
      where clients.id = measurements.client_id and clients.user_id = auth.uid()
    )
  );

create policy "admin can read all orders" on orders
  for select using (is_admin());
create policy "clients can read own orders" on orders
  for select using (
    exists (
      select 1 from clients
      where clients.id = orders.client_id and clients.user_id = auth.uid()
    )
  );

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

create policy "admin can read all waitlist_entries" on waitlist_entries
  for select using (is_admin());

create policy "admin can read all saved_designs" on saved_designs
  for select using (is_admin());
create policy "clients can read own saved_designs" on saved_designs
  for select using (
    exists (
      select 1 from clients
      where clients.id = saved_designs.client_id and clients.user_id = auth.uid()
    )
  );
