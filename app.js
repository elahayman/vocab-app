// עיר המילים: daily English vocabulary practice for two siblings.
(function () {
  'use strict';

  // ---------- Settings ----------
  const QUIZ_SIZE = 12;              // minimum questions per daily quiz
  const MAX_REVIEWS = 22;            // reviews per day on top of the new words (about 4-5 minutes in total)
  const REVIEW_HEAVY = 50;           // due reviews above this: no new words today
  const REVIEW_BUSY = 30;            // due reviews above this: fewer new words
  const INTERVALS = [0, 1, 4, 10, 25, 60, 120]; // days until next check, by level
  const RETIRED = 6;                 // level 6 = learned, checked again in 120 days
  const KNOWN_LEVEL = 3;             // a basic word answered right on first sight starts here (next check in 10 days)
  const COMPLEX_STAGE = 4;           // stage 4 (psychometric level) = "challenge" words
  const MILESTONES = { 3: 5, 7: 20, 14: 30, 30: 80, 60: 150, 100: 250, 150: 300, 200: 400, 365: 800 }; // streak day -> bonus coins
  const WEEKLY_GOAL = 10;            // joint sessions per week for the team chest
  const MAX_SHIELDS = 2;
  const LEVEL_COST = [10, 20, 35, 55, 80]; // bricks for building levels 1..5

  const DEFAULT_SETTINGS = { regular: 4, complex: 2 };
  const PRIZES_VERSION = 3;
  const DEFAULT_PRIZES = [
    { id: 'icecream', emoji: '🍦', name: 'גלידה', cost: 300 },
    { id: 'disney', emoji: '📺', name: 'חודש מנוי לדיסני+', cost: 700 },
    { id: 'takeaway', emoji: '🍕', name: 'הזמנת טייק אווי', cost: 900 },
    { id: 'movie', emoji: '🎬', name: 'יציאה לסרט', cost: 900 },
  ];

  const AVATARS = Object.keys(window.ART.AVATARS);
  const BUILDINGS = [
    { id: 'house', emoji: '🏠', name: 'הבית' },
    { id: 'diner', emoji: '🍕', name: 'המסעדה' },
    { id: 'tower', emoji: '🏢', name: 'מגדל הגיבורים' },
    { id: 'web', emoji: '🕸️', name: 'מטה העכביש' },
    { id: 'arena', emoji: '🏟️', name: 'זירת הקרב' },
    { id: 'shop', emoji: '🛍️', name: 'חנות הסקינים' },
    { id: 'park', emoji: '🎡', name: 'לונה פארק' },
    { id: 'port', emoji: '🚀', name: 'נמל החלליות' },
    { id: 'band', emoji: '🎸', name: 'במת הלהקה' },
  ];
  // The band gets one instrument per level, and plays a song with whatever it has.
  const BAND = ['🥁 תופים', '🎸 גיטרה', '🎹 קלידים', '🎺 חצוצרה', '🎤 זמרת ומיקרופון'];
  // Things found in chests to furnish the city. The house is open from the start, other buildings once started.
  const ITEMS = {
    house: [['sofa', '🛋️', 'ספה'], ['tv', '📺', 'טלוויזיה'], ['bed', '🛏️', 'מיטה'], ['console', '🎮', 'קונסולת משחקים'], ['plant', '🪴', 'עציץ'],
      ['lamp', '💡', 'מנורה'], ['fridge', '🧊', 'מקרר'], ['bath', '🛁', 'אמבטיה'], ['frame', '🖼️', 'תמונה לקיר']],
    diner: [['oven', '🍕', 'תנור פיצה'], ['grill', '🍔', 'גריל המבורגרים'], ['soda', '🥤', 'מכונת שתייה'], ['gelato', '🍦', 'מקרר גלידה'], ['cake', '🍰', 'ויטרינת עוגות'], ['chef', '🧑‍🍳', 'שף']],
    tower: [['scope', '🔭', 'טלסקופ'], ['super', '💻', 'מחשב-על'], ['shield', '🛡️', 'מגן ענק'], ['suits', '🦸', 'חדר תלבושות'], ['alarm', '🚨', 'אזעקת גיבורים']],
    web: [['bigweb', '🕸️', 'רשת ענק'], ['masks', '🎭', 'קיר מסכות'], ['watch', '⌚', 'שעון גאדג׳טים'], ['camera', '📷', 'מצלמה'], ['rope', '🪢', 'חבל קפיצה']],
    arena: [['cup', '🏆', 'גביע אלופים'], ['drums', '🥁', 'תופים'], ['flag', '🚩', 'דגל קבוצה'], ['spot', '🔦', 'זרקור'], ['screen', '🖥️', 'מסך ענק']],
    shop: [['rack', '👕', 'מתלה בגדים'], ['mirror', '🪞', 'מראה'], ['crown', '👑', 'כתר'], ['shoes', '👟', 'נעלי ספורט'], ['mystery', '🎁', 'קופסת הפתעות']],
    park: [['wheel', '🎡', 'גלגל ענק'], ['coaster', '🎢', 'רכבת הרים'], ['candy', '🍭', 'סוכריית ענק'], ['balloons', '🎈', 'בלונים'], ['carousel', '🎠', 'קרוסלה']],
    band: [['speakers', '🔊', 'רמקולים'], ['disco', '🪩', 'כדור דיסקו'], ['headphones', '🎧', 'אוזניות'], ['notes', '🎼', 'דף תווים'], ['guitar2', '🪕', 'בנג׳ו']],
    port: [['rocket', '🚀', 'טיל'], ['sat', '🛰️', 'לוויין'], ['alien', '👽', 'חבר חייזר'], ['stars', '🌌', 'מפת כוכבים'], ['ufo', '🛸', 'צלחת מעופפת']],
  };
  // Where each item stands inside its building: [left %, top %, size rem]. Others use ROOM_SLOTS in order.
  const ROOM_SPOTS = {
    'house:frame': [14, 8, 2.4], 'house:tv': [44, 10, 3.2], 'house:console': [47, 40, 2], 'house:lamp': [78, 22, 2.6],
    'house:sofa': [38, 58, 3.6], 'house:bed': [4, 52, 3.6], 'house:fridge': [70, 44, 3], 'house:plant': [80, 60, 2.8], 'house:bath': [18, 70, 3],
  };
  const ROOM_SLOTS = [[10, 10, 3], [44, 8, 3], [74, 12, 3], [8, 56, 3.2], [42, 58, 3.4], [74, 56, 3.2]];
  const ROOM_COLORS = {
    house: ['#fde7c8', '#c08552'], diner: ['#fee2e2', '#9ca3af'], tower: ['#dbeafe', '#64748b'], web: ['#1e3a8a', '#1e293b'],
    arena: ['#ede9fe', '#16a34a'], band: ['#2e1065', '#6d28d9'], shop: ['#fce7f3', '#e5e7eb'], park: ['#bae6fd', '#4ade80'], port: ['#0f172a', '#475569'],
  };
  const ITEM_CHANCE = { common: 0.3, big: 0.6, mega: 1 };
  const FEED_MAX = 40;
  const CHESTS = {
    common: { name: 'תיבה', bricks: 3, emoji: '📦' },
    big: { name: 'תיבה גדולה', bricks: 5, emoji: '🎁' },
    mega: { name: 'מגה תיבה!', bricks: 10, emoji: '💎' },
  };
  // Categories concrete enough for "which word doesn't belong?" questions.
  const ODD_CATS = ['אוכל', 'בגדים', 'בית', 'גוף', 'חפצים', 'טבע', 'מספרים', 'משפחה ואנשים', 'צבעים', 'תחבורה', 'רגשות', 'בית הספר', 'זמן', 'מקומות', 'משחקים', 'אינטרנט ודיגיטל']
    .map((c) => window.CATEGORIES.indexOf(c)).filter((i) => i >= 0);

  // ---------- Words ----------
  const W = {};
  window.WORDS.forEach(([id, en, he, cat, stage, basic, sent]) => {
    W[id] = { id, en, he, cat, stage, basic: !!basic, sent, complex: stage >= COMPLEX_STAGE };
  });
  const ALL_IDS = window.WORDS.map((w) => w[0]);
  const REGULAR_IDS = ALL_IDS.filter((id) => !W[id].complex).sort((a, b) => W[a].stage - W[b].stage || a - b);
  const COMPLEX_IDS = ALL_IDS.filter((id) => W[id].complex);
  // Words they should already know: the "very basic" ones first, then the rest of stage 1.
  const BASIC_IDS = ALL_IDS.filter((id) => W[id].basic).concat(ALL_IDS.filter((id) => W[id].stage === 1 && !W[id].basic));
  // Word families: derived word -> its parts; base word -> derived words.
  const PARTS = {};
  const FAMILY_OF = {};
  (window.FAMILY || []).forEach(([d, affix, base, he]) => {
    PARTS[d] = { affix, base };
    (FAMILY_OF[base] = FAMILY_OF[base] || []).push({ d, affix, he });
  });
  const EN_INDEX = {};
  ALL_IDS.forEach((id) => { EN_INDEX[W[id].en.toLowerCase()] = id; });
  // Words a parent added for one kid (e.g. for a test at school), shared by all devices.
  function registerCustomWords() {
    const general = window.CATEGORIES.indexOf('כללי');
    (data.shared.customWords || []).forEach(([id, en, he]) => {
      if (W[id]) return;
      W[id] = { id, en, he, cat: general, stage: 1, basic: false, sent: '', complex: false, custom: true };
      ALL_IDS.push(id);
      EN_INDEX[en.toLowerCase()] = id;
      (BY_CAT[general] = BY_CAT[general] || []).push(id);
    });
  }
  const SPELL_COINS = 3;             // per word in the optional spelling challenge
  const FOCUS_NEW = 6;               // test words taught per day (instead of the regular new words)
  const FOCUS_MAX_NEW = 10;          // ...or up to this many when the test is close
  const FOCUS_OLD = 8;               // test words already seen, asked again every day until the test
  const EXTRA_SURPRISE = 0.3;        // chance that an extra round pays double (a surprise keeps it exciting)
  const BY_CAT = {};
  ALL_IDS.forEach((id) => { (BY_CAT[W[id].cat] = BY_CAT[W[id].cat] || []).push(id); });

  // ---------- Time ----------
  function todayNum() {
    const d = new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }
  function weekKey(day) {
    // Weeks start on Sunday, as in Israel. Day 0 (1970-01-01) was a Thursday.
    return 'w' + Math.floor((day + 4) / 7);
  }

  // ---------- State ----------
  let data = Store.loadAll();
  let profile = data.activeId ? data.profiles[data.activeId] : null;
  let session = null;

  function normalizeShared() {
    const s = data.shared;
    s.settings = Object.assign({}, DEFAULT_SETTINGS, s.settings);
    if (!s.prizes || (s.prizesVersion || 1) < PRIZES_VERSION) {
      s.prizes = DEFAULT_PRIZES.map((p) => Object.assign({}, p));
      s.prizesVersion = PRIZES_VERSION;
    }
    s.suggestions = s.suggestions || [];
    s.city = s.city || { levels: {}, progress: {}, current: 'house', bricks: 0 };
    s.city.items = s.city.items || {};
    s.feed = s.feed || [];
    s.decisions = s.decisions || {};
    s.weekly = s.weekly || {};
    s.weeklyClaimed = s.weeklyClaimed || {};
    s.focus = s.focus || {};
    s.customWords = s.customWords || [];
    registerCustomWords();
  }
  normalizeShared();

  function newProfile(name, avatar, theme, gender) {
    return {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name, avatar, theme, gender, feedSeen: 0,
      words: {},
      streak: 0, best: 0, shields: 0, lastSessionDay: null,
      trophies: 0, coins: 0, sessions: 0, history: {},
      milestones: [], requests: [], goalPrize: null,
    };
  }

  function save() {
    if (profile) Store.saveProfile(profile);
    Store.saveShared(data.shared);
  }

  // Players this device plays as. With sync, only their own device changes a profile,
  // so a parent's answer to a prize request travels through the shared data.
  function ownedIds() {
    try { return JSON.parse(localStorage.getItem('vocab-city-mine')) || []; } catch (e) { return []; }
  }
  function own(id) {
    const ids = ownedIds();
    if (!ids.includes(id)) {
      ids.push(id);
      try { localStorage.setItem('vocab-city-mine', JSON.stringify(ids)); } catch (e) { /* ignore */ }
    }
  }
  function applyDecisions() {
    const mine = Store.family() ? ownedIds() : Object.keys(data.profiles);
    mine.forEach((id) => {
      const p = data.profiles[id];
      if (!p) return;
      let changed = false;
      p.requests.forEach((r, i) => {
        const d = data.shared.decisions[id + ':' + i];
        if (r.status === 'pending' && d) {
          r.status = d;
          if (d === 'declined') p.coins += r.cost;
          changed = true;
        }
      });
      if (changed) Store.saveProfile(p);
    });
  }
  applyDecisions();

  // Another device changed something: take it in, and refresh the screen if nothing is in progress.
  let view = null;
  Store.onRemote((remote) => {
    if (remote.shared) data.shared = remote.shared;
    normalizeShared();
    Object.keys(data.profiles).forEach((id) => { if (!remote.profiles[id] && (!profile || id !== profile.id)) delete data.profiles[id]; });
    Object.entries(remote.profiles).forEach(([id, p]) => {
      // The player on this device keeps its own copy (it may be mid-mission).
      if (profile && id === profile.id) return;
      data.profiles[id] = p;
    });
    applyDecisions();
    if (session || document.querySelector('.modal, .showcase')) return;
    if (view === 'home' && profile) screenHome();
    else if (view === 'profiles') screenProfiles();
  });

  // ---------- Helpers ----------
  const $app = document.getElementById('app');
  function h(html) { view = null; $app.innerHTML = html; window.scrollTo(0, 0); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function on(sel, ev, fn) {
    document.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, fn));
  }

  function avatar(a) {
    const art = window.ART.AVATARS[a];
    return art ? `<span class="ava">${art.art}</span>` : esc(a || '🙂');
  }

  // ---------- Sound ----------
  let audioCtx = null;
  function beep(freqs, dur) {
    if (profile && profile.mute) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        const t = audioCtx.currentTime + i * dur;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(audioCtx.destination);
        o.start(t);
        o.stop(t + dur + 0.02);
      });
    } catch (e) { /* no audio available */ }
  }
  // An original 8-bar tune. Each band level adds a part: drums, bass guitar, keys, trumpet melody, lead voice.
  const SONG = {
    bpm: 112,
    chords: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62], [53, 57, 60], [60, 64, 67]],
    melody: [[64, 1], [67, 1], [72, 1], [67, 1], [74, 1.5], [71, 0.5], [67, 2], [72, 1], [69, 1], [64, 1], [69, 1], [65, 1], [69, 1], [72, 2],
      [76, 1], [74, 1], [72, 1], [67, 1], [71, 1], [74, 1], [79, 2], [69, 1], [72, 1], [77, 1], [76, 1], [72, 3], [0, 1]],
  };
  let songStop = null;
  function playSong(level, onEnd) {
    stopSong();
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx;
      const beat = 60 / SONG.bpm;
      const t0 = ctx.currentTime + 0.1;
      const master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
      const tone = (type, midi, start, dur, vol, vibrato) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.value = hz(midi);
        if (vibrato) {
          const lfo = ctx.createOscillator(); const lg = ctx.createGain();
          lfo.frequency.value = 5; lg.gain.value = 4; lfo.connect(lg).connect(o.frequency); lfo.start(start); lfo.stop(start + dur);
        }
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(vol, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.95);
        o.connect(g).connect(master);
        o.start(start); o.stop(start + dur);
      };
      const noise = (start, dur, vol, hp) => {
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = ctx.createBufferSource(); src.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
        const g = ctx.createGain(); g.gain.value = vol;
        src.connect(f).connect(g).connect(master); src.start(start);
      };
      const kick = (start) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.frequency.setValueAtTime(140, start); o.frequency.exponentialRampToValueAtTime(40, start + 0.15);
        g.gain.setValueAtTime(0.6, start); g.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
        o.connect(g).connect(master); o.start(start); o.stop(start + 0.22);
      };
      const bars = SONG.chords.length;
      for (let bar = 0; bar < bars; bar++) {
        const tb = t0 + bar * 4 * beat;
        const ch = SONG.chords[bar];
        for (let k = 0; k < 4; k++) {
          const tk = tb + k * beat;
          if (level >= 1) { if (k % 2 === 0) kick(tk); else noise(tk, 0.12, 0.25, 1500); noise(tk + beat / 2, 0.04, 0.08, 7000); }
          if (level >= 2) tone('triangle', ch[0] - 24, tk, beat * 0.9, 0.3);
        }
        if (level >= 3) ch.forEach((m) => { tone('sine', m, tb, beat * 2, 0.08); tone('sine', m, tb + beat * 2, beat * 2, 0.07); });
      }
      if (level >= 4) {
        let t = t0;
        SONG.melody.forEach(([m, b]) => {
          if (m) {
            tone('sawtooth', m, t, b * beat, 0.05);
            if (level >= 5) tone('sine', m + 12, t, b * beat, 0.07, true);
          }
          t += b * beat;
        });
      }
      const total = bars * 4 * beat * 1000 + 300;
      const timer = setTimeout(() => { songStop = null; if (onEnd) onEnd(); }, total);
      songStop = () => { clearTimeout(timer); master.gain.setTargetAtTime(0, ctx.currentTime, 0.05); setTimeout(() => master.disconnect(), 300); songStop = null; };
    } catch (e) { if (onEnd) onEnd(); }
  }
  function stopSong() { if (songStop) songStop(); }

  const sfx = {
    right: () => beep([660, 880], 0.09),
    wrong: () => beep([300, 220], 0.12),
    win: () => beep([523, 659, 784, 1047], 0.11),
  };

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/\.\.\./g, ' ... '));
      u.lang = 'en-US';
      u.rate = 0.85;
      const v = speechSynthesis.getVoices().find((x) => /en[-_]US/i.test(x.lang));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* speech not available */ }
  }

  // In-page dialog. Resolves with true/false, or with the typed text when `input` is set.
  function dialog({ text, input, ok = 'אישור', cancel = 'ביטול', numeric = true, secret = false }) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.className = 'modal';
      wrap.innerHTML = `<div class="modal-card card" role="dialog" aria-modal="true">
          <p>${esc(text)}</p>
          ${input ? `<input id="modal-input" ${numeric ? 'inputmode="numeric"' : 'maxlength="60"'} ${secret ? 'type="password"' : ''} autocomplete="off">` : ''}
          <div class="modal-actions">
            <button class="btn primary" data-v="ok">${esc(ok)}</button>
            ${cancel ? `<button class="btn ghost" data-v="cancel">${esc(cancel)}</button>` : ''}
          </div></div>`;
      document.body.appendChild(wrap);
      const field = wrap.querySelector('#modal-input');
      (field || wrap.querySelector('[data-v="ok"]')).focus();
      const done = (v) => { wrap.remove(); resolve(v); };
      wrap.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
        const yes = b.dataset.v === 'ok';
        done(input ? (yes ? field.value : null) : yes);
      }));
      if (field) field.addEventListener('keydown', (e) => { if (e.key === 'Enter') done(field.value); });
    });
  }

  function confetti() {
    const box = document.getElementById('confetti');
    const colors = ['#e23636', '#ffc93c', '#3fbf6a', '#3a7bff', '#b983ff'];
    let html = '';
    for (let i = 0; i < 60; i++) {
      html += `<i style="left:${Math.random() * 100}%;background:${pick(colors)};animation-delay:${Math.random() * 0.4}s;transform:rotate(${Math.random() * 360}deg)"></i>`;
    }
    box.innerHTML = html;
    box.classList.add('on');
    setTimeout(() => { box.classList.remove('on'); box.innerHTML = ''; }, 2200);
  }

  // ---------- Spaced repetition ----------
  function dueIds(day) {
    return Object.keys(profile.words)
      .map(Number)
      .filter((id) => {
        const s = profile.words[id];
        return s.lvl >= 1 && s.due <= day;
      })
      .sort((a, b) => profile.words[a].due - profile.words[b].due);
  }

  function firstUnseen(list, n, skip) {
    const out = [];
    for (const id of list) {
      if (out.length >= n) break;
      if (!profile.words[id] && !(skip && skip.includes(id))) out.push(id);
    }
    return out;
  }

  // Today's new words: mostly regular words (stage 1 -> 3 in order) plus a few challenge words.
  function newWordsFor(nRegular, nComplex, skip = []) {
    const reg = firstUnseen(REGULAR_IDS, nRegular, skip);
    let cpx = firstUnseen(COMPLEX_IDS, nComplex, skip);
    if (cpx.length < nComplex) {
      // Challenge list finished: take the hardest regular words still unseen instead.
      const tail = REGULAR_IDS.slice().reverse().filter((id) => !profile.words[id] && !reg.includes(id) && !skip.includes(id));
      cpx = cpx.concat(tail.slice(0, nComplex - cpx.length));
    }
    if (reg.length < nRegular) {
      cpx = cpx.concat(firstUnseen(COMPLEX_IDS, nRegular - reg.length, cpx.concat(skip)));
    }
    return { reg, cpx };
  }

  // Test words a parent set for this kid: active until the day of the test (or until cleared).
  function focusOf(p, day) {
    const f = data.shared.focus[p.id];
    if (!f || !f.ids.length || (f.until && day > f.until)) return null;
    return f.ids.filter((id) => W[id]);
  }
  // Unseen test words are taught first; seen ones are asked every day, least recently asked first.
  function focusPick(day, nNew, nOld, skip = []) {
    const ids = focusOf(profile, day) || [];
    const fresh = ids.filter((id) => !profile.words[id] && !skip.includes(id)).slice(0, nNew);
    const old = ids.filter((id) => profile.words[id] && !skip.includes(id))
      .sort((a, b) => (profile.words[a].last || 0) - (profile.words[b].last || 0) || profile.words[a].lvl - profile.words[b].lvl)
      .slice(0, nOld);
    return { fresh, old };
  }

  function newState(day) {
    return { lvl: 0, due: day, right: 0, wrong: 0, mc: 0, sent: 0 };
  }

  function grade(id, correct, type, day) {
    let s = profile.words[id];
    if (!s) s = profile.words[id] = newState(day);
    if (correct) {
      s.right++;
      if (type === 'sentence') s.sent++; else s.mc++;
      let lvl = Math.min(RETIRED, Math.max(1, s.lvl + 1));
      // A word only leaves the cycle after it was recognized both ways.
      if (lvl === RETIRED && (!s.sent || !s.mc)) lvl = RETIRED - 1;
      s.lvl = lvl;
    } else {
      s.wrong++;
      s.lvl = 1;
    }
    s.due = day + INTERVALS[s.lvl];
    s.last = day;
  }

  // A basic word checked without being taught first: right = already known, wrong = start learning it.
  function gradeKnownCheck(id, correct, type, day) {
    const s = profile.words[id] = newState(day);
    if (correct) {
      s.right = 1;
      if (type === 'sentence') s.sent = 1; else s.mc = 1;
      s.lvl = KNOWN_LEVEL;
      s.pre = 1; // already knew it before the app
    } else {
      s.wrong = 1;
      s.lvl = 1;
    }
    s.due = day + INTERVALS[s.lvl];
    s.last = day;
  }

  // ---------- Word families ----------
  function partsTip(w) {
    const p = PARTS[w.en.toLowerCase()];
    if (!p) return '';
    const baseId = EN_INDEX[p.base];
    const baseHe = baseId ? ` (${esc(W[baseId].he)})` : '';
    return `<div class="morph">💡 <span dir="ltr"><b>${esc(p.affix)}</b></span> = ${esc(window.AFFIXES[p.affix] || '')} · <span dir="ltr">${esc(p.base)}</span>${baseHe}</div>`;
  }
  function familyTip(w) {
    const fam = (FAMILY_OF[w.en.toLowerCase()] || []).slice(0, 3);
    if (!fam.length) return '';
    return `<div class="morph">🧩 מאותה משפחה: ${fam.map((f) => `<span dir="ltr">${esc(f.d)}</span> = ${esc(f.he)}`).join(' · ')}</div>`;
  }

  // ---------- Question building ----------
  function distractors(id, n, mode) {
    const w = W[id];
    const nearStage = ALL_IDS.filter((x) => x !== id && Math.abs(W[x].stage - w.stage) <= 1);
    let pool;
    if (mode === 'sentence') {
      // Other categories, so a distractor cannot also fit the sentence.
      pool = nearStage.filter((x) => W[x].cat !== w.cat && !W[x].en.includes('...'));
    } else {
      const same = nearStage.filter((x) => W[x].cat === w.cat);
      pool = same.length >= 8 ? same : nearStage;
    }
    const seen = new Set([w.he, w.en.toLowerCase()]);
    const out = [];
    for (const x of shuffle(pool)) {
      const key = mode === 'meaning' ? W[x].he : W[x].en.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(x);
      if (out.length >= n) break;
    }
    return out;
  }

  function makeQuestion(id, type) {
    const w = W[id];
    if (type === 'sentence' && !w.sent) type = 'meaning';
    if (type === 'odd') {
      // The target word is the odd one out among three words from another concrete category.
      if (!ODD_CATS.includes(w.cat)) type = 'meaning';
      else {
        const cat = shuffle(ODD_CATS.filter((c) => c !== w.cat && BY_CAT[c] && BY_CAT[c].length >= 6))[0];
        const group = shuffle(BY_CAT[cat].filter((x) => W[x].stage <= Math.max(2, w.stage))).slice(0, 3);
        if (group.length === 3) return { id, type, opts: shuffle([id, ...group]), groupCat: cat };
        type = 'meaning';
      }
    }
    const opts = shuffle([id, ...distractors(id, 3, type)]);
    return { id, type, opts };
  }

  function reviewType(lvl, cat) {
    const r = Math.random();
    if (lvl >= 2 && ODD_CATS.includes(cat) && r < 0.15) return 'odd';
    if (lvl >= 2 && r < 0.55) return 'sentence';
    if (lvl >= 3 && r < 0.75) return 'reverse';
    return 'meaning';
  }

  function buildSession(day) {
    const due = dueIds(day);
    const set = data.shared.settings;
    let nReg = set.regular;
    let nCpx = set.complex;
    if (due.length > REVIEW_HEAVY) { nReg = 0; nCpx = 0; } else if (due.length > REVIEW_BUSY) { nReg = Math.ceil(nReg / 2); nCpx = Math.min(nCpx, 1); }
    // Test words take the place of today's regular new words (then of the challenge ones).
    // With a test date, enough test words are taught each day to cover them all before the test.
    const f = data.shared.focus[profile.id];
    const unseen = (focusOf(profile, day) || []).filter((id) => !profile.words[id]).length;
    const perDay = f && f.until ? Math.min(FOCUS_MAX_NEW, Math.max(FOCUS_NEW, Math.ceil(unseen / Math.max(1, f.until - day)))) : FOCUS_NEW;
    const focus = focusPick(day, perDay, FOCUS_OLD);
    const extra = Math.max(0, focus.fresh.length - nReg);
    nReg = Math.max(0, nReg - focus.fresh.length);
    nCpx = Math.max(0, nCpx - extra);
    const { reg, cpx } = newWordsFor(nReg, nCpx, focus.fresh.concat(focus.old));
    // Learn in a mixed order, but never open with a challenge word.
    const first = focus.fresh.concat(reg);
    const fresh = first.length ? [first[0], ...shuffle(first.slice(1).concat(cpx))] : cpx;
    const reviews = due.filter((id) => !focus.old.includes(id)).slice(0, Math.max(0, MAX_REVIEWS - focus.old.length));
    // Test words asked before they are due: practice only, they can demote a word but not promote it.
    const early = focus.old.filter((id) => !due.includes(id));
    // Early on there is little to review: fill the quiz with basic words they should already know.
    const known = firstUnseen(BASIC_IDS, Math.max(0, QUIZ_SIZE - fresh.length - reviews.length - focus.old.length), fresh.concat(focus.old));
    const quiz = [];
    fresh.forEach((id) => quiz.push(makeQuestion(id, 'meaning')));
    reviews.forEach((id) => quiz.push(makeQuestion(id, reviewType(profile.words[id].lvl, W[id].cat))));
    focus.old.forEach((id) => quiz.push(makeQuestion(id, reviewType(Math.max(2, profile.words[id].lvl), W[id].cat))));
    known.forEach((id) => quiz.push(makeQuestion(id, Math.random() < 0.35 ? 'sentence' : 'meaning')));
    // Start the quiz with an easy win: a known word if there is one.
    let ordered = shuffle(quiz);
    const easy = ordered.findIndex((q) => q.type === 'meaning' && (known.includes(q.id) || (profile.words[q.id] && profile.words[q.id].lvl >= 2)));
    if (easy > 0) ordered = [ordered[easy], ...ordered.filter((_, i) => i !== easy)];
    markAsked(day, ordered);
    return {
      day, fresh, reviews, known, early,
      learnIdx: 0, revealed: false,
      quiz: ordered,
      qIdx: 0,
      firstTry: {},
      retried: {},
      combo: 0, bestCombo: 0, trophies: 0, right: 0, total: 0, complexRight: 0,
      bonus: false,
    };
  }

  // Words asked today, so extra rounds can pick other words (or at least other question types).
  function askedToday(day) {
    if (!profile.today || profile.today.day !== day) profile.today = { day, ids: [], types: {} };
    return profile.today;
  }
  function markAsked(day, quiz) {
    const t = askedToday(day);
    quiz.forEach((q) => { if (!t.ids.includes(q.id)) t.ids.push(q.id); (t.types[q.id] = t.types[q.id] || []).push(q.type); });
  }

  // Extra practice after today's session: no streak or coins. With `withNew`, 3 new words are learned first.
  function buildBonusSession(day, withNew) {
    const t = askedToday(day);
    let fresh = [];
    if (withNew) {
      const focusNew = focusPick(day, 3, 0).fresh;
      const { reg, cpx } = newWordsFor(Math.max(0, 2 - focusNew.length), Math.max(0, Math.min(1, 3 - focusNew.length)), focusNew);
      fresh = focusNew.concat(reg, cpx);
    }
    const focus = focusOf(profile, day) || [];
    const seen = Object.keys(profile.words).map(Number).filter((id) => profile.words[id].lvl >= 1 && !fresh.includes(id));
    // Test words first, then words not asked yet today; the rest only fill in if there are not enough.
    const order = (list) => shuffle(list.filter((id) => !t.ids.includes(id))).concat(shuffle(list.filter((id) => t.ids.includes(id))));
    const ids = order(seen.filter((id) => focus.includes(id))).concat(order(seen.filter((id) => !focus.includes(id))))
      .slice(0, withNew ? 5 : 8);
    const typeFor = (id) => {
      const used = t.types[id] || [];
      const options = ['meaning', 'sentence', 'reverse', 'odd'].filter((x) => !used.includes(x));
      return pick(options.length ? options : ['meaning', 'sentence', 'reverse']);
    };
    const quiz = shuffle(fresh.map((id) => makeQuestion(id, 'meaning')).concat(ids.map((id) => makeQuestion(id, typeFor(id)))));
    markAsked(day, quiz);
    return {
      day, fresh, reviews: ids, known: [], learnIdx: 0, revealed: false,
      quiz, qIdx: 0, firstTry: {}, retried: {}, combo: 0, bestCombo: 0, trophies: 0, right: 0, total: 0, complexRight: 0,
      bonus: true,
    };
  }

  // ---------- Extra rounds ----------
  // Learning more on a given day earns more, with no daily limit: new words pay more than review,
  // and sometimes the round pays double.
  function extraCoins(s) {
    const base = s.fresh.length ? 3 + Math.floor(s.right / 3) + s.complexRight : 1 + Math.floor(s.right / 3);
    const surprise = Math.random() < EXTRA_SURPRISE;
    return { coins: surprise ? base * 2 : base, surprise };
  }

  // ---------- Streak, coins & city ----------
  function applyStreak(day) {
    const last = profile.lastSessionDay;
    let used = 0;
    if (last === day) return { used };
    if (last === day - 1) {
      profile.streak++;
    } else if (last != null && day - last - 1 <= profile.shields) {
      used = day - last - 1;
      profile.shields -= used;
      profile.streak++;
    } else {
      profile.streak = 1;
    }
    profile.lastSessionDay = day;
    if (profile.streak % 7 === 0 && profile.shields < MAX_SHIELDS) profile.shields++;
    profile.best = Math.max(profile.best, profile.streak);
    return { used };
  }

  function rollChest() {
    const r = Math.random();
    return r < 0.08 ? 'mega' : r < 0.38 ? 'big' : 'common';
  }

  function buildingLevel(id) { return data.shared.city.levels[id] || 0; }
  function buildingCost(id) { return LEVEL_COST[buildingLevel(id)]; }

  // Adds bricks to the current building; returns the buildings that went up a level.
  function addBricks(n) {
    const city = data.shared.city;
    const ups = [];
    city.bricks += n;
    while (n > 0) {
      if (buildingLevel(city.current) >= LEVEL_COST.length) {
        const next = BUILDINGS.find((b) => buildingLevel(b.id) < LEVEL_COST.length);
        if (!next) { city.spare = (city.spare || 0) + n; break; }
        city.current = next.id;
      }
      const id = city.current;
      const need = buildingCost(id) - (city.progress[id] || 0);
      const put = Math.min(need, n);
      city.progress[id] = (city.progress[id] || 0) + put;
      n -= put;
      if (city.progress[id] >= buildingCost(id)) {
        city.progress[id] = 0;
        city.levels[id] = buildingLevel(id) + 1;
        ups.push({ id, level: city.levels[id] });
      }
    }
    return ups;
  }

  function weeklyCount(day) {
    return data.shared.weekly[weekKey(day)] || 0;
  }

  function bumpWeekly(day) {
    const wk = weekKey(day);
    data.shared.weekly[wk] = (data.shared.weekly[wk] || 0) + 1;
    if (data.shared.weekly[wk] >= WEEKLY_GOAL && !data.shared.weeklyClaimed[wk]) {
      data.shared.weeklyClaimed[wk] = true;
      return true;
    }
    return false;
  }

  function siblingPlayedToday(day) {
    return Object.values(data.profiles).some((p) => p.id !== profile.id && p.lastSessionDay === day);
  }

  // Hebrew verb forms by the player's gender ('m' / 'f'); the neutral form until it is set.
  function daysLeft(n) {
    return n <= 0 ? 'המבחן היום' : n === 1 ? 'המבחן מחר' : `עוד ${n} ימים למבחן`;
  }
  function dateOfDay(day) { return new Date(day * 86400000).toISOString().slice(0, 10); }

  function g(p, m, f) {
    return p && p.gender === 'm' ? m : p && p.gender === 'f' ? f : `${m}/${f}`;
  }

  // "to the house": ל + name, dropping the definite ה (הבית → לבית).
  function toPlace(name) { return 'ל' + (name.startsWith('ה') ? name.slice(1) : name); }

  // ---------- Shared news feed ----------
  function pushFeed(entry) {
    data.shared.feed.push(Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: Date.now(), by: profile.id }, entry));
    data.shared.feed = data.shared.feed.slice(-FEED_MAX);
  }

  function feedText(e) {
    const p = data.profiles[e.by];
    const who = p ? `<b>${esc(p.name)}</b>` : 'מישהו';
    if (e.kind === 'mission') {
      return `${who} ${g(p, 'ביצע', 'ביצעה')} את המשימה היומית ${g(p, 'והוסיף', 'והוסיפה')} ${e.bricks} לבנים 🧱` +
        (e.item ? ` ${g(p, 'ומצא', 'ומצאה')} ${e.item.emoji} ${esc(e.item.name)} ${esc(toPlace(e.item.where))}!` : '');
    }
    if (e.kind === 'level') {
      const b = BUILDINGS.find((x) => x.id === e.b);
      return `${b.emoji} ${esc(b.name)} ${e.level >= LEVEL_COST.length ? 'הושלם!' : `עלה לשלב ${e.level}`} בזכות ${who} 🎉`;
    }
    if (e.kind === 'streak') return `${who} ${g(p, 'הגיע', 'הגיעה')} ל-${e.n} ימים ברצף 🔥`;
    if (e.kind === 'cheer') return `${who} ${g(p, 'שולח', 'שולחת')} לך כל הכבוד 👏`;
    return '';
  }

  // News from the other players since this player last looked.
  function unseenFeed() {
    const since = profile.feedSeen || 0;
    return data.shared.feed.filter((e) => e.by !== profile.id && e.t > since && (e.kind !== 'cheer' || e.to === profile.id)).slice(-5);
  }

  // ---------- City items ----------
  function itemList(bid) {
    return ITEMS[bid].map(([id, emoji, name]) => ({ id: bid + ':' + id, emoji, name, where: BUILDINGS.find((b) => b.id === bid).name }));
  }
  function itemsOpen(bid) { return bid === 'house' || buildingLevel(bid) > 0; }

  // Maybe finds a new item for the city; returns it, or null.
  function rollItem(chest) {
    if (Math.random() >= ITEM_CHANCE[chest]) return null;
    const pool = BUILDINGS.filter((b) => itemsOpen(b.id)).flatMap((b) => itemList(b.id)).filter((it) => !data.shared.city.items[it.id]);
    if (!pool.length) return null;
    const it = pick(pool);
    data.shared.city.items[it.id] = profile.id;
    return it;
  }

  function prizeById(id) { return data.shared.prizes.find((p) => p.id === id); }

  // ---------- Stats ----------
  function stats(p) {
    const vals = Object.values(p.words);
    return {
      learned: vals.filter((s) => s.lvl >= RETIRED).length,
      known: vals.filter((s) => s.lvl >= 3).length,
      knewBefore: vals.filter((s) => s.pre && s.lvl >= 3).length,
      learnedHere: vals.filter((s) => !s.pre && s.lvl >= 3).length,
      learning: vals.filter((s) => s.lvl >= 1 && s.lvl < RETIRED).length,
      seen: vals.length,
      complexSeen: Object.keys(p.words).filter((id) => W[id] && W[id].complex).length,
      hard: Object.keys(p.words).map(Number).filter((id) => p.words[id].wrong >= 3 && p.words[id].lvl < RETIRED),
    };
  }

  // =====================================================================
  // Screens
  // =====================================================================

  function themeClass() {
    document.body.className = profile ? 'theme-' + profile.theme : 'theme-fun';
  }

  function screenProfiles() {
    profile = null;
    themeClass();
    const ps = Object.values(data.profiles);
    if (Store.syncAvailable && !Store.family()) { screenFamily(); return; }
    h(`
      <main class="screen center">
        <div class="logo">🏙️</div>
        <h1>עיר המילים</h1>
        <p class="muted">מי משחק/ת עכשיו?</p>
        <div class="profile-list">
          ${ps.map((p) => `
            <button class="profile-btn" data-id="${p.id}">
              <span class="avatar">${avatar(p.avatar)}</span>
              <span class="pname">${esc(p.name)}</span>
              <span class="pstreak">🔥 ${p.streak}</span>
            </button>`).join('')}
        </div>
        <button class="btn ghost" id="add">+ שחקן חדש</button>
        <button class="btn ghost" id="tour">👀 הצצה: הדמויות, העיר והפרסים</button>
      </main>`);
    view = 'profiles';
    on('#tour', 'click', () => screenTour(screenProfiles));
    on('.profile-btn', 'click', (e) => {
      profile = data.profiles[e.currentTarget.dataset.id];
      Store.setActive(profile.id); own(profile.id);
      screenHome();
    });
    on('#add', 'click', screenSetup);
    if (!ps.length) screenSetup();
  }

  function screenSetup() {
    let avatar = AVATARS[0];
    let theme = 'fun';
    let gender;
    h(`
      <main class="screen">
        <h1>שחקן חדש</h1>
        <label class="field">איך קוראים לך?
          <input id="name" maxlength="16" autocomplete="off" placeholder="שם">
        </label>
        <div class="field">בחירת דמות
          <div class="avatar-grid">${AVATARS.map((a, i) => `<button class="av ${i === 0 ? 'sel' : ''}" data-a="${a}" title="${esc(window.ART.AVATARS[a].name)}">${window.ART.AVATARS[a].art}<span>${esc(window.ART.AVATARS[a].name)}</span></button>`).join('')}</div>
        </div>
        <div class="field">אני
          <div class="seg" id="gender">
            <button data-g="m">בן</button>
            <button data-g="f">בת</button>
          </div>
        </div>
        <div class="field">סגנון
          <div class="seg" id="theme">
            <button data-t="fun" class="sel">צבעוני</button>
            <button data-t="clean">נקי</button>
          </div>
        </div>
        <button class="btn primary big" id="go">יאללה!</button>
        ${Object.keys(data.profiles).length ? '<button class="btn ghost" id="back">חזרה</button>' : ''}
      </main>`);
    on('.av', 'click', (e) => {
      document.querySelectorAll('.av').forEach((b) => b.classList.remove('sel'));
      e.currentTarget.classList.add('sel');
      avatar = e.currentTarget.dataset.a;
    });
    on('#theme button', 'click', (e) => {
      document.querySelectorAll('#theme button').forEach((b) => b.classList.remove('sel'));
      e.currentTarget.classList.add('sel');
      theme = e.currentTarget.dataset.t;
      document.body.className = 'theme-' + theme;
    });
    on('#gender button', 'click', (e) => {
      document.querySelectorAll('#gender button').forEach((b) => b.classList.remove('sel'));
      e.currentTarget.classList.add('sel');
      gender = e.currentTarget.dataset.g;
    });
    on('#back', 'click', screenProfiles);
    on('#go', 'click', () => {
      const name = document.getElementById('name').value.trim();
      if (!name) { document.getElementById('name').focus(); return; }
      profile = newProfile(name, avatar, theme, gender);
      data.profiles[profile.id] = profile;
      Store.setActive(profile.id); own(profile.id);
      save();
      screenHome();
    });
  }

  function cityStrip() {
    const built = BUILDINGS.filter((b) => buildingLevel(b.id) > 0);
    const cur = BUILDINGS.find((b) => b.id === data.shared.city.current);
    const prog = data.shared.city.progress[cur.id] || 0;
    const cost = buildingCost(cur.id) || 1;
    return `
      <div class="city-strip">${built.map((b) => `<span class="mini-b" title="${esc(b.name)}">${window.ART.building(b.id, buildingLevel(b.id))}</span>`).join('') || '<span class="empty-note">עוד לא נבנה כלום. כל משימה מביאה לבנים.</span>'}</div>
      <div class="goal">
        <div class="goal-label">בבנייה עכשיו: ${cur.emoji} ${esc(cur.name)} (שלב ${buildingLevel(cur.id) + 1}) · 🧱 ${prog}/${cost}</div>
        <div class="bar"><i style="width:${Math.min(100, (prog / cost) * 100)}%"></i></div>
      </div>`;
  }

  function goalPrizeCard() {
    const pending = profile.requests.filter((r) => r.status === 'pending');
    const prize = prizeById(profile.goalPrize);
    if (pending.length) {
      const p = prizeById(pending[0].prizeId);
      return `<section class="card prize-goal" id="shop-open"><div class="row-between"><h3>הפרס שלי</h3><span class="pill wait">מחכה לאישור הורה</span></div>
        <div class="prize-line"><span class="pe">${p ? p.emoji : '🎁'}</span><span>${esc(p ? p.name : 'פרס')}</span></div></section>`;
    }
    if (!prize) {
      return `<section class="card prize-goal" id="shop-open"><div class="row-between"><h3>חנות הפרסים</h3><span class="coins">🪙 ${profile.coins}</span></div>
        <p class="muted small">בוחרים פרס אמיתי וחוסכים אליו ←</p></section>`;
    }
    const pct = Math.min(100, (profile.coins / prize.cost) * 100);
    return `<section class="card prize-goal" id="shop-open">
      <div class="row-between"><h3>חוסכים ל:</h3><span class="coins">🪙 ${profile.coins}/${prize.cost}</span></div>
      <div class="prize-line"><span class="pe">${prize.emoji}</span><span>${esc(prize.name)}</span></div>
      <div class="bar gold"><i style="width:${pct}%"></i></div>
      ${profile.coins >= prize.cost ? '<p class="note good-note">יש מספיק מטבעות! לוחצים כדי לבקש את הפרס</p>' : ''}
    </section>`;
  }

  function screenHome() {
    themeClass();
    const day = todayNum();
    const doneToday = profile.lastSessionDay === day;
    const st = stats(profile);
    const due = dueIds(day).length;
    const wk = weeklyCount(day);
    const others = Object.values(data.profiles).filter((p) => p.id !== profile.id);
    const set = data.shared.settings;
    // Shown as 0 when the streak is already lost (a day missed with no shield to cover it).
    const lost = !doneToday && profile.lastSessionDay != null && profile.lastSessionDay < day - 1 - profile.shields;
    const news = unseenFeed();
    h(`
      <main class="screen">
        <header class="topbar">
          <button class="chip" id="switch">${avatar(profile.avatar)} ${esc(profile.name)}</button>
          <span class="chip streak ${doneToday ? 'lit' : ''}" title="ימים ברצף">🔥 ${lost ? 0 : profile.streak}</span>
          <span class="chip" title="מגני רצף">🛡️ ${profile.shields}</span>
          <span class="chip" title="גביעים">🏆 ${profile.trophies}</span>
        </header>

        <section class="hero card">
          ${doneToday
            ? `<div class="big-emoji">✅</div><h2>סיימת להיום!</h2><p class="muted">נתראה מחר. הרצף שלך: ${profile.streak} ימים.</p>
               <button class="btn ghost" id="bonus">עוד קצת? (רשות)</button>`
            : `<div class="big-emoji">${profile.streak ? '🔥' : '🦸'}</div>
               <h2>${profile.streak ? `יום ${profile.streak + 1} ברצף מחכה לך` : 'המשימה של היום'}</h2>
               <p class="muted">${set.regular} מילים חדשות + ${set.complex} מאתגרות 💪${due ? ` · ${due} לחזרה` : ''}</p>
               ${focusOf(profile, day) ? `<p class="small">📝 היום מתאמנים גם על המילים למבחן${data.shared.focus[profile.id].until ? ` (${daysLeft(data.shared.focus[profile.id].until - day)})` : ''}</p>` : ''}
               <button class="btn primary big" id="start">יוצאים למשימה</button>`}
        </section>

        ${news.length ? `<section class="card news pop">
          <h3>📣 חדש בעיר</h3>
          ${news.map((e) => `<p class="news-line">${data.profiles[e.by] ? avatar(data.profiles[e.by].avatar) : ''}<span>${feedText(e)}</span></p>`).join('')}
          <div class="row-gap">
            ${news.some((e) => e.kind !== 'cheer') ? '<button class="btn primary sm" id="cheer">👏 לשלוח כל הכבוד</button>' : ''}
            <button class="btn ghost sm" id="news-ok">הבנתי</button>
          </div>
        </section>` : ''}

        ${goalPrizeCard()}

        <section class="card city-mini" id="city-open">
          <div class="row-between"><h3>העיר המשותפת</h3><span class="muted small">פתיחה ←</span></div>
          ${cityStrip()}
          <div class="goal">
            <div class="goal-label">יעד צוות שבועי: ${Math.min(wk, WEEKLY_GOAL)}/${WEEKLY_GOAL} משימות ${wk >= WEEKLY_GOAL ? '🎉' : ''}</div>
            <div class="bar team"><i style="width:${Math.min(100, (wk / WEEKLY_GOAL) * 100)}%"></i></div>
          </div>
          ${others.length ? `<div class="sibs">${others.map((p) => `<span class="sib ${p.lastSessionDay === day ? 'done' : ''}">${avatar(p.avatar)} ${esc(p.name)} ${p.lastSessionDay === day ? `✓ ${g(p, 'סיים', 'סיימה')} היום` : '· עוד לא היום'}</span>`).join('')}</div>` : ''}
        </section>

        <section class="card stats-row">
          <div><b>${st.known}</b><span>מילים שאני יודע/ת</span></div>
          <div><b>${st.seen - st.known}</b><span>בלמידה</span></div>
          <div><b>${profile.best}</b><span>שיא רצף</span></div>
        </section>

        <footer class="foot">
          <button class="link" id="parent">הורים</button>
          <button class="link" id="tour">👀 מה אפשר להשיג</button>
          <button class="link" id="mute">${profile.mute ? '🔇 צלילים כבויים' : '🔊 צלילים'}</button>
        </footer>
      </main>`);
    on('#switch', 'click', screenProfiles);
    on('#start', 'click', () => { session = buildSession(day); startLearn(); });
    on('#bonus', 'click', screenDone);
    view = 'home';
    const seen = () => { profile.feedSeen = Date.now(); save(); screenHome(); };
    on('#news-ok', 'click', seen);
    on('#cheer', 'click', () => {
      [...new Set(news.filter((e) => e.kind !== 'cheer').map((e) => e.by))].forEach((to) => pushFeed({ kind: 'cheer', to }));
      sfx.right();
      seen();
    });
    on('#city-open', 'click', screenCity);
    on('#shop-open', 'click', screenShop);
    on('#parent', 'click', screenParentGate);
    on('#tour', 'click', () => screenTour(screenHome));
    on('#mute', 'click', () => { profile.mute = !profile.mute; save(); screenHome(); });
  }

  // ---------- Learn ----------
  function startLearn() {
    if (!session.fresh.length) { screenQuestion(); return; }
    screenLearn();
  }

  function progressBar() {
    const learnSteps = session.fresh.length;
    const total = learnSteps + session.quiz.length;
    const done = (session.phase === 'quiz' ? learnSteps : session.learnIdx) + session.qIdx;
    return `<div class="progress"><i style="width:${Math.round((done / Math.max(total, 1)) * 100)}%"></i></div>`;
  }

  function screenLearn() {
    session.phase = 'learn';
    const id = session.fresh[session.learnIdx];
    const w = W[id];
    const shown = session.revealed;
    const sent = w.sent ? esc(w.sent).replace(/___/g, `<b>${esc(w.en.split('...')[0])}</b>`) : '';
    h(`
      <main class="screen">
        <header class="qbar"><button class="x" id="quit" aria-label="יציאה">✕</button>${progressBar()}</header>
        <p class="tag">מילה חדשה ${session.learnIdx + 1}/${session.fresh.length} ${w.complex ? '<span class="pill hard">💪 מילה מאתגרת</span>' : ''}${(focusOf(profile, session.day) || []).includes(id) ? '<span class="pill wait">📝 למבחן</span>' : ''}</p>
        <section class="card wordcard ${w.complex ? 'complex' : ''}">
          <button class="speak" id="say" aria-label="השמעה">🔊</button>
          <div class="en" dir="ltr">${esc(w.en)}</div>
          ${shown
            ? `<div class="he pop">${esc(w.he)}</div>
               ${sent ? `<div class="example" dir="ltr">${sent}</div>` : ''}
               ${partsTip(w)}${familyTip(w)}
               <div class="cat muted small">${esc(window.CATEGORIES[w.cat])}</div>`
            : `<p class="muted guess">יש ניחוש? חושבים רגע מה הפירוש, ואז מגלים.</p>`}
        </section>
        ${shown
          ? `<button class="btn primary big" id="next">${session.learnIdx + 1 < session.fresh.length ? 'הבנתי, הבאה' : 'לבדיקה!'}</button>`
          : `<button class="btn primary big" id="reveal">גלה את הפירוש</button>`}
      </main>`);
    if (!shown) speak(w.en);
    on('#say', 'click', () => speak(w.en));
    on('#quit', 'click', confirmQuit);
    on('#reveal', 'click', () => { session.revealed = true; screenLearn(); });
    on('#next', 'click', () => {
      profile.words[id] = profile.words[id] || newState(session.day);
      session.learnIdx++;
      session.revealed = false;
      if (session.learnIdx < session.fresh.length) screenLearn();
      else screenQuestion();
    });
  }

  async function confirmQuit() {
    if (await dialog({ text: 'לצאת? ההתקדמות במשימה הזו לא תישמר.', ok: 'יציאה', cancel: 'להמשיך לשחק' })) {
      data = Store.loadAll();
      normalizeShared();
      profile = data.profiles[profile.id];
      session = null;
      screenHome();
    }
  }

  // ---------- Quiz ----------
  function screenQuestion() {
    session.phase = 'quiz';
    if (session.qIdx >= session.quiz.length) {
      if (!session.bonus && !session.spell) screenSpellOffer(); else finishSession();
      return;
    }
    const q = session.quiz[session.qIdx];
    const w = W[q.id];
    let prompt = '';
    let options = '';
    const enOpts = () => q.opts.map((o) => `<button class="opt ltr" dir="ltr" data-id="${o}">${esc(W[o].en)}</button>`).join('');
    if (q.type === 'meaning') {
      prompt = `<p class="tag">מה הפירוש?</p>
        <div class="card prompt"><div class="en" dir="ltr">${esc(w.en)}</div></div>`;
      options = q.opts.map((o) => `<button class="opt" data-id="${o}">${esc(W[o].he)}</button>`).join('');
    } else if (q.type === 'reverse') {
      prompt = `<p class="tag">איך אומרים באנגלית?</p>
        <div class="card prompt"><div class="he big">${esc(w.he)}</div></div>`;
      options = enOpts();
    } else if (q.type === 'odd') {
      prompt = `<p class="tag">איזו מילה לא שייכת לקבוצה?</p>
        <div class="card prompt"><div class="muted">שלוש מהמילים שייכות לאותו נושא. מוצאים את הרביעית.</div></div>`;
      options = enOpts();
    } else {
      const s = esc(w.sent).replace(/___/g, '<span class="blank">____</span>');
      prompt = `<p class="tag">איזו מילה חסרה?</p>
        <div class="card prompt"><div class="sentence" dir="ltr">${s}</div></div>`;
      options = enOpts();
    }
    h(`
      <main class="screen">
        <header class="qbar"><button class="x" id="quit" aria-label="יציאה">✕</button>${progressBar()}
          ${session.combo >= 2 ? `<span class="combo">x${session.combo} 🔥</span>` : ''}</header>
        ${prompt}
        <div class="opts">${options}</div>
        <div id="feedback"></div>
      </main>`);
    // No audio before answering: in the quiz they read the word on their own.
    on('#quit', 'click', confirmQuit);
    on('.opt', 'click', (e) => answer(q, +e.currentTarget.dataset.id, e.currentTarget));
  }

  function answer(q, chosen, btn) {
    const correct = chosen === q.id;
    const first = !(q.id in session.firstTry);
    document.querySelectorAll('.opt').forEach((b) => {
      b.disabled = true;
      if (+b.dataset.id === q.id) b.classList.add('right');
    });
    const w = W[q.id];
    const fb = document.getElementById('feedback');
    const oddNote = q.type === 'odd'
      ? `<div class="small">${q.opts.filter((o) => o !== q.id).map((o) => `<span dir="ltr">${esc(W[o].en)}</span> = ${esc(W[o].he)}`).join(' · ')}<br>הקבוצה: ${esc(window.CATEGORIES[q.groupCat])}</div>`
      : '';
    if (correct) {
      btn.classList.add('right', 'bounce');
      sfx.right();
      session.combo++;
      session.bestCombo = Math.max(session.bestCombo, session.combo);
      const gained = 10 + Math.min(10, (session.combo - 1) * 2) + (w.complex ? 5 : 0);
      session.trophies += gained;
      if (first) {
        session.right++;
        if (w.complex) session.complexRight++;
      }
      fb.innerHTML = `<div class="fb good">${w.complex ? 'וואו, מילה מאתגרת!' : 'מעולה!'} +${gained} 🏆
        ${q.type !== 'meaning' ? `<div class="small"><span dir="ltr">${esc(w.en)}</span> = ${esc(w.he)}</div>` : ''}${oddNote}${partsTip(w)}</div>`;
      speak(w.en); // after answering, hearing the word reinforces it
    } else {
      btn.classList.add('wrong', 'shake');
      sfx.wrong();
      session.combo = 0;
      fb.innerHTML = `<div class="fb soft">כמעט! <b dir="ltr">${esc(w.en)}</b> = ${esc(w.he)}${oddNote}${partsTip(w)}<div class="small">נחזור אליה עוד רגע</div></div>`;
      // Ask again at the end, so the word is answered right before the session ends.
      if (!session.retried[q.id]) {
        session.retried[q.id] = true;
        session.quiz.push(makeQuestion(q.id, 'meaning'));
      }
    }
    if (first) {
      session.firstTry[q.id] = correct;
      session.total++;
      if (session.known.includes(q.id)) gradeKnownCheck(q.id, correct, q.type, session.day);
      // Bonus rounds and early test-word practice can demote a word but never promote it.
      else if ((!session.bonus && !(session.early || []).includes(q.id)) || !correct || session.fresh.includes(q.id)) grade(q.id, correct, q.type, session.day);
      // For the parent's test-word list: how the last answer went.
      if ((focusOf(profile, session.day) || []).includes(q.id) && profile.words[q.id]) profile.words[q.id].ok = correct;
    }
    const next = document.createElement('button');
    next.className = 'btn primary big';
    next.textContent = 'המשך';
    next.addEventListener('click', () => { session.qIdx++; screenQuestion(); });
    fb.appendChild(next);
    setTimeout(() => next.focus(), 50);
  }

  // ---------- Optional spelling challenge ----------
  function spellCandidates() {
    return shuffle(Object.keys(profile.words).map(Number).filter((id) => {
      const w = W[id];
      return profile.words[id].lvl >= 3 && /^[a-z]{3,12}$/i.test(w.en);
    })).slice(0, 2);
  }

  function editDistance(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return d[a.length][b.length];
  }

  function screenSpellOffer() {
    const ids = spellCandidates();
    session.spell = { ids, idx: 0, right: 0 };
    if (ids.length < 2) { finishSession(); return; }
    h(`
      <main class="screen center">
        <div class="big-emoji">✍️</div>
        <h2>אתגר כתיב (רשות)</h2>
        <p class="muted">שתי מילים שכבר יודעים: רואים בעברית וכותבים באנגלית. ${SPELL_COINS}+ 🪙 על כל מילה.</p>
        <button class="btn primary big" id="go">יאללה</button>
        <button class="btn ghost" id="skip">לא היום, לסיום</button>
      </main>`);
    on('#go', 'click', screenSpell);
    on('#skip', 'click', finishSession);
  }

  function screenSpell() {
    const sp = session.spell;
    if (sp.idx >= sp.ids.length) { finishSession(); return; }
    const w = W[sp.ids[sp.idx]];
    const first = w.en[0];
    const rest = w.en.length - 1;
    // The word is typed straight into the letter slots: an invisible input sits on top of them.
    h(`
      <main class="screen">
        <p class="tag">אתגר כתיב ${sp.idx + 1}/${sp.ids.length}</p>
        <div class="card prompt"><div class="he big">${esc(w.he)}</div>
          <label class="slots" dir="ltr">
            <span class="slot fixed">${esc(first)}</span>${'<span class="slot"></span>'.repeat(rest)}
            <input id="spell" maxlength="${rest}" dir="ltr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="המשך המילה באנגלית">
          </label>
          <div class="muted small">${w.en.length} אותיות · לוחצים על הקווים ומקלידים</div></div>
        <div id="feedback"><button class="btn primary big" id="check">בדיקה</button></div>
      </main>`);
    const input = document.getElementById('spell');
    const slots = [...document.querySelectorAll('.slot:not(.fixed)')];
    const paint = () => {
      input.value = input.value.replace(/[^a-z]/gi, '').slice(0, rest);
      slots.forEach((el, i) => {
        el.textContent = input.value[i] || '';
        el.classList.toggle('cur', i === input.value.length);
      });
    };
    input.addEventListener('input', paint);
    paint();
    input.focus();
    const check = () => {
      const typed = (first + input.value).trim().toLowerCase();
      if (typed.length < 2) { input.focus(); return; }
      const target = w.en.toLowerCase();
      const dist = editDistance(typed, target);
      const ok = dist === 0 || (dist === 1 && target.length >= 5);
      input.disabled = true;
      const st = profile.words[w.id];
      if (ok) {
        sp.right++;
        st.spell = (st.spell || 0) + 1;
        sfx.right();
      } else {
        sfx.wrong();
      }
      speak(w.en);
      document.getElementById('feedback').innerHTML = `<div class="fb ${ok ? 'good' : 'soft'}">${ok ? (dist ? 'כמעט מושלם! +' + SPELL_COINS + ' 🪙' : 'מושלם! +' + SPELL_COINS + ' 🪙') : 'לא נורא.'}
          <div class="small">האיות: <b dir="ltr">${esc(w.en)}</b></div></div>
        <button class="btn primary big" id="next">המשך</button>`;
      on('#next', 'click', () => { sp.idx++; screenSpell(); });
    };
    on('#check', 'click', check);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
  }

  // ---------- Finish ----------
  function finishSession() {
    const day = session.day;
    profile.trophies += session.trophies;
    profile.history[day] = (profile.history[day] || 0) + session.total;
    let streakInfo = { used: 0 };
    let chest = null;
    let coins = 0;
    let team = false;
    let milestone = null;
    let surprise = false;
    let doubleDay = false;
    if (!session.bonus) {
      streakInfo = applyStreak(day);
      profile.sessions++;
      // About 15 coins a day: a small prize takes ~3 weeks of daily play, a big one ~2 months.
      coins = 8 + Math.floor(session.right / 4) + session.complexRight + (session.spell ? session.spell.right * SPELL_COINS : 0);
      if (MILESTONES[profile.streak] && !profile.milestones.includes(profile.streak)) {
        milestone = profile.streak;
        profile.milestones.push(milestone);
        coins += MILESTONES[milestone];
        pushFeed({ kind: 'streak', n: milestone });
      }
      profile.coins += coins;
      chest = rollChest();
      doubleDay = siblingPlayedToday(day);
      team = bumpWeekly(day);
    } else {
      ({ coins, surprise } = extraCoins(session));
      profile.coins += coins;
    }
    save();
    sfx.win();
    confetti();
    const pct = session.total ? Math.round((session.right / session.total) * 100) : 100;
    h(`
      <main class="screen center">
        ${surprise ? `<div class="milestone pop">🎲 הפתעה! המטבעות כפולים</div>` : ''}
        ${milestone ? `<div class="milestone pop">🏆 ${milestone} ימים ברצף! +${MILESTONES[milestone]} 🪙</div>` : ''}
        <h1>${session.bonus ? (session.fresh.length ? `למדת עוד ${session.fresh.length} מילים!` : 'האימון הנוסף הושלם') : pct >= 80 ? 'משימה הושלמה!' : pct >= 50 ? 'יפה מאוד!' : 'עבודה טובה!'}</h1>
        <div class="summary card">
          <div><b>${session.right}/${session.total}</b><span>נכון בפעם הראשונה</span></div>
          <div><b>+${session.trophies}</b><span>🏆 גביעים</span></div>
          ${session.bonus && !coins ? '' : `<div><b>+${coins}</b><span>🪙 מטבעות</span></div>`}
        </div>
        ${session.bonus ? '' : `<p class="muted small">🔥 ${profile.streak} ימים ברצף</p>`}
        ${streakInfo.used ? `<p class="note">🛡️ מגן רצף שמר על הרצף שלך!</p>` : ''}
        ${chest ? `
          <div class="chest card" id="chest">
            <div class="chest-box">${CHESTS[chest].emoji}</div>
            <p>לוחצים כדי לפתוח את התיבה</p>
          </div>` : ''}
        <div id="after"></div>
        <button class="btn primary big" id="home">${session.bonus ? 'הביתה' : 'לעיר'}</button>
      </main>`);
    let opened = false;
    let placed = false;
    let bricks = 0;
    const extras = [];
    const openChest = () => {
      if (opened || !chest) return;
      opened = true;
      bricks = CHESTS[chest].bricks;
      if (doubleDay) { bricks += 3; extras.push('בונוס יום כפול (שניכם שיחקתם היום): +3 🧱'); }
      if (team) { bricks += 15; extras.push('תיבת צוות! הגעתם יחד ליעד השבועי: +15 🧱'); }
      const el = document.getElementById('chest');
      el.classList.add('open');
      el.innerHTML = `<div class="chest-box pop">🧱 ×${bricks}</div><p><b>${CHESTS[chest].name}</b> לבנים לעיר המשותפת</p>`;
      const open = BUILDINGS.filter((b) => buildingLevel(b.id) < LEVEL_COST.length);
      document.getElementById('after').innerHTML =
        extras.map((x) => `<p class="note pop">${x}</p>`).join('') +
        (open.length ? `<section class="card pick pop"><h3>מה בונים היום?</h3>
          <div class="pick-grid">${open.map((b) => {
            const lvl = buildingLevel(b.id);
            const prog = data.shared.city.progress[b.id] || 0;
            return `<button class="pick-b ${data.shared.city.current === b.id ? 'cur' : ''}" data-pick="${b.id}">
              <span class="mini-b">${window.ART.building(b.id, lvl)}</span><span class="small">${esc(b.name)}</span>
              <span class="bar small-bar"><i style="width:${(prog / buildingCost(b.id)) * 100}%"></i></span></button>`;
          }).join('')}</div></section>` : '');
      document.getElementById('home').textContent = 'בוחרים בניין ←';
      on('[data-pick]', 'click', (e) => place(e.currentTarget.dataset.pick));
      if (chest === 'mega') confetti();
      sfx.right();
      if (!open.length) place(null);
    };
    // Puts the day's bricks into the chosen building (overflow moves on to the next unfinished one).
    const place = (bid) => {
      if (placed) return;
      placed = true;
      if (bid) data.shared.city.current = bid;
      const ups = addBricks(bricks);
      const item = rollItem(chest);
      pushFeed({ kind: 'mission', bricks, item: item && { emoji: item.emoji, name: item.name, where: item.where } });
      ups.forEach((u) => pushFeed({ kind: 'level', b: u.id, level: u.level }));
      save();
      const b = BUILDINGS.find((x) => x.id === data.shared.city.current);
      const pickEl = document.querySelector('.pick');
      if (pickEl) pickEl.outerHTML = `<p class="note pop">🧱 ${bricks} לבנים הלכו ${esc(toPlace(b ? b.name : 'העיר'))}</p>`;
      document.getElementById('after').insertAdjacentHTML('beforeend',
        (item ? `<div class="note pop big-note found"><span class="found-e">${item.emoji}</span><span>מצאת ${esc(item.name)} ${esc(toPlace(item.where))}!</span></div>` : '') +
        ups.map((u) => { const x = BUILDINGS.find((y) => y.id === u.id); return `<div class="note pop big-note levelup"><span class="lv-art">${window.ART.building(x.id, u.level)}</span><span>${esc(x.name)}: עלינו לשלב ${u.level}!</span></div>`; }).join(''));
      document.getElementById('home').textContent = 'לעיר';
      if (ups.length || item) confetti();
      sfx.right();
      if (ups.length) setTimeout(() => showcase(ups[ups.length - 1].id, true), 900);
    };
    on('#chest', 'click', openChest);
    on('#home', 'click', () => {
      // An unopened chest is opened and placed automatically, never lost.
      if (chest && !opened) { openChest(); return; }
      if (chest && !placed) { place(data.shared.city.current); return; }
      session = null;
      if (chest) screenCity(true); else screenDone();
    });
  }

  // ---------- City ----------
  function stars(n) {
    return Array.from({ length: LEVEL_COST.length }, (_, i) => (i < n ? '★' : '☆')).join('');
  }

  function screenCity(fromFinish) {
    themeClass();
    const city = data.shared.city;
    h(`
      <main class="screen">
        <header class="topbar"><button class="chip" id="back">→ חזרה</button><h2 class="grow">העיר המשותפת</h2></header>
        ${fromFinish ? '<p class="tag center-text">לוחצים על בניין כדי לבחור מה בונים עכשיו</p>' : ''}
        <div class="skyline">
          ${BUILDINGS.map((b) => {
            const lvl = buildingLevel(b.id);
            return `<span class="bld l${lvl}" title="${esc(b.name)}">${window.ART.building(b.id, lvl)}</span>`;
          }).join('')}
        </div>
        <p class="muted small center-text">כל משימה יומית מביאה לבנים 🧱. בוחרים יחד מה בונים, וכל אחד מוסיף לאותה עיר. עד עכשיו נאספו ${city.bricks} לבנים.</p>
        <section class="buildings">
          ${BUILDINGS.map((b) => {
            const lvl = buildingLevel(b.id);
            const max = lvl >= LEVEL_COST.length;
            const prog = city.progress[b.id] || 0;
            const cost = max ? 1 : buildingCost(b.id);
            const cur = city.current === b.id;
            return `<button class="bcard card ${cur ? 'current' : ''} ${max ? 'finished' : ''}" data-b="${b.id}">
              <span class="bart">${window.ART.building(b.id, lvl)}</span>
              <span class="bname">${esc(b.name)}</span>
              <span class="stars">${stars(lvl)}</span>
              ${max ? '<span class="pill done">הושלם · 👀 להיכנס</span>' : `<span class="bar small-bar"><i style="width:${(prog / cost) * 100}%"></i></span><span class="small muted">🧱 ${prog}/${cost}</span>`}
              ${cur && !max ? '<span class="pill">בונים עכשיו</span>' : ''}
            </button>`;
          }).join('')}
        </section>
        <h3 class="center-text">מה יש בפנים</h3>
        <p class="muted small center-text">בתיבות מוצאים לפעמים חפצים לעיר. בית מתמלא ברהיטים, וכל בניין שמתחילים לבנות נפתח לחפצים משלו.</p>
        <section class="rooms">
          ${BUILDINGS.filter((b) => itemsOpen(b.id)).map((b) => {
            const list = itemList(b.id);
            const got = list.filter((it) => city.items[it.id]).length;
            return `<div class="room card">
              <div class="row-between"><b>${b.emoji} ${esc(b.name)}</b><span class="small muted">${got}/${list.length} <button class="link" data-view="${b.id}">👀 להיכנס</button></span></div>
              <div class="room-items">${list.map((it) => city.items[it.id]
                ? `<span class="ri" title="${esc(it.name)}">${it.emoji}<small>${esc(it.name)}</small></span>`
                : '<span class="ri missing" title="עוד לא נמצא">❔<small>?</small></span>').join('')}</div>
            </div>`;
          }).join('')}
        </section>
        ${fromFinish ? '<button class="btn primary big sticky-cta" id="done">סיימתי להיום ✓</button>' : ''}
      </main>`);
    on('#back', 'click', () => (fromFinish ? screenDone() : screenHome()));
    on('#done', 'click', screenDone);
    on('[data-view]', 'click', (e) => showcase(e.currentTarget.dataset.view, false));
    on('.bcard', 'click', (e) => {
      const id = e.currentTarget.dataset.b;
      if (buildingLevel(id) >= LEVEL_COST.length) { showcase(id, false); return; }
      city.current = id;
      save();
      screenCity(fromFinish);
    });
  }

  // ---------- Building showcase ----------
  // Full-screen view of a building and everything found for it. With `celebrate`, opens with a burst of stars.
  function showcase(bid, celebrate) {
    const b = BUILDINGS.find((x) => x.id === bid);
    const lvl = buildingLevel(bid);
    const done = lvl >= LEVEL_COST.length;
    const items = itemList(bid).filter((it) => data.shared.city.items[it.id]);
    const missing = itemList(bid).length - items.length;
    const [wall, floor] = ROOM_COLORS[bid];
    let slot = 0;
    const placed = items.map((it, i) => {
      const [x, y, size] = ROOM_SPOTS[it.id] || ROOM_SLOTS[slot++ % ROOM_SLOTS.length];
      return `<span class="it" style="left:${x}%;top:${y}%;font-size:${size}rem;animation-delay:${(celebrate ? 2.2 : 0.3) + i * 0.25}s" title="${esc(it.name)}">${it.emoji}</span>`;
    }).join('');
    const stars = celebrate ? Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * Math.PI * 2;
      const r = 120 + Math.random() * 160;
      return `<i style="--x:${Math.round(Math.cos(a) * r)}px;--y:${Math.round(Math.sin(a) * r)}px;animation-delay:${(Math.random() * 0.4).toFixed(2)}s">${pick(['⭐', '✨', '🌟'])}</i>`;
    }).join('') : '';
    const title = celebrate ? (done ? `${b.name} הושלם!` : `${b.name}: שלב ${lvl}!`) : b.name;
    const wrap = document.createElement('div');
    wrap.className = 'showcase' + (celebrate ? ' celebrate' : '');
    wrap.innerHTML = `
      <div class="sc-stars">${stars}</div>
      <div class="sc-inner">
        <h1 class="sc-title">${esc(title)} ${celebrate ? '🎉' : ''}</h1>
        <div class="sc-building">${window.ART.building(bid, lvl)}</div>
        <p class="sc-sub">${'★'.repeat(lvl)}${'☆'.repeat(LEVEL_COST.length - lvl)}</p>
        ${bid === 'band' ? `<div class="band-box">
          <div class="band-list">${BAND.map((x, i) => `<span class="${i < lvl ? 'have' : 'missing'}">${i < lvl ? x : '❔ עוד לא'}</span>`).join('')}</div>
          ${lvl ? `<button class="btn primary" id="sc-play">▶ הלהקה מנגנת${lvl < LEVEL_COST.length ? ` (${lvl} מתוך ${LEVEL_COST.length} כלים)` : ''}</button>` : '<p class="sc-empty">בשלב 1 מגיעים התופים</p>'}
        </div>` : ''}
        <h3 class="sc-in">מה יש בפנים</h3>
        <div class="sc-room" style="--wall:${wall};--floor:${floor}">
          ${placed || '<p class="sc-empty">עוד ריק כאן. חפצים מגיעים בתיבות!</p>'}
        </div>
        <p class="sc-sub">${missing ? `עוד ${missing} חפצים מחכים בתיבות` : 'מצאתם את כל החפצים! 🏆'}</p>
        <button class="btn primary big" id="sc-close">${celebrate ? 'יששש! ממשיכים' : 'סגירה'}</button>
      </div>`;
    document.body.appendChild(wrap);
    const play = wrap.querySelector('#sc-play');
    const toggle = () => {
      if (songStop) { stopSong(); play.textContent = '▶ לנגן שוב'; wrap.classList.remove('playing'); return; }
      play.textContent = '⏹ עצירה';
      wrap.classList.add('playing');
      playSong(lvl, () => { play.textContent = '▶ לנגן שוב'; wrap.classList.remove('playing'); });
    };
    if (play) play.addEventListener('click', toggle);
    if (celebrate) {
      if (play && !(profile && profile.mute)) setTimeout(toggle, 1800); else sfx.win();
      setTimeout(confetti, 1500);
    }
    return new Promise((resolve) => {
      wrap.querySelector('#sc-close').addEventListener('click', () => { stopSong(); wrap.remove(); resolve(); });
    });
  }

  // ---------- Family: connecting the phones ----------
  function screenFamily() {
    themeClass();
    const fromLink = new URLSearchParams(location.search).get('family') || '';
    h(`
      <main class="screen center">
        <div class="logo">🏙️</div>
        <h1>עיר המילים</h1>
        <p class="muted">כדי שכל הטלפונים בבית יבנו את אותה עיר, מחברים אותם למשפחה אחת.</p>
        <section class="card done-card">
          <h3>הטלפון הראשון במשפחה?</h3>
          <button class="btn primary big" id="create">יצירת משפחה חדשה</button>
        </section>
        <section class="card done-card">
          <h3>יש לנו כבר קוד</h3>
          <p class="muted small">את הקוד רואים במסך ההורים בטלפון הראשון.</p>
          <input id="code" class="spell-in" dir="ltr" maxlength="9" autocomplete="off" autocapitalize="characters" placeholder="ABCD2345" value="${esc(fromLink)}">
          <button class="btn primary" id="join">הצטרפות</button>
        </section>
        <p class="muted small" id="fam-msg"></p>
      </main>`);
    const busy = (on_) => document.querySelectorAll('#create, #join').forEach((b) => { b.disabled = on_; });
    const msg = (t) => { document.getElementById('fam-msg').textContent = t; };
    const done = () => { data = Store.loadAll(); normalizeShared(); applyDecisions(); screenProfiles(); };
    on('#create', 'click', async () => {
      busy(true); msg('מתחבר…');
      try {
        const code = await Store.createFamily();
        await dialog({ text: `נוצרה משפחה! הקוד שלכם: ${code}. בטלפונים של הילדים בוחרים "יש לנו כבר קוד" ומקלידים אותו. הקוד יופיע תמיד במסך ההורים.`, cancel: '' });
        done();
      } catch (e) { busy(false); msg('לא הצלחנו להתחבר. בדקו שיש אינטרנט ונסו שוב.'); }
    });
    on('#join', 'click', async () => {
      busy(true); msg('מתחבר…');
      try { await Store.joinFamily(document.getElementById('code').value); done(); } catch (e) {
        busy(false);
        msg(e.message === 'bad code' ? 'הקוד צריך להיות 8 תווים (אותיות באנגלית ומספרים).' : 'לא הצלחנו להצטרף. בדקו את הקוד ואת האינטרנט ונסו שוב.');
      }
    });
  }

  // ---------- Tour: everything there is to get ----------
  function screenTour(back) {
    themeClass();
    const perDay = 17; // average coins per daily mission (see finishSession)
    h(`
      <main class="screen">
        <header class="topbar"><button class="chip" id="back">→ חזרה</button><h2 class="grow">מה יש בעיר המילים</h2></header>
        <section class="card">
          <h3>🦸 הגיבורים</h3>
          <p class="muted small">כל שחקן בוחר גיבור כשהוא נרשם.</p>
          <div class="avatar-grid tour-grid">${AVATARS.map((a) => `<div class="av">${window.ART.AVATARS[a].art}<span>${esc(window.ART.AVATARS[a].name)}</span></div>`).join('')}</div>
        </section>
        <section class="card">
          <h3>🎁 פרסים אמיתיים</h3>
          <p class="muted small">כל משימה יומית מביאה בערך ${perDay} מטבעות, ויש בונוסים על רצף ימים. מי שבוחר ללמוד עוד באותו יום (אימון נוסף) מרוויח עוד מטבעות. כשיש מספיק מטבעות מבקשים את הפרס, והורה מאשר.</p>
          ${data.shared.prizes.map((p) => `<div class="tour-prize"><span class="pe">${esc(p.emoji)}</span><span class="grow">${esc(p.name)}</span><span class="coins">🪙 ${p.cost}</span><span class="small muted">כ-${Math.ceil(p.cost / perDay)} ימים</span></div>`).join('')}
          <p class="muted small">יש לכם רעיון לפרס אחר? אפשר להציע אותו בחנות.</p>
        </section>
        <section class="card">
          <h3>🏙️ העיר המשותפת</h3>
          <p class="muted small">אחרי כל משימה פותחים תיבה עם לבנים. בונים יחד, וכל בניין עולה 5 שלבים עד שהוא גמור ומואר:</p>
          <div class="skyline">${BUILDINGS.map((b) => `<span class="bld" title="${esc(b.name)}">${window.ART.building(b.id, LEVEL_COST.length)}</span>`).join('')}</div>
          <div class="tour-names">${BUILDINGS.map((b) => `<span>${b.emoji} ${esc(b.name)}</span>`).join('')}</div>
        </section>
        <section class="card">
          <h3>🛋️ חפצים שמוצאים בתיבות</h3>
          ${BUILDINGS.map((b) => `<p class="tour-items"><b>${esc(b.name)}:</b> ${itemList(b.id).map((it) => `${it.emoji} ${esc(it.name)}`).join(' · ')}</p>`).join('')}
        </section>
        <section class="card">
          <h3>🔥 עוד דברים</h3>
          <p class="small">רצף ימים, מגני רצף שנאספים כל 7 ימים, גביעים 🏆 על תשובות נכונות, יעד צוות שבועי של 10 משימות ביחד, ובונוס כשמשחקים שניכם באותו יום.</p>
        </section>
      </main>`);
    on('#back', 'click', back);
  }

  // ---------- Done for today ----------
  function screenDone() {
    themeClass();
    const day = todayNum();
    const others = Object.values(data.profiles).filter((p) => p.id !== profile.id);
    h(`
      <main class="screen center">
        <div class="done-badge pop">✓</div>
        <h1>זהו להיום!</h1>
        <p class="muted">המשימה היומית הושלמה. 🔥 ${profile.streak} ימים ברצף.</p>
        ${others.map((p) => `<p class="note">${avatar(p.avatar)} ${esc(p.name)} ${p.lastSessionDay === day ? `כבר ${g(p, 'סיים', 'סיימה')} היום ✓` : `עוד לא ${g(p, 'שיחק', 'שיחקה')} היום. אולי תזכירו?`}</p>`).join('')}
        <section class="card done-card">
          <h3>בא לך עוד?</h3>
          <p class="muted small">רק אם בא לך. כל אימון נוסף מביא עוד מטבעות, ולפעמים יש הפתעה ומקבלים פי 2 🎲</p>
          <button class="btn primary big" id="extra-new">✨ 3 מילים חדשות · 🪙</button>
          <button class="btn ghost" id="extra">🔁 אימון על מילים שלמדתי · 🪙</button>
        </section>
        <button class="btn ghost" id="home">למסך הבית</button>
      </main>`);
    on('#extra', 'click', () => {
      session = buildBonusSession(day, false);
      if (session.quiz.length) screenQuestion(); else screenHome();
    });
    on('#extra-new', 'click', () => {
      session = buildBonusSession(day, true);
      if (session.quiz.length) startLearn(); else screenHome();
    });
    on('#home', 'click', screenHome);
  }

  // ---------- Prize shop ----------
  function screenShop() {
    themeClass();
    const pending = profile.requests.filter((r) => r.status === 'pending');
    const recent = profile.requests.filter((r) => r.status !== 'pending').slice(-3).reverse();
    const mySuggestions = data.shared.suggestions.filter((x) => x.by === profile.id).slice(-4).reverse();
    h(`
      <main class="screen">
        <header class="topbar"><button class="chip" id="back">→ חזרה</button><h2 class="grow">חנות הפרסים</h2><span class="chip">🪙 ${profile.coins}</span></header>
        <p class="muted small">מטבעות מרוויחים רק במשימה היומית: על השלמת המשימה, על תשובות נכונות, על מילים מאתגרות ועל רצפים ארוכים. בוחרים פרס כיעד, וכשיש מספיק מטבעות מבקשים אותו מההורים.</p>
        ${pending.map((r) => { const p = prizeById(r.prizeId); return `<p class="note">⏳ ${p ? p.emoji + ' ' + esc(p.name) : 'פרס'} מחכה לאישור הורה</p>`; }).join('')}
        ${recent.map((r) => { const p = prizeById(r.prizeId); return `<p class="note">${r.status === 'approved' ? '✅' : '↩️'} ${p ? esc(p.name) : 'פרס'}: ${r.status === 'approved' ? 'אושר!' : 'לא אושר, המטבעות הוחזרו'}</p>`; }).join('')}
        <section class="prizes">
          ${data.shared.prizes.slice().sort((a, b) => a.cost - b.cost).map((p) => {
            const can = profile.coins >= p.cost && !pending.length;
            const goal = profile.goalPrize === p.id;
            return `<div class="pcard card ${goal ? 'current' : ''}">
              <span class="pe">${p.emoji}</span>
              <span class="pname2">${esc(p.name)}</span>
              <span class="coins">🪙 ${p.cost}</span>
              <span class="bar gold small-bar"><i style="width:${Math.min(100, (profile.coins / p.cost) * 100)}%"></i></span>
              <span class="pactions">
                <button class="btn ghost sm" data-goal="${p.id}">${goal ? 'היעד שלי ✓' : 'לבחור כיעד'}</button>
                <button class="btn primary sm" data-buy="${p.id}" ${can ? '' : 'disabled'}>לבקש</button>
              </span>
            </div>`;
          }).join('')}
        </section>
        <section class="card suggest">
          <h3>יש לך רעיון לפרס?</h3>
          <p class="muted small">אפשר להציע פרס חדש. ההורים יחליטו אם להוסיף אותו לחנות וכמה מטבעות הוא יעלה.</p>
          ${mySuggestions.map((x) => `<p class="note small">${x.status === 'pending' ? '⏳' : x.status === 'added' ? '✅ נוסף לחנות:' : '↩️ לא הפעם:'} ${esc(x.text)}</p>`).join('')}
          <button class="btn ghost" id="suggest">💡 להציע רעיון</button>
        </section>
      </main>`);
    on('#back', 'click', screenHome);
    on('#suggest', 'click', async () => {
      const text = await dialog({ text: 'איזה פרס היית רוצה?', input: true, numeric: false, ok: 'שליחה להורים' });
      if (!text || !text.trim()) return;
      data.shared.suggestions.push({ id: 's' + Date.now().toString(36), by: profile.id, text: text.trim(), status: 'pending' });
      save();
      screenShop();
    });
    on('[data-goal]', 'click', (e) => { profile.goalPrize = e.currentTarget.dataset.goal; save(); screenShop(); });
    on('[data-buy]', 'click', async (e) => {
      const p = prizeById(e.currentTarget.dataset.buy);
      if (!(await dialog({ text: `לבקש ${p.name} תמורת ${p.cost} מטבעות? ההורים יאשרו.`, ok: 'כן, לבקש' }))) return;
      profile.coins -= p.cost; // held until a parent decides; refunded if declined
      profile.requests.push({ prizeId: p.id, cost: p.cost, day: todayNum(), status: 'pending' });
      if (profile.goalPrize === p.id) profile.goalPrize = null;
      save();
      confetti();
      screenShop();
    });
  }

  // ---------- Parents ----------
  // Not real security, just keeps the password from sitting in plain text in storage.
  function pinHash(pin) {
    let x = 5381;
    for (const ch of 'vocab-city:' + pin) x = ((x * 33) ^ ch.charCodeAt(0)) >>> 0;
    return x.toString(36);
  }

  async function setParentPin() {
    const a = await dialog({ text: 'בחירת סיסמת הורים (לפחות 4 תווים). הילדים לא צריכים לדעת אותה.', input: true, numeric: false, secret: true, ok: 'המשך' });
    if (a == null) return false;
    if (a.trim().length < 4) { await dialog({ text: 'הסיסמה קצרה מדי. צריך לפחות 4 תווים.', cancel: '' }); return false; }
    const b = await dialog({ text: 'הקלדה חוזרת של הסיסמה', input: true, numeric: false, secret: true, ok: 'שמירה' });
    if (b == null) return false;
    if (a.trim() !== b.trim()) { await dialog({ text: 'הסיסמאות לא תואמות. נסו שוב.', cancel: '' }); return false; }
    data.shared.parentPin = pinHash(a.trim());
    Store.saveShared(data.shared);
    return true;
  }

  async function screenParentGate() {
    if (!data.shared.parentPin) {
      if (await setParentPin()) screenParent();
      return;
    }
    const ans = await dialog({ text: 'סיסמת הורים', input: true, numeric: false, secret: true, ok: 'כניסה' });
    if (ans == null) return;
    if (pinHash(ans.trim()) === data.shared.parentPin) screenParent();
    else await dialog({ text: 'סיסמה לא נכונה', cancel: '' });
  }

  // Parent screen: test words for one kid. Each word shows whether it was answered right last time.
  function focusCard(p, day) {
    const f = data.shared.focus[p.id];
    const ids = (f && f.ids.filter((id) => W[id])) || [];
    const active = !!focusOf(p, day);
    const mark = (id) => {
      const s = p.words[id];
      if (!s) return '⬜';
      return (s.ok === undefined ? s.lvl >= 2 : s.ok) ? '✅' : '🟨';
    };
    return `<div class="focus-edit">
      <h4>📝 מילים למבחן</h4>
      ${ids.length ? `<p class="small">${active ? (f.until ? daysLeft(f.until - day) : 'פעיל עד שמנקים') : 'המבחן עבר, המילים כבר לא מקבלות עדיפות'}</p>
        <p class="small" dir="ltr">${ids.map((id) => `${mark(id)} ${esc(W[id].en)}`).join(' · ')}</p>
        <p class="muted small">⬜ עוד לא נלמדה · 🟨 בלמידה · ✅ ${g(p, 'ענה', 'ענתה')} נכון בפעם האחרונה</p>` : ''}
      <p class="muted small">מילים באנגלית, מופרדות בפסיק או בשורה. הן יילמדו קודם ויחזרו בכל משימה עד יום המבחן.</p>
      <textarea id="focus-words-${p.id}" dir="ltr" rows="3">${esc(ids.map((id) => W[id].en).join(', '))}</textarea>
      <label class="small">יום המבחן (לא חובה) <input type="date" id="focus-until-${p.id}" value="${f && f.until ? dateOfDay(f.until) : ''}"></label>
      <div class="row-gap"><button class="btn primary sm" data-focus-save="${p.id}">שמירה</button>
        ${ids.length ? `<button class="btn ghost sm" data-focus-clear="${p.id}">ניקוי הרשימה</button>` : ''}</div>
    </div>`;
  }

  async function saveFocus(pid) {
    const words = [...new Set(document.getElementById('focus-words-' + pid).value.toLowerCase()
      .split(/[,\n;]+/).map((x) => x.trim().replace(/\s+/g, ' ')).filter(Boolean))];
    const until = document.getElementById('focus-until-' + pid).value;
    const ids = [];
    for (const en of words) {
      let id = EN_INDEX[en];
      if (!id) {
        // Not in the word bank yet: ask for the meaning and add it for the whole family.
        const he = await dialog({ text: `המילה "${en}" לא נמצאת במאגר. מה הפירוש בעברית? (ריק = לדלג)`, input: true, numeric: false });
        if (!he || !he.trim()) continue;
        do id = 100000 + Math.floor(Math.random() * 900000); while (W[id]);
        data.shared.customWords.push([id, en, he.trim()]);
        registerCustomWords();
      }
      ids.push(id);
    }
    data.shared.focus[pid] = { ids, until: until ? Math.floor(Date.parse(until) / 86400000) : null };
    Store.saveShared(data.shared);
    screenParent();
  }

  function screenParent() {
    const day = todayNum();
    const ps = Object.values(data.profiles);
    const set = data.shared.settings;
    const pending = [];
    ps.forEach((p) => p.requests.forEach((r, i) => { if (r.status === 'pending' && !data.shared.decisions[p.id + ':' + i]) pending.push({ p, r, i }); }));
    const ideas = data.shared.suggestions.filter((x) => x.status === 'pending');
    h(`
      <main class="screen">
        <header class="topbar"><button class="chip" id="back">→ חזרה</button><h2 class="grow">מסך הורים</h2></header>

        ${pending.length ? `<section class="card attention">
          <h3>בקשות לפרסים</h3>
          ${pending.map(({ p, r, i }) => { const pr = prizeById(r.prizeId); return `
            <div class="req"><span>${avatar(p.avatar)} ${esc(p.name)}: ${pr ? pr.emoji + ' ' + esc(pr.name) : 'פרס'} (🪙 ${r.cost})</span>
              <span class="pactions"><button class="btn primary sm" data-approve="${p.id}:${i}">אישור</button><button class="btn ghost sm" data-decline="${p.id}:${i}">דחייה</button></span></div>`; }).join('')}
        </section>` : ''}

        ${ideas.length ? `<section class="card attention">
          <h3>רעיונות לפרסים מהילדים</h3>
          ${ideas.map((x) => `
            <div class="req"><span>${data.profiles[x.by] ? avatar(data.profiles[x.by].avatar) + ' ' + esc(data.profiles[x.by].name) : ''}: ${esc(x.text)}</span>
              <span class="pactions"><input id="idea-cost-${x.id}" type="number" min="10" step="10" value="500" aria-label="מחיר במטבעות" class="cost-in">
                <button class="btn primary sm" data-idea-add="${x.id}">הוספה לחנות</button><button class="btn ghost sm" data-idea-no="${x.id}">לא הפעם</button></span></div>`).join('')}
        </section>` : ''}

        ${ps.map((p) => {
          const st = stats(p);
          const last7 = Array.from({ length: 7 }, (_, i) => day - 6 + i).map((d) => (p.history[d] ? '🟩' : '⬜')).join('');
          return `
          <section class="card">
            <h3>${avatar(p.avatar)} ${esc(p.name)}</h3>
            <div class="kv"><span>פנייה בלשון</span><select data-gender="${p.id}"><option value="">לא נבחר</option><option value="m" ${p.gender === 'm' ? 'selected' : ''}>זכר</option><option value="f" ${p.gender === 'f' ? 'selected' : ''}>נקבה</option></select></div>
            <div class="kv"><span>רצף נוכחי / שיא</span><b>${p.streak} / ${p.best}</b></div>
            <div class="kv"><span>7 ימים אחרונים</span><b>${last7}</b></div>
            <div class="kv"><span>ידעו כבר מקודם (ענו נכון בפעם הראשונה)</span><b>${st.knewBefore}</b></div>
            <div class="kv"><span>נלמדו באפליקציה ועברו כמה בדיקות</span><b>${st.learnedHere}</b></div>
            <div class="kv"><span>נרכשו לגמרי (יצאו מהסבב)</span><b>${st.learned}</b></div>
            <div class="kv"><span>בתהליך למידה</span><b>${st.learning}</b></div>
            <div class="kv"><span>מילים מאתגרות שנחשף/ה אליהן</span><b>${st.complexSeen}</b></div>
            <div class="kv"><span>נותרו במאגר</span><b>${ALL_IDS.length - st.seen}</b></div>
            <div class="kv"><span>מטבעות</span><b>🪙 ${p.coins}</b></div>
            ${st.hard.length ? `<div class="hard"><b>מילים עקשניות:</b> <span dir="ltr">${st.hard.slice(0, 20).map((id) => esc(W[id].en)).join(', ')}</span></div>` : ''}
            ${focusCard(p, day)}
            <button class="link danger" data-del="${p.id}">מחיקת שחקן</button>
          </section>`;
        }).join('')}

        <section class="card settings">
          <h3>הגדרות משותפות לשניהם</h3>
          <label>מילים רגילות ביום
            <select id="set-regular">${[2, 3, 4, 5, 6].map((n) => `<option ${n === set.regular ? 'selected' : ''}>${n}</option>`).join('')}</select>
          </label>
          <label>מילים מאתגרות ביום
            <select id="set-complex">${[0, 1, 2, 3].map((n) => `<option ${n === set.complex ? 'selected' : ''}>${n}</option>`).join('')}</select>
          </label>
        </section>

        <section class="card settings">
          <h3>פרסים ומחירים</h3>
          <p class="muted small">משימה יומית מכניסה בערך 15 מטבעות, ועוד בונוסים על רצפים (7 ימים: 20, 30 ימים: 80).</p>
          ${data.shared.prizes.map((p, i) => `
            <div class="prize-edit">
              <input id="pe-emoji-${i}" class="emoji-in" value="${esc(p.emoji)}" maxlength="4" aria-label="סמל">
              <input id="pe-name-${i}" value="${esc(p.name)}" aria-label="שם הפרס">
              <input id="pe-cost-${i}" type="number" min="10" step="10" value="${p.cost}" aria-label="מחיר">
              <button class="link danger" data-rm="${i}" aria-label="הסרה">✕</button>
            </div>`).join('')}
          <button class="btn ghost" id="add-prize">+ פרס חדש</button>
          <button class="btn primary" id="save-prizes">שמירת הפרסים</button>
        </section>
        <button class="btn ghost" id="change-pin">שינוי סיסמת הורים</button>
        ${Store.family() ? `<section class="card">
          <h3>חיבור הטלפונים</h3>
          <p class="small">קוד המשפחה: <b dir="ltr" class="fam-code">${esc(Store.family())}</b></p>
          <p class="muted small">בטלפון חדש פותחים את האפליקציה, בוחרים "יש לנו כבר קוד" ומקלידים את הקוד. כל הטלפונים עם אותו קוד בונים את אותה עיר.</p>
          <button class="btn ghost" id="share-code">שליחת הקוד</button>
        </section>` : '<p class="muted small">כרגע ההתקדמות נשמרת במכשיר הזה בלבד.</p>'}
      </main>`);
    on('#back', 'click', () => (profile ? screenHome() : screenProfiles()));
    on('#set-regular', 'change', (e) => { set.regular = +e.currentTarget.value; Store.saveShared(data.shared); });
    on('#set-complex', 'change', (e) => { set.complex = +e.currentTarget.value; Store.saveShared(data.shared); });
    const decide = (key, ok) => {
      data.shared.decisions[key] = ok ? 'approved' : 'declined';
      Store.saveShared(data.shared);
      applyDecisions();
      screenParent();
    };
    on('[data-idea-add]', 'click', (e) => {
      const x = data.shared.suggestions.find((y) => y.id === e.currentTarget.dataset.ideaAdd);
      const cost = Math.max(10, +document.getElementById('idea-cost-' + x.id).value || 500);
      data.shared.prizes.push({ id: 'x' + Date.now().toString(36), emoji: '🎁', name: x.text, cost });
      x.status = 'added';
      Store.saveShared(data.shared);
      screenParent();
    });
    on('[data-idea-no]', 'click', (e) => {
      data.shared.suggestions.find((y) => y.id === e.currentTarget.dataset.ideaNo).status = 'declined';
      Store.saveShared(data.shared);
      screenParent();
    });
    on('#share-code', 'click', async () => {
      const text = `קוד המשפחה לעיר המילים: ${Store.family()}\n${location.origin + location.pathname}`;
      try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { return; }
      try { await navigator.clipboard.writeText(text); await dialog({ text: 'הקוד הועתק. אפשר להדביק אותו בהודעה.', cancel: '' }); } catch (e) { /* ignore */ }
    });
    on('#change-pin', 'click', async () => { if (await setParentPin()) await dialog({ text: 'הסיסמה עודכנה', cancel: '' }); });
    on('[data-gender]', 'change', (e) => {
      const p = data.profiles[e.currentTarget.dataset.gender];
      p.gender = e.currentTarget.value || undefined;
      Store.saveProfile(p);
    });
    on('[data-focus-save]', 'click', (e) => saveFocus(e.currentTarget.dataset.focusSave));
    on('[data-focus-clear]', 'click', (e) => {
      delete data.shared.focus[e.currentTarget.dataset.focusClear];
      Store.saveShared(data.shared);
      screenParent();
    });
    on('[data-approve]', 'click', (e) => decide(e.currentTarget.dataset.approve, true));
    on('[data-decline]', 'click', (e) => decide(e.currentTarget.dataset.decline, false));
    const readPrizes = () => data.shared.prizes.map((p, i) => ({
      id: p.id,
      emoji: document.getElementById('pe-emoji-' + i).value.trim() || '🎁',
      name: document.getElementById('pe-name-' + i).value.trim() || 'פרס',
      cost: Math.max(10, +document.getElementById('pe-cost-' + i).value || p.cost),
    }));
    on('#save-prizes', 'click', () => { data.shared.prizes = readPrizes(); Store.saveShared(data.shared); screenParent(); });
    on('#add-prize', 'click', () => {
      data.shared.prizes = readPrizes();
      data.shared.prizes.push({ id: 'x' + Date.now().toString(36), emoji: '🎁', name: 'פרס חדש', cost: 300 });
      Store.saveShared(data.shared);
      screenParent();
    });
    on('[data-rm]', 'click', (e) => {
      data.shared.prizes = readPrizes();
      data.shared.prizes.splice(+e.currentTarget.dataset.rm, 1);
      Store.saveShared(data.shared);
      screenParent();
    });
    on('[data-del]', 'click', async (e) => {
      const id = e.currentTarget.dataset.del;
      if (!(await dialog({ text: `למחוק את ${data.profiles[id].name}? כל ההתקדמות תימחק.`, ok: 'מחיקה' }))) return;
      Store.deleteProfile(id);
      delete data.profiles[id];
      if (profile && profile.id === id) profile = null;
      screenParent();
    });
  }

  // ---------- Boot ----------
  if (profile) screenHome(); else screenProfiles();

  // For tests and debugging in the browser console.
  window.__vocab = { W, todayNum, buildSession, grade, showcase, addBricks, get profile() { return profile; }, get data() { return data; } };
})();
