-- ============================================================
-- Migration v3: schriftliche Multiplikation/Division bekommen jetzt auch
-- eine Fehlerquote-je-Reihe- und Trefferquote-über-Zeit-Auswertung im
-- Eltern-Dashboard, genau wie Division/Multiplikation. Dafür schreibt das
-- Spiel jetzt auch für die schriftlichen Fächer in "facts" und
-- "answer_log" - bisher waren die dortigen CHECK-Constraints aber fest auf
-- 'division'/'multiplication' begrenzt und hätten das abgelehnt.
--
-- Nur einmal im Supabase SQL-Editor ausführen (Dashboard → SQL Editor →
-- New query → einfügen → Run). Bestehende Daten bleiben unangetastet,
-- es werden nur die beiden Constraints erweitert.
--
-- Falls die automatisch vergebenen Constraint-Namen unten bei dir anders
-- heißen (z.B. weil du die Tabellen manuell abweichend angelegt hast),
-- findest du die echten Namen über: Supabase Dashboard → Table Editor →
-- facts / answer_log → Tab "Constraints", oder per SQL:
--   select conname from pg_constraint where conrelid = 'facts'::regclass;
-- ============================================================

alter table facts drop constraint if exists facts_subject_check;
alter table facts add constraint facts_subject_check
  check (subject in ('division','multiplication','writtenMultiplication','writtenDivision'));

alter table answer_log drop constraint if exists answer_log_subject_check;
alter table answer_log add constraint answer_log_subject_check
  check (subject in ('division','multiplication','writtenMultiplication','writtenDivision'));
