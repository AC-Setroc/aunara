create table public.repbook_consent_events (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_type text not null check (consent_type in ('legal', 'health_data')),
  action text not null check (action in ('granted', 'declined', 'revoked')),
  policy_version text not null,
  locale text not null check (locale in ('es', 'en')),
  source text not null check (source in ('account', 'privacy-center', 'migration-gate')),
  created_at timestamptz not null default now()
);

create index repbook_consent_events_user_created_idx
on public.repbook_consent_events (user_id, created_at desc);

alter table public.repbook_consent_events enable row level security;

revoke all on table public.repbook_consent_events from anon;
revoke all on table public.repbook_consent_events from authenticated;
grant select, insert on table public.repbook_consent_events to authenticated;

create policy "People can read their own consent history"
on public.repbook_consent_events
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "People can record their own consent decisions"
on public.repbook_consent_events
for insert
to authenticated
with check ((select auth.uid()) = user_id);
