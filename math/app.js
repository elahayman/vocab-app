// מעבדת המתמטיקה: a few minutes a day of multiple-choice "do you understand it" questions.
// Everything is kept on this device (localStorage), separate from the English apps.
const ROUND = 8;
const BOX_DAYS = [0, 1, 2, 4, 8, 16, 32]; // Leitner box → days until the question comes back
const MASTER_BOX = 3;
const KEY = 'math-lab-v1';
const $ = s => document.querySelector(s);
const app = $('#app');

// ---------- state ----------
const fresh = () => ({
  days: {},      // 'YYYY-MM-DD' → { q, ok, rounds, goal }
  qs: {},        // template id → { b: box, due: day number, ok, bad }
  subs: {},      // 'topic:sub' → { ok, bad }
  recent: [],    // last mistakes: { r: rule, d: day key }
  stars: 0, rounds: 0, perfects: 0, fixes: 0, bestCombo: 0,
  trophies: {}, shields: 0, frozen: {}, mute: false,
});
let S;
try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

const pad = n => String(n).padStart(2, '0');
const dk = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shift = (k, n) => { const [y, m, d] = k.split('-').map(Number); return dk(new Date(y, m - 1, d + n)); };
const dayNum = k => { const [y, m, d] = k.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
const today = () => dk();
const done = k => !!((S.days[k] && S.days[k].goal) || S.frozen[k]);

function streak() {
  let k = today();
  if (!done(k)) k = shift(k, -1);
  let n = 0;
  while (done(k)) { n++; k = shift(k, -1); }
  return n;
}
// A streak shield covers missed days automatically (earned every 7 days in a row, up to 2).
function useShields() {
  const t = today();
  let last = null;
  for (let i = 1; i <= 60; i++) { const k = shift(t, -i); if (done(k)) { last = k; break; } }
  if (!last) return 0;
  const missed = [];
  for (let k = shift(last, 1); k !== t; k = shift(k, 1)) missed.push(k);
  if (!missed.length || missed.length > S.shields) return 0;
  missed.forEach(k => { S.frozen[k] = true; });
  S.shields -= missed.length;
  save();
  return missed.length;
}

// ---------- topics and question choice ----------
const TOPICS = window.TOPICS;
const topicById = id => TOPICS.find(t => t.id === id);
const newest = () => TOPICS.reduce((m, t) => (t.added > m ? t.added : m), '');
const isNew = t => dayNum(today()) - dayNum(t.added) <= 10;
const subKey = (tp, sub) => tp.id + ':' + sub;
const allTemplates = () => TOPICS.flatMap(tp => tp.templates.map(t => ({ t, tp })));

function subStats(tp, sub) {
  const list = tp.templates.filter(t => t.sub === sub.id);
  const mastered = list.filter(t => (S.qs[t.id] || {}).b >= MASTER_BOX).length;
  const seen = list.filter(t => S.qs[t.id]).length;
  const r = S.subs[subKey(tp, sub.id)] || { ok: 0, bad: 0 };
  const n = r.ok + r.bad, acc = n ? r.ok / n : 0;
  let level = n ? 'mid' : 'new';
  if (n >= 3) level = acc >= 0.8 && mastered / list.length >= 0.5 ? 'good' : acc < 0.6 ? 'weak' : 'mid';
  if (n >= 3 && mastered === list.length) level = 'good';
  return { total: list.length, mastered, seen, n, acc, level };
}
const topicProgress = tp => {
  const m = tp.templates.filter(t => (S.qs[t.id] || {}).b >= MASTER_BOX).length;
  return Math.round(100 * m / tp.templates.length);
};
const weakSubs = () => TOPICS.flatMap(tp => tp.subs.map(s => ({ tp, s, st: subStats(tp, s) })))
  .filter(x => x.st.level === 'weak' || x.st.level === 'mid').sort((a, b) => a.st.acc - b.st.acc);

function pickRound(mode) {
  let pool = allTemplates();
  if (mode === 'weak') {
    const w = new Set(weakSubs().slice(0, 3).map(x => subKey(x.tp, x.s.id)));
    pool = pool.filter(x => w.has(subKey(x.tp, x.t.sub)));
  } else if (mode !== 'all') pool = pool.filter(x => x.tp.id === mode);
  const now = dayNum(today());
  // Weighted random order (bigger weight = earlier): due and weak questions first, then new ones.
  // In the mixed mode, mastered questions come back a little more often as reminders.
  const keyed = pool.map(x => {
    const r = S.qs[x.t.id];
    const w = !r ? 4 : r.due <= now ? 8 - Math.min(r.b, 6) : (mode === 'all' ? 1.2 : 0.4);
    return { x, k: Math.random() ** (1 / w) };
  }).sort((a, b) => b.k - a.k);
  const out = [], perSub = {};
  const cap = mode === 'all' ? 2 : 3;
  for (const { x } of keyed) {
    const s = subKey(x.tp, x.t.sub);
    if ((perSub[s] || 0) >= cap) continue;
    perSub[s] = (perSub[s] || 0) + 1;
    out.push(x);
    if (out.length === ROUND) break;
  }
  for (const { x } of keyed) { if (out.length >= ROUND) break; if (!out.includes(x)) out.push(x); }
  return R.shuffle(out);
}

// Builds one question; tries again if the random numbers produced duplicate answers.
function build(t) {
  for (let i = 0; i < 20; i++) {
    const q = t.make();
    if (q.opts.length === 4 && new Set(q.opts).size === 4) return q;
  }
  return t.make();
}

// ---------- sound and fun ----------
const Snd = (() => {
  let ctx = null;
  const tone = (f, at, dur, type = 'sine', vol = 0.12) => {
    if (S.mute) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + at;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + dur);
    } catch (e) {}
  };
  return {
    ok: () => { tone(660, 0, 0.12); tone(990, 0.09, 0.2); },
    bad: () => { tone(220, 0, 0.25, 'triangle', 0.1); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle')),
  };
})();

