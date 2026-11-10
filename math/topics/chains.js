// Step-by-step exercises ("תרגיל בשלבים"): a real exercise with fresh numbers, solved in small multiple-choice steps,
// like the guided homework. The header shows the expression as it looks after each step, so no paper is needed.
// A chain template returns { q, expr, chain: [{ q, opts: [correct, ...wrong], explain, after?, hint? }], explain, rule? }.
// They are added to the existing topics (algebra, geometry) and get a bigger share of each round (see pickRound in app.js).
(() => {
const SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => (n === 1 ? '' : String(n).split('').map(d => SUPD[d]).join(''));
const N = n => (n < 0 ? '−' + -n : String(n));
const xp = (pw, v = 'x') => (pw === 0 ? '' : v + sup(pw));
// ex([[3, 'x²'], [-6, 'x'], [9, '']]) → "3x² − 6x + 9"
const ex = terms => terms.filter(t => t[0]).map(([c, v], i) => {
  const a = Math.abs(c), body = (a === 1 && v ? '' : a) + v;
  return i === 0 ? (c < 0 ? '−' : '') + body : (c < 0 ? ' − ' : ' + ') + body;
}).join('') || '0';
const lin = (a, b, v = 'x') => ex([[a, v], [b, '']]);
const sg = n => (n < 0 ? '−' : '+');
const pm = n => (n < 0 ? '−' + -n : '+' + n);          // signed number for "two numbers" answers
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const step = (q, ok, wrongs, explain, after, hint) => ({ q, opts: choices(ok, wrongs), explain, after, hint });
const path = (expr, chain) => [expr, ...chain.map(s => s.after).filter(a => a && !a.includes('…'))].map(M).join(' ⬅ ');

const topic = id => window.TOPICS.find(t => t.id === id);
const add = (tid, id, sub, make, lvl = 1) => topic(tid).templates.push({ id: 'c-' + id, sub, make, lvl, chain: true });

// ===================== algebra =====================
const FACT = 'פרק לגורמים, שלב אחרי שלב';
const GCF = 'מה הגורם המשותף הגדול ביותר?';
const SQS = ['הפרש ריבועים', 'ריבוע של סכום', 'ריבוע של הפרש', 'אף נוסחה לא מתאימה'];
const sqStep = (kind, why) => step('איזו נוסחה מתאימה למה שבסוגריים?', kind, SQS.filter(x => x !== kind), why);

// k·x^e · (m²x² − n²)
add('algebra', 'gcf-ds', 'factor', lv => {
  let m, n; do { m = R.int(1, lv >= 2 ? 3 : 2); n = R.int(1, 7); } while (gcd(m, n) !== 1 || m === n);
  const k = R.pick([2, 3, 5]), e = lv >= 2 && R.coin() ? 1 : 0;
  const A = k * m * m, B = k * n * n, f = k + xp(e), box = (m === 1 ? '' : m) + 'x';
  const expr = ex([[A, xp(2 + e)], [-B, xp(e)]]);
  const inner = ex([[m * m, 'x²'], [-n * n, '']]);
  const fin = `${f}(${box} − ${n})(${box} + ${n})`;
  const chain = [
    step(GCF, f, [A + xp(e), String(B), (k * m) + xp(e), k + xp(e + 1), xp(e) || '1'], `המספר ${k} מחלק גם את ${A} וגם את ${B}${e ? `, ו-${M('x')} נמצא בשני האיברים` : ''}.`, `${f}(…)`, 'מה המספר הגדול ביותר שמחלק את שני המקדמים?'),
    step(`מה נשאר בסוגריים אחרי שמוציאים ${M(f)}?`, inner, [ex([[m * m, 'x²'], [-B, '']]), ex([[A, 'x²'], [-n * n, '']]), ex([[m * m, 'x'], [-n * n, '']]), ex([[m * m, 'x²'], [n * n, '']])], `מחלקים כל איבר ב-${M(f)}.`, `${f}(${inner})`),
    sqStep('הפרש ריבועים', `${M(inner)}: שני ריבועים, ומינוס ביניהם.`),
    step('מה הם □ ו-△?', `□ = ${box}, △ = ${n}`, [`□ = ${m * m}x, △ = ${n}`, `□ = ${box}, △ = ${n * n}`, `□ = x², △ = ${n * n}`, `□ = ${box}, △ = ${n + 1}`], `${M(`(${box})² = ${ex([[m * m, 'x²']])}`)} ו-${M(`${n}² = ${n * n}`)}.`, fin),
  ];
  return { q: FACT, expr, chain, explain: path(expr, chain), rule: 'קודם גורם משותף, ואז בודקים את מה שבסוגריים: a² − b² = (a − b)(a + b)' };
});

// k·x^e · (mx ± n)²
add('algebra', 'gcf-sq', 'factor', lv => {
  let m, n; do { m = R.int(1, lv >= 2 ? 3 : 2); n = R.int(1, 6); } while (gcd(m, n) !== 1);
  const k = R.pick([2, 3, 5]), s = R.coin() ? 1 : -1, e = lv >= 3 && R.coin() ? 1 : 0;
  const f = k + xp(e), box = (m === 1 ? '' : m) + 'x';
  const expr = ex([[k * m * m, xp(2 + e)], [s * 2 * k * m * n, xp(1 + e)], [k * n * n, xp(e)]]);
  const inner = ex([[m * m, 'x²'], [s * 2 * m * n, 'x'], [n * n, '']]);
  const kind = s > 0 ? 'ריבוע של סכום' : 'ריבוע של הפרש';
  const fin = `${f}(${box} ${sg(s)} ${n})²`;
  const chain = [
    step(GCF, f, [String(k * n * n) + xp(e), (2 * k) + xp(e), k + xp(e + 1), (k * m * m) + xp(e), (k * m) + xp(e), (k * n) + xp(e + 1), (k + 1) + xp(e)], `${k} מחלק את כל המקדמים${e ? `, ו-${M('x')} בכל האיברים` : ''}.`, `${f}(…)`),
    step(`מה נשאר בסוגריים אחרי שמוציאים ${M(f)}?`, inner, [ex([[m * m, 'x²'], [s * 2 * k * m * n, 'x'], [n * n, '']]), ex([[m * m, 'x²'], [s * m * n, 'x'], [n * n, '']]), ex([[m * m, 'x²'], [-s * 2 * m * n, 'x'], [n * n, '']])], `מחלקים כל איבר ב-${M(f)}.`, `${f}(${inner})`),
    sqStep(kind, `${M(`${ex([[m * m, 'x²']])} = (${box})²`)}, ${M(`${n * n} = ${n}²`)}, והאיבר האמצעי ${M(`${2 * m * n}x = 2 · ${box} · ${n}`)}. הסימן באמצע: ${s > 0 ? 'פלוס' : 'מינוס'}.`),
    step('מה הם □ ו-△?', `□ = ${box}, △ = ${n}`, [`□ = ${m * m}x, △ = ${n * n}`, `□ = ${box}, △ = ${n * n}`, `□ = ${box}, △ = ${2 * n}`, `□ = x², △ = ${n}`], `${M(`(${box})²`)} ו-${M(`${n}²`)}.`, fin),
  ];
  return { q: FACT, expr, chain, explain: path(expr, chain), rule: '(a ± b)² = a² ± 2ab + b². בודקים שהאיבר האמצעי הוא 2ab.' };
});

// (x + p)(x + q), sometimes with a common factor first
add('algebra', 'trinomial', 'factor', lv => {
  let p, q; do { p = R.int(-9, 9); q = R.int(-9, 9); } while (!p || !q || p === q || p === -q || Math.abs(p * q) > 60);
  const k = lv >= 2 && R.coin() ? R.pick([2, 3]) : 1;
  const b = p + q, c = p * q;
  const inner = ex([[1, 'x²'], [b, 'x'], [c, '']]);
  const expr = ex([[k, 'x²'], [k * b, 'x'], [k * c, '']]);
  const K = k === 1 ? '' : String(k);
  const wrap = s => (k === 1 ? s : `${k}(${s})`);
  const other = [1, c].join() === [p, q].join() ? [2, c / 2] : [1, c];
  const chain = [];
  if (k > 1) {
    chain.push(step(GCF, String(k), ['x', String(k * k), String(2 * k + 1), k + 'x'], `${k} מחלק את כל המקדמים. ב-${M(String(k * c))} אין x.`, `${k}(…)`, 'קודם בודקים גורם משותף, גם בטרינום!'));
    chain.push(step(`מה נשאר בסוגריים אחרי שמוציאים ${M(K)}?`, inner, [ex([[1, 'x²'], [b, 'x'], [k * c, '']]), ex([[1, 'x²'], [k * b, 'x'], [c, '']]), ex([[k, 'x²'], [b, 'x'], [c, '']])], `מחלקים כל מקדם ב-${k}.`, wrap(inner)));
  }
  chain.push(step(`מחפשים שני מספרים שסכומם ${M(N(b))} ומכפלתם ${M(N(c))}. מה הם?`, `${pm(p)} , ${pm(q)}`,
    [`${pm(-p)} , ${pm(-q)}`, `${pm(p)} , ${pm(-q)}`, `${pm(-p)} , ${pm(q)}`, `${pm(other[0])} , ${pm(other[1])}`],
    `${M(`${N(p)} · ${N(q)} = ${N(c)}`)} ו-${M(`${N(p)} + ${N(q)} = ${N(b)}`)}.`, wrap(ex([[1, 'x²'], [p, 'x'], [q, 'x'], [c, '']])),
    'מתחילים מהמכפלה: אילו זוגות נותנים אותה? ואז בודקים איזה זוג נותן את הסכום.'));
  const g = (a, bb) => `x(${lin(1, a)}) ${sg(bb)} ${Math.abs(bb) === 1 ? '' : Math.abs(bb)}(${lin(1, a)})`;
  chain.push(step('פירוק בקבוצות: מה יוצא?', g(p, q), [`x(${lin(1, p)}) ${sg(q)} ${Math.abs(q) === 1 ? '' : Math.abs(q)}(${lin(1, -p)})`, `x(${lin(1, -p)}) ${sg(q)} ${Math.abs(q) === 1 ? '' : Math.abs(q)}(${lin(1, -p)})`, `x(${lin(1, q)}) ${sg(p)} ${Math.abs(p) === 1 ? '' : Math.abs(p)}(${lin(1, -q)})`],
    `${M(`x² ${sg(p)} ${Math.abs(p) === 1 ? '' : Math.abs(p)}x = x(${lin(1, p)})`)}, ומהזוג השני מוציאים ${M(N(q))}.`, wrap(g(p, q))));
  const fin = `${K}(${lin(1, p)})(${lin(1, q)})`;
  chain.push(step('מה הפירוק הסופי?', fin, [`${K}(${lin(1, -p)})(${lin(1, -q)})`, `${K}(${lin(1, p)})(${lin(1, -q)})`, k > 1 ? `(${lin(1, p)})(${lin(1, q)})` : `(${lin(1, -p)})(${lin(1, q)})`],
    `מוציאים את הסוגריים המשותפים ${M(`(${lin(1, p)})`)}${k > 1 ? `, ולא שוכחים את ה-${k} שבחוץ` : ''}.`, fin));
  return { q: FACT, expr, chain, explain: path(expr, chain), rule: 'טרינום: שני מספרים שמכפלתם c וסכומם b, מפצלים את האיבר האמצעי ומפרקים בקבוצות.' };
});

// xy + qx + py + pq = (y + q)(x + p)
add('algebra', 'grouping', 'factor', () => {
  let p, q; do { p = R.int(-6, 6); q = R.int(-6, 6); } while (!p || !q || p === q);
  const expr = ex([[1, 'xy'], [q, 'x'], [p, 'y'], [p * q, '']]);
  const P = Math.abs(p) === 1 ? '' : Math.abs(p);
  const yq = lin(1, q, 'y');
  const ok2 = `x(${yq}) ${sg(p)} ${P}(${yq})`;
  const chain = [
    step('איך מחלקים לקבוצות?', `(${ex([[1, 'xy'], [q, 'x']])}) + (${ex([[p, 'y'], [p * q, '']])})`,
      [`(${ex([[1, 'xy'], [p * q, '']])}) + (${ex([[q, 'x'], [p, 'y']])})`, `(xy) + (${ex([[q, 'x'], [p, 'y'], [p * q, '']])})`, 'אין צורך בקבוצות'],
      'שני הראשונים (בשניהם יש x) ושני האחרונים.', `(${ex([[1, 'xy'], [q, 'x']])}) + (${ex([[p, 'y'], [p * q, '']])})`),
    step('מה מוציאים מכל קבוצה?', ok2, [`x(${yq}) ${sg(-p)} ${P}(${lin(1, -q, 'y')})`, `y(${lin(1, q, 'x')}) ${sg(p)} ${P}(${yq})`, `x(${lin(1, -q, 'y')}) ${sg(p)} ${P}(${lin(1, -q, 'y')})`],
      `מהראשונה ${M('x')}, ומהשנייה ${M(N(p))}, כדי שיצאו <b>אותם</b> סוגריים.`, ok2),
    step('מה הפירוק הסופי?', `(${yq})(${lin(1, p)})`, [`(${yq})(${lin(1, -p)})`, `(${lin(1, -q, 'y')})(${lin(1, p)})`, `(${yq})(x)`],
      `מוציאים את ${M(`(${yq})`)}, ומה שנשאר: ${M(`(${lin(1, p)})`)}.`, `(${yq})(${lin(1, p)})`),
  ];
  return { q: FACT, expr, chain, explain: path(expr, chain), rule: 'פירוק בקבוצות: מכל זוג מוציאים גורם משותף, ואז מוציאים את הסוגריים המשותפים.' };
}, 2);

// expand (px ± q)²
add('algebra', 'expand-sq', 'formulas', lv => {
  const p = lv >= 2 ? R.int(1, 3) : 1, q = R.int(1, 9), s = R.coin() ? 1 : -1, S = sg(s);
  const px = (p === 1 ? '' : p) + 'x';
  const expr = `(${px} ${S} ${q})²`;
  const fin = ex([[p * p, 'x²'], [s * 2 * p * q, 'x'], [q * q, '']]);
  const chain = [
    step('איזו נוסחה מתאימה?', `(a ${S} b)² = a² ${S} 2ab + b²`, [`(a ${S} b)² = a² + b²`, `(a ${S} b)² = a² ${S} ab + b²`, '(a + b)(a − b) = a² − b²'], `ריבוע של ${s > 0 ? 'סכום' : 'הפרש'}. לא לשכוח את האיבר האמצעי ${M('2ab')}!`),
    step('מה הם a ו-b?', `a = ${px}, b = ${q}`, [p === 1 ? `a = x², b = ${q}` : `a = x, b = ${q}`, `a = ${px}, b = ${q * q}`, `a = ${q}, b = ${px}`, `a = ${px}, b = ${S}${q}²`], `${M('a')} הוא האיבר הראשון בסוגריים, ${M('b')} השני.`, `(${px})² ${S} 2 · ${px} · ${q} + ${q}²`),
    step('מה הם a² ו-b²?', `a² = ${ex([[p * p, 'x²']])}, b² = ${q * q}`, [`a² = ${ex([[p, 'x²']])}, b² = ${q * q}`, `a² = ${ex([[2 * p, 'x']])}, b² = ${2 * q}`, `a² = ${ex([[p * p, 'x']])}, b² = ${q * q}`, `a² = ${ex([[p * p, 'x²']])}, b² = ${2 * q}`, `a² = ${ex([[p * p, 'x²']])}, b² = ${q}`], `${M(`(${px})² = ${ex([[p * p, 'x²']])}`)}: גם המספר וגם x בריבוע.`, `${ex([[p * p, 'x²']])} ${S} 2ab + ${q * q}`),
    step(`מה האיבר האמצעי ${M('2ab')}?`, `${2 * p * q}x`, [`${p * q}x`, `${2 * q}x`, `${2 * p * q}x²`, `${q * q}x`, `${2 * p * q + 2}x`, `${2 * p}x`], `${M(`2 · ${px} · ${q} = ${2 * p * q}x`)}.`, fin),
  ];
  return { q: 'פתח סוגריים בעזרת הנוסחה', expr, chain, explain: path(expr, chain), rule: '(a ± b)² = a² ± 2ab + b²' };
});

// expand (px − q)(px + q)
add('algebra', 'expand-ds', 'formulas', lv => {
  const p = lv >= 2 ? R.int(1, 4) : 1, q = R.int(1, 9), px = (p === 1 ? '' : p) + 'x';
  const expr = R.coin() ? `(${px} − ${q})(${px} + ${q})` : `(${px} + ${q})(${px} − ${q})`;
  const fin = ex([[p * p, 'x²'], [-q * q, '']]);
  const chain = [
    step('איזו נוסחה מתאימה?', '(a + b)(a − b) = a² − b²', ['(a + b)² = a² + 2ab + b²', '(a + b)(a − b) = a² + b²', '(a + b)(a − b) = a² − 2ab − b²'], 'אותם שני איברים, פעם עם פלוס ופעם עם מינוס: הפרש ריבועים.'),
    step('מה הם a ו-b?', `a = ${px}, b = ${q}`, [`a = ${px}, b = −${q}`, `a = ${q}, b = ${px}`, `a = x, b = ${q * q}`, `a = ${px}², b = ${q}`], 'a הוא האיבר שזהה בשני הסוגריים, ו-b הוא המספר.', `(${px})² − ${q}²`),
    step('מה התוצאה?', fin, [ex([[p * p, 'x²'], [q * q, '']]), ex([[p * p, 'x²'], [-2 * p * q, 'x'], [-q * q, '']]), ex([[p, 'x²'], [-q * q, '']]), ex([[p * p, 'x²'], [-2 * q, '']]), ex([[p * p, 'x²'], [-q, '']])], `${M(`(${px})² = ${ex([[p * p, 'x²']])}`)} ו-${M(`${q}² = ${q * q}`)}. אין איבר אמצעי!`, fin),
  ];
  return { q: 'פתח סוגריים בעזרת הנוסחה', expr, chain, explain: path(expr, chain), rule: '(a + b)(a − b) = a² − b²' };
});

// mental math: 31² = (30 + 1)², 29 · 31 = 30² − 1²
add('algebra', 'mental', 'formulas', () => {
  const t = R.int(2, 9), d = R.int(1, 2), T = 10 * t;
  if (R.coin()) {
    const s = R.coin() ? 1 : -1, n = T + s * d, S = sg(s);
    const chain = [
      step(`איך כדאי לכתוב את ${n}?`, `(${T} ${S} ${d})²`, [`(${t} ${S} ${d})²`, `${T}² ${S} ${d}²`, `(${T} · ${d})²`], `${n} = ${T} ${S} ${d}. עם עשרות שלמות קל לחשב בראש.`, `(${T} ${S} ${d})²`),
      step(`לפי ${M(`(a ${S} b)² = a² ${S} 2ab + b²`)}, מה יוצא?`, `${T * T} ${S} ${2 * T * d} + ${d * d}`, [`${T * T} ${S} ${T * d} + ${d * d}`, `${T * T} + ${d * d}`, `${t * t * 10} ${S} ${2 * T * d} + ${d * d}`], `${M(`${T}² = ${T * T}`)}, ${M(`2 · ${T} · ${d} = ${2 * T * d}`)}, ${M(`${d}² = ${d * d}`)}.`, `${T * T} ${S} ${2 * T * d} + ${d * d}`),
      step('כמה זה?', String(n * n), [String(T * T + d * d), String(n * n + 10), String(T * T + s * T * d + d * d)], `${M(`${T * T} ${S} ${2 * T * d} + ${d * d} = ${n * n}`)}.`, `${n}² = ${n * n}`),
    ];
    return { q: 'חשב בראש בעזרת הנוסחה', expr: `${n}²`, chain, explain: path(`${n}²`, chain), rule: '(a ± b)² = a² ± 2ab + b²' };
  }
  const a = T - d, b = T + d, expr = `${a} · ${b}`;
  const chain = [
    step(`איך כדאי לכתוב את ${M(expr)}?`, `(${T} − ${d})(${T} + ${d})`, [`(${T} − ${d})²`, `${T}² · ${d}`, `(${t} − ${d})(${t} + ${d})`], `שני המספרים במרחק ${d} מ-${T}, אחד מתחת ואחד מעל.`, `(${T} − ${d})(${T} + ${d})`),
    step('לפי הפרש ריבועים, מה יוצא?', `${T}² − ${d}²`, [`${T}² + ${d}²`, `${T}² − 2 · ${T} · ${d} − ${d}²`, `${T} − ${d}²`], `${M('(a − b)(a + b) = a² − b²')}.`, `${T * T} − ${d * d}`),
    step('כמה זה?', String(a * b), [String(T * T + d * d), String(T * T), String(a * b - 10)], `${M(`${T * T} − ${d * d} = ${a * b}`)}.`, `${expr} = ${a * b}`),
  ];
  return { q: 'חשב בראש בעזרת הנוסחה', expr, chain, explain: path(expr, chain), rule: '(a − b)(a + b) = a² − b²' };
}, 2);

// equations
const OR = (a, b) => `${M(a)} או ${M(b)}`;
add('algebra', 'eq-tri', 'equations', () => {
  let r1, r2; do { r1 = R.int(-8, 8); r2 = R.int(-8, 8); } while (!r1 || !r2 || r1 === r2 || r1 === -r2 || Math.abs(r1 * r2) > 50);
  const b = -(r1 + r2), c = r1 * r2;
  const expr = `${ex([[1, 'x²'], [b, 'x'], [c, '']])} = 0`;
  const f1 = lin(1, -r1), f2 = lin(1, -r2);
  const chain = [
    step(`מפרקים: שני מספרים שסכומם ${M(N(b))} ומכפלתם ${M(N(c))}?`, `${pm(-r1)} , ${pm(-r2)}`, [`${pm(r1)} , ${pm(r2)}`, `${pm(-r1)} , ${pm(r2)}`, `${pm(r1)} , ${pm(-r2)}`],
      `${M(`${N(-r1)} · ${N(-r2)} = ${N(c)}`)} ו-${M(`${N(-r1)} + ${N(-r2)} = ${N(b)}`)}.`, `(${f1})(${f2}) = 0`),
    step('מכפלה שווה 0. מה זה אומר?', OR(`${f1} = 0`, `${f2} = 0`), [`${M(`${f1} = 0`)} וגם ${M(`${f2} = 0`)}`, M(`${f1} = ${f2}`), 'אין פתרון'], 'מכפלה שווה 0 רק כשלפחות אחד הגורמים שווה 0.', `${f1} = 0   או   ${f2} = 0`),
    step('מה הפתרונות?', OR(`x = ${N(r1)}`, `x = ${N(r2)}`), [OR(`x = ${N(-r1)}`, `x = ${N(-r2)}`), OR(`x = ${N(r1)}`, `x = ${N(-r2)}`), M(`x = ${N(r1 + r2)}`)],
      `${M(`${f1} = 0 → x = ${N(r1)}`)}. שים לב להיפוך הסימן!`, `x = ${N(r1)}   או   x = ${N(r2)}`),
  ];
  return { q: 'פתור את המשוואה בעזרת פירוק', expr, chain, explain: path(expr, chain), rule: 'מכפלה שווה 0 רק כשאחד הגורמים שווה 0.' };
});

add('algebra', 'eq-gcf', 'equations', () => {
  const k = R.int(2, 9) * (R.coin() ? 1 : -1);
  const expr = `${ex([[1, 'x²'], [-k, 'x']])} = 0`;
  const chain = [
    step('מה מוציאים כגורם משותף?', 'x', ['x²', String(Math.abs(k)), 'אי אפשר'], `${M('x')} נמצא בשני האיברים.`, `x(${lin(1, -k)}) = 0`),
    step('מה הפתרונות?', OR('x = 0', `x = ${N(k)}`), [M(`x = ${N(k)}`), OR('x = 0', `x = ${N(-k)}`), M('x = 0')],
      `${M('x = 0')} או ${M(`${lin(1, -k)} = 0`)}. אם מחלקים ב-x, מאבדים את הפתרון 0!`, `x = 0   או   x = ${N(k)}`),
  ];
  return { q: 'פתור את המשוואה בעזרת פירוק', expr, chain, explain: path(expr, chain), rule: 'x² − kx = 0 → x(x − k) = 0 → x = 0 או x = k. לא מחלקים ב-x!' };
});

add('algebra', 'eq-ds', 'equations', () => {
  const n = R.int(2, 12);
  const expr = `x² − ${n * n} = 0`;
  const chain = [
    sqStep('הפרש ריבועים', `${M(`x² − ${n}²`)}: שני ריבועים ומינוס ביניהם.`),
    step('איך נראה הפירוק?', `(x − ${n})(x + ${n}) = 0`, [`(x − ${n})² = 0`, `(x − ${n * n})(x + ${n * n}) = 0`, `(x − ${n})(x − ${n}) = 0`], `${M(`${n * n} = ${n}²`)}.`, `(x − ${n})(x + ${n}) = 0`),
    step('מה הפתרונות?', OR(`x = ${n}`, `x = −${n}`), [M(`x = ${n}`), OR(`x = ${n * n}`, `x = −${n * n}`), M(`x = −${n}`)], `${M(`x − ${n} = 0`)} או ${M(`x + ${n} = 0`)}. שני פתרונות!`, `x = ${n}   או   x = −${n}`),
  ];
  return { q: 'פתור את המשוואה בעזרת פירוק', expr, chain, explain: path(expr, chain), rule: 'x² − a² = 0 → x = a או x = −a' };
});

// ===================== geometry =====================
const DEG = n => n + '°';
const br = s => (/[+−]/.test(s.slice(1)) ? `(${s})` : s);

// Two angles given as expressions; they are equal, or add up to 180°.
function twoAngles(pairs) {
  const [name, rel] = R.pick(pairs);
  let a, b, c, d, v, A, B;
  for (let i = 0; i < 200; i++) {
    a = R.int(1, 4); c = R.int(1, 5); v = R.int(4, 30); b = 5 * R.int(0, 8);
    if (rel === 'eq' && c <= a) continue;
    A = a * v + b;
    B = rel === 'eq' ? A : 180 - A;
    d = B - c * v;
    if (A >= 20 && A <= 160 && B >= 20 && d !== 0 && Math.abs(d) <= 90) break;
  }
  const e1 = lin(a, b), e2 = lin(c, d);
  const chain = [];
  if (rel === 'eq') {
    chain.push(step('מה הקשר בין שתי הזוויות?', 'הן שוות', ['סכומן 180°', 'סכומן 90°', 'אחת כפולה מהשנייה'], `${name} שוות זו לזו.`, `${e1} = ${e2}`));
    chain.push(step('מעבירים אגפים. מה יוצא?', `${c - a === 1 ? '' : c - a}x = ${N(b - d)}`, [`${c - a === 1 ? '' : c - a}x = ${N(b + d)}`, `${c + a}x = ${N(b - d)}`, `${c - a === 1 ? '' : c - a}x = ${N(d - b)}`, `${c - a === 1 ? '' : c - a}x = ${N(b - d + 10)}`, `${c + a}x = ${N(b + d)}`],
      `את ה-x לצד אחד ואת המספרים לצד השני: ${M(`${c}x − ${a}x = ${N(b)} − (${N(d)})`)}.`, `${c - a === 1 ? '' : c - a}x = ${N(b - d)}`));
  } else {
    chain.push(step('מה הקשר בין שתי הזוויות?', 'סכומן 180°', ['הן שוות', 'סכומן 90°', 'סכומן 360°'], `${name}: יחד 180°.`, `${br(e1)} + ${br(e2)} = 180`));
    chain.push(step('מכנסים איברים דומים. מה יוצא?', `${a + c}x = ${180 - b - d}`, [`${a + c}x = ${180 + b + d}`, `${a * c}x = ${180 - b - d}`, `${a + c}x = ${b + d - 180}`, `${a + c}x = ${180 - b - d + 10}`, `${a + c + 1}x = ${180 - b - d}`],
      `${M(`${a}x + ${c}x = ${a + c}x`)}, ואת המספרים מעבירים: ${M(`180 − (${N(b + d)}) = ${180 - b - d}`)}.`, `${a + c}x = ${180 - b - d}`));
  }
  chain.push(step('כמה זה x?', `x = ${v}`, [`x = ${v * 2}`, `x = ${v + 5}`, `x = ${Math.max(1, v - 3)}`, `x = ${v + 1}`, `x = ${v + 10}`], `מחלקים את שני האגפים במקדם של x.`, `x = ${v}`));
  chain.push(step(`כמה מעלות הזווית ${M(e1)}?`, DEG(A), [DEG(180 - A), DEG(v), DEG(A + 10), DEG(a * v), DEG(A - 10), DEG(A + 20)], `מציבים ${M(`x = ${v}`)}: ${M(`${a === 1 ? '' : a + ' · '}${v} ${b ? '+ ' + b : ''} = ${A}`)}.`, `${e1} = ${A}°`));
  return { name, e1, e2, chain };
}

add('geometry', 'parallel-x', 'angles', () => {
  const t = twoAngles([['זוויות מתאימות בין ישרים מקבילים', 'eq'], ['זוויות מתחלפות בין ישרים מקבילים', 'eq'], ['זוויות קודקודיות', 'eq'], ['זוויות חד-צדדיות בין ישרים מקבילים', 'sum'], ['זוויות צמודות', 'sum']]);
  const expr = `${t.e1}  ,  ${t.e2}`;
  return { q: `${t.name}: אחת ${M(t.e1)} והשנייה ${M(t.e2)}. מצא את x ואת הזווית.`, expr, chain: t.chain, explain: path(expr, t.chain), rule: 'מתאימות, מתחלפות, קודקודיות: שוות. צמודות וחד-צדדיות: יחד 180°.' };
});

add('geometry', 'parallelogram-x', 'quads', () => {
  const t = twoAngles([['במקבילית, זוויות נגדיות', 'eq'], ['במקבילית, זוויות סמוכות לאותה צלע', 'sum']]);
  const expr = `${t.e1}  ,  ${t.e2}`;
  return { q: `${t.name}: אחת ${M(t.e1)} והשנייה ${M(t.e2)}. מצא את x ואת הזווית.`, expr, chain: t.chain, explain: path(expr, t.chain), rule: 'במקבילית: זוויות נגדיות שוות, זוויות סמוכות יחד 180°.' };
});

add('geometry', 'triangle-x', 'triangle', () => {
  let k, e, v, A;
  for (let i = 0; i < 300; i++) {
    v = R.int(8, 30); k = [1, R.int(1, 3), R.int(1, 4)]; e = [0, 5 * R.int(-4, 6), 0];
    A = [k[0] * v, k[1] * v + e[1]];
    A[2] = 180 - A[0] - A[1]; e[2] = A[2] - k[2] * v;
    if (A.every(x => x >= 15) && e[2] % 5 === 0 && Math.abs(e[2]) <= 60 && e[1] !== 0 && e[1] + e[2] !== 0 && new Set(A).size === 3) break;
  }
  const es = k.map((kk, i) => lin(kk, e[i]));
  const K = k[0] + k[1] + k[2], E = e[1] + e[2];
  const big = Math.max(...A);
  const expr = es.join('  ,  ');
  const chain = [
    step('מה סכום הזוויות במשולש?', '180°', ['90°', '360°', '270°'], 'בכל משולש סכום הזוויות הוא 180°.', es.map(br).join(' + ') + ' = 180'),
    step('מכנסים איברים דומים. מה יוצא?', `${K}x ${sg(E)} ${Math.abs(E)} = 180`, [`${K}x ${sg(-E)} ${Math.abs(E)} = 180`, `${K - 1}x ${sg(E)} ${Math.abs(E)} = 180`, `${K}x = 180`, `${K + 1}x ${sg(E)} ${Math.abs(E)} = 180`], `${M(`${k.join('x + ')}x = ${K}x`)}, והמספרים: ${M(`${N(e[1])} + (${N(e[2])}) = ${N(E)}`)}.`, `${K}x ${sg(E)} ${Math.abs(E)} = 180`),
    step('מעבירים אגפים. מה יוצא?', `${K}x = ${180 - E}`, [`${K}x = ${180 + E}`, `${K}x = ${E - 180}`, `x = ${180 - E}`, `${K}x = ${190 - E}`], `מעבירים את ${M(N(E))} לצד השני עם סימן הפוך.`, `${K}x = ${180 - E}`),
    step('כמה זה x?', `x = ${v}`, [`x = ${v + 2}`, `x = ${(180 - E) * K}`, `x = ${Math.max(1, v - 4)}`, `x = ${v + 5}`], `${M(`${180 - E} : ${K} = ${v}`)}.`, `x = ${v}`),
    step('מה הזווית הגדולה במשולש?', DEG(big), [DEG(Math.min(...A)), DEG(180 - big), DEG(big + 10), DEG(big - 10), DEG(v)], `מציבים ${M(`x = ${v}`)}: הזוויות הן ${M(A.map(DEG).join(', '))}. בדיקה: הסכום 180°.`, A.map(DEG).join(' , ')),
  ];
  return { q: `זוויות המשולש הן ${M(es.join(' , '))}. מצא את x ואת הזווית הגדולה.`, expr, chain, explain: path(expr, chain), rule: 'סכום הזוויות במשולש 180°.' };
});

add('geometry', 'iso-x', 'isosceles', () => {
  if (R.coin()) {
    const t = 2 * R.int(10, 70), beta = (180 - t) / 2;
    const expr = `${t}° , β , β`;
    const chain = [
      step('מה ידוע על זוויות הבסיס?', 'הן שוות זו לזו', ['הן שוות לזווית הראש', 'סכומן 90°', 'אין קשר'], 'במשולש שווה שוקיים, מול השוקיים השוות יש זוויות שוות.', `${t} + β + β = 180`),
      step('מה יוצא?', `2β = ${180 - t}`, [`β = ${180 - t}`, `2β = ${180 + t}`, `β + ${t} = 180`, `2β = ${t}`], `${M('β + β = 2β')}, ומעבירים את ${t} לצד השני.`, `2β = ${180 - t}`),
      step('כמה מעלות כל זווית בסיס?', DEG(beta), [DEG(180 - t), DEG(t), DEG(beta + 10), DEG(beta - 10), DEG(2 * beta + 10)], `${M(`${180 - t} : 2 = ${beta}`)}.`, `β = ${beta}°`),
    ];
    return { q: `במשולש שווה שוקיים זווית הראש ${M(DEG(t))}. כמה מעלות כל זווית בסיס?`, expr, chain, explain: path(expr, chain), rule: 'במשולש שווה שוקיים זוויות הבסיס שוות. ראש + 2 · בסיס = 180°.' };
  }
  const b = R.int(20, 80), t = 180 - 2 * b;
  const expr = `${b}° , ${b}° , α`;
  const chain = [
    step('מה ידוע על זוויות הבסיס?', 'הן שוות זו לזו', ['הן שוות לזווית הראש', 'סכומן 90°', 'אין קשר'], 'שתי זוויות הבסיס שוות, אז שתיהן ' + DEG(b) + '.', `${b} + ${b} + α = 180`),
    step('מה יוצא?', `α = ${180 - 2 * b}`, [`α = ${180 - b}`, `2α = ${180 - 2 * b}`, `α = ${2 * b}`, `α = ${180 - 2 * b + 10}`], `${M(`180 − ${2 * b} = ${t}`)}.`, `α = ${t}°`),
  ];
  return { q: `במשולש שווה שוקיים זווית בסיס ${M(DEG(b))}. כמה מעלות זווית הראש?`, expr, chain, explain: path(expr, chain), rule: 'ראש + 2 · בסיס = 180°.' };
});

const TRIP = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29]];
add('geometry', 'pyth-x', 'right', () => {
  const [a, b, c] = R.pick(TRIP);
  const hyp = R.coin();
  const ask = hyp ? 'היתר' : 'הניצב השני';
  const expr = hyp ? `a = ${a} , b = ${b} , c = ?` : `a = ${a} , b = ? , c = ${c}`;
  const eq = hyp ? `${a}² + ${b}² = c²` : `${a}² + b² = ${c}²`;
  const chain = [
    step('איזו צלע היא היתר?', 'הצלע שמול הזווית הישרה', ['הצלע הקצרה ביותר', 'הצלע שליד הזווית הישרה', 'כל צלע יכולה להיות'], 'היתר תמיד מול הזווית הישרה, והוא הצלע הארוכה ביותר.'),
    step('איך נראית משוואת פיתגורס כאן?', eq, hyp ? [`${a}² + c² = ${b}²`, `${a} + ${b} = c`, `${a}² − ${b}² = c²`] : [`${a}² + ${c}² = b²`, `${a} + b = ${c}`, `${c}² + b² = ${a}²`], 'ניצב² + ניצב² = יתר².', eq),
    step('מחשבים את הריבועים. מה יוצא?', hyp ? `${a * a} + ${b * b} = c²` : `${a * a} + b² = ${c * c}`, hyp ? [`${2 * a} + ${2 * b} = c²`, `${a * a} + ${b * b} = c`, `${a * b} = c²`] : [`${2 * a} + b² = ${2 * c}`, `${a * a} + b = ${c * c}`, `${a * a} − b² = ${c * c}`], 'מספר בריבוע = המספר כפול עצמו.', hyp ? `c² = ${c * c}` : `b² = ${c * c - a * a}`),
    step(`כמה אורך ${ask}?`, String(hyp ? c : b), hyp ? [String(c * c), String(a + b), String(c + 1)] : [String(c * c - a * a), String(c - a), String(b + 1)], `מוציאים שורש: ${M(hyp ? `√${c * c} = ${c}` : `√${b * b} = ${b}`)}.`, hyp ? `c = ${c}` : `b = ${b}`),
  ];
  return { q: `במשולש ישר זווית ${hyp ? `הניצבים ${M(a)} ו-${M(b)}` : `ניצב אחד ${M(a)} והיתר ${M(c)}`}. מצא את ${ask}.`, expr, chain, explain: path(expr, chain), rule: 'ניצב² + ניצב² = יתר²' };
});

