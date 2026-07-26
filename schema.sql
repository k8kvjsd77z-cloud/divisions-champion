-- ============================================================
-- Divisions-Champion – Supabase-Schema
-- Einmal komplett im SQL-Editor deines Supabase-Projekts ausführen
-- (Dashboard → SQL Editor → New query → einfügen → Run).
-- ============================================================

create table if not exists facts (
  divisor smallint not null check (divisor between 1 and 12),
  quotient smallint not null check (quotient between 1 and 12),
  box smallint not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  seen boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (divisor, quotient)
);

create table if not exists answer_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  divisor smallint not null,
  quotient smallint not null,
  dividend integer not null,
  given_answer integer,
  correct boolean not null,
  mode text not null default 'table'
);

create table if not exists progress (
  id boolean primary key default true,
  stars jsonb not null default '{}'::jsonb,
  unlocked jsonb not null default '{}'::jsonb,
  score integer not null default 0,
  best_streak integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint progress_single_row check (id)
);

alter table facts enable row level security;
alter table answer_log enable row level security;
alter table progress enable row level security;

-- Bewusst einfach gehalten: Das Spiel hat kein Login, daher bekommt der
-- öffentliche "anon"-Schlüssel volle Lese-/Schreibrechte auf allen drei
-- Tabellen. Das ist für ein privates Familienprojekt ohne sensible Daten
-- ein vertretbarer Kompromiss - aber sei dir bewusst: JEDER, der die
-- Supabase-URL + den anon-Key kennt (beide stehen sichtbar im JS-Code auf
-- GitHub), könnte die Übungsdaten deiner Tochter lesen oder verändern.
-- Teile das Repo also nicht öffentlich mit den echten Zugangsdaten, wenn
-- dir das wichtig ist, oder frag nach, wenn du eine Login-Variante willst.
create policy "anon full access facts" on facts
  for all using (true) with check (true);
create policy "anon full access answer_log" on answer_log
  for all using (true) with check (true);
create policy "anon full access progress" on progress
  for all using (true) with check (true);
