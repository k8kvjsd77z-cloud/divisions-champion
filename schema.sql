-- ============================================================
-- Milli Power Akademie – Supabase-Schema (v3: Division, Multiplikation,
-- schriftliche Division/Multiplikation)
-- Einmal komplett im SQL-Editor deines Supabase-Projekts ausführen
-- (Dashboard → SQL Editor → New query → einfügen → Run).
-- Für ein bereits bestehendes Projekt mit dem alten (v1) Schema:
-- benutze stattdessen migration_v2.sql, danach migration_v3.sql.
-- Für ein Projekt, das schon auf v2 ist: nur migration_v3.sql ausführen.
-- ============================================================

create table if not exists facts (
  subject text not null check (subject in ('division','multiplication','writtenMultiplication','writtenDivision')),
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

create table if not exists answer_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  subject text not null check (subject in ('division','multiplication','writtenMultiplication','writtenDivision')),
  reihe smallint not null,
  position smallint not null,
  given_answer integer,
  correct boolean not null,
  skipped boolean not null default false,
  mode text not null default 'paket'
);

create table if not exists progress (
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

-- Nur angemeldete Nutzer dürfen lesen/schreiben. Das Spiel und das
-- Eltern-Dashboard melden sich mit einem einzigen gemeinsamen Familien-
-- Konto an (siehe README.md, "Login einrichten") - ohne dieses Login kommt
-- niemand an die Daten, selbst wenn der öffentliche anon-Key bekannt ist.
-- Wichtig: die Registrierung neuer Nutzer muss in Supabase deaktiviert sein
-- (Authentication → Providers → Email → "Allow new users to sign up" AUS),
-- sonst könnte sich theoretisch jemand selbst ein Konto anlegen.
create policy "authenticated only facts" on facts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated only answer_log" on answer_log
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated only progress" on progress
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