add('geometry', 'polygon', 'midseg', () => {
  const n = R.pick([5, 6, 8, 9, 10, 12]), sum = (n - 2) * 180;
  const expr = `n = ${n}`;
  const chain = [
    step('מה הנוסחה לסכום הזוויות במצולע?', '180° · (n − 2)', ['180° · n', '360° · (n − 2)', '90° · (n − 2)'], 'כל מצולע אפשר לחלק ל-(n − 2) משולשים, ובכל משולש 180°.', `180 · (${n} − 2)`),
    step('כמה זה?', DEG(sum), [DEG(180 * n), DEG(360 * (n - 2)), DEG(sum - 180)], `${M(`180 · ${n - 2} = ${sum}`)}.`, `S = ${sum}°`),
    step('כמה מעלות כל זווית (כולן שוות)?', DEG(sum / n), [DEG(360 / n), DEG(sum / (n - 2)), DEG(sum / n + 10)], `מחלקים את הסכום ב-${n} זוויות: ${M(`${sum} : ${n} = ${sum / n}`)}.`, `α = ${sum / n}°`),
  ];
  return { q: `מצולע משוכלל עם ${n} צלעות. כמה מעלות כל זווית שלו?`, expr, chain, explain: path(expr, chain), rule: 'סכום הזוויות במצולע: 180° · (n − 2).' };
});

