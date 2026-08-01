# Milli Power Akademie

Ein Übungsspiel für Division und Multiplikation (1–12) mit Gedächtnis-Funktion,
plus ein PIN-geschütztes Eltern-Dashboard, das zeigt, wo Fehler gehäuft
auftreten. Trainer ist **Papalino**, die Schülerin heißt im Spiel **Milli**.

- `index.html` – das Spiel
- `dashboard.html` – Eltern-Dashboard (Auswertung)
- `shared.js` – gemeinsame Logik (wird von beiden Seiten geladen)
- `config.js` – deine Zugangsdaten (Supabase-URL, Key, PIN)
- `schema.sql` – Datenbank-Schema für ein neues Supabase-Projekt
- `migration_v2.sql` – Schema-Update für ein Projekt mit dem alten (v1) Schema
- `migration_v3.sql` – Schema-Update, damit auch die schriftlichen Fächer
  Aufgaben-Daten speichern dürfen (nötig für Projekte, die schon auf v2 sind)
- `migration_v4.sql` – historisch, nicht mehr nötig (durch `migration_v5.sql`
  ersetzt - kann übersprungen werden)
- `migration_v5.sql` – macht das Fach-Feld dauerhaft zukunftssicher: jedes
  künftig neu hinzugefügte Fach wird automatisch akzeptiert, ohne dass noch
  eine Migration nötig wird (nötig für Projekte, die schon auf v2/v3/v4 sind)

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
2. Kopiere den kompletten Inhalt von [`schema.sql`](schema.sql) hinein und klicke **Run**
   (bei einem bereits bestehenden Projekt mit älterem Schema stattdessen
   [`migration_v2.sql`](migration_v2.sql) verwenden - das ersetzt die Tabellen komplett;
   ist dein Projekt schon auf v2, reicht danach [`migration_v3.sql`](migration_v3.sql)
   und [`migration_v5.sql`](migration_v5.sql) [`migration_v4.sql` überspringen];
   ist es schon auf v3 oder v4, reicht nur `migration_v5.sql`).
3. Das legt drei Tabellen an: `facts` (Gedächtnis pro Aufgabe, jetzt getrennt
   nach Fach), `answer_log` (jede einzelne Antwort/jedes Überspringen, für die
   Auswertung) und `progress` (Paket-Fortschritt/Punkte).

## 3. Zugangsdaten eintragen

1. Öffne im Supabase-Dashboard **Project Settings → API**.
2. Kopiere die **Project URL** und den **`anon` `public`** Key.
3. Trage beides in [`config.js`](config.js) ein:

   ```js
   SUPABASE_URL: 'https://xxxxxxxxxxxx.supabase.co',
   SUPABASE_ANON_KEY: 'eyJ...',
   ```
4. Ändere in derselben Datei auch `PARENT_PIN` auf einen eigenen 4-stelligen Code.

> ℹ️ Der `anon`-Key ist öffentlich sichtbar (er steht im JavaScript-Code, den
> jeder Besucher deiner GitHub-Pages-Seite laden kann) - das ist bei Supabase
> so vorgesehen. Geschützt werden die Daten dahinter durch das Login in
> Schritt 4: ohne den Familien-Zugang lässt die Datenbank niemanden lesen
> oder schreiben, egal ob der Key bekannt ist.

## 4. Login einrichten (schützt die Daten vor Fremdzugriff)

Es gibt bewusst **zwei getrennte Zugänge** - Milli kennt nur ihren eigenen, nicht
den fürs Eltern-Dashboard:

| Zugang | Benutzt für | Benutzername | E-Mail (technisch, intern) |
|---|---|---|---|
| Milli | Spiel (`index.html`) | `Milli` | `milli@family.local` |
| Familie | Eltern-Dashboard (`dashboard.html`) | `FamKed` | `famked@family.local` |

Beide Zugänge legst du gleich an:

1. Im Supabase-Dashboard: **Authentication → Users → Add user → Create new user**.
   - E-Mail: `<benutzername>@family.local` (also z.B. bei Benutzername "Milli" → `milli@family.local`)
   - Passwort: das jeweils gewählte Passwort (mindestens 6 Zeichen)
   - Häkchen bei **"Auto Confirm User"** setzen → **Create user**.
   - Das Ganze ein zweites Mal für den jeweils anderen Zugang wiederholen.
