-- Fine Print Syndicate: daily challenge results. One row per player per day, holding their best attempt.
-- Written only by the submit-score Edge Function; the public can read the leaderboard columns.
create table if not exists daily_scores (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  player_id text not null check (char_length(player_id) <= 64),
  name text not null check (char_length(name) <= 28),
  ceo text check (char_length(ceo) <= 20),
  city text check (city in ('london','nyc','bermuda','zurich')),
  format text not null check (format in ('fixed','race','objective')),
  score integer not null,
  quarters integer not null,
  finished boolean not null default false,
  progress real not null default 0,
  objective_met boolean not null default false,
  rank_key double precision not null,
  attempts integer not null default 1,
  version text,
  ip_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (day, player_id)
);
create index if not exists daily_rank_idx on daily_scores (day, rank_key desc);
create index if not exists daily_ip_time_idx on daily_scores (ip_hash, updated_at);
alter table daily_scores enable row level security;
drop policy if exists "anyone can read daily" on daily_scores;
create policy "anyone can read daily" on daily_scores for select using (true);
revoke select on table daily_scores from anon, authenticated;
grant select (day, name, ceo, city, format, score, quarters, finished, progress, objective_met, rank_key, attempts, created_at) on table daily_scores to anon, authenticated;
