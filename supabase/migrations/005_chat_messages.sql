-- One ongoing chat thread per customer, between that customer and the
-- business admin. All writes (send, mark-as-read) go through server
-- actions using the service-role key, never the anon key, so these RLS
-- policies only need to cover reads — including what Realtime is allowed
-- to push to a subscriber.

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  sender_role text not null check (sender_role in ('client', 'admin')),
  body text not null check (char_length(body) between 1 and 2000),
  read_by_client boolean not null default false,
  read_by_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_client_created
  on chat_messages (client_id, created_at);

alter table chat_messages enable row level security;

drop policy if exists "admin can do everything on chat_messages" on chat_messages;
create policy "admin can do everything on chat_messages" on chat_messages
  for all using (is_admin()) with check (is_admin());

drop policy if exists "clients can read own chat_messages" on chat_messages;
create policy "clients can read own chat_messages" on chat_messages
  for select using (
    exists (
      select 1 from clients
      where clients.id = chat_messages.client_id and clients.user_id = auth.uid()
    )
  );

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table chat_messages;
  end if;
end $$;
