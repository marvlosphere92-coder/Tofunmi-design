-- Site-wide switch for whether clients see "seen" receipts on their own
-- messages. Admin always sees whether clients have read hers. The underlying
-- read_by_client/read_by_admin tracking always runs (it also powers unread
-- badges), this only controls whether the client UI surfaces it.
alter table capacity_settings
  add column if not exists chat_read_receipts_enabled boolean not null default true;
