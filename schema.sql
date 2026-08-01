-- ============================================================
-- Milli Power Akademie – Supabase-Schema (v7: answer_log speichert
-- konkreten Aufgaben-Text UND Paketnummer, subject-Feld akzeptiert
-- automatisch jedes künftig neu hinzugefügte Fach ohne weitere Migration)
-- Einmal komplett im SQL-Editor deines Supabase-Projekts ausführen
-- (Dashboard → SQL Editor → New query → einfügen → Run).
-- Für ein bereits bestehendes Projekt mit dem alten (v1) Schema:
-- benutze stattdessen migration_v2.sql, dann migration_v3.sql, dann
-- migration_v5.sql, dann migration_v6.sql, dann migration_v7.sql
-- (migration_v4.sql kann übersprungen werden - v5 ersetzt sie). Für ein
-- Projekt, das schon auf v2-v6 ist: nur migration_v7.sql ausführen.
-- ============================================================

create table if not exists facts (
  subject text not null check (subject ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(subject) <= 40),
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
  subject text not null check (subject ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(subject) <= 40),
  reihe smallint not null,
  position smallint not null,
  given_answer integer,
  correct boolean not null,
  skipped boolean not null default false,
  mode text not null default 'paket',
  -- Konkreter Aufgaben-Text (z.B. "48 × 6 =") - v.a. für die schriftlichen
  -- Fächer wichtig, da sich die Einzelaufgabe dort sonst nicht mehr
  -- rekonstruieren lässt (jede Zahl wird frisch zufällig erzeugt).
  detail text,
  -- Zu welchem Paket die Antwort gehörte (NULL bei der Milli Power
  -- Akademie, die kein Paket-Konzept hat) - erlaubt die Gruppierung "welche
  -- Aufgaben je Paket" im Eltern-Dashboard.
  package_number integer
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
