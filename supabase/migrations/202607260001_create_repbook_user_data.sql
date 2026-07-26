create table public.repbook_user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object')
);

alter table public.repbook_user_data enable row level security;

revoke all on table public.repbook_user_data from anon;
revoke all on table public.repbook_user_data from authenticated;
grant select, insert, update, delete on table public.repbook_user_data to authenticated;

create policy "People can read their own Repbook data"
on public.repbook_user_data
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "People can create their own Repbook data"
on public.repbook_user_data
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "People can update their own Repbook data"
on public.repbook_user_data
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "People can delete their own Repbook data"
on public.repbook_user_data
for delete
to authenticated
using ((select auth.uid()) = user_id);
