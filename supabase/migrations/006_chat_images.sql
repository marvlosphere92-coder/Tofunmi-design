-- Allow chat messages to carry an image, with an optional text caption
-- (previously text was required). A message now needs body OR media_url.

alter table chat_messages add column if not exists media_url text;

alter table chat_messages drop constraint if exists chat_messages_body_check;
alter table chat_messages add constraint chat_messages_body_check
  check (char_length(body) between 0 and 2000);

alter table chat_messages drop constraint if exists chat_messages_body_or_media_check;
alter table chat_messages add constraint chat_messages_body_or_media_check
  check (body <> '' or media_url is not null);
