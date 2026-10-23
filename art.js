// Hand-drawn SVG art: original hero avatars and city buildings that grow by level.
(function () {
  'use strict';

  const svg = (body, vb = '0 0 64 64') =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

  // ---------- Hero avatars (original characters) ----------
  // Each is a bust: background disc, shoulders in the suit colors, head with a mask.
  const AVATARS = {
    web: { name: 'גיבור הרשת', art: svg(`
      <circle cx="32" cy="32" r="32" fill="#1e3a8a"/>
      <path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="#1d4ed8"/>
      <path d="M20 64c1-10 6-16 12-16s11 6 12 16z" fill="#dc2626"/>
      <path d="M28 50l4 5 4-5-4 3z" fill="#111"/><circle cx="32" cy="52" r="2.2" fill="#111"/>
      <ellipse cx="32" cy="28" rx="15" ry="17" fill="#dc2626"/>
      <g stroke="#7f1d1d" stroke-width="0.9" fill="none" opacity="0.9">
        <path d="M32 11v34M17 28h30M21 16l22 24M43 16L21 40"/>
        <ellipse cx="32" cy="28" rx="8" ry="9"/><ellipse cx="32" cy="28" rx="12.5" ry="14"/>
      </g>
      <rect x="17" y="21" width="30" height="9" rx="4.5" fill="#1d4ed8"/>
      <circle cx="25" cy="25.5" r="5" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.8"/>
      <circle cx="39" cy="25.5" r="5" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.8"/>
      <circle cx="26.5" cy="24" r="1.4" fill="#fff"/><circle cx="40.5" cy="24" r="1.4" fill="#fff"/>`) },
    ninja: { name: 'נינג\'ת הצללים', art: svg(`
      <circle cx="32" cy="32" r="32" fill="#3b0764"/>
      <path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="#1f1235"/>
      <path d="M26 46l6 10 6-10" fill="none" stroke="#a855f7" stroke-width="3"/>
      <ellipse cx="32" cy="28" rx="15" ry="17" fill="#1f1235"/>
      <rect x="17" y="22" width="30" height="10" rx="5" fill="#f5d0a9"/>
      <path d="M21 27l7-2v4zM43 27l-7-2v4z" fill="#111"/>
      <path d="M46 20l12-6-4 8 6 2-14 1z" fill="#a855f7"/>`) },
    robot: { name: 'רובוט לוחם', art: svg(`
      <circle cx="32" cy="32" r="32" fill="#0f766e"/>
      <path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="#64748b"/>
      <rect x="27" y="48" width="10" height="8" rx="2" fill="#facc15"/>
      <line x1="32" y1="6" x2="32" y2="12" stroke="#cbd5e1" stroke-width="3"/><circle cx="32" cy="5" r="3" fill="#f43f5e"/>
      <rect x="15" y="12" width="34" height="32" rx="9" fill="#cbd5e1"/>
      <rect x="19" y="20" width="26" height="11" rx="5.5" fill="#0e7490"/>
      <circle cx="26" cy="25.5" r="3" fill="#67e8f9"/><circle cx="38" cy="25.5" r="3" fill="#67e8f9"/>
      <rect x="24" y="35" width="16" height="4" rx="2" fill="#475569"/>`) },
    thunder: { name: 'ברק', art: svg(`
      <circle cx="32" cy="32" r="32" fill="#1e40af"/>
      <path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="#facc15"/>
      <path d="M34 46l-6 9h5l-3 8 9-11h-5l3-6z" fill="#1e40af"/>
      <ellipse cx="32" cy="29" rx="14" ry="16" fill="#f1c27d"/>
      <path d="M17 26c0-11 7-16 15-16s15 5 15 16l-5-3-3 4-7-6-7 6-3-4z" fill="#facc15"/>
      <path d="M18 27h28v6H18z" fill="#1e3a8a" rx="3"/>
      <circle cx="26" cy="30" r="2" fill="#fff"/><circle cx="38" cy="30" r="2" fill="#fff"/>
      <path d="M27 38q5 3 10 0" stroke="#7c2d12" stroke-width="1.8" fill="none"/>`) },
    blaze: { name: 'להבה', art: svg(`
      <circle cx="32" cy="32" r="32" fill="#7c2d12"/>
      <path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="#ea580c"/>
      <path d="M14 30c-2-12 6-22 10-24-1 5 2 6 4 2 2 4 6 3 6-2 6 4 13 12 11 24z" fill="#f97316"/>
      <path d="M18 30c0-8 4-14 8-16 0 4 3 4 5 1 2 3 5 3 6 0 4 4 8 9 8 15z" fill="#fde047"/>
      <ellipse cx="32" cy="32" rx="12" ry="13" fill="#e0ac69"/>
      <path d="M20 29h24v6c-4 2-8 0-12-2-4 2-8 4-12 2z" fill="#be123c"/>
      <circle cx="26" cy="31.5" r="2" fill="#fff"/><circle cx="38" cy="31.5" r="2" fill="#fff"/>
      <path d="M28 40q4 2 8 0" stroke="#7c2d12" stroke-width="1.8" fill="none"/>`) },
    astro: { name: 'ריינג\'ר חלל', art: svg(`
      <circle cx="32" cy="32" r="32" fill="#020617"/>
      <circle cx="12" cy="14" r="1.2" fill="#fff"/><circle cx="52" cy="10" r="1" fill="#fff"/><circle cx="54" cy="40" r="1.2" fill="#fff"/>
      <path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="#e2e8f0"/>
      <rect x="25" y="50" width="14" height="6" rx="2" fill="#22c55e"/>
      <circle cx="32" cy="28" r="17" fill="#e2e8f0"/>
      <path d="M19 27c0-7 6-12 13-12s13 5 13 12-6 10-13 10-13-3-13-10z" fill="#1e293b"/>
      <path d="M23 22c3-3 7-4 10-3" stroke="#7dd3fc" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="27" cy="28" r="2" fill="#7dd3fc"/><circle cx="37" cy="28" r="2" fill="#7dd3fc"/>`) },
    wolf: { name: 'זאב הלילה', art: svg(`
      <circle cx="32" cy="32" r="32" fill="#334155"/>
      <path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="#0f172a"/>
      <path d="M17 22L14 6l12 9zM47 22l3-16-12 9z" fill="#94a3b8"/>
      <ellipse cx="32" cy="29" rx="15" ry="16" fill="#94a3b8"/>
      <path d="M22 33c3 9 17 9 20 0-3 5-17 5-20 0z" fill="#e2e8f0"/>
      <path d="M20 24l9 2-2 4-7-1zM44 24l-9 2 2 4 7-1z" fill="#facc15"/>
      <ellipse cx="32" cy="36" rx="3" ry="2" fill="#0f172a"/>`) },
    cat: { name: 'חתולת הגגות', art: svg(`
      <circle cx="32" cy="32" r="32" fill="#9d174d"/>
      <path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="#111827"/>
      <path d="M24 48h16l-8 8z" fill="#f472b6"/>
      <path d="M18 20l-1-14 11 9zM46 20l1-14-11 9z" fill="#111827"/>
      <ellipse cx="32" cy="30" rx="14" ry="15" fill="#f1c27d"/>
      <path d="M17 22c3-8 27-8 30 0v8c-5 3-10 0-15-2-5 2-10 5-15 2z" fill="#111827"/>
      <ellipse cx="25.5" cy="26" rx="3" ry="2.2" fill="#f472b6"/><ellipse cx="38.5" cy="26" rx="3" ry="2.2" fill="#f472b6"/>
      <path d="M28 38q4 3 8 0" stroke="#9d174d" stroke-width="1.8" fill="none"/>`) },
  };

  // ---------- Buildings ----------
  // Each building is drawn in a 100x100 box. Parts carry the minimum level at which they appear:
  // level 0 is a construction site, 1 the bare structure, 5 the finished, lit-up building.
  const site = `
    <rect x="10" y="84" width="80" height="6" fill="#a16207"/>
    <path d="M14 84V70h72v14" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4"/>
    <path d="M70 84V20M70 22H30M70 22l10 8M40 22v18" stroke="#eab308" stroke-width="3" fill="none"/>
    <rect x="34" y="40" width="12" height="8" fill="#b45309"/>
    <rect x="22" y="74" width="20" height="10" fill="#c2410c"/><rect x="46" y="76" width="14" height="8" fill="#9a3412"/>`;
  const ground = `<rect x="0" y="90" width="100" height="10" rx="2" fill="#4ade80"/>`;
  const lights = `<g fill="#fde047"><circle cx="8" cy="12" r="2"/><circle cx="92" cy="16" r="2"/><circle cx="16" cy="30" r="1.4"/><circle cx="86" cy="34" r="1.4"/></g>
    <path d="M50 2l2 5 5 .5-4 3 1 5-4-3-4 3 1-5-4-3 5-.5z" fill="#facc15"/>`;

  const B = {
    house: [
      [1, `<rect x="22" y="50" width="56" height="40" fill="#fde68a"/>`],
      [2, `<path d="M16 52L50 22l34 30z" fill="#dc2626"/><rect x="64" y="26" width="8" height="16" fill="#7f1d1d"/>`],
      [2, `<rect x="28" y="58" width="14" height="12" fill="#7dd3fc" stroke="#fff" stroke-width="2"/><rect x="58" y="58" width="14" height="12" fill="#7dd3fc" stroke="#fff" stroke-width="2"/>`],
      [3, `<rect x="44" y="68" width="12" height="22" rx="2" fill="#92400e"/><circle cx="53" cy="80" r="1.3" fill="#fde047"/>`],
      [4, `<circle cx="14" cy="82" r="8" fill="#16a34a"/><circle cx="86" cy="82" r="8" fill="#16a34a"/><path d="M30 90v-6h40v6" stroke="#fff" stroke-width="2" fill="none"/>`],
      [5, `<rect x="28" y="58" width="14" height="12" fill="#fde047" opacity=".85"/><rect x="58" y="58" width="14" height="12" fill="#fde047" opacity=".85"/>` + lights],
    ],
    diner: [
      [1, `<rect x="12" y="46" width="76" height="44" fill="#fef3c7"/>`],
      [2, `<path d="M10 46h80l-6 12H16z" fill="#ef4444"/><path d="M22 46l-3 12M34 46l-2 12M46 46v12M58 46l1 12M70 46l2 12M82 46l2 12" stroke="#fff" stroke-width="4"/>`],
      [2, `<rect x="18" y="62" width="26" height="18" fill="#7dd3fc"/>`],
      [3, `<rect x="56" y="62" width="16" height="28" fill="#7c2d12"/><circle cx="68" cy="76" r="1.4" fill="#fde047"/>`],
      [4, `<circle cx="50" cy="30" r="14" fill="#f59e0b"/><circle cx="50" cy="30" r="11" fill="#fca5a5"/><circle cx="46" cy="27" r="2" fill="#b91c1c"/><circle cx="54" cy="31" r="2" fill="#b91c1c"/><circle cx="49" cy="35" r="2" fill="#b91c1c"/><rect x="48" y="44" width="4" height="4" fill="#78350f"/>`],
      [5, `<rect x="18" y="62" width="26" height="18" fill="#fde047" opacity=".7"/><circle cx="80" cy="84" r="5" fill="#16a34a"/>` + lights],
    ],
    tower: [
      [1, `<rect x="34" y="30" width="32" height="60" fill="#94a3b8"/>`],
      [2, `<rect x="38" y="14" width="24" height="18" fill="#cbd5e1"/><g fill="#bae6fd">${[36, 46, 56, 66, 76].map((y) => `<rect x="38" y="${y}" width="9" height="6"/><rect x="53" y="${y}" width="9" height="6"/>`).join('')}</g>`],
      [3, `<rect x="44" y="80" width="12" height="10" fill="#1e293b"/><rect x="48" y="4" width="4" height="10" fill="#64748b"/>`],
      [4, `<circle cx="50" cy="23" r="7" fill="#1d4ed8"/><path d="M47 19v8M53 19v8M47 23h6" stroke="#fff" stroke-width="2"/><rect x="24" y="60" width="10" height="30" fill="#64748b"/><rect x="66" y="54" width="10" height="36" fill="#64748b"/>`],
      [5, `<g fill="#fde047">${[36, 46, 56, 66].map((y) => `<rect x="38" y="${y}" width="9" height="6"/>`).join('')}</g><circle cx="50" cy="4" r="3" fill="#f43f5e"/>` + lights],
    ],
    web: [
      [1, `<rect x="22" y="40" width="56" height="50" fill="#1e3a8a"/>`],
      [2, `<path d="M18 42L50 18l32 24z" fill="#dc2626"/><g fill="#93c5fd"><rect x="28" y="50" width="12" height="10"/><rect x="60" y="50" width="12" height="10"/></g>`],
      [3, `<rect x="43" y="68" width="14" height="22" fill="#111827"/><g stroke="#e5e7eb" stroke-width="1" fill="none"><path d="M50 18v24M34 30l32 0M38 24l24 18M62 24L38 42"/></g>`],
      [4, `<g transform="translate(50 64)"><ellipse rx="5" ry="6" fill="#111827"/><path d="M-4-3l-6-4M-4 0h-7M-4 3l-6 4M4-3l6-4M4 0h7M4 3l6 4" stroke="#111827" stroke-width="1.6"/></g>
            <path d="M78 40c6 6 10 18 8 30" stroke="#e5e7eb" stroke-width="1.2" fill="none"/>`],
      [5, `<g fill="#fde047" opacity=".8"><rect x="28" y="50" width="12" height="10"/><rect x="60" y="50" width="12" height="10"/></g>` + lights],
    ],
    arena: [
      [1, `<rect x="12" y="60" width="76" height="30" fill="#7c3aed"/>`],
      [2, `<path d="M12 60c4-26 72-26 76 0z" fill="#a78bfa"/><path d="M24 60c3-16 49-16 52 0" fill="none" stroke="#ede9fe" stroke-width="2"/>`],
      [3, `<path d="M40 90V74c0-6 20-6 20 0v16z" fill="#2e1065"/><g fill="#fde047"><rect x="18" y="66" width="8" height="6"/><rect x="74" y="66" width="8" height="6"/></g>`],
      [4, `<path d="M50 24v-14l12 4-12 4" fill="#f43f5e" stroke="#475569" stroke-width="1.5"/><path d="M44 50l6-10 6 10-6-3z" fill="#facc15"/>`],
      [5, `<path d="M14 40L4 10M86 40l10-30" stroke="#fde047" stroke-width="3" opacity=".7"/>` + lights],
    ],
    shop: [
      [1, `<rect x="16" y="44" width="68" height="46" fill="#fce7f3"/>`],
      [2, `<rect x="12" y="38" width="76" height="10" fill="#db2777"/><rect x="22" y="56" width="34" height="24" fill="#7dd3fc"/>`],
      [3, `<rect x="62" y="58" width="14" height="32" fill="#831843"/>`],
      [4, `<path d="M38 14h24l4 22H34z" fill="#f472b6"/><path d="M42 18c0-8 16-8 16 0" stroke="#831843" stroke-width="2.5" fill="none"/><path d="M28 62l6 10 6-10 6 10" stroke="#fff" stroke-width="2" fill="none"/>`],
      [5, `<rect x="22" y="56" width="34" height="24" fill="#fde047" opacity=".6"/>` + lights],
    ],
    park: [
      [1, `<path d="M30 90L50 50l20 40" stroke="#475569" stroke-width="5" fill="none"/>`],
      [2, `<circle cx="50" cy="46" r="30" fill="none" stroke="#0ea5e9" stroke-width="4"/><g stroke="#0ea5e9" stroke-width="1.6"><path d="M50 16v60M20 46h60M29 25l42 42M71 25L29 67"/></g>`],
      [3, `<g fill="#f43f5e">${[[50, 16], [80, 46], [50, 76], [20, 46], [29, 25], [71, 25], [71, 67], [29, 67]].map(([x, y]) => `<rect x="${x - 4}" y="${y - 3}" width="8" height="7" rx="2"/>`).join('')}</g>`],
      [4, `<path d="M6 90c6-20 14-20 18-10" stroke="#f59e0b" stroke-width="3" fill="none"/><circle cx="88" cy="80" r="8" fill="#16a34a"/>`],
      [5, `<circle cx="50" cy="46" r="31" fill="none" stroke="#fde047" stroke-width="1.5" stroke-dasharray="2 4"/>` + lights],
    ],
    port: [
      [1, `<rect x="20" y="80" width="60" height="10" fill="#64748b"/>`],
      [2, `<path d="M50 20c10 10 12 30 10 50H40c-2-20 0-40 10-50z" fill="#e2e8f0"/><circle cx="50" cy="44" r="5" fill="#38bdf8" stroke="#475569" stroke-width="2"/>`],
      [3, `<path d="M40 60l-10 14h10zM60 60l10 14H60z" fill="#ef4444"/><path d="M28 80V40h6v40" fill="#94a3b8"/>`],
      [4, `<path d="M44 70h12l-6 14z" fill="#f97316"/><path d="M47 70h6l-3 8z" fill="#fde047"/>`],
      [5, `<path d="M50 20c4-6 6-10 6-14" stroke="#fde047" stroke-width="2" fill="none"/>` + lights],
    ],
    // The band stage gets a new instrument at every level.
    band: [
      [1, `<path d="M10 22h80v46H10z" fill="#4c1d95"/><path d="M10 22q10 8 20 0q10 8 20 0q10 8 20 0q10 8 20 0" fill="#7c3aed"/>
        <rect x="6" y="68" width="88" height="6" fill="#a78bfa"/><rect x="6" y="74" width="88" height="16" fill="#6d28d9"/>
        <ellipse cx="14" cy="48" rx="7" ry="2" fill="#facc15"/><path d="M14 50v18" stroke="#94a3b8" stroke-width="1.5"/>
        <circle cx="27" cy="58" r="9" fill="#f8fafc" stroke="#ef4444" stroke-width="3"/><circle cx="27" cy="58" r="3" fill="#ef4444"/>`],
      [2, `<path d="M84 46l-9 12" stroke="#7c2d12" stroke-width="3"/><rect x="82" y="42" width="6" height="5" rx="1" fill="#7c2d12"/>
        <ellipse cx="73" cy="61" rx="7" ry="7" fill="#f97316"/><ellipse cx="76" cy="55" rx="5" ry="5" fill="#f97316"/><circle cx="74" cy="59" r="2" fill="#7c2d12"/>`],
      [3, `<rect x="39" y="46" width="26" height="7" rx="1" fill="#111827"/>
        <path d="M42 46v5M46 46v5M50 46v5M54 46v5M58 46v5M62 46v5" stroke="#f8fafc" stroke-width="2.2"/>
        <path d="M43 53l-3 15M61 53l3 15" stroke="#6b7280" stroke-width="2"/>`],
      [4, `<path d="M42 34h12l7-5v12l-7-5H42z" fill="#facc15" stroke="#a16207" stroke-width="1"/><path d="M46 33v-3M50 33v-3" stroke="#a16207" stroke-width="1.5"/>`],
      [5, `<path d="M90 68V38" stroke="#6b7280" stroke-width="2"/><circle cx="90" cy="36" r="3.5" fill="#111827"/>
        <g fill="#f0abfc"><text x="22" y="40" font-size="10">♪</text><text x="64" y="32" font-size="12">♫</text><text x="34" y="30" font-size="8">♪</text></g>` + lights],
    ],
  };

  function building(id, level) {
    const parts = B[id] || [];
    let body = level <= 0 ? site : parts.filter(([min]) => level >= min).map(([, p]) => p).join('');
    // Level 1 is still under construction: scaffolding around the bare structure.
    if (level === 1) body += `<g stroke="#f59e0b" stroke-width="2.5" fill="none"><path d="M8 90V30M92 90V30M8 40h84M8 62h84M8 40l84 22"/></g>`;
    return svg(ground + body, '0 0 100 100');
  }

  window.ART = { AVATARS, building };
})();