function burst(chars = ['⭐', '✨', '🎉', '🏆'], n = 26) {
  const box = document.createElement('div');
  box.className = 'burst';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.textContent = R.pick(chars);
    s.style.left = R.int(5, 95) + '%';
    s.style.animationDelay = (Math.random() * 0.4) + 's';
    s.style.fontSize = R.int(18, 34) + 'px';
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2400);
}

// ---------- ranks and trophies ----------
const RANKS = [[0, '🌱', 'מתחיל'], [30, '🔍', 'סקרן'], [80, '🧪', 'חוקר'], [160, '🧩', 'פותר בעיות'], [300, '📐', 'אדריכל'],
  [500, '⚙️', 'מהנדס'], [800, '🎓', 'פרופסור'], [1200, '🧠', 'גאון'], [1800, '👑', 'אגדה']];
const rank = () => {
  let i = 0;
  while (i + 1 < RANKS.length && S.stars >= RANKS[i + 1][0]) i++;
  return { i, cur: RANKS[i], next: RANKS[i + 1] };
};

const subMastered = (tid, sid) => { const tp = topicById(tid); const s = tp && tp.subs.find(x => x.id === sid); return s && subStats(tp, s).level === 'good'; };
const TROPHIES = [
  ['first', '🚀', 'צעד ראשון', 'לסיים סבב ראשון', () => S.rounds >= 1],
  ['s3', '🔥', 'שלושה ימים', '3 ימים ברצף', () => streak() >= 3],
  ['s7', '📅', 'שבוע שלם', '7 ימים ברצף', () => streak() >= 7],
  ['s14', '💪', 'שבועיים', '14 ימים ברצף', () => streak() >= 14],
  ['s30', '🏅', 'חודש של אלופים', '30 ימים ברצף', () => streak() >= 30],
  ['perfect', '✨', 'סבב מושלם', 'כל השאלות בסבב נכונות מהפעם הראשונה', () => S.perfects >= 1],
  ['perfect5', '💎', 'חמישה מושלמים', '5 סבבים מושלמים', () => S.perfects >= 5],
  ['combo5', '⚡', 'ברצף', '5 תשובות נכונות ברצף', () => S.bestCombo >= 5],
  ['combo12', '🌩️', 'בלתי עציר', '12 תשובות נכונות ברצף', () => S.bestCombo >= 12],
  ['fix10', '🔧', 'לומד מטעויות', 'לתקן 10 טעויות בסוף הסבב', () => S.fixes >= 10],
  ['r10', '🎯', 'מתמיד', '10 סבבים', () => S.rounds >= 10],
  ['r50', '🏋️', 'מכונה', '50 סבבים', () => S.rounds >= 50],
  ['st100', '⭐', '100 כוכבים', 'לאסוף 100 כוכבים', () => S.stars >= 100],
  ['st500', '🌟', '500 כוכבים', 'לאסוף 500 כוכבים', () => S.stars >= 500],
  ['cong', '🔺', 'אלוף החפיפה', 'לשלוט בחפיפת משולשים', () => subMastered('geometry', 'congruence')],
  ['pyth', '📐', 'פיתגורס היה גאה', 'לשלוט במשולש ישר זווית ופיתגורס', () => subMastered('geometry', 'right')],
  ['quads', '🔷', 'מלך המרובעים', 'לשלוט במרובעים', () => subMastered('geometry', 'quads')],
  ['formulas', '🧮', 'נוסחאות בדם', 'לשלוט בנוסחאות הכפל המקוצר', () => subMastered('algebra', 'formulas')],
  ['factor', '🛠️', 'מפרק מקצועי', 'לשלוט בפירוק לגורמים', () => subMastered('algebra', 'factor')],
  ['geo', '🏛️', 'גאומטריקן', 'לשלוט בכל נושאי הגאומטריה', () => topicById('geometry').subs.every(s => subMastered('geometry', s.id))],
];
function checkTrophies() {
  const got = [];
  TROPHIES.forEach(([id, ic, name, , test]) => {
    if (!S.trophies[id] && test()) { S.trophies[id] = today(); got.push({ ic, name }); }
  });
  return got;
}

