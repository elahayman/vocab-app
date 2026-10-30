// Shared helpers for writing questions: math formatting, randomness and SVG figures.
// A topic file pushes { id, title, icon, added, subs, rules, templates } onto window.TOPICS.
// A template is { id, sub, lvl?, make(level) }. lvl (1-3, default 1) is the difficulty level of the subtopic
// at which the template starts to appear; make() gets the subtopic's current level and returns one of:
//   multiple choice / true-false: { q, fig?, opts: [correct, ...wrong] (2-4), explain, rule?, hint? }
//   tap on the figure:            { q, fig (with D.hitSeg / D.hitAng targets), tap: key of the right target, explain, ... }
//   put steps in order:           { q, steps: [step 1, step 2, ...] in the right order, explain, ... }
// All strings are HTML.
window.TOPICS = window.TOPICS || [];

// Inline math, kept left-to-right inside the Hebrew text.
const M = s => `<span class="m" dir="ltr">${s}</span>`;
const FR = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;

const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  shuffle: arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  },
  coin: () => Math.random() < 0.5,
};

// Correct answer first, then the first three distinct wrong candidates.
function choices(correct, wrongs) {
  const out = [correct];
  for (const w of wrongs) if (w != null && !out.includes(w) && out.length < 4) out.push(w);
  return out;
}

// SVG figures. Points are [x, y] in a 320-wide box (y grows downward).
const D = (() => {
  const f = n => Math.round(n * 10) / 10;
  const pt = p => `${f(p[0])},${f(p[1])}`;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const unit = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const add = (a, v, k = 1) => [a[0] + v[0] * k, a[1] + v[1] * k];
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const cen = (...ps) => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length];
  const polar = (o, deg, r) => [o[0] + Math.cos(deg * Math.PI / 180) * r, o[1] - Math.sin(deg * Math.PI / 180) * r];

  const svg = (inner, h = 190) => `<svg class="fig" viewBox="0 0 320 ${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  const seg = (a, b, cls = '') => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" class="ln ${cls}"/>`;
  const poly = (ps, cls = '') => `<polygon points="${ps.map(pt).join(' ')}" class="shape ${cls}"/>`;
  const txt = (p, t, cls = 'val') => `<text x="${f(p[0])}" y="${f(p[1])}" class="${cls}">${t}</text>`;
  // Vertex name, pushed away from the shape's centre c.
  const name = (p, t, c, d = 13) => txt(add(p, unit(sub(p, c)), d), t, 'lbl');
  // A value written next to the middle of side ab, on the side away from c.
  const side = (a, b, t, c, d = 13, cls = 'val') => {
    const m = mid(a, b), u = unit(sub(b, a));
    let n = [-u[1], u[0]];
    if ((m[0] + n[0] - c[0]) ** 2 + (m[1] + n[1] - c[1]) ** 2 < (m[0] - c[0]) ** 2 + (m[1] - c[1]) ** 2) n = [-n[0], -n[1]];
    return txt(add(m, n, d), t, cls);
  };
  // n small ticks across side ab: sides with the same number of ticks are equal.
  const ticks = (a, b, n = 1) => {
    const m = mid(a, b), u = unit(sub(b, a)), nr = [-u[1], u[0]];
    let s = '';
    for (let i = 0; i < n; i++) { const p = add(m, u, (i - (n - 1) / 2) * 5); s += seg(add(p, nr, -6), add(p, nr, 6), 'mark'); }
    return s;
  };
  // Chevrons that mark parallel lines.
  const par = (a, b, n = 1) => {
    const m = mid(a, b), u = unit(sub(b, a)), nr = [-u[1], u[0]];
    let s = '';
    for (let i = 0; i < n; i++) {
      const tip = add(m, u, i * 6 + 4);
      s += `<polyline points="${pt(add(add(tip, u, -7), nr, 5))} ${pt(tip)} ${pt(add(add(tip, u, -7), nr, -5))}" class="mark"/>`;
    }
    return s;
  };
  // Angle arc(s) at vertex v between the rays toward a and toward b, with optional text.
  const ang = (v, a, b, { n = 1, r = 20, t = '', cls = '', tr = 0 } = {}) => {
    const ua = unit(sub(a, v)), ub = unit(sub(b, v));
    const sweep = ua[0] * ub[1] - ua[1] * ub[0] > 0 ? 1 : 0;
    let s = '';
    for (let i = 0; i < n; i++) {
      const rr = r + i * 4;
      s += `<path d="M${pt(add(v, ua, rr))} A${rr} ${rr} 0 0 ${sweep} ${pt(add(v, ub, rr))}" class="arc ${cls}"/>`;
    }
    if (t) s += txt(add(v, unit(add(ua, ub)), tr || r + 4 * n + 12), t, 'val ' + cls);
    return s;
  };
  const rt = (v, a, b, k = 11) => {
    const ua = unit(sub(a, v)), ub = unit(sub(b, v));
    return `<polyline points="${pt(add(v, ua, k))} ${pt(add(add(v, ua, k), ub, k))} ${pt(add(v, ub, k))}" class="mark"/>`;
  };
  // Invisible, finger-sized tap targets for "tap on the figure" questions. Add them last so they sit on top.
  const hitSeg = (a, b, k) => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" class="hit" data-k="${k}"/>`;
  const hitAng = (v, a, b, k, d = 24) => {
    const p = add(v, unit(add(unit(sub(a, v)), unit(sub(b, v)))), d);
    return `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="17" class="hit spot" data-k="${k}"/>`;
  };
  const dot = p => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="3" class="dot"/>`;
  return { svg, hitSeg, hitAng, seg, poly, txt, name, side, ticks, par, ang, rt, dot, mid, cen, polar, add, sub, unit };
})();
