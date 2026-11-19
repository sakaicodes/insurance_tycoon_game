-- Private, anonymous exit-interview feedback. No run or player ID is stored.
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  rating integer not null check (rating between 0 and 5),
  tags text[] not null default '{}',
  comment text check (char_length(comment) <= 500),
  reason text check (reason in ('bankrupt', 'fired', 'licence', 'exit', 'retire', 'win')),
  quarters integer check (quarters between 0 and 500),
  city text check (city in ('london', 'nyc', 'bermuda', 'zurich')),
  version text,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists feedback_ip_time_idx on feedback (ip_hash, created_at);

alter table feedback enable row level security;
revoke all on table feedback from anon, authenticated;