// ---------- screens ----------
const DOW = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
function weekStrip() {
  const t = today();
  return '<div class="week">' + Array.from({ length: 7 }, (_, i) => {
    const k = shift(t, i - 6), [y, m, d] = k.split('-').map(Number), dow = new Date(y, m - 1, d).getDay();
    const mark = S.frozen[k] ? '🛡️' : done(k) ? '🔥' : k === t ? '' : '·';
    return `<div class="day ${done(k) ? 'on' : ''} ${k === t ? 'today' : ''}"><small>${DOW[dow]}</small><b>${mark}</b></div>`;
  }).join('') + '</div>';
}

function home() {
  const used = useShields();
  const st = streak(), r = rank(), todayDone = done(today());
  const pct = r.next ? Math.round(100 * (S.stars - r.cur[0]) / (r.next[0] - r.cur[0])) : 100;
  const nw = newest();
  const trophyCount = Object.keys(S.trophies).length;
  app.innerHTML = `
    <header class="top">
      <div class="brand">🧪 מעבדת המתמטיקה</div>
      <button class="chip" id="mute" aria-label="צליל">${S.mute ? '🔇' : '🔊'}</button>
    </header>
    <section class="card streak ${todayDone ? 'done' : ''}">
      <div class="flame">${st ? `🔥<span>${st}</span>` : "💤"}</div>
      <div class="streak-text">
        <b>${st ? `${st} ${st === 1 ? 'יום' : 'ימים'} ברצף` : 'מתחילים רצף חדש'}</b>
        <span>${todayDone ? 'המשימה של היום בוצעה ✅' : 'המשימה של היום: סבב אחד, 8 שאלות'}</span>
        ${S.shields ? `<span class="shield">🛡️ × ${S.shields} מגן רצף</span>` : ''}
        ${used ? `<span class="shield">מגן רצף שמר על הרצף שלך 🛡️</span>` : ''}
      </div>
    </section>
    ${weekStrip()}
    <section class="rankbar">
      <span>${r.cur[1]} ${r.cur[2]}</span>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <span class="stars">⭐ ${S.stars}</span>
    </section>
    <h2 class="pick">מה מתרגלים היום?</h2>
    ${TOPICS.map(tp => `
      <button class="topic" data-mode="${tp.id}">
        <span class="ic">${tp.icon}</span>
        <span class="tx"><b>${tp.title}</b><small>${tp.blurb}</small>
          <span class="bar"><i style="width:${topicProgress(tp)}%"></i></span></span>
        ${tp.added === nw && isNew(tp) ? '<span class="badge">חדש</span>' : ''}
      </button>`).join('')}
    <button class="topic mix" data-mode="all">
      <span class="ic">🔀</span>
      <span class="tx"><b>כל החומר מעורבב</b><small>כל הנושאים שנלמדו עד עכשיו, עם חזרות על מה שכבר יודעים</small></span>
    </button>
    ${weakSubs().length ? `<button class="topic weak" data-mode="weak"><span class="ic">🎯</span><span class="tx"><b>לחזק נקודות חלשות</b><small>${weakSubs().slice(0, 3).map(x => x.s.name).join(' · ')}</small></span></button>` : ''}
    <nav class="dock">
      <button data-go="trophies">🏆<small>גביעים ${trophyCount}/${TROPHIES.length}</small></button>
      <button data-go="status">📊<small>סקירת מצב</small></button>
      <button data-go="rules">📖<small>דף חוקים</small></button>
    </nav>`;
  app.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => startRound(b.dataset.mode));
  app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => ({ trophies, status, rules })[b.dataset.go]());
  $('#mute').onclick = () => { S.mute = !S.mute; save(); home(); };
  window.scrollTo(0, 0);
}