add('geometry', 'midseg-x', 'midseg', () => {
  let a, p, q, v;
  do { v = R.int(2, 15); p = R.int(1, 9); a = R.int(3, 5); q = 2 * v + 2 * p - a * v; } while (q === 0 || Math.abs(q) > 40);
  const m = lin(1, p), base = lin(a, q);
  const expr = `MN = ${m}  ,  BC = ${base}`;
  const chain = [
    step('מה הקשר בין קטע האמצעים לצלע השלישית?', 'הצלע גדולה פי 2 מקטע האמצעים', ['הם שווים', 'קטע האמצעים גדול פי 2', 'סכומם 180'], 'קטע אמצעים במשולש שווה לחצי הצלע השלישית.', `${base} = 2(${m})`),
    step('פותחים סוגריים. מה יוצא?', `${base} = ${lin(2, 2 * p)}`, [`${base} = ${lin(2, p)}`, `${base} = ${lin(1, 2 * p)}`, `${lin(2 * a, 2 * q)} = ${m}`], `${M(`2 · x + 2 · ${p} = ${lin(2, 2 * p)}`)}.`, `${base} = ${lin(2, 2 * p)}`),
    step('מעבירים אגפים. מה יוצא?', `${a - 2 === 1 ? '' : a - 2}x = ${N(2 * p - q)}`, [`${a - 2 === 1 ? '' : a - 2}x = ${N(2 * p + q)}`, `${a + 2}x = ${N(2 * p - q)}`, `${a - 2 === 1 ? '' : a - 2}x = ${N(q - 2 * p)}`], `${M(`${a}x − 2x`)}, והמספרים לצד השני.`, `x = ${v}`),
    step('כמה אורך קטע האמצעים?', String(v + p), [String(2 * (v + p)), String(v), String(v + p + 2)], `מציבים ${M(`x = ${v}`)}: ${M(`${v} + ${p} = ${v + p}`)}. והצלע: ${M(String(2 * (v + p)))}, באמת פי 2.`, `MN = ${v + p}`),
  ];
  return { q: `במשולש, קטע האמצעים ${M('MN = ' + m)} מקביל לצלע ${M('BC = ' + base)}. מצא את x ואת אורך קטע האמצעים.`, expr, chain, explain: path(expr, chain), rule: 'קטע אמצעים במשולש = חצי הצלע השלישית.' };
}, 2);

