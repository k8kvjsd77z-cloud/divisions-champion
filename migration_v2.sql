-- ============================================================
-- Migration v2: Division + Multiplikation, Login-Pflicht, Überspringen
-- Nur einmal ausführen. Ersetzt die alten Tabellen komplett (die bisher
-- nur minimal befüllt waren - falls du zwischenzeitlich schon "echt"
-- geübt hast, geht dieser Test-Fortschritt dabei verloren).
--
-- Führe VORHER schon aus (falls noch nicht geschehen):
-- 1. Authentication → Users → Add user (siehe README.md, "Login einrichten")
-- 2. Authentication → Providers → Email → "Allow new users to sign up" AUS
-- ============================================================

drop table if exists facts cascade;
drop table if exists answer_log cascade;
drop table if exists progress cascade;

create table facts (
  subject text not null check (subject in ('division','multiplication')),
  reihe smallint not null check (reihe between 1 and 12),
  position smallint not null check (position between 1 and 12),
  box smallint not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  skip_count integer not null default 0,
  seen boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (subject, reihe, position)
);

create table answer_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  subject text not null check (subject in ('division','multiplication')),
  reihe smallint not null,
  position smallint not null,
  given_answer integer,
  correct boolean not null,
  skipped boolean not null default false,
  mode text not null default 'paket'
);

create table progress (
  id boolean primary key default true,
  packages jsonb not null default '{}'::jsonb,
  score integer not null default 0,
  best_streak integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint progress_single_row check (id)
);

alter table facts enable row level security;
alter table answer_log enable row level security;
alter table progress enable row level security;

create policy "authenticated only facts" on facts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated only answer_log" on answer_log
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated only progress" on progress
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
