-- ============================================================
-- Migration v6: Eltern-Dashboard zeigt bei den schriftlichen Fächern jetzt
-- auch die konkreten Aufgaben (nicht nur die Reihen-Zusammenfassung), die
-- falsch gerechnet oder übersprungen wurden.
--
-- Dafür braucht answer_log eine neue Spalte "detail" mit dem eigentlichen
-- Aufgaben-Text (z.B. "48 × 6 =") - bei den schriftlichen Fächern lässt
-- sich die konkrete Aufgabe sonst nicht mehr rekonstruieren, weil jede
-- Zahl frisch zufällig erzeugt wird (anders als bei Division/Multiplikation,
-- wo Reihe+Position dafür reichen).
--
-- Rein additiv, bestehende Zeilen bleiben unangetastet (dort ist "detail"
-- einfach NULL - für die betroffenen alten Einträge lässt sich der genaue
-- Aufgabentext nicht mehr nachträglich ergänzen, nur ab jetzt für neue).
--
-- Nur einmal im Supabase SQL-Editor ausführen (Dashboard → SQL Editor →
-- New query → einfügen → Run).
-- ============================================================

alter table answer_log add column if not exists detail text;
