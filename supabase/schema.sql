-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- Clients (not Supabase auth users — she has no client logins yet,
-- just records tied to a phone number)
create table clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
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
  category text not null check (category in ('bridal', 'aso_ebi', 'casual', 'men', 'other')),
  description text,
  labour_price numeric not null,
  estimated_yards numeric,
  cover_photo_url text,
  photos jsonb not null default '[]'::jsonb, -- array of Cloudinary URLs
  active boolean not null default true,
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

-- Simple capacity control she toggles from the admin
create table capacity_settings (
  id int primary key default 1,
  accepting_orders boolean not null default true,
  booked_until date,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into capacity_settings (id) values (1);

-- Row Level Security: public read on catalog data, everything else locked
-- down to the service role (used only from trusted server actions/admin).
alter table clients enable row level security;
alter table measurements enable row level security;
alter table materials enable row level security;
alter table designs enable row level security;
alter table design_materials enable row level security;
alter table orders enable row level security;
alter table order_status_events enable row level security;
alter table waitlist_entries enable row level security;
alter table capacity_settings enable row level security;

create policy "public can read active designs" on designs
  for select using (active = true);

create policy "public can read materials" on materials
  for select using (true);

create policy "public can read design_materials" on design_materials
  for select using (true);

create policy "public can read capacity" on capacity_settings
  for select using (true);

-- No public policies on clients, measurements, orders, order_status_events,
-- or waitlist_entries: those are only ever written/read via the service-role
-- client inside server actions, never directly from the browser.
