-- ============================================================
-- Migration v7: Eltern-Dashboard kann jetzt die Aufgaben je Paket zeigen
-- (nicht nur insgesamt), damit klar wird, in welchem Paket welche Aufgaben
-- gemacht wurden.
--
-- Dafür braucht answer_log eine neue Spalte "package_number" - ohne die
-- lässt sich aus dem Protokoll nicht rekonstruieren, zu welchem Paket eine
-- Antwort gehörte (bei der Milli Power Akademie bleibt sie NULL, da es dort
-- kein Paket-Konzept gibt).
--
-- Rein additiv, bestehende Zeilen bleiben unangetastet (dort ist
-- "package_number" einfach NULL - für die betroffenen alten Einträge lässt
-- sich das nicht mehr nachträglich ergänzen, nur ab jetzt für neue).
--
-- Nur einmal im Supabase SQL-Editor ausführen (Dashboard → SQL Editor →
-- New query → einfügen → Run).
-- ============================================================

alter table answer_log add column if not exists package_number integer;
