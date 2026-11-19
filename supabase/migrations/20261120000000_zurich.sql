-- Fine Print Syndicate: allow Zurich as a city. Changes only the allowed values; no data is modified.
alter table scores drop constraint if exists scores_city_check;
alter table scores add constraint scores_city_check check (city in ('london','nyc','bermuda','zurich'));
alter table plays drop constraint if exists plays_city_check;
alter table plays add constraint plays_city_check check (city in ('london','nyc','bermuda','zurich'));
