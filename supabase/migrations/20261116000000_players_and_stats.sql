-- Fine Print Syndicate: anonymous player IDs, run starts, public stats, and a tighter public read.
-- Safe to run more than once.

-- 1. Each score can carry an anonymous player ID (a random string the game makes; no personal data).
alter table scores add column if not exists player_id text check (char_length(player_id) <= 64);
create index if not exists scores_player_idx on scores (player_id);
create index if not exists scores_city_score_idx on scores (city, score desc);

-- 2. Run starts: one row each time someone creates a CEO, finished or not. Private: only the Edge Function writes it.
create table if not exists plays (
  id uuid primary key default gen_random_uuid(),
  player_id text not null check (char_length(player_id) <= 64),
  city text check (city in ('london','nyc','bermuda')),
  version text,
  ip_hash text,
  created_at timestamptz default now()
);
create index if not exists plays_ip_time_idx on plays (ip_hash, created_at);
alter table plays enable row level security;   -- no policies, so browsers can't read or write it

-- 3. What the game shows: players who have recorded at least one run, and recorded runs.
create or replace view leaderboard_stats as
  select count(distinct player_id) as players, count(*) as runs from scores;
grant select on leaderboard_stats to anon, authenticated;

-- 4. For you only (dashboard / SQL editor): everyone who started a run.
create or replace view play_stats as
  select count(distinct player_id) as players_started, count(*) as runs_started,
         count(*) filter (where created_at > now() - interval '7 days') as runs_started_last_7_days
  from plays;
revoke all on play_stats from anon, authenticated;

-- 5. The public can read only the leaderboard columns, not ip_hash, run_id or player_id.
revoke select on table scores from anon, authenticated;
grant select (name, ceo, city, score, quarters, rank_idx, version, created_at) on table scores to anon, authenticated;