2. **Authentication → Providers → Email** → Schalter **"Allow new users to sign up"** deaktivieren (damit sich niemand sonst selbst einen Zugang anlegen kann).
3. Im Spiel (`index.html`) meldet sich Milli mit **ihrem** Zugang an, im Dashboard
   (`dashboard.html`) meldest du dich mit dem **Familien**-Zugang an - danach
   bleibt die Anmeldung im jeweiligen Browser gespeichert, es muss nicht jedes
   Mal neu eingegeben werden.

> ℹ️ Beide Zugänge haben in der Datenbank technisch dieselben Rechte (lesen +
> schreiben), das Login trennt nur, wer die App überhaupt öffnen kann. Die
> eigentliche Trennung "Milli sieht das Dashboard nicht" kommt zusätzlich über
> den PIN in `config.js` (`PARENT_PIN`), den nur du kennst.

## 5. Auf GitHub veröffentlichen

Das übernimmst du selbst über deinen eigenen GitHub-Account:

1. Erstelle ein neues (privates oder öffentliches) Repository auf GitHub.
2. Push den Inhalt dieses Ordners hinein, z.B.:
   ```bash
   git init
   git add .
   git commit -m "Milli Power Akademie"
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

## Wie das Spiel aufgebaut ist

**Zwei Fächer, getrennt:** Division und Multiplikation werden nie gemischt -
Milli wählt zu Beginn, welches Fach sie üben möchte.

**Genau 10 Curriculum-Pakete:** Statt starr eine Reihe nach der anderen zu
üben, mischt jedes 10-Aufgaben-Paket bewusst mehrere Reihen (nie zwei gleiche
Reihen direkt hintereinander) - das sorgt für Abwechslung statt stumpfem
Auswendiglernen einer einzelnen Reihe. Welche Reihen im Mix sind, wächst mit
jedem Paket um eine weitere Reihe: Paket 1 nutzt Reihen 1-3, Paket 2 → 1-4,
… bis Paket 10 → alle 1-12 im Mix. Innerhalb eines Pakets gilt:
- Ergebnisse 11 und 12 kommen in den Curriculum-Paketen nie vor (die tauchen
  nur gelegentlich in der Milli Power Akademie auf).
- Eine Aufgabe kann übersprungen werden und kommt später im selben Paket
  nochmal dran.
- Eine falsch beantwortete Aufgabe kann beliebig oft neu versucht werden.
- Ein Paket gilt erst als abgeschlossen, wenn alle 10 Aufgaben richtig
  beantwortet wurden (übersprungene/falsche zählen erst, wenn sie am Ende
  richtig gelöst sind) - dafür gibt's Konfetti und 1-3 Sterne.

**Ab Paket 11: automatische Wiederholungs-Pakete.** Sobald alle 10
Curriculum-Pakete geschafft sind, werden weitere Pakete (11, 12, 13, …)
automatisch aus den Aufgaben gebaut, bei denen es zuletzt Fehler gab oder die
oft übersprungen wurden - ebenfalls maximal 10 Aufgaben pro Paket, mit
denselben Regeln (überspringen, beliebig oft neu versuchen). Ist gerade
nichts zu wiederholen, zeigt die Paket-Übersicht "✅ Kein Rückstand" statt
eines neuen Pakets - sobald wieder etwas auffällt (z.B. beim Üben in der
Akademie), erscheint automatisch ein neues Wiederholungs-Paket.

**Milli Power Akademie:** Endloses, gewichtetes Üben über alle bisher
eingeführten Reihen. Jede der bis zu 144 Aufgaben pro Fach hat eine
"Box-Stufe" 0-4: richtig beantwortet → Stufe rauf, falsch → deutlich runter,
übersprungen erhöht zusätzlich das Auswahl-Gewicht. Schwache/oft übersprungene
Aufgaben kommen häufiger dran, sicher gemeisterte nur noch selten (zur
Auffrischung) - aber nie ganz raus.

## Was das Eltern-Dashboard zeigt

- Eine kompakte Zusammenfassung ganz oben (Trefferquote gesamt, Übungstage,
  aktuelles Paket + Sterne je Fach, offene Wiederholungen je Fach)
- Division und Multiplikation getrennt umschaltbar (Tabs)
- Fehlerquote je Reihe (1-12)
- Die einzelnen Aufgaben mit den meisten Fehlern
- Die einzelnen Aufgaben, die am häufigsten übersprungen wurden
- Trefferquote über die **komplette** Übungshistorie (nicht nur die letzten Tage)
- Automatisch erkannte Fehlermuster (z.B. "verzählt sich oft um 1",
  "verwechselt benachbarte Reihen", "schreibt manchmal nur die erste Zahl
  ab") mit konkretem Beispiel, worauf du zu Hause gezielt eingehen kannst
