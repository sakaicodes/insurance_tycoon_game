-- Fine Print Syndicate: allow Singapore as a city. Changes only the allowed values; no data is modified.
alter table scores drop constraint if exists scores_city_check;
alter table scores add constraint scores_city_check check (city in ('london','nyc','bermuda','zurich','singapore'));
alter table plays drop constraint if exists plays_city_check;
alter table plays add constraint plays_city_check check (city in ('london','nyc','bermuda','zurich','singapore'));
alter table daily_scores drop constraint if exists daily_scores_city_check;
alter table daily_scores add constraint daily_scores_city_check check (city in ('london','nyc','bermuda','zurich','singapore'));
