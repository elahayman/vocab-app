// Topic: factoring and the short multiplication formulas (9th grade algebra).
// Every question is generated with fresh numbers, so it checks the method and not a memorised answer.
(() => {
// poly([[coef, power], ...]) → "2x² − 6x + 9"
function poly(terms, v = 'x') {
  const parts = terms.filter(([c]) => c).map(([c, pw]) => {
    const abs = Math.abs(c);
    return [c < 0, pw === 0 ? String(abs) : (abs === 1 ? '' : abs) + v + (pw === 2 ? '²' : '')];
  });
  return parts.map(([neg, b], i) => (i === 0 ? (neg ? '−' : '') + b : (neg ? ' − ' : ' + ') + b)).join('') || '0';
}
const Q = (a, b, c, v) => poly([[a, 2], [b, 1], [c, 0]], v);   // ax² + bx + c
const L = (p, q, v) => poly([[p, 1], [q, 0]], v);              // px + q
const sq = (p, q) => `(${L(p, q)})²`;
const sgn = n => (n < 0 ? '−' : '+');
const nz = (a, b) => { let n; do { n = R.int(a, b); } while (!n); return n; };

const subs = [
  { id: 'formulas', name: 'נוסחאות הכפל המקוצר', tip: '(a + b)² = a² + 2ab + b²   (a − b)² = a² − 2ab + b²   (a + b)(a − b) = a² − b²' },
  { id: 'factor', name: 'פירוק לגורמים', tip: 'קודם גורם משותף. אחר כך: הפרש ריבועים? ריבוע של סכום/הפרש? טרינום: שני מספרים שמכפלתם c וסכומם b.' },
  { id: 'equations', name: 'פתרון משוואות בעזרת פירוק', tip: 'מכפלה שווה 0 רק כשאחד הגורמים שווה 0.' },
];

const rules = {
  formulas: [
    'ריבוע של סכום: (a + b)² = a² + 2ab + b²',
    'ריבוע של הפרש: (a − b)² = a² − 2ab + b²',
    'הפרש ריבועים: (a + b)(a − b) = a² − b²',
    'הטעות הנפוצה: (a + b)² ≠ a² + b². תמיד יש גם את האיבר האמצעי 2ab.',
    'חישוב בראש: 31² = (30 + 1)² = 900 + 60 + 1. ו-29 · 31 = 30² − 1² = 899.',
  ],
  factor: [
    'פירוק לגורמים = לכתוב ביטוי כמכפלה. זה ההפך מפתיחת סוגריים.',
    'שלב 1: הוצאת גורם משותף. 6x² + 9x = 3x(2x + 3).',
    'הפרש ריבועים: a² − b² = (a − b)(a + b). למשל x² − 49 = (x − 7)(x + 7).',
    'ריבוע של סכום/הפרש: x² + 10x + 25 = (x + 5)². בודקים: האמצעי = 2 · x · 5?',
    'טרינום x² + bx + c: מחפשים שני מספרים שמכפלתם c וסכומם b. x² + 7x + 12 = (x + 3)(x + 4).',
    'פירוק בקבוצות: xy + 3x + 2y + 6 = x(y + 3) + 2(y + 3) = (x + 2)(y + 3).',
    'תמיד אפשר לבדוק: פותחים את הסוגריים וצריך לחזור לביטוי המקורי.',
  ],
  equations: [
    'מכפלה שווה 0 רק אם לפחות אחד הגורמים שווה 0.',
    '(x − 3)(x + 4) = 0 → x = 3 או x = −4.',
    'x² − 25 = 0 → (x − 5)(x + 5) = 0 → x = 5 או x = −5.',
    'x² − 5x = 0 → x(x − 5) = 0 → x = 0 או x = 5. (לא לחלק ב-x! מאבדים את הפתרון 0.)',
  ],
};

const T = [];
const add = (id, sub, make) => T.push({ id: 'a-' + id, sub, make });

// ---------- formulas (expanding) ----------
add('sum-sq', 'formulas', () => {
  const p = R.pick([1, 1, 1, 2, 3]), q = R.int(1, 9), minus = R.coin(), s = minus ? -1 : 1;
  const ok = Q(p * p, s * 2 * p * q, q * q);
  return {
    q: `מה שווה ${M(sq(p, s * q))}?`,
    opts: choices(M(ok), [M(Q(p * p, 0, q * q)), M(Q(p * p, s * p * q, q * q)), M(Q(p * p, -s * 2 * p * q, q * q)), M(Q(p, s * 2 * p * q, q * q)), M(Q(p * p, s * 2 * p * q, -q * q))]),
    rule: minus ? '(a − b)² = a² − 2ab + b²' : '(a + b)² = a² + 2ab + b²',
    hint: 'אל תשכח את האיבר האמצעי.',
    explain: `${minus ? 'ריבוע של הפרש' : 'ריבוע של סכום'}: (a ${sgn(s)} b)² = a² ${sgn(s)} 2ab + b². כאן a = ${L(p, 0)}, b = ${q}: ` +
      M(`(${L(p, 0)})² ${sgn(s)} 2 · ${L(p, 0)} · ${q} + ${q}² = ${ok}`) + '. הטעות הנפוצה היא לשכוח את 2ab.',
  };
});

add('diff-sq', 'formulas', () => {
  const p = R.pick([1, 1, 2, 3]), q = R.int(1, 9);
  const ok = Q(p * p, 0, -q * q);
  return {
    q: `מה שווה ${M(`(${L(p, q)})(${L(p, -q)})`)}?`,
    opts: choices(M(ok), [M(Q(p * p, 0, q * q)), M(Q(p * p, -2 * p * q, q * q)), M(Q(p * p, 0, -2 * q)), M(Q(p, 0, -q * q))]),
    rule: '(a + b)(a − b) = a² − b²',
    explain: `הפרש ריבועים: (a + b)(a − b) = a² − b². האיברים האמצעיים מבטלים זה את זה (+${p * q}x ו-−${p * q}x). התוצאה: ${M(ok)}.`,
  };
});

add('missing-mid', 'formulas', () => {
  const q = R.int(2, 9), minus = R.coin(), s = minus ? '−' : '+';
  return {
    q: `מה חסר במקום הריבוע? ${M(`x² ${s} ▢ + ${q * q} = (x ${s} ${q})²`)}`,
    opts: choices(M(`${2 * q}x`), [M(`${q}x`), M(`${q * q}x`), M('2x'), M(`${4 * q}x`)]),
    rule: 'האיבר האמצעי: 2ab',
    explain: `האיבר האמצעי הוא 2 · a · b = 2 · x · ${q} = ${2 * q}x.`,
  };
});

add('missing-last', 'formulas', () => {
  const q = R.int(3, 9), minus = R.coin(), s = minus ? '−' : '+';
  return {
    q: `מה חסר במקום הריבוע? ${M(`x² ${s} ${2 * q}x + ▢ = (x ${s} ${q})²`)}`,
    opts: choices(M(String(q * q)), [M(String(q)), M(String(2 * q)), M('−' + q * q)]),
    rule: 'האיבר האחרון: b²',
    explain: `האיבר האחרון הוא b², ו-b = ${q} (חצי מהמקדם האמצעי ${2 * q}). ${q}² = ${q * q}, תמיד חיובי.`,
  };
});

add('mental', 'formulas', () => {
  const k = R.int(2, 9), d = R.pick([1, 2]), up = R.coin();
  if (R.coin()) {
    const n = 10 * k + (up ? d : -d), s = up ? '+' : '−';
    return {
      q: `איך הכי נוח לחשב בראש ${M(n + '²')}?`,
      opts: choices(M(`${10 * k}² ${s} 2 · ${10 * k} · ${d} + ${d}²`), [M(`${10 * k}² ${s} ${d}²`), M(`(${10 * k} + ${d})(${10 * k} − ${d})`), M(`${10 * k}² ${s} ${10 * k} · ${d}`)]),
      rule: up ? '(a + b)² = a² + 2ab + b²' : '(a − b)² = a² − 2ab + b²',
      explain: `${n} = ${10 * k} ${s} ${d}, ולכן ${n}² = (${10 * k} ${s} ${d})² = ${10 * k}² ${s} 2 · ${10 * k} · ${d} + ${d}² = ${n * n}.`,
    };
  }
  const a = 10 * k, x = (a - d) * (a + d);
  return {
    q: `איך הכי נוח לחשב בראש ${M(`${a - d} · ${a + d}`)}?`,
    opts: choices(M(`${a}² − ${d}²`), [M(`${a}² + ${d}²`), M(`(${a} − ${d})²`), M(`${a}² − 2 · ${d}`)]),
    rule: '(a + b)(a − b) = a² − b²',
    explain: `${a - d} = ${a} − ${d} ו-${a + d} = ${a} + ${d}. הפרש ריבועים: (${a} − ${d})(${a} + ${d}) = ${a}² − ${d}² = ${a * a} − ${d * d} = ${x}.`,
  };
});

const KINDS = { sum: 'ריבוע של סכום: (a + b)²', diff: 'ריבוע של הפרש: (a − b)²', ds: 'הפרש ריבועים: (a − b)(a + b)', none: 'אף אחת מהנוסחאות' };
add('identify', 'formulas', () => {
  const q = R.int(2, 9), kind = R.pick(['sum', 'diff', 'ds', 'ds', 'none', 'none']);
  const exprs = {
    sum: [Q(1, 2 * q, q * q), `= (x + ${q})²`],
    diff: [Q(1, -2 * q, q * q), `= (x − ${q})²`],
    ds: [Q(1, 0, -q * q), `= (x − ${q})(x + ${q})`],
    none: R.coin() ? [Q(1, 0, q * q), ''] : [Q(1, q, q * q), ''],
  };
  const [e, res] = exprs[kind];
  const whyNone = e.includes('x +') || e.includes('x −')
    ? `האיבר האמצעי צריך להיות 2 · x · ${q} = ${2 * q}x, אבל כאן הוא ${q}x.`
    : 'סכום ריבועים (פלוס בין שני ריבועים) לא מתפרק לפי אף נוסחה. רק הפרש (מינוס).';
  return {
    q: `לפי איזו נוסחה אפשר לכתוב את ${M(e)} כמכפלה?`,
    opts: choices(KINDS[kind], Object.values(KINDS).filter(v => v !== KINDS[kind])),
    rule: 'לזהות את הנוסחה',
    hint: 'כמה איברים יש? יש סימן מינוס? האיבר האמצעי הוא 2ab?',
    explain: kind === 'none' ? whyNone : `${M(e + ' ' + res)}. ` + (kind === 'ds' ? 'שני ריבועים עם מינוס ביניהם.' : `האיבר האמצעי ${2 * q}x הוא בדיוק 2 · x · ${q}.`),
  };
});

// ---------- factoring ----------
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
add('common', 'factor', () => {
  let a, b;
  do { a = R.int(1, 5); b = R.int(1, 7); } while (gcd(a, b) !== 1);
  const k = R.int(2, 6), withX = R.coin();
  if (withX) {
    return {
      q: `מה הפירוק המלא של ${M(Q(a * k, b * k, 0))}?`,
      opts: choices(M(`${k}x(${L(a, b)})`), [M(`${k}x(${L(b, a)})`), M(`${k}(${L(a, b)})`), M(`${k}x(${Q(a, 0, b)})`), M(`${k}x²(${a} + ${b})`)]),
      rule: 'הוצאת גורם משותף',
      hint: 'מה יש בשני האיברים? גם מספר וגם x?',
      explain: `בשני האיברים יש ${k} ויש x, לכן הגורם המשותף הוא ${k}x. ${a * k}x² ÷ ${k}x = ${L(a, 0)}, ${b * k}x ÷ ${k}x = ${b}. בדיקה: ${k}x · (${L(a, b)}) = ${Q(a * k, b * k, 0)}.`,
    };
  }
  return {
    q: `מה הפירוק של ${M(L(a * k, -b * k))}?`,
    opts: choices(M(`${k}(${L(a, -b)})`), [M(`${k}(${L(a, b)})`), M(`${k}(${L(a * k, -b)})`), M(`${k}x(${a} − ${b})`)]),
    rule: 'הוצאת גורם משותף',
    explain: `${k} מחלק את שני האיברים: ${a * k}x ÷ ${k} = ${L(a, 0)}, ${b * k} ÷ ${k} = ${b}. בדיקה: ${k}(${L(a, -b)}) = ${L(a * k, -b * k)}.`,
  };
});

add('fac-ds', 'factor', () => {
  let p, q;
  do { p = R.pick([1, 1, 2, 3]); q = R.int(1, 9); } while (gcd(p, q) !== 1);
  return {
    q: `מה הפירוק של ${M(Q(p * p, 0, -q * q))}?`,
    opts: choices(M(`(${L(p, -q)})(${L(p, q)})`), [M(sq(p, -q)), M(sq(p, q)), M(`(${L(p, -q * q)})(${L(p, 1)})`), M(`${p * p}(${L(1, -q)})(${L(1, q)})`)]),
    rule: 'a² − b² = (a − b)(a + b)',
    explain: `${Q(p * p, 0, -q * q)} = (${L(p, 0)})² − ${q}². הפרש ריבועים: (a − b)(a + b) עם a = ${L(p, 0)}, b = ${q}.`,
  };
});

add('fac-square', 'factor', () => {
  const q = R.int(2, 9), s = R.coin() ? 1 : -1;
  return {
    q: `מה הפירוק של ${M(Q(1, s * 2 * q, q * q))}?`,
    opts: choices(M(sq(1, s * q)), [M(sq(1, -s * q)), M(`(x + ${q})(x − ${q})`), M(sq(1, s * 2 * q)), M(sq(1, s * q * q))]),
    rule: s > 0 ? 'a² + 2ab + b² = (a + b)²' : 'a² − 2ab + b² = (a − b)²',
    hint: `האם ${q * q} הוא ריבוע של מספר? והאיבר האמצעי הוא פעמיים המספר?`,
    explain: `${q * q} = ${q}², והאיבר האמצעי ${2 * q}x = 2 · x · ${q}. הסימן באמצע ${s > 0 ? 'פלוס' : 'מינוס'}, לכן ${sq(1, s * q)}.`,
  };
});

add('trinomial', 'factor', () => {
  let m, n;
  do { m = nz(-7, 7); n = nz(-7, 7); } while (m === n || m === -n);
  const e = Q(1, m + n, m * n), f = (a, b) => `(${L(1, a)})(${L(1, b)})`;
  return {
    q: `מה הפירוק של ${M(e)}?`,
    opts: choices(M(f(m, n)), [M(f(-m, -n)), M(f(-m, n)), M(f(m, -n))]),
    rule: 'טרינום: מכפלה c, סכום b',
    hint: `חפש שני מספרים שמכפלתם ${m * n} וסכומם ${m + n}.`,
    explain: `מחפשים שני מספרים ש<b>מכפלתם ${m * n}</b> ו<b>סכומם ${m + n}</b>: ${m} ו-${n}. לכן ${e} = ${f(m, n)}. בדיקה: ${m} · ${n} = ${m * n}, ${m} + ${n} = ${m + n}.`,
  };
});

add('pair', 'factor', () => {
  let m, n;
  do { m = nz(-6, 6); n = nz(-6, 6); } while (m === n || m === -n);
  const num = a => (a < 0 ? '−' + -a : String(a));
  const e = Q(1, m + n, m * n), f = (a, b) => `${num(Math.min(a, b))} ו-${Math.max(a, b) < 0 ? '(' + num(Math.max(a, b)) + ')' : Math.max(a, b)}`;
  const wrong = [f(-m, -n), f(-m, n)];
  for (let a = -12; a <= 12; a++) if (a && (m * n) % a === 0 && a !== m && a !== n) wrong.push(f(a, (m * n) / a));
  return {
    q: `כדי לפרק את ${M(e)}, אילו שני מספרים מחפשים?`,
    opts: choices(M(f(m, n)), R.shuffle(wrong.filter(w => w !== f(m, n))).map(M)),
    rule: 'טרינום: מכפלה c, סכום b',
    explain: `צריך שני מספרים ש<b>מכפלתם ${num(m * n)}</b> (המספר החופשי) ו<b>סכומם ${num(m + n)}</b> (המקדם של x): ${f(m, n)}.`,
  };
});

const METHOD = { gcf: 'הוצאת גורם משותף', ds: 'הפרש ריבועים', tri: 'טרינום: מכפלה וסכום', sq: 'ריבוע של סכום או הפרש' };
add('method', 'factor', () => {
  const kind = R.pick(['gcf', 'ds', 'tri']);
  let e;
  if (kind === 'gcf') { const k = R.int(2, 7); e = Q(k * R.int(1, 3), (R.coin() ? 1 : -1) * k * R.int(1, 5), 0); }
  if (kind === 'ds') { const p = R.pick([1, 2, 3]), q = R.int(2, 9); e = Q(p * p, 0, -q * q); }
  if (kind === 'tri') { let m, n; do { m = nz(-6, 6); n = nz(-6, 6); } while (m === n || m === -n || Math.abs(m + n) === 2 * Math.sqrt(Math.abs(m * n))); e = Q(1, m + n, m * n); }
  const why = {
    gcf: 'יש x בשני האיברים (ואין מספר חופשי), לכן מוציאים גורם משותף.',
    ds: 'שני איברים, שניהם ריבועים, ומינוס ביניהם: הפרש ריבועים.',
    tri: 'שלושה איברים, והמספר החופשי לא מתאים לריבוע של סכום: מחפשים שני מספרים שמכפלתם המספר החופשי וסכומם המקדם של x.',
  };
  return {
    q: `איזו דרך מתאימה לפירוק של ${M(e)}?`,
    opts: choices(METHOD[kind], Object.values(METHOD).filter(v => v !== METHOD[kind])),
    rule: 'לבחור דרך פירוק',
    explain: why[kind],
  };
});

add('two-step', 'factor', () => {
  const k = R.int(2, 5), q = R.int(1, 6);
  return {
    q: `מה הפירוק המלא של ${M(Q(k, 0, -k * q * q))}?`,
    opts: choices(M(`${k}(x − ${q})(x + ${q})`), [M(`${k}(x − ${q})²`), M(`(${k}x − ${q})(x + ${q})`), M(`${k}(x − ${q * q})(x + ${q * q})`), M(`(${k}x − ${q})(${k}x + ${q})`)]),
    rule: 'קודם גורם משותף, אחר כך נוסחה',
    hint: 'מה משותף לשני האיברים?',
    explain: `שלב 1: גורם משותף ${k}: ${k}(x² − ${q * q}). שלב 2: הפרש ריבועים: x² − ${q * q} = (x − ${q})(x + ${q}). ביחד: ${k}(x − ${q})(x + ${q}).`,
  };
});

add('grouping', 'factor', () => {
  const a = R.int(1, 7), b = R.int(1, 7), v = R.coin() ? 1 : -1;
  const e = `xy ${sgn(v * b)} ${b === 1 ? '' : b}x + ${a}y ${sgn(v * a * b)} ${a * b}`.replace(/  /g, ' ');
  const f = (p, r) => `(x ${sgn(p)} ${Math.abs(p)})(y ${sgn(r)} ${Math.abs(r)})`;
  return {
    q: `מה הפירוק של ${M(e)}?`,
    opts: choices(M(f(a, v * b)), [M(f(v * b, a)), M(f(-a, -v * b)), M(f(a * b, v))]),
    rule: 'פירוק בקבוצות',
    hint: 'קבץ את שני האיברים הראשונים ואת שני האחרונים.',
    explain: `מקבצים בזוגות: x(y ${sgn(v * b)} ${b}) + ${a}(y ${sgn(v * b)} ${b}). הסוגריים משותפים: (x + ${a})(y ${sgn(v * b)} ${b}).`,
  };
});

// ---------- equations ----------
add('zero-prod', 'equations', () => {
  let m, n;
  do { m = nz(-8, 8); n = nz(-8, 8); } while (m === n || m === -n);
  const e = `(${L(1, -m)})(${L(1, -n)}) = 0`, s = (a, b) => `x = ${a} או x = ${b}`.replace(/-/g, '−');
  return {
    q: `מה הפתרונות של ${M(e)}?`,
    opts: choices(M(s(m, n)), [M(s(-m, -n)), M(s(m, -n)), M(`x = ${m * n}`.replace(/-/g, '−'))]),
    rule: 'מכפלה = 0 → אחד הגורמים = 0',
    explain: `מכפלה שווה 0 רק אם אחד הגורמים 0: ${L(1, -m)} = 0 → x = ${m}, או ${L(1, -n)} = 0 → x = ${n}.`.replace(/= -/g, '= −'),
  };
});

add('eq-ds', 'equations', () => {
  const q = R.int(2, 9);
  return {
    q: `מה הפתרונות של ${M(`x² − ${q * q} = 0`)}?`,
    opts: choices(M(`x = ${q} או x = −${q}`), [M(`x = ${q}`), M(`x = ${q * q}`), 'אין פתרון']),
    rule: 'הפרש ריבועים ואז מכפלה = 0',
    hint: 'אילו מספרים בריבוע נותנים ' + q * q + '?',
    explain: `x² − ${q * q} = (x − ${q})(x + ${q}) = 0, לכן x = ${q} או x = −${q}. גם (−${q})² = ${q * q}, אז אסור לשכוח את הפתרון השלילי.`,
  };
});

add('eq-gcf', 'equations', () => {
  const q = R.int(2, 9);
  return {
    q: `מה הפתרונות של ${M(`x² − ${q}x = 0`)}?`,
    opts: choices(M(`x = 0 או x = ${q}`), [M(`x = ${q}`), M(`x = 0 או x = −${q}`), M('x = 0')]),
    rule: 'גורם משותף ואז מכפלה = 0',
    hint: 'הוצא גורם משותף.',
    explain: `x² − ${q}x = x(x − ${q}) = 0, לכן x = 0 או x = ${q}. אם מחלקים ב-x מאבדים את הפתרון x = 0.`,
  };
});

add('eq-why', 'equations', () => ({
  q: `למה מ-${M('(x − 3)(x + 4) = 0')} מותר לכתוב "x − 3 = 0 או x + 4 = 0"?`,
  opts: choices('כי מכפלה שווה 0 רק אם לפחות אחד הגורמים שווה 0', ['כי מותר לחלק את שני האגפים ב-(x + 4)', 'כי שני הגורמים תמיד שווים זה לזה', 'כי x חייב להיות 0']),
  rule: 'מכפלה = 0 → אחד הגורמים = 0',
  explain: 'אם מכפילים שני מספרים ומקבלים 0, <b>לפחות אחד מהם 0</b>. בגלל זה מפרקים לגורמים לפני שפותרים.',
}));

TOPICS.push({
  id: 'algebra', title: 'פירוק לגורמים ונוסחאות הכפל המקוצר', icon: '🧮', added: '2026-10-30',
  blurb: 'לזהות את הנוסחה, לבחור דרך פירוק ולבדוק',
  subs, rules, templates: T,
});
})();
