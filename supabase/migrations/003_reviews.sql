-- Reviews feature migration. Safe to re-run.

create table if not exists reviews (
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
create index if not exists reviews_design_idx on reviews (design_id);
create unique index if not exists reviews_one_per_order on reviews (order_id) where order_id is not null;

alter table reviews enable row level security;

drop policy if exists "public can read published reviews" on reviews;
create policy "public can read published reviews" on reviews
  for select using (published = true);

drop policy if exists "admin can read all reviews" on reviews;
create policy "admin can read all reviews" on reviews
  for select using (is_admin());