// ---------- the round ----------
let Q = null;
function startRound(mode) {
  const items = pickRound(mode);
  if (!items.length) return home();
  Q = { mode, items: items.map(x => ({ ...x, retry: false })), i: 0, combo: 0, maxCombo: 0, firstOk: 0, firstN: 0, earned: 0, seen: new Set() };
  ask();
}

function ask() {
  const it = Q.items[Q.i];
  const q = build(it.t), order = R.shuffle([0, 1, 2, 3]);
  Q.cur = { q, order, hinted: false, answered: false };
  const total = Q.items.length;
  app.innerHTML = `
    <header class="qtop">
      <button class="chip" id="quit" aria-label="יציאה">✕</button>
      <div class="bar prog"><i style="width:${100 * Q.i / total}%"></i></div>
      <span class="combo ${Q.combo >= 3 ? 'hot' : ''}">${Q.combo >= 2 ? '⚡' + Q.combo : ''}</span>
    </header>
    <div class="tag">${it.tp.icon} ${it.tp.subs.find(s => s.id === it.t.sub).name}${it.retry ? ' · <b>עוד ניסיון</b>' : ''}</div>
    <h2 class="question">${q.q}</h2>
    ${q.fig ? `<div class="figbox">${q.fig}</div>` : ''}
    <div class="opts">${order.map(i => `<button class="opt" data-i="${i}">${q.opts[i]}</button>`).join('')}</div>
    <div class="under"><button class="hint" id="hint">💡 רמז</button></div>
    <div id="fb"></div>`;
  app.querySelectorAll('.opt').forEach(b => b.onclick = () => answer(+b.dataset.i, b));
  $('#hint').onclick = () => {
    if (Q.cur.answered) return;
    Q.cur.hinted = true;
    const sub = it.tp.subs.find(s => s.id === it.t.sub);
    $('#hint').outerHTML = `<div class="hintbox">💡 ${q.hint || sub.tip}</div>`;
  };
  $('#quit').onclick = () => { if (confirm('לצאת מהסבב? ההתקדמות בסבב הזה לא תיחשב למשימה היומית.')) home(); };
  window.scrollTo(0, 0);
}

