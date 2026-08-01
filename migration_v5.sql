-- ============================================================
-- Migration v5: macht das Fach-Feld in "facts" und "answer_log" dauerhaft
-- zukunftssicher.
--
-- Der Reihe nach ist genau derselbe Fehler jetzt zweimal passiert: eine
-- feste Aufzählung erlaubter subject-Werte (CHECK ... in (...)) musste bei
-- jedem neuen Fach manuell per Migration nachgezogen werden - vergisst man
-- das (oder ist die Migration einfach noch nicht gelaufen), lehnt die
-- Datenbank alle Schreibversuche für das neue Fach ab, und zwar still
-- (das Spiel merkt es nicht, es versucht nur 3x und gibt dann auf).
--
-- Diese Migration ersetzt die feste Aufzählung durch eine Formatprüfung
-- (nur Buchstaben/Ziffern, beginnt mit einem Buchstaben, max. 40 Zeichen).
-- Jedes neue Fach, das künftig in shared.js hinzukommt (z.B. eine 7. oder
-- 8. schriftliche Session), wird dadurch automatisch akzeptiert - ganz
-- ohne weitere Migration. Ersetzt migration_v4.sql (die muss nicht mehr
-- separat ausgeführt werden, egal ob sie schon lief oder nicht).
--
-- Nur einmal im Supabase SQL-Editor ausführen (Dashboard → SQL Editor →
-- New query → einfügen → Run). Bestehende Daten bleiben unangetastet.
-- ============================================================

alter table facts drop constraint if exists facts_subject_check;
alter table facts add constraint facts_subject_check
  check (subject ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(subject) <= 40);

alter table answer_log drop constraint if exists answer_log_subject_check;
alter table answer_log add constraint answer_log_subject_check
  check (subject ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(subject) <= 40);
