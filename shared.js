/* ============================================================
   Divisions-Champion – geteilte Logik für Spiel & Eltern-Dashboard
   ============================================================ */

/* ---------- Konfiguration ---------- */
const TABLE_COLORS = {
  1:'#e63946', 2:'#f3722c', 3:'#f8b64c', 4:'#f6e94e',
  5:'#90c85c', 6:'#2a9d54', 7:'#274c9b', 8:'#2196c9',
  9:'#6ec6e0', 10:'#e6398a', 11:'#9c4fa8', 12:'#5e2a7e'
};
const STORAGE_KEY = 'divisionsChampionProgress_v1';
const LEVELS_PER_ROUND = 12;
const AKADEMIE_ROUND_LENGTH = 16;
// Gedächtnis-Gewichte je Box-Stufe: 0 = wird gerade noch geübt, 4 = sicher gemeistert.
// Je niedriger die Box, desto öfter taucht die Aufgabe in der Milli Power Akademie auf.
const BOX_WEIGHTS = { 0:10, 1:6, 2:3, 3:1.5, 4:0.4 };
const UNSEEN_WEIGHT = 7;

/* ---------- Zustand (lokaler Cache) ---------- */
function defaultState(){
  const stars = {};
  const unlocked = {};
  for(let i=1;i<=12;i++){ stars[i]=0; unlocked[i]= (i===1); }
  return { stars, unlocked, score:0, bestStreak:0, facts:{} };
}
let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return Object.assign(base, parsed, {
      stars: Object.assign(base.stars, parsed.stars||{}),
      unlocked: Object.assign(base.unlocked, parsed.unlocked||{}),
      facts: Object.assign(base.facts, parsed.facts||{})
    });
  }catch(e){ return defaultState(); }
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function totalStars(){
  return Object.values(state.stars).reduce((a,b)=>a+b,0);
}
function refreshUnlocks(){
  for(let i=2;i<=12;i++){
    if(state.stars[i-1] >= 1) state.unlocked[i] = true;
  }
}

/* ---------- Gedächtnis pro Aufgabe ---------- */
function factKey(divisor, quotient){ return divisor + '_' + quotient; }

function getFact(divisor, quotient){
  const f = state.facts[factKey(divisor, quotient)];
  return f || { box:0, correct:0, wrong:0, seen:false };
}

function updateFact(divisor, quotient, correct){
  const key = factKey(divisor, quotient);
  const f = state.facts[key] || { box:0, correct:0, wrong:0, seen:false };
  f.seen = true;
  if(correct){
    f.box = Math.min(4, f.box + 1);
    f.correct++;
  } else {
    f.box = Math.max(0, f.box - 2);
    f.wrong++;
  }
  state.facts[key] = f;
  return f;
}

function weightForFact(fact){
  if(!fact.seen) return UNSEEN_WEIGHT;
  return BOX_WEIGHTS[fact.box] ?? 1;
}

// Ermittelt, welche (freigeschalteten) Reihen tendenziell Fehler verursachen.
// Zuerst zählt, wo tatsächlich Fehler passiert sind (echtes Fehlermuster);
// wo noch keine Fehler vorliegen, dient der Übungsstand als Rückfallkriterium
// (z.B. ganz neu freigeschaltete Reihen).
function analyzeWeakAreas(){
  const perTable = [];
  for(let d=1; d<=12; d++){
    if(!state.unlocked[d]) continue;
    let totalWrong = 0, totalWeight = 0;
    for(let q=1;q<=12;q++){
      const f = getFact(d,q);
      totalWrong += f.wrong || 0;
      totalWeight += weightForFact(f);
    }
    perTable.push([d, totalWrong, totalWeight/12]);
  }
  perTable.sort((a,b)=> (b[1]-a[1]) || (b[2]-a[2]));
  return perTable.slice(0,2).map(e=>e[0]);
}

function akademieHintText(){
  const weak = analyzeWeakAreas();
  if(weak.length === 0) return 'Spiele zuerst eine Reihe, damit Milli sehen kann, wo du üben solltest!';
  if(weak.length === 1) return `🦊 Milli hat gesehen: Die ÷${weak[0]}-Reihe braucht noch etwas Übung. Los geht's!`;
  return `🦊 Milli hat gesehen: Die ÷${weak[0]}- und ÷${weak[1]}-Reihe brauchen noch etwas Übung. Los geht's!`;
}

function starString(n){
  if(n<=0) return '☆ ☆ ☆';
  const filled = '★ '.repeat(n);
  const empty = '☆ '.repeat(3-n);
  return (filled+empty).trim();
}

/* ---------- Aufgaben-Generierung ---------- */
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

function buildQuestions(divisor){
  const qs = [];
  for(let q=1;q<=12;q++){
    qs.push({ dividend: divisor*q, divisor: divisor, answer: q });
  }
  return shuffle(qs);
}

// Baut den Aufgaben-Pool für die Milli Power Akademie: jede Aufgabe bekommt ein
// Gewicht nach Gedächtnis-Stand, damit sichere Aufgaben seltener, unsichere
// Aufgaben häufiger drankommen - aber über die Zeit bleibt alles im Umlauf.
function buildAkademiePool(){
  const pool = [];
  for(let d=1; d<=12; d++){
    if(!state.unlocked[d]) continue;
    for(let q=1;q<=12;q++){
      const fact = getFact(d,q);
      pool.push({ dividend:d*q, divisor:d, answer:q, weight: weightForFact(fact) });
    }
  }
  return pool;
}

function weightedSample(pool, n){
  const items = pool.slice();
  const picked = [];
  n = Math.min(n, items.length);
  for(let i=0;i<n;i++){
    const total = items.reduce((s,it)=>s+it.weight, 0);
    let r = Math.random()*total;
    let idx = 0;
    for(; idx<items.length-1; idx++){
      r -= items[idx].weight;
      if(r <= 0) break;
    }
    picked.push(items[idx]);
    items.splice(idx,1);
  }
  return picked;
}

function buildAkademieQuestions(){
  const pool = buildAkademiePool();
  return shuffle(weightedSample(pool, AKADEMIE_ROUND_LENGTH));
}

/* ============================================================
   Cloud-Sync (Supabase) – optional, mit lokalem Fallback
   Erwartet ein globales APP_CONFIG aus config.js:
     { SUPABASE_URL, SUPABASE_ANON_KEY, PARENT_PIN }
   Ist nichts konfiguriert, läuft die App rein lokal weiter
   (localStorage) - nichts bricht, es gibt nur keine Cloud-Sicherung.
   ============================================================ */
function supabaseConfigured(){
  return typeof APP_CONFIG !== 'undefined'
    && APP_CONFIG.SUPABASE_URL && !/HIER/.test(APP_CONFIG.SUPABASE_URL)
    && APP_CONFIG.SUPABASE_ANON_KEY && !/HIER/.test(APP_CONFIG.SUPABASE_ANON_KEY);
}

let supabaseClient = null;
function getSupabaseClient(){
  if(!supabaseConfigured()) return null;
  if(!supabaseClient && typeof window.supabase !== 'undefined'){
    supabaseClient = window.supabase.createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// Fire-and-forget: wird vom Spiel nach jeder Antwort aufgerufen. Fehler (z.B.
// kein Internet) werden bewusst verschluckt, damit das Spiel nie hängen bleibt.
function cloudLogAnswer(entry){
  const sb = getSupabaseClient();
  if(!sb) return;
  sb.from('answer_log').insert({
    divisor: entry.divisor,
    quotient: entry.answer,
    dividend: entry.dividend,
    given_answer: entry.given,
    correct: entry.correct,
    mode: entry.mode
  }).then(({error})=>{ if(error) console.warn('cloudLogAnswer', error.message); });
}

function cloudUpsertFact(divisor, quotient, fact){
  const sb = getSupabaseClient();
  if(!sb) return;
  sb.from('facts').upsert({
    divisor, quotient,
    box: fact.box,
    correct_count: fact.correct,
    wrong_count: fact.wrong,
    seen: fact.seen,
    updated_at: new Date().toISOString()
  }, { onConflict: 'divisor,quotient' }).then(({error})=>{ if(error) console.warn('cloudUpsertFact', error.message); });
}

function cloudUpsertProgress(){
  const sb = getSupabaseClient();
  if(!sb) return;
  sb.from('progress').upsert({
    id: true,
    stars: state.stars,
    unlocked: state.unlocked,
    score: state.score,
    best_streak: state.bestStreak,
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' }).then(({error})=>{ if(error) console.warn('cloudUpsertProgress', error.message); });
}

// Beim Start versuchen, den Cloud-Stand zu laden und über den lokalen Cache zu
// legen (Cloud gewinnt bei Konflikten - Mehrgeräte-Nutzung). Schlägt still fehl,
// wenn nicht konfiguriert oder kein Internet.
async function cloudLoadIntoState(){
  const sb = getSupabaseClient();
  if(!sb) return false;
  try{
    const [{ data: factRows, error: factErr }, { data: progressRows, error: progErr }] = await Promise.all([
      sb.from('facts').select('*'),
      sb.from('progress').select('*').eq('id', true).limit(1)
    ]);
    if(factErr || progErr) throw factErr || progErr;
    if(factRows){
      factRows.forEach(r=>{
        state.facts[factKey(r.divisor, r.quotient)] = {
          box: r.box, correct: r.correct_count, wrong: r.wrong_count, seen: r.seen
        };
      });
    }
    if(progressRows && progressRows[0]){
      const p = progressRows[0];
      state.stars = Object.assign(state.stars, p.stars || {});
      state.unlocked = Object.assign(state.unlocked, p.unlocked || {});
      state.score = p.score || state.score;
      state.bestStreak = p.best_streak || state.bestStreak;
    }
    saveState();
    return true;
  }catch(e){
    console.warn('cloudLoadIntoState fehlgeschlagen (offline?):', e && e.message);
    return false;
  }
}

/* ---------- Fehlbild-Klassifizierung (fürs Eltern-Dashboard) ----------
   Ordnet eine falsche Antwort einem typischen Fehlermuster zu, damit
   Eltern sehen, WORAN es hakt statt nur WIE VIEL falsch war. */
function classifyMistake(row){
  const { dividend, divisor, quotient, given_answer } = row;
  if(given_answer === null || given_answer === undefined) return 'unbekannt';
  if(given_answer === quotient) return null; // war eigentlich richtig
  const delta = given_answer - quotient;
  if(delta === 1 || delta === -1) return 'verzaehlt';
  if(given_answer === divisor) return 'ergebnis_divisor_vertauscht';
  if(given_answer === dividend) return 'nicht_dividiert';
  if(divisor+1 > 0 && dividend % (divisor+1) === 0 && given_answer === dividend/(divisor+1)) return 'nachbarreihe';
  if(divisor-1 > 0 && dividend % (divisor-1) === 0 && given_answer === dividend/(divisor-1)) return 'nachbarreihe';
  return 'sonstige';
}

const MISTAKE_LABELS = {
  verzaehlt: {
    title: 'Verzählt sich oft um 1',
    detail: (ex)=>`Bei Aufgaben wie ${ex.dividend}÷${ex.divisor} liegt ihre Antwort meist nur um 1 daneben. Das deutet auf Unsicherheit beim Abzählen der Reihen hin – lautes gemeinsames Durchzählen hilft hier oft mehr als reines Auswendiglernen.`
  },
  nachbarreihe: {
    title: 'Verwechselt benachbarte Reihen',
    detail: (ex)=>`Bei ${ex.dividend}÷${ex.divisor} rutscht die Antwort manchmal in die Nachbar-Reihe (z.B. ÷${ex.divisor-1} oder ÷${ex.divisor+1}). Gezieltes Üben genau dieser Reihe im direkten Vergleich kann helfen.`
  },
  ergebnis_divisor_vertauscht: {
    title: 'Vertauscht Ergebnis und Divisor',
    detail: (ex)=>`Bei ${ex.dividend}÷${ex.divisor} wird manchmal der Divisor selbst als Ergebnis genannt. Das kann auf Unsicherheit beim Verständnis von "geteilt durch" hindeuten – evtl. mit Gegenständen aufteilen üben.`
  },
  nicht_dividiert: {
    title: 'Schreibt die Dividende ab',
    detail: (ex)=>`Bei ${ex.dividend}÷${ex.divisor} wurde manchmal einfach ${ex.dividend} als Antwort gegeben. Das spricht dafür, dass die Aufgabe unter Zeitdruck nicht wirklich gerechnet, sondern nur abgeschrieben wurde.`
  },
  sonstige: {
    title: 'Unregelmäßige Fehler',
    detail: (ex)=>`Bei ${ex.dividend}÷${ex.divisor} gab es Fehler ohne klares Muster – am ehesten hilft hier einfach mehr Übung in kleinen Portionen.`
  }
};