function record(it, ok) {
  const now = dayNum(today());
  const r = S.qs[it.t.id] || { b: 0, due: now, ok: 0, bad: 0 };
  if (ok) { r.ok++; if (!Q.cur.hinted) r.b = Math.min(r.b + 1, BOX_DAYS.length - 1); }
  else { r.bad++; r.b = Math.max(0, r.b - 2); }
  r.due = now + (ok ? BOX_DAYS[r.b] : 0);
  S.qs[it.t.id] = r;
  const sk = subKey(it.tp, it.t.sub), s = S.subs[sk] || { ok: 0, bad: 0 };
  ok ? s.ok++ : s.bad++;
  S.subs[sk] = s;
  const d = S.days[today()] || { q: 0, ok: 0, rounds: 0, goal: false };
  d.q++; if (ok) d.ok++;
  S.days[today()] = d;
  if (!ok) { S.recent.unshift({ r: Q.cur.q.rule || '', s: sk, d: today() }); S.recent = S.recent.slice(0, 15); }
}

function answer(i, btn) {
  if (Q.cur.answered) return;
  Q.cur.answered = true;
  const it = Q.items[Q.i], q = Q.cur.q, ok = i === 0;
  app.querySelectorAll('.opt').forEach(b => { b.disabled = true; if (+b.dataset.i === 0) b.classList.add('right'); });
  if (!ok) btn.classList.add('wrong');
  let gain = 0;
  if (!it.retry) {
    record(it, ok);
    Q.firstN++;
    if (ok) Q.firstOk++;
  } else if (ok) S.fixes++;
  if (ok) {
    Q.combo++; Q.maxCombo = Math.max(Q.maxCombo, Q.combo); S.bestCombo = Math.max(S.bestCombo, Q.combo);
    if (!it.retry && !Q.cur.hinted) gain = 1 + (Q.combo > 0 && Q.combo % 5 === 0 ? 2 : 0);
    Snd.ok();
  } else {
    Q.combo = 0;
    if (!it.retry) Q.items.push({ ...it, retry: true });
    Snd.bad();
    if (navigator.vibrate) navigator.vibrate(60);
  }
  S.stars += gain; Q.earned += gain;
  save();
  const praise = R.pick(['נכון!', 'מעולה!', 'בדיוק!', 'יפה מאוד!', 'צדקת!']);
  $('#fb').innerHTML = ok ? `
    <div class="fb ok">
      <div class="fbhead"><b>✅ ${praise}</b>${gain ? `<span class="gain">+${gain} ⭐${gain > 1 ? ' בונוס רצף!' : ''}</span>` : ''}</div>
      ${q.rule ? `<div class="rule">${q.rule}</div>` : ''}
      <details><summary>למה?</summary><p>${q.explain}</p></details>
      <button class="next" id="next">הבא ←</button>
    </div>` : `
    <div class="fb bad">
      <div class="fbhead"><b>לא הפעם. הנה ההסבר:</b></div>
      <p>${q.explain}</p>
      ${q.rule ? `<div class="rule">📌 ${q.rule}</div>` : ''}
      ${it.retry ? '' : '<small>השאלה תחזור עוד פעם בסוף הסבב.</small>'}
      <button class="next" id="next">הבנתי ←</button>
    </div>`;
  if (ok && gain) { const s = document.createElement('span'); s.className = 'fly'; s.textContent = '⭐'; btn.appendChild(s); }
  $('#next').onclick = () => { Q.i++; Q.i < Q.items.length ? ask() : finish(); };
  setTimeout(() => $('#fb').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
}

function finish() {
  const t = today(), d = S.days[t] || { q: 0, ok: 0, rounds: 0, goal: false };
  const firstToday = !d.goal;
  d.rounds++; d.goal = true; S.days[t] = d;
  S.rounds++;
  const perfect = Q.firstOk === Q.firstN && Q.firstN >= ROUND;
  let bonus = 0;
  if (perfect) { S.perfects++; bonus += 5; }
  if (firstToday) bonus += 3;
  S.stars += bonus; Q.earned += bonus;
  const st = streak();
  let shieldMsg = '';
  if (firstToday && st > 0 && st % 7 === 0 && S.shields < 2) { S.shields++; shieldMsg = 'קיבלת מגן רצף 🛡️: אם תפספס יום, הוא ישמור על הרצף.'; }
  const got = checkTrophies();
  save();
  Snd.win();
  burst(perfect ? ['💎', '✨', '⭐', '🏆'] : ['⭐', '✨', '🎉']);
  const pct = Math.round(100 * Q.firstOk / Math.max(1, Q.firstN));
  app.innerHTML = `
    <section class="end">
      <div class="big">${perfect ? '💎' : pct >= 75 ? '🏆' : pct >= 50 ? '💪' : '🌱'}</div>
      <h2>${perfect ? 'סבב מושלם!' : pct >= 75 ? 'עבודה מצוינת!' : pct >= 50 ? 'כל הכבוד, ממשיכים!' : 'למדת דברים חדשים היום!'}</h2>
      <p class="score">${Q.firstOk} מתוך ${Q.firstN} נכונות מהפעם הראשונה</p>
      <div class="earn">+${Q.earned} ⭐</div>
      ${firstToday ? `<div class="card streak done end-streak"><div class="flame pop">🔥<span>${st}</span></div><div class="streak-text"><b>${st} ${st === 1 ? 'יום' : 'ימים'} ברצף!</b><span>המשימה של היום בוצעה. +3 ⭐ על היום</span>${shieldMsg ? `<span class="shield">${shieldMsg}</span>` : ''}</div></div>` : ''}
      ${got.map(x => `<div class="newtrophy"><span>${x.ic}</span><div><small>גביע חדש!</small><b>${x.name}</b></div></div>`).join('')}
      <div class="endbtns">
        <button class="next" id="again">עוד סבב</button>
        <button class="ghost" id="home">למסך הבית</button>
      </div>
    </section>`;
  $('#again').onclick = () => startRound(Q.mode);
  $('#home').onclick = home;
  window.scrollTo(0, 0);
}

// ---------- other screens ----------
const backBar = title => `<header class="top"><button class="chip" id="back" aria-label="חזרה">→</button><div class="brand">${title}</div><span></span></header>`;
const bindBack = () => { $('#back').onclick = home; window.scrollTo(0, 0); };

function trophies() {
  const r = rank();
  app.innerHTML = backBar('🏆 גביעים') + `
    <section class="card rankcard"><div class="big">${r.cur[1]}</div><div><b>הדרגה שלך: ${r.cur[2]}</b>
      <small>${r.next ? `עוד ${r.next[0] - S.stars} ⭐ לדרגת ${r.next[2]} ${r.next[1]}` : 'הדרגה הכי גבוהה!'}</small></div></section>
    <div class="shelf">${TROPHIES.map(([id, ic, name, desc]) => `
      <div class="trophy ${S.trophies[id] ? 'got' : ''}"><span>${S.trophies[id] ? ic : '🔒'}</span><b>${name}</b><small>${desc}</small></div>`).join('')}</div>
    <h3>הדרגות</h3>
    <div class="ranks">${RANKS.map(([n, ic, name], i) => `<span class="${i <= r.i ? 'got' : ''}">${ic} ${name} <small>${n}⭐</small></span>`).join('')}</div>`;
  bindBack();
}

function rules() {
  app.innerHTML = backBar('📖 דף חוקים') + TOPICS.map(tp => `
    <h2 class="rt">${tp.icon} ${tp.title}</h2>
    ${tp.subs.map(s => `<details class="rules"><summary>${s.name}</summary><ul>${tp.rules[s.id].map(x => `<li>${x}</li>`).join('')}</ul></details>`).join('')}`).join('');
  bindBack();
}

function status() {
  const t = today();
  const last = n => Array.from({ length: n }, (_, i) => S.days[shift(t, -i)]).filter(Boolean);
  const sum = (arr, f) => arr.reduce((s, x) => s + x[f], 0);
  const w = last(7), activeDays = Object.values(S.days).filter(d => d.goal).length;
  const acc7 = sum(w, 'q') ? Math.round(100 * sum(w, 'ok') / sum(w, 'q')) : null;
  const rows = TOPICS.flatMap(tp => tp.subs.map(s => ({ tp, s, st: subStats(tp, s) })));
  const group = lv => rows.filter(x => x.st.level === lv);
  const LV = { good: ['✅', 'שולט'], mid: ['🙂', 'בתהליך'], weak: ['⚠️', 'צריך עוד תרגול'], new: ['⚪', 'עוד לא תורגל'] };
  const row = x => `<div class="srow ${x.st.level}"><span>${LV[x.st.level][0]}</span><div><b>${x.s.name}</b>
    <small>${x.tp.icon} ${x.st.n ? `${Math.round(100 * x.st.acc)}% נכונות · ${x.st.n} שאלות · ${x.st.mastered}/${x.st.total} סוגי שאלות נרכשו` : 'עוד לא היו שאלות מהנושא הזה'}</small></div></div>`;
  const cal = Array.from({ length: 28 }, (_, i) => {
    const k = shift(t, i - 27), d = S.days[k];
    return `<i class="${S.frozen[k] ? 'fz' : d && d.goal ? 'on' : ''} ${k === t ? 'today' : ''}" title="${k}"></i>`;
  }).join('');
  const sections = ['good', 'weak', 'mid', 'new'].map(lv => group(lv).length ? `<h3>${LV[lv][0]} ${LV[lv][1]}</h3>${group(lv).map(row).join('')}` : '').join('');
  app.innerHTML = backBar('📊 סקירת מצב') + `
    <section class="stats">
      <div><b>${streak()}</b><small>ימים ברצף</small></div>
      <div><b>${activeDays}</b><small>ימי תרגול</small></div>
      <div><b>${S.rounds}</b><small>סבבים</small></div>
      <div><b>${acc7 == null ? '–' : acc7 + '%'}</b><small>נכונות השבוע</small></div>
    </section>
    <h3>4 השבועות האחרונים</h3>
    <div class="cal">${cal}</div>
    <p class="legend"><i class="on"></i> תרגל <i class="fz"></i> מגן רצף <i></i> לא תרגל</p>
    ${TOPICS.map(tp => `<div class="tprog">${tp.icon} ${tp.title}<div class="bar"><i style="width:${topicProgress(tp)}%"></i></div><small>${topicProgress(tp)}% מסוגי השאלות נרכשו</small></div>`).join('')}
    ${sections}
    ${S.recent.length ? `<h3>טעויות אחרונות</h3><ul class="recent">${S.recent.slice(0, 8).map(x => `<li>${x.r || x.s} <small dir="ltr">${x.d.slice(5).split('-').reverse().join('/')}</small></li>`).join('')}</ul>` : ''}
    <p class="note">"נרכש" = סוג שאלה שנענה נכון כמה פעמים, בימים שונים. נושא מסומן "שולט" כשיש בו לפחות 80% נכונות ורוב סוגי השאלות נרכשו.</p>
    <button class="ghost danger" id="reset">איפוס כל ההתקדמות</button>`;
  $('#reset').onclick = () => {
    if (confirm('למחוק את כל ההתקדמות, הרצף והגביעים?') && confirm('בטוח? אי אפשר לבטל.')) { S = fresh(); save(); home(); }
  };
  bindBack();
}

home();
if ('serviceWorker' in navigator && /github\.io$/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => {});
