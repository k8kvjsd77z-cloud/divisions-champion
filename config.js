/* ============================================================
   Divisions-Champion – Konfiguration
   ============================================================
   Trage hier deine eigenen Supabase-Zugangsdaten ein, siehe README.md
   ("1. Supabase-Projekt anlegen"). Solange hier noch "HIER-EINTRAGEN"
   steht, läuft die App ganz normal weiter - nur ohne Cloud-Sicherung
   (Fortschritt bleibt dann nur lokal im Browser gespeichert).
   ============================================================ */
const APP_CONFIG = {
  SUPABASE_URL: 'https://nftojjuyueqsvqqnbmbk.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdG9qanV5dWVxc3ZxcW5ibWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNDc4NDIsImV4cCI6MjEwMDYyMzg0Mn0.sFIT-lyk0V70MMY21IzeSI-0GvFRxJkdlLgFaWTaLsE',

  // Einfacher 4-stelliger Code, der das Eltern-Dashboard von deiner Tochter
  // trennt. Das ist KEIN echter Login, nur eine kleine Hürde - ändere ihn
  // gern auf eine Zahl, die du dir leicht merken kannst.
  PARENT_PIN: '1234'
};
