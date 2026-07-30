-- ============================================================
-- Migration v4: 4 neue schriftliche Übungs-Sessions (je 2 zusätzliche für
-- Division und Multiplikation, zusätzlich zu den bestehenden) - erweitert
-- die CHECK-Constraints in "facts" und "answer_log" um die neuen
-- subject-Werte 'writtenMultiplication2', 'writtenMultiplication3',
-- 'writtenDivision2', 'writtenDivision3'.
--
-- Nur einmal im Supabase SQL-Editor ausführen (Dashboard → SQL Editor →
-- New query → einfügen → Run). Bestehende Daten bleiben unangetastet,
-- es werden nur die beiden Constraints erweitert. Setzt voraus, dass
-- migration_v3.sql bereits gelaufen ist (sonst zuerst diese ausführen).
--
-- Falls die automatisch vergebenen Constraint-Namen unten bei dir anders
-- heißen, findest du die echten Namen über:
--   select conname from pg_constraint where conrelid = 'facts'::regclass;
-- ============================================================

alter table facts drop constraint if exists facts_subject_check;
alter table facts add constraint facts_subject_check
  check (subject in ('division','multiplication','writtenMultiplication','writtenMultiplication2','writtenMultiplication3','writtenDivision','writtenDivision2','writtenDivision3'));

alter table answer_log drop constraint if exists answer_log_subject_check;
alter table answer_log add constraint answer_log_subject_check
  check (subject in ('division','multiplication','writtenMultiplication','writtenMultiplication2','writtenMultiplication3','writtenDivision','writtenDivision2','writtenDivision3'));