add('geometry', 'similar-x', 'similar', () => {
  const k = R.pick([2, 3, 4]), [a, b] = R.pick([[3, 5], [4, 6], [5, 7], [2, 5], [6, 9], [4, 7]]);
  const expr = `${a} → ${k * a}  ,  ${b} → x`;
  const chain = [
    step('מה יחס הדמיון (גדול : קטן)?', `k = ${k * a} : ${a} = ${k}`, [`k = ${a} : ${k * a}`, `k = ${k * a} − ${a} = ${k * a - a}`, `k = ${b} : ${a}`], 'מחלקים צלע במשולש הגדול בצלע המתאימה לה במשולש הקטן.', `k = ${k}`),
    step('כמה זה x?', `x = ${k * b}`, [`x = ${b + k}`, `x = ${b}`, `x = ${k * b + k}`], `כל צלע במשולש הגדול גדולה פי ${k}: ${M(`${b} · ${k} = ${k * b}`)}.`, `x = ${k * b}`),
    step('ופי כמה שטח המשולש הגדול?', `פי ${k * k}`, [`פי ${k}`, `פי ${2 * k}`, `פי ${k * k * k}`, `פי ${k + 1}`], `יחס השטחים = ריבוע יחס הדמיון: ${M(`${k}² = ${k * k}`)}.`, `S₂ : S₁ = ${k * k}`),
  ];
  return { q: `שני משולשים דומים. במשולש הקטן צלעות ${M(a)} ו-${M(b)}. במשולש הגדול הצלעות המתאימות הן ${M(k * a)} ו-${M('x')}.`, expr, chain, explain: path(expr, chain), rule: 'במשולשים דומים כל הצלעות באותו יחס k, והשטחים ביחס k².' };
});
})();
