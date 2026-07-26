# Divisions-Champion / Milli Power Akademie

Ein kleines Divisions-Übungsspiel (÷1 bis ÷12) mit Gedächtnis-Funktion für
Kinder, plus ein PIN-geschütztes Eltern-Dashboard, das zeigt, wo Fehler
gehäuft auftreten.

- `index.html` – das Spiel
- `dashboard.html` – Eltern-Dashboard (Auswertung)
- `shared.js` – gemeinsame Logik (wird von beiden Seiten geladen)
- `config.js` – deine Zugangsdaten (Supabase-URL, Key, PIN)
- `schema.sql` – Datenbank-Schema zum Einrichten

Ohne Einrichtung läuft das Spiel sofort lokal im Browser (Fortschritt wird
in `localStorage` gespeichert). Für dauerhafte Speicherung über mehrere
Geräte hinweg und das Eltern-Dashboard brauchst du eine kostenlose
Supabase-Datenbank (Schritte unten).

## 1. Supabase-Projekt anlegen

1. Gehe auf [supabase.com](https://supabase.com) und erstelle einen kostenlosen Account.
2. Erstelle ein neues Projekt (Name/Passwort frei wählbar, Region z.B. Frankfurt).
3. Warte, bis das Projekt fertig eingerichtet ist (dauert ~1-2 Minuten).

## 2. Datenbank-Tabellen anlegen

1. Öffne im Supabase-Dashboard links **SQL Editor** → **New query**.
2. Kopiere den kompletten Inhalt von [`schema.sql`](schema.sql) hinein und klicke **Run**.
3. Das legt drei Tabellen an: `facts` (Gedächtnis pro Aufgabe), `answer_log`
   (jede einzelne Antwort, für die Auswertung) und `progress` (Sterne/Punkte).

## 3. Zugangsdaten eintragen

1. Öffne im Supabase-Dashboard **Project Settings → API**.
2. Kopiere die **Project URL** und den **`anon` `public`** Key.
3. Trage beides in [`config.js`](config.js) ein:

   ```js
   SUPABASE_URL: 'https://xxxxxxxxxxxx.supabase.co',
   SUPABASE_ANON_KEY: 'eyJ...',
   ```
4. Ändere in derselben Datei auch `PARENT_PIN` auf einen eigenen 4-stelligen Code.

> ⚠️ Der `anon`-Key ist öffentlich sichtbar (er steht im JavaScript-Code, den
> jeder Besucher deiner GitHub-Pages-Seite laden kann). Das Schema erlaubt
> diesem Key vollen Lese-/Schreibzugriff, ohne Login - bewusst einfach
> gehalten für ein privates Familienprojekt ohne sensible Daten. Wer die
> Adresse deiner Seite + den Key kennt, könnte theoretisch die Übungsdaten
> sehen oder verändern. Wenn dir das wichtig ist, sag Bescheid - dann bauen
> wir eine Login-Variante.

## 4. Auf GitHub veröffentlichen

Das übernimmst du selbst über deinen eigenen GitHub-Account:

1. Erstelle ein neues (privates oder öffentliches) Repository auf GitHub.
2. Push den Inhalt dieses Ordners hinein, z.B.:
   ```bash
   git init
   git add .
   git commit -m "Divisions-Champion mit Milli Power Akademie"
   git branch -M main
   git remote add origin <deine-repo-url>
   git push -u origin main
   ```
3. Im Repo unter **Settings → Pages**: Branch `main`, Ordner `/ (root)` auswählen → Save.
4. Nach ein bis zwei Minuten ist die Seite unter
   `https://<dein-username>.github.io/<repo-name>/` erreichbar.
5. Das Spiel liegt unter `.../index.html`, das Eltern-Dashboard unter
   `.../dashboard.html` (nirgends im Spiel selbst verlinkt - nur du kennst
   die Adresse, zusätzlich mit PIN geschützt).

## Wie die Gedächtnis-Funktion funktioniert

Jede der 144 Aufgaben (12 Reihen × 12) hat eine "Box-Stufe" 0-4:
richtig beantwortet → Stufe rauf, falsch → deutlich runter. Die **Milli
Power Akademie** wählt Übungsaufgaben gewichtet nach Box-Stufe: schwache
Aufgaben kommen häufiger, sicher gemeisterte nur noch selten (zur
Auffrischung) - aber nie ganz raus, damit über die Zeit alles im Umlauf
bleibt.

## Was das Eltern-Dashboard zeigt

- Fehlerquote je Reihe (÷1-÷12)
- Die einzelnen Aufgaben mit den meisten Fehlern
- Trefferquote über die letzten Übungstage
- Automatisch erkannte Fehlermuster (z.B. "verzählt sich oft um 1",
  "verwechselt benachbarte Reihen", "schreibt manchmal nur die Dividende
  ab") mit konkretem Beispiel, worauf du zu Hause gezielt eingehen kannst
