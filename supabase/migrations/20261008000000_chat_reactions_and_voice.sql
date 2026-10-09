-- 1. Create table for message reactions
create table if not exists public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now(),
  constraint unique_message_user_emoji unique (message_id, user_id, emoji)
);

alter table public.message_reactions enable row level security;

create policy "Users can view all message reactions"
  on public.message_reactions for select using (true);

create policy "Users can add reactions"
  on public.message_reactions for insert with check (auth.uid() = user_id);

create policy "Users can remove their own reactions"
  on public.message_reactions for delete using (auth.uid() = user_id);

-- 2. Add voice recording columns to messages table
alter table public.messages 
add column if not exists media_url text,
add column if not exists media_type text default 'text',
add column if not exists duration_seconds numeric;

-- 3. Storage bucket policies for voice notes
create policy "Allow authenticated uploads to voice_notes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'voice_notes');

create policy "Allow public view for voice_notes"
  on storage.objects for select
  using (bucket_id = 'voice_notes');
