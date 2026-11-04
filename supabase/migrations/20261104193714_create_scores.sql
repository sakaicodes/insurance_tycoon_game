create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  run_id text unique not null,          -- stops the same run being submitted twice
  name text not null check (char_length(name) <= 28),
  ceo text check (char_length(ceo) <= 20),
  city text not null check (city in ('london','nyc','bermuda')),
  score integer not null,
  quarters integer not null,
  rank_idx integer not null,
  version text not null,
  ip_hash text,
  created_at timestamptz default now()
);
create index if not exists scores_score_idx on scores (score desc);
create index if not exists scores_ip_time_idx on scores (ip_hash, created_at);

alter table scores enable row level security;
drop policy if exists "anyone can read" on scores;
create policy "anyone can read" on scores for select using (true);