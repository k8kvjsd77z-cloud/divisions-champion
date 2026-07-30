/* ============================================================
   Milli Power Akademie – geteilte Logik für Spiel & Eltern-Dashboard
   Trainer: Papalino · Schülerin: Milli
   ============================================================ */

/* ---------- Konfiguration ---------- */
const TABLE_COLORS = {
  1:'#e63946', 2:'#f3722c', 3:'#f8b64c', 4:'#f6e94e',
  5:'#90c85c', 6:'#2a9d54', 7:'#274c9b', 8:'#2196c9',
  9:'#6ec6e0', 10:'#e6398a', 11:'#9c4fa8', 12:'#5e2a7e'
};
const SUBJECTS = ['division', 'multiplication'];
const SUBJECT_LABELS = { division: 'Division', multiplication: 'Multiplikation' };
const STORAGE_KEY = 'milliPowerAkademieProgress_v2';
const PACKAGE_SIZE = 10;
const AKADEMIE_ROUND_LENGTH = 16;
const SONDERBLOCK_SIZE = 10;
// Genau 10 feste Curriculum-Pakete (÷/× 1 bis 12 werden bis Paket 10 komplett
// eingeführt). Paket 11 und danach sind automatisch Wiederholungs-Pakete.
const CURRICULUM_PACKAGE_COUNT = 10;
const PACKAGE_REIHEN_CAPS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// Gedächtnis-Gewichte je Box-Stufe: 0 = wird gerade noch geübt, 4 = sicher gemeistert.
const BOX_WEIGHTS = { 0:10, 1:6, 2:3, 3:1.5, 4:0.4 };
const UNSEEN_WEIGHT = 7;
// Wie stark häufiges Überspringen das Auswahl-Gewicht zusätzlich erhöht.
const SKIP_WEIGHT_BONUS = 1.5;
const SKIP_WEIGHT_CAP = 5;
// Ab wie vielen Übersprüngen eine Aufgabe in die Wiederholung wandert.
// Bewusst auf 1 gesetzt: jede übersprungene oder falsch beantwortete Aufgabe
// landet garantiert in der Wiederholung, genau wie eine falsch beantwortete.
const SKIP_FLAG_THRESHOLD = 1;

// Schriftliche Division/Multiplikation: eigenständige Bereiche, unabhängig
// von den Reihen-Paketen oben. Jede Aufgabe wird frisch zufällig erzeugt
// (kein fester 144er-Aufgabenpool). Je Rechenart gibt es mehrere gleichartige
// Sessions (mehr Übungsvolumen als 5 Pakete) - jede mit eigenem Fortschritt,
// eigenen 5 Paketen à 5 Aufgaben, und eigener Wiederholung analog zu
// Division/Multiplikation (Paket 6+ = dynamische Wiederholungs-Pakete aus
// den bisher auffälligen Reihen dieser Session).
const WRITTEN_MULTIPLICATION_SUBJECTS = ['writtenMultiplication', 'writtenMultiplication2', 'writtenMultiplication3'];
const WRITTEN_DIVISION_SUBJECTS = ['writtenDivision', 'writtenDivision2', 'writtenDivision3'];
const WRITTEN_SUBJECTS = WRITTEN_MULTIPLICATION_SUBJECTS.concat(WRITTEN_DIVISION_SUBJECTS);
const WRITTEN_SUBJECT_LABELS = {
  writtenMultiplication: 'Schriftliche Multiplikation',
  writtenMultiplication2: 'Schriftliche Multiplikation 2',
  writtenMultiplication3: 'Schriftliche Multiplikation 3',
  writtenDivision: 'Schriftliche Division',
  writtenDivision2: 'Schriftliche Division 2',
  writtenDivision3: 'Schriftliche Division 3'
};
// Fester Beispiel-Rechenweg, der jedes Mal gezeigt wird, wenn Milli neu in
// eine der schriftlichen Sessions einsteigt (nicht an die konkreten Zahlen
// des jeweiligen Pakets gekoppelt, nur zur Erinnerung an die Methode). Bei
// der Division wird die Zerlegung des Dividenden (60, 12) inzwischen selbst
// eingetragen - das Beispiel zeigt trotzdem den kompletten, fertigen
// Rechenweg zum Nachlesen.
const WRITTEN_MULTIPLICATION_INTRO = [
  { text: '2 × 44 = ?' },
  { text: '2 × 40 = 80' },
  { text: '2 × 4 = 8' },
  { text: '80 + 8 = 88', final: true }
];
const WRITTEN_DIVISION_INTRO = [
  { text: '128 ÷ 4 = ?' },
  { text: '120 ÷ 4 = 30' },
  { text: '8 ÷ 4 = 2' },
  { text: '30 + 2 = 32', final: true }
];
const WRITTEN_INTRO_EXAMPLES = {
  writtenMultiplication: WRITTEN_MULTIPLICATION_INTRO,
  writtenMultiplication2: WRITTEN_MULTIPLICATION_INTRO,
  writtenMultiplication3: WRITTEN_MULTIPLICATION_INTRO,
  writtenDivision: WRITTEN_DIVISION_INTRO,
  writtenDivision2: WRITTEN_DIVISION_INTRO,
  writtenDivision3: WRITTEN_DIVISION_INTRO
};
// Für Stellen (z.B. Eltern-Dashboard), die automatisch ALLE Fächer anzeigen
// sollen - auch neu hinzugefügte - statt sie einzeln aufzuzählen.
const ALL_SUBJECTS = SUBJECTS.concat(WRITTEN_SUBJECTS);
const ALL_SUBJECT_LABELS = Object.assign({}, SUBJECT_LABELS, WRITTEN_SUBJECT_LABELS);
const SUBJECT_ICONS = {
  division: '➗',
  multiplication: '✖️',
  writtenMultiplication: '✍️',
  writtenMultiplication2: '✍️',
  writtenMultiplication3: '✍️',
  writtenDivision: '✍️',
  writtenDivision2: '✍️',
  writtenDivision3: '✍️'
};

// Genau 5 feste Einstiegs-Pakete je Session (÷/× 2 bis 9 werden bis Paket 5
// komplett eingeführt). Paket 6 und danach sind automatisch Wiederholungs-
// Pakete, genau wie bei Division/Multiplikation ab Paket 11.
const WRITTEN_PACKAGE_COUNT = 5;
const WRITTEN_PACKAGE_SIZE = 5;
// Welcher einstellige Faktor/Divisor je Paket im Topf ist - wächst wie bei
// den normalen Paketen schrittweise.
const WRITTEN_FACTOR_POOLS = [
  [2,3],
  [2,3,4,5],
  [2,3,4,5,6],
  [2,3,4,5,6,7,8],
  [2,3,4,5,6,7,8,9]
];
// Für die Fehlerquote-je-Reihe-Auswertung im Dashboard: welcher Reihen-Bereich
// bei den schriftlichen Fächern überhaupt vorkommen kann (aus den Faktor-
// Töpfen oben abgeleitet, statt fest verdrahtet).
const WRITTEN_REIHE_MIN = Math.min(...WRITTEN_FACTOR_POOLS.flat());
const WRITTEN_REIHE_MAX = Math.max(...WRITTEN_FACTOR_POOLS.flat());

/* ---------- Zustand (lokaler Cache) ---------- */
function defaultSubjectState(){
  return { packages: {}, facts: {} };
}
function defaultWrittenSubjectState(){
  // "facts" hier: ein Eintrag pro Reihe (einstelliger Faktor/Divisor 2-9),
  // nicht pro Einzelaufgabe - die zweistellige Zahl wird ja jedes Mal neu
  // zufällig erzeugt. So bekommt das Eltern-Dashboard trotzdem eine
  // Fehlerquote-je-Reihe-Auswertung wie bei Division/Multiplikation.
  return { packages: {}, facts: {} };
}
function defaultState(){
  const subjects = {};
  SUBJECTS.forEach(s=>{ subjects[s] = defaultSubjectState(); });
  const written = {};
  WRITTEN_SUBJECTS.forEach(s=>{ written[s] = defaultWrittenSubjectState(); });
  return { score:0, bestStreak:0, subjects, written };
}
let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    const merged = Object.assign(base, parsed);
    SUBJECTS.forEach(s=>{
      const parsedSub = (parsed.subjects && parsed.subjects[s]) || {};
      merged.subjects[s] = {
        packages: Object.assign({}, parsedSub.packages || {}),
        facts: Object.assign({}, parsedSub.facts || {})
      };
    });
    WRITTEN_SUBJECTS.forEach(s=>{
      const parsedSub = (parsed.written && parsed.written[s]) || {};
      merged.written[s] = {
        packages: Object.assign({}, parsedSub.packages || {}),
        facts: Object.assign({}, parsedSub.facts || {})
      };
    });
    return merged;
  }catch(e){ return defaultState(); }
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------- Paket-Fortschritt ---------- */
function currentPackageNumber(subject){
  const packages = state.subjects[subject].packages;
  let n = 1;
  while(packages[n] && packages[n].completed) n++;
  return n;
}

function currentWrittenPackageNumber(subject){
  const packages = state.written[subject].packages;
  let n = 1;
  while(packages[n] && packages[n].completed) n++;
  return n;
}

function totalWrittenStars(subject){
  const packages = state.written[subject].packages;
  return Object.values(packages).reduce((sum,p)=>sum + (p.stars||0), 0);
}

function reihenPoolForPackage(packageNumber){
  const idx = Math.min(packageNumber - 1, PACKAGE_REIHEN_CAPS.length - 1);
  const cap = PACKAGE_REIHEN_CAPS[Math.max(idx, 0)];
  const pool = [];
  for(let r=1; r<=cap; r++) pool.push(r);
  return pool;
}

function unlockedReihen(subject){
  return reihenPoolForPackage(currentPackageNumber(subject));
}

function isCurriculumPackage(packageNumber){
  return packageNumber <= CURRICULUM_PACKAGE_COUNT;
}

// Wiederholungs-Pakete (11+) haben keinen festen Block-Index - die auffälligen
// Aufgaben verschieben sich ja bei jeder Antwort. Jedes Wiederholungs-Paket
// greift deshalb einfach immer den *aktuell* schlechtesten Block (Index 0)
// der live berechneten Sonderblöcke, egal welche Paket-Nummer gerade dran ist.
function packageHasContent(subject, packageNumber){
  if(isCurriculumPackage(packageNumber)) return true;
  return buildSonderblöcke(subject).length > 0;
}

function buildReviewPackageQuestions(subject){
  const blocks = buildSonderblöcke(subject);
  const block = blocks[0] || [];
  return block.map(t=>makeTask(t.subject, t.reihe, t.position));
}

function buildPackageQuestions(subject, packageNumber){
  if(isCurriculumPackage(packageNumber)) return buildGuidedPackage(subject, packageNumber);
  return buildReviewPackageQuestions(subject);
}

function totalStars(subject){
  const packages = state.subjects[subject].packages;
  return Object.values(packages).reduce((sum,p)=>sum + (p.stars||0), 0);
}
function totalStarsAllSubjects(){
  return SUBJECTS.reduce((sum,s)=>sum + totalStars(s), 0);
}

function starString(n){
  if(n<=0) return '☆ ☆ ☆';
  const filled = '★ '.repeat(n);
  const empty = '☆ '.repeat(3-n);
  return (filled+empty).trim();
}

/* ---------- Gedächtnis pro Aufgabe ---------- */
function factKey(reihe, position){ return reihe + '_' + position; }

// Division/Multiplikation führen ihre Fakten in state.subjects, die
// schriftlichen Fächer in state.written - dieser Helfer findet den
// richtigen Eimer, damit getFact/updateFact/skipFact für alle vier
// Fächer gleich funktionieren.
function factsBucket(subject){
  return WRITTEN_SUBJECTS.includes(subject) ? state.written[subject] : state.subjects[subject];
}

function getFact(subject, reihe, position){
  const f = factsBucket(subject).facts[factKey(reihe, position)];
  return f || { box:0, correct:0, wrong:0, skip:0, seen:false };
}

function updateFact(subject, reihe, position, correct){
  const key = factKey(reihe, position);
  const facts = factsBucket(subject).facts;
  const f = facts[key] || { box:0, correct:0, wrong:0, skip:0, seen:false };
  f.seen = true;
  if(correct){
    f.box = Math.min(4, f.box + 1);
    f.correct++;
  } else {
    f.box = Math.max(0, f.box - 2);
    f.wrong++;
  }
  facts[key] = f;
  return f;
}

function skipFact(subject, reihe, position){
  const key = factKey(reihe, position);
  const facts = factsBucket(subject).facts;
  const f = facts[key] || { box:0, correct:0, wrong:0, skip:0, seen:false };
  f.seen = true;
  f.skip++;
  facts[key] = f;
  return f;
}

function weightForFact(fact){
  const base = fact.seen ? (BOX_WEIGHTS[fact.box] ?? 1) : UNSEEN_WEIGHT;
  const skipBonus = Math.min(fact.skip||0, SKIP_WEIGHT_CAP) * SKIP_WEIGHT_BONUS;
  return base + skipBonus;
}

// Nur "aktuell noch schwach" (niedrige Box-Stufe) UND mit Fehler-/Übersprungen-
// Historie gilt als Wiederholungs-Kandidat. So verschwindet eine Aufgabe aus
// dem Sonderbereich, sobald sie wieder sicher sitzt - statt für immer wegen
// eines einzelnen alten Fehlers dort hängen zu bleiben.
function isFlagged(fact){
  if((fact.box||0) > 1) return false;
  return (fact.wrong||0) > 0 || (fact.skip||0) >= SKIP_FLAG_THRESHOLD;
}

// Ermittelt, welche Reihen (im bisher eingeführten Bereich) tendenziell Fehler
// verursachen. Zuerst zählt, wo tatsächlich Fehler passiert sind; wo noch keine
// Fehler vorliegen, dient der Übungsstand als Rückfallkriterium.
function analyzeWeakAreas(subject){
  const reihen = unlockedReihen(subject);
  const perTable = reihen.map(r=>{
    let totalWrong = 0, totalWeight = 0;
    for(let p=1; p<=12; p++){
      const f = getFact(subject, r, p);
      totalWrong += f.wrong || 0;
      totalWeight += weightForFact(f);
    }
    return [r, totalWrong, totalWeight/12];
  });
  perTable.sort((a,b)=> (b[1]-a[1]) || (b[2]-a[2]));
  return perTable.slice(0,2).map(e=>e[0]);
}

function subjectSymbol(subject){ return subject.toLowerCase().includes('division') ? '÷' : '×'; }

// Anzeige-Label für eine "Reihe" bei den schriftlichen Fächern im Dashboard -
// dort gibt es keine feste Einzelaufgabe, nur den einstelligen Faktor/Divisor.
function writtenReiheLabel(subject, reihe){
  return `${subjectSymbol(subject)}${reihe}-Reihe (schriftlich)`;
}

function akademieHintText(subject){
  const weak = analyzeWeakAreas(subject);
  const sym = subjectSymbol(subject);
  if(weak.length === 0) return 'Löse zuerst ein Paket, damit Papalino sehen kann, wo Milli üben sollte!';
  if(weak.length === 1) return `🐯 Papalino hat gesehen: Die ${sym}${weak[0]}-Reihe braucht noch etwas Übung. Los geht's, Milli!`;
  return `🐯 Papalino hat gesehen: Die ${sym}${weak[0]}- und ${sym}${weak[1]}-Reihe brauchen noch etwas Übung. Los geht's, Milli!`;
}

/* ---------- Aufgaben-Erzeugung ---------- */
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

// Baut eine Aufgabe aus Fach + Reihe + Position (Position = Ergebnis bei
// Division, zweiter Faktor bei Multiplikation).
function makeTask(subject, reihe, position){
  if(subject === 'division'){
    return { subject, reihe, position, answer: position, promptText: `${reihe*position} ÷ ${reihe} =` };
  }
  return { subject, reihe, position, answer: reihe*position, promptText: `${reihe} × ${position} =` };
}

// Verteilt die Aufgaben per Greedy so, dass nie zweimal hintereinander dieselbe
// Reihe drankommt (in jedem Schritt die Reihe mit den meisten verbleibenden
// Aufgaben wählen, außer sie war gerade dran) - das ist rechnerisch immer
// möglich, solange keine Reihe mehr als die Hälfte der Aufgaben stellt, was
// bei unserem Reihen-Pool immer der Fall ist.
function avoidConsecutiveRepeats(items){
  const groups = {};
  items.forEach(it=>{ (groups[it.reihe] = groups[it.reihe] || []).push(it); });
  const counts = Object.keys(groups).map(r=>({ reihe:r, remaining: groups[r].length }));
  const result = [];
  let lastReihe = null;
  for(let i=0; i<items.length; i++){
    counts.sort((a,b)=>b.remaining-a.remaining);
    let choice = counts.find(c=>c.remaining>0 && c.reihe!==lastReihe);
    if(!choice) choice = counts.find(c=>c.remaining>0);
    result.push(groups[choice.reihe].pop());
    choice.remaining--;
    lastReihe = choice.reihe;
  }
  return result;
}

// Geführtes Zehnerpaket: mischt Reihen aus dem für dieses Paket freigegebenen
// Bereich, Ergebnis/Position immer 1-10 (11 und 12 kommen hier nie vor).
// Die 10 Aufgaben werden zuerst möglichst gleichmäßig auf die verfügbaren
// Reihen verteilt (nie mehr als die Hälfte aus einer Reihe) - nur so lässt
// sich hinterher garantiert vermeiden, dass eine Reihe zweimal hintereinander
// drankommt.
function buildGuidedPackage(subject, packageNumber){
  const reihen = shuffle(reihenPoolForPackage(packageNumber).slice());
  const counts = {};
  reihen.forEach(r=>{ counts[r] = 0; });
  for(let i=0; i<PACKAGE_SIZE; i++){
    counts[reihen[i % reihen.length]]++;
  }
  const items = [];
  Object.keys(counts).forEach(r=>{
    const positions = shuffle([1,2,3,4,5,6,7,8,9,10]).slice(0, counts[r]);
    positions.forEach(p=>items.push({ reihe:Number(r), position:p }));
  });
  const arranged = avoidConsecutiveRepeats(shuffle(items));
  return arranged.map(t=>makeTask(subject, t.reihe, t.position));
}

/* ============================================================
   Schriftliche Division/Multiplikation
   Zerlegungs-Rechenweg: die zweistellige Zahl wird in Zehner + Einer
   zerlegt. Bei Multiplikation wird jeder Teil mit dem einstelligen Faktor
   multipliziert (5×12 -> 5×10 und 5×2). Bei Division wird das (zweistellige)
   Ergebnis in Zehner + Einer zerlegt und beide Teile durch denselben
   Divisor geteilt (72÷6 -> 60÷6 und 12÷6) - bei größeren Divisoren kann die
   Ausgangszahl dafür auch dreistellig werden, das ist genau der Sinn der
   Übung (große Aufgaben in einfache Teile zerlegen). Bei beiden Rechenarten
   ist die Zerlegung selbst (Zehner-/Einerteil bzw. die beiden Dividenden-
   Teile) ein eigenes Eingabefeld - Milli soll sie selbst herleiten, nicht
   nur die Teilergebnisse eintragen.
   ============================================================ */
function isWrittenCurriculumPackage(packageNumber){
  return packageNumber <= WRITTEN_PACKAGE_COUNT;
}

function writtenPackageTileLabel(n){
  return n > WRITTEN_PACKAGE_COUNT ? `Wiederholung ${n - WRITTEN_PACKAGE_COUNT}` : `Paket ${n}`;
}

// Analog zu buildSonderblöcke, aber auf Reihen-Ebene (2-9) statt auf
// einzelnen (reihe,position)-Fakten, da bei den schriftlichen Fächern jede
// Aufgabe frisch zufällig erzeugt wird und es keine feste Position gibt.
// Chunkt in Blöcke von WRITTEN_PACKAGE_SIZE, damit - wie bei Division/
// Multiplikation - mehrere anstehende Wiederholungs-Pakete als Vorschau
// gezeigt werden können, falls mehr als 5 Reihen gleichzeitig auffällig sind.
function buildWrittenSonderblöcke(subject){
  const flagged = [];
  for(let r=WRITTEN_REIHE_MIN; r<=WRITTEN_REIHE_MAX; r++){
    const fact = getFact(subject, r, 1);
    if(isFlagged(fact)) flagged.push({ reihe:r, weight: weightForFact(fact) });
  }
  flagged.sort((a,b)=>b.weight - a.weight);
  const reihen = flagged.map(f=>f.reihe);
  const blocks = [];
  for(let i=0; i<reihen.length; i+=WRITTEN_PACKAGE_SIZE){
    blocks.push(reihen.slice(i, i+WRITTEN_PACKAGE_SIZE));
  }
  return blocks;
}

function writtenPackageHasContent(subject, packageNumber){
  if(isWrittenCurriculumPackage(packageNumber)) return true;
  return buildWrittenSonderblöcke(subject).length > 0;
}

function writtenFactorPool(subject, packageNumber){
  if(isWrittenCurriculumPackage(packageNumber)){
    return WRITTEN_FACTOR_POOLS[Math.min(packageNumber - 1, WRITTEN_FACTOR_POOLS.length - 1)];
  }
  // Wiederholungs-Paket: immer der *aktuell* auffälligste Reihen-Block dieser
  // Session (verschiebt sich live, sobald Reihen wieder sicher sitzen) -
  // gleiches Prinzip wie bei den normalen Division/Multiplikation-Paketen.
  const block = buildWrittenSonderblöcke(subject)[0] || [];
  return block.length ? block : WRITTEN_FACTOR_POOLS[WRITTEN_FACTOR_POOLS.length - 1];
}

function buildWrittenTask(subject, packageNumber){
  const pool = writtenFactorPool(subject, packageNumber);
  const einstellig = pool[Math.floor(Math.random() * pool.length)];
  const zehnerTeil = (1 + Math.floor(Math.random() * 9)) * 10; // 10,20,...,90
  const einerTeil = Math.floor(Math.random() * 10); // 0-9
  const zweistellig = zehnerTeil + einerTeil;

  if(WRITTEN_MULTIPLICATION_SUBJECTS.includes(subject)){
    const teil1 = einstellig * zehnerTeil;
    const teil2 = einstellig * einerTeil;
    return {
      subject,
      promptText: `${einstellig} × ${zweistellig} =`,
      einstellig,
      step1: { part: zehnerTeil, answer: teil1 },
      step2: { part: einerTeil, answer: teil2 },
      finalAnswer: teil1 + teil2
    };
  }

  // writtenDivision: Divisor = einstellig, Ergebnis (Quotient) = zweistellig,
  // Ausgangszahl (Dividend) = einstellig * zweistellig. Die Zerlegung des
  // Dividenden in die beiden Teile (z.B. 128 -> 120 + 8) ist selbst ein
  // Eingabefeld, nicht mehr vorgegeben.
  const dividend = einstellig * zweistellig;
  const teil1 = einstellig * zehnerTeil;
  const teil2 = einstellig * einerTeil;
  return {
    subject,
    promptText: `${dividend} ÷ ${einstellig} =`,
    einstellig,
    step1: { part: teil1, answer: zehnerTeil },
    step2: { part: teil2, answer: einerTeil },
    finalAnswer: zehnerTeil + einerTeil
  };
}

function buildWrittenPackage(subject, packageNumber){
  const tasks = [];
  for(let i=0; i<WRITTEN_PACKAGE_SIZE; i++){
    tasks.push(buildWrittenTask(subject, packageNumber));
  }
  return tasks;
}

// Milli Power Akademie: gewichteter Pool über alle bisher eingeführten Reihen,
// Positionen 1-12 (11/12 tauchen hier gelegentlich als "neu" auf).
function buildAkademiePool(subject){
  const reihen = unlockedReihen(subject);
  const pool = [];
  reihen.forEach(r=>{
    for(let p=1; p<=12; p++){
      const fact = getFact(subject, r, p);
      pool.push(Object.assign(makeTask(subject, r, p), { weight: weightForFact(fact) }));
    }
  });
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

function buildAkademieQuestions(subject){
  const pool = buildAkademiePool(subject);
  return shuffle(weightedSample(pool, AKADEMIE_ROUND_LENGTH));
}

// Sonderbereich / Wiederholung: nur Aufgaben mit Fehlern oder häufigem
// Überspringen, in Blöcken von maximal SONDERBLOCK_SIZE, schlimmste zuerst.
function buildSonderblöcke(subject){
  const reihen = unlockedReihen(subject);
  const flagged = [];
  reihen.forEach(r=>{
    for(let p=1; p<=12; p++){
      const fact = getFact(subject, r, p);
      if(isFlagged(fact)){
        flagged.push(Object.assign(makeTask(subject, r, p), { weight: weightForFact(fact), fact }));
      }
    }
  });
  flagged.sort((a,b)=>b.weight - a.weight);
  const blocks = [];
  for(let i=0; i<flagged.length; i+=SONDERBLOCK_SIZE){
    blocks.push(flagged.slice(i, i+SONDERBLOCK_SIZE));
  }
  return blocks;
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

// Alle Cloud-Schreibvorgänge laufen sequentiell durch diese Warteschlange
// (statt jeweils sofort und parallel als "fire-and-forget"). Grund: bei
// schnellem Antworten (z.B. 100 Aufgaben in wenigen Minuten) würden sonst
// bis zu 200 gleichzeitige Netzwerk-Anfragen losgeschickt - auf manchen
// Geräten/Browsern (v.a. mobil) gehen davon etliche einfach verloren, ohne
// dass das Spiel etwas davon merkt. Mit der Warteschlange läuft immer nur
// eine Anfrage gleichzeitig, und jede wird bei einem Fehler bis zu zweimal
// wiederholt, bevor sie endgültig aufgegeben wird.
let cloudQueue = Promise.resolve();
function enqueueCloudWrite(label, run){
  cloudQueue = cloudQueue.then(async ()=>{
    for(let attempt=1; attempt<=3; attempt++){
      try{
        const { error } = await run();
        if(!error) return;
        console.warn(label, error.message);
      }catch(e){
        console.warn(label, e && e.message);
      }
      if(attempt<3) await new Promise(r=>setTimeout(r, 400*attempt));
    }
  });
  return cloudQueue;
}

// Wird vom Spiel nach jeder Antwort/jedem Überspringen aufgerufen.
function cloudLogAnswer(entry){
  const sb = getSupabaseClient();
  if(!sb) return;
  enqueueCloudWrite('cloudLogAnswer', ()=>sb.from('answer_log').insert({
    subject: entry.subject,
    reihe: entry.reihe,
    position: entry.position,
    given_answer: entry.given ?? null,
    correct: !!entry.correct,
    skipped: !!entry.skipped,
    mode: entry.mode
  }));
}

function cloudUpsertFact(subject, reihe, position, fact){
  const sb = getSupabaseClient();
  if(!sb) return;
  enqueueCloudWrite('cloudUpsertFact', ()=>sb.from('facts').upsert({
    subject, reihe, position,
    box: fact.box,
    correct_count: fact.correct,
    wrong_count: fact.wrong,
    skip_count: fact.skip,
    seen: fact.seen,
    updated_at: new Date().toISOString()
  }, { onConflict: 'subject,reihe,position' }));
}

function cloudUpsertProgress(){
  const sb = getSupabaseClient();
  if(!sb) return;
  const packagesBySubject = {};
  SUBJECTS.forEach(s=>{ packagesBySubject[s] = state.subjects[s].packages; });
  WRITTEN_SUBJECTS.forEach(s=>{ packagesBySubject[s] = state.written[s].packages; });
  enqueueCloudWrite('cloudUpsertProgress', ()=>sb.from('progress').upsert({
    id: true,
    packages: packagesBySubject,
    score: state.score,
    best_streak: state.bestStreak,
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' }));
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
    const cloudFactKeys = new Set();
    if(factRows){
      factRows.forEach(r=>{
        if(!ALL_SUBJECTS.includes(r.subject)) return;
        cloudFactKeys.add(r.subject + '|' + factKey(r.reihe, r.position));
        factsBucket(r.subject).facts[factKey(r.reihe, r.position)] = {
          box: r.box, correct: r.correct_count, wrong: r.wrong_count,
          skip: r.skip_count||0, seen: r.seen
        };
      });
    }
    if(progressRows && progressRows[0]){
      const p = progressRows[0];
      SUBJECTS.forEach(s=>{
        if(p.packages && p.packages[s]) state.subjects[s].packages = p.packages[s];
      });
      WRITTEN_SUBJECTS.forEach(s=>{
        if(p.packages && p.packages[s]) state.written[s].packages = p.packages[s];
      });
      state.score = p.score ?? state.score;
      state.bestStreak = p.best_streak ?? state.bestStreak;
    }
    saveState();

    // Selbstheilung: Aufgaben, die lokal schon geübt wurden, aber (z.B. durch
    // einen früheren Sync-Fehler) nie in der Cloud ankamen, jetzt nachholen.
    // So gehen bereits gespielte Ergebnisse nicht dauerhaft verloren, sobald
    // das Gerät das nächste Mal online ist.
    ALL_SUBJECTS.forEach(s=>{
      Object.keys(factsBucket(s).facts).forEach(key=>{
        if(cloudFactKeys.has(s + '|' + key)) return;
        const fact = factsBucket(s).facts[key];
        if(!fact.seen) return;
        const [reiheStr, positionStr] = key.split('_');
        cloudUpsertFact(s, Number(reiheStr), Number(positionStr), fact);
      });
    });

    return true;
  }catch(e){
    console.warn('cloudLoadIntoState fehlgeschlagen (offline?):', e && e.message);
    return false;
  }
}

/* ============================================================
   Familien-Login (Supabase Auth)
   Ein einziges gemeinsames Konto sorgt dafür, dass nur wer den
   Familien-Zugang kennt Daten lesen/schreiben kann - die
   Datenbank-Regeln lassen nur noch angemeldete Nutzer zu (siehe
   schema.sql). Der Benutzername wird intern in eine technische
   Kennung umgewandelt, die Supabase als "E-Mail" erwartet - sie ist
   nicht real, wird nie verschickt und nirgends angezeigt.
   ============================================================ */
function familyAuthEmail(username){
  return username.trim().toLowerCase() + '@family.local';
}

async function familySignIn(username, password){
  const sb = getSupabaseClient();
  if(!sb) return { error: { message: 'Cloud nicht konfiguriert' } };
  return sb.auth.signInWithPassword({ email: familyAuthEmail(username), password });
}

async function familySignOut(){
  const sb = getSupabaseClient();
  if(!sb) return;
  await sb.auth.signOut();
}

async function familyHasSession(){
  const sb = getSupabaseClient();
  if(!sb) return false;
  const { data } = await sb.auth.getSession();
  return !!(data && data.session);
}

/* ---------- Fehlbild-Klassifizierung (fürs Eltern-Dashboard) ----------
   Ordnet eine falsche Antwort einem typischen Fehlermuster zu, damit
   Eltern sehen, WORAN es hakt statt nur WIE VIEL falsch war. */
function classifyMistake(row){
  const { subject, reihe, position, given_answer } = row;
  if(given_answer === null || given_answer === undefined) return 'unbekannt';
  const task = makeTask(subject, reihe, position);
  const correctAnswer = task.answer;
  if(given_answer === correctAnswer) return null; // war eigentlich richtig
  const delta = given_answer - correctAnswer;
  if(delta === 1 || delta === -1) return 'verzaehlt';
  if(subject === 'division'){
    const dividend = reihe*position;
    if(given_answer === reihe) return 'ergebnis_divisor_vertauscht';
    if(given_answer === dividend) return 'nicht_dividiert';
    if(reihe+1 > 0 && dividend % (reihe+1) === 0 && given_answer === dividend/(reihe+1)) return 'nachbarreihe';
    if(reihe-1 > 0 && dividend % (reihe-1) === 0 && given_answer === dividend/(reihe-1)) return 'nachbarreihe';
  } else {
    if(given_answer === reihe*(position+1)) return 'nachbarreihe';
    if(given_answer === reihe*(position-1)) return 'nachbarreihe';
    if(given_answer === reihe || given_answer === position) return 'ergebnis_divisor_vertauscht';
  }
  return 'sonstige';
}

const MISTAKE_LABELS = {
  verzaehlt: {
    title: 'Verzählt sich oft um 1',
    detail: (ex)=>`Bei Aufgaben wie ${taskLabel(ex)} liegt die Antwort meist nur um 1 daneben. Das deutet auf Unsicherheit beim Abzählen der Reihen hin – lautes gemeinsames Durchzählen hilft hier oft mehr als reines Auswendiglernen.`
  },
  nachbarreihe: {
    title: 'Verwechselt benachbarte Reihen',
    detail: (ex)=>`Bei ${taskLabel(ex)} rutscht die Antwort manchmal in eine Nachbar-Reihe. Gezieltes Üben genau dieser Reihe im direkten Vergleich kann helfen.`
  },
  ergebnis_divisor_vertauscht: {
    title: 'Vertauscht Zahlen in der Aufgabe',
    detail: (ex)=>`Bei ${taskLabel(ex)} wird manchmal eine der Aufgaben-Zahlen selbst als Ergebnis genannt. Das kann auf Unsicherheit beim Aufgabentyp hindeuten – evtl. mit Gegenständen legen/aufteilen üben.`
  },
  nicht_dividiert: {
    title: 'Schreibt die Dividende ab',
    detail: (ex)=>`Bei ${taskLabel(ex)} wurde manchmal einfach die erste Zahl als Antwort gegeben. Das spricht dafür, dass die Aufgabe unter Zeitdruck nicht wirklich gerechnet, sondern nur abgeschrieben wurde.`
  },
  sonstige: {
    title: 'Unregelmäßige Fehler',
    detail: (ex)=>`Bei ${taskLabel(ex)} gab es Fehler ohne klares Muster – am ehesten hilft hier einfach mehr Übung in kleinen Portionen.`
  }
};

function taskLabel(row){
  const task = makeTask(row.subject, row.reihe, row.position);
  return task.promptText.replace(/\s*=\s*$/, '');
}
