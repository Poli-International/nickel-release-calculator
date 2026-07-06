/*
  Nickel Release Calculator — Alloy & Material Dataset
  Poli International | 2026

  Standard: EN 1811:2011+A1:2015
  "Reference test method for release of nickel from all post assemblies
  which are inserted into pierced parts of the human body"

  Nickel release limits (EN 1811 / EU Directive 94/27/EC → REACH Annex XVII Entry 27):
  - Piercing jewelry in contact with pierced skin: 0.2 µg/cm²/week
  - Other jewelry in prolonged skin contact (>30 min/day, >2 years): 0.5 µg/cm²/week

  Note: the 0.2 µg/cm²/week limit applies specifically to items inserted into
  pierced parts of the human body (including initial piercings and healed piercings).
*/

const NICKEL_STANDARD = 'EN 1811:2011+A1:2015';
const NICKEL_LIMIT_PIERCING = 0.2;   // µg/cm²/week — piercing jewelry
const NICKEL_LIMIT_CONTACT  = 0.5;   // µg/cm²/week — other prolonged skin contact

// ─── Material database ────────────────────────────────────────────
// nickel_pct: typical nickel content as mass fraction (0–100%)
// release_rate: estimated µg/cm²/week release under standard EN 1811 conditions
//   null = not applicable / not tested (polymers, ceramics)
// release_note: context on why release rate differs from bulk nickel content
// compliance: 'safe' | 'borderline' | 'non_compliant' | 'na' | 'variable'
// astm_grade: relevant standard, if applicable

const NICKEL_MATERIALS = [

  // ─── Polymers / non-metals (no nickel release) ──────────────
  {
    id: 'bioflex',
    name: 'BioFlex® (PP-R)',
    full_name: 'BioFlex® Medical-Grade Polypropylene Random Copolymer',
    category: 'polymer',
    nickel_pct: 0,
    release_rate: 0,
    release_note: 'No metal content. Zero nickel release. The ideal material for nickel-sensitive patients.',
    compliance: 'safe',
    poli_highlight: true,
    manufacturer: 'Poli International',
    iso_reference: 'ISO 10993-6',
    also_known_as: ['BioFlex retainer', 'PP-R bar', 'PTCA polymer bar'],
    poli_url: 'https://poliinternational.com/bioflex/',
  },
  {
    id: 'ptfe',
    name: 'PTFE (Teflon)',
    full_name: 'Polytetrafluoroethylene',
    category: 'polymer',
    nickel_pct: 0,
    release_rate: 0,
    release_note: 'No metal content. Zero nickel release.',
    compliance: 'safe',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['Teflon bar', 'flexible retainer'],
    poli_url: null,
  },
  {
    id: 'nylon',
    name: 'Nylon / Acrylic',
    full_name: 'Nylon (Polyamide) / Acrylic Retainer',
    category: 'polymer',
    nickel_pct: 0,
    release_rate: 0,
    release_note: 'No metal content. Zero nickel release.',
    compliance: 'safe',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['plastic retainer', 'acrylic ball'],
    poli_url: null,
  },

  // ─── Noble metals / safe metals ─────────────────────────────
  {
    id: 'titanium_f136',
    name: 'Implant-Grade Titanium (ASTM F136)',
    full_name: 'Ti-6Al-4V ELI (Grade 23, ASTM F136)',
    category: 'metal',
    nickel_pct: 0,
    release_rate: 0,
    release_note: 'Nickel-free alloy. Ti-6Al-4V contains no nickel by specification. Zero measured release.',
    compliance: 'safe',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: 'ASTM F136, ISO 5832-3',
    also_known_as: ['implant grade titanium', 'G23 titanium', 'Grade 23 Ti', 'ASTM F136'],
    poli_url: null,
  },
  {
    id: 'niobium',
    name: 'Niobium',
    full_name: 'Pure Niobium (Nb)',
    category: 'metal',
    nickel_pct: 0,
    release_rate: 0,
    release_note: 'Nickel-free. No significant nickel release.',
    compliance: 'safe',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['Nb jewelry'],
    poli_url: null,
  },
  {
    id: 'gold_18k',
    name: '18k Gold (750)',
    full_name: '18-Karat Gold Alloy (75% Au)',
    category: 'metal',
    nickel_pct: 0,   // ideally — depends on alloy; white gold may contain nickel
    release_rate: 0.02,
    release_note: 'Yellow 18k alloy: typically alloyed with Cu/Ag — negligible nickel release. White 18k gold may contain up to 12–17% nickel; verify alloy composition. Value shown is for nickel-free yellow alloy.',
    compliance: 'safe',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['750 gold', '18 karat gold', 'solid gold 18k'],
    poli_url: null,
  },
  {
    id: 'gold_14k',
    name: '14k Gold (585)',
    full_name: '14-Karat Gold Alloy (58.5% Au)',
    category: 'metal',
    nickel_pct: 0,
    release_rate: 0.03,
    release_note: 'Yellow/rose 14k alloy: typically Cu/Ag/Zn — trace nickel release. White 14k gold may contain 6–11% nickel; see notes. Value shown is for non-white alloy.',
    compliance: 'safe',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['585 gold', '14 karat gold'],
    poli_url: null,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    full_name: 'Platinum (Pt, ≥950)',
    category: 'metal',
    nickel_pct: 0,
    release_rate: 0,
    release_note: 'Platinum alloys for jewelry typically use ruthenium or cobalt as hardeners. Nickel is not used in platinum piercing jewelry by reputable manufacturers.',
    compliance: 'safe',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['Pt jewelry', '950 platinum'],
    poli_url: null,
  },

  // ─── Borderline / variable ───────────────────────────────────
  {
    id: 'implant_steel_f138',
    name: 'Implant-Grade Steel (ASTM F138)',
    full_name: '316LVM Stainless Steel (ASTM F138)',
    category: 'metal',
    nickel_pct: 13.5,
    release_rate: 0.08,
    release_note: 'Despite containing 10–14% nickel by composition, the passive oxide layer on 316LVM severely restricts nickel release. EN 1811 measured release is typically 0.05–0.12 µg/cm²/week — below the 0.2 limit in controlled conditions. However, scratched surfaces, acidic environments, or lower grades of finish can push release above the threshold.',
    compliance: 'safe',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: 'ASTM F138, ISO 5832-1',
    also_known_as: ['316LVM', 'implant steel', 'surgical steel F138'],
    poli_url: null,
  },
  {
    id: 'white_gold_18k',
    name: 'White Gold 18k',
    full_name: '18k White Gold (Ni-based alloy)',
    category: 'metal',
    nickel_pct: 12,
    release_rate: 0.35,
    release_note: 'Nickel-based white gold alloys release 0.2–0.6 µg/cm²/week depending on surface condition. Many European manufacturers now use palladium-based white gold (0% nickel) to comply with EN 1811. Always request an EN 1811 test certificate from the supplier.',
    compliance: 'borderline',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['white gold', '750 white gold', '18ct white gold'],
    poli_url: null,
  },
  {
    id: 'white_gold_14k',
    name: 'White Gold 14k',
    full_name: '14k White Gold (Ni-based alloy)',
    category: 'metal',
    nickel_pct: 9,
    release_rate: 0.28,
    release_note: 'Moderate nickel release. Close to the 0.2 µg/cm²/week piercing limit. Palladium-based 14k white gold is available and releases negligible nickel.',
    compliance: 'borderline',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['585 white gold', '14ct white gold'],
    poli_url: null,
  },

  // ─── Non-compliant ───────────────────────────────────────────
  {
    id: 'surgical_steel_unknown',
    name: '"Surgical Steel" (unspecified)',
    full_name: 'Surgical Steel — Grade Unknown',
    category: 'metal',
    nickel_pct: 12,
    release_rate: null,
    release_note: '"Surgical steel" is a marketing term, not a certified grade. Without a material certificate and EN 1811 test report, nickel release cannot be quantified. Some unspecified surgical steels have been shown to release >1 µg/cm²/week — 5× the piercing limit. Always replace with certified implant-grade material or BioFlex® retainer.',
    compliance: 'variable',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['316L (unspecified)', 'stainless body jewelry', 'generic surgical steel'],
    poli_url: null,
  },
  {
    id: 'nickel_silver',
    name: 'Nickel Silver / German Silver',
    full_name: 'Nickel Silver (Cu-Ni-Zn alloy)',
    category: 'metal',
    nickel_pct: 18,
    release_rate: 4.5,
    release_note: 'Nickel silver contains no silver — it is a copper-nickel-zinc alloy. Nickel release is typically 3–6 µg/cm²/week, up to 22× the 0.2 limit. Completely non-compliant with EN 1811 for piercing use.',
    compliance: 'non_compliant',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['German silver', 'alpaca', 'white metal', 'maillechort'],
    poli_url: null,
  },
  {
    id: 'brass',
    name: 'Brass',
    full_name: 'Brass (Cu-Zn, various)',
    category: 'metal',
    nickel_pct: 0,
    release_rate: 0.8,
    release_note: 'Brass itself contains no nickel, but many brass jewelry items are plated with nickel for appearance. Unplated brass releases copper/zinc, not nickel. However, nickel-plated brass releases far above the 0.2 limit once the plating wears. Treat as non-compliant if nickel-plated.',
    compliance: 'non_compliant',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['copper alloy', 'brass ring', 'yellow metal'],
    poli_url: null,
  },
  {
    id: 'chrome_plated',
    name: 'Chrome / Nickel-Plated Metal',
    full_name: 'Chromium or Nickel-Plated Base Metal',
    category: 'metal',
    nickel_pct: null,
    release_rate: 2.5,
    release_note: 'Nickel plating releases heavily at wear points. Chrome plate often has a nickel sub-layer. Release rates of 1–5 µg/cm²/week are common once the surface is abraded. Non-compliant for piercing use.',
    compliance: 'non_compliant',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['chrome jewelry', 'nickel plated', 'electroplated steel'],
    poli_url: null,
  },
  {
    id: 'sterling_silver',
    name: 'Sterling Silver (925)',
    full_name: 'Sterling Silver (Ag 92.5%, Cu 7.5%)',
    category: 'metal',
    nickel_pct: 0,
    release_rate: 0.05,
    release_note: 'Standard sterling silver (925) contains no nickel. Nickel release is negligible. However, some low-quality silver alloys substitute copper with nickel to cut costs. Verify alloy composition. Nickel-free 925 silver meets the EN 1811 threshold but is still not recommended for initial piercings due to lack of biocompatibility certification.',
    compliance: 'safe',
    poli_highlight: false,
    manufacturer: null,
    iso_reference: null,
    also_known_as: ['.925 silver', 'fine silver', 'argentum'],
    poli_url: null,
  },

];

// ─── Compliance thresholds ─────────────────────────────────────────
const COMPLIANCE_CONFIG = {
  safe:          { label: 'Compliant',     cls: 'safe',          icon: '✅' },
  borderline:    { label: 'Borderline',    cls: 'borderline',    icon: '⚠️' },
  non_compliant: { label: 'Non-Compliant', cls: 'non_compliant', icon: '🚫' },
  variable:      { label: 'Unverified',    cls: 'variable',      icon: '🔍' },
  na:            { label: 'N/A',           cls: 'na',            icon: '—'  },
};

// ─── Search index ──────────────────────────────────────────────────
function normalizeNickelName(s) {
  return String(s || '').toLowerCase().replace(/[®™\s\-_\/()]+/g, '');
}

const NICKEL_INDEX = (() => {
  const idx = [];
  NICKEL_MATERIALS.forEach(m => {
    idx.push({ key: normalizeNickelName(m.name), entry: m });
    idx.push({ key: normalizeNickelName(m.full_name), entry: m });
    (m.also_known_as || []).forEach(a => idx.push({ key: normalizeNickelName(a), entry: m }));
  });
  return idx;
})();

function findNickelMaterial(query) {
  if (!query) return null;
  const q = normalizeNickelName(query);
  const exact = NICKEL_INDEX.find(e => e.key === q);
  if (exact) return exact.entry;
  const partial = NICKEL_INDEX.find(e => e.key.includes(q) && q.length >= 3);
  if (partial) return partial.entry;
  return null;
}

// ─── Custom calculator ─────────────────────────────────────────────
// Estimate nickel release from nickel content % using an empirical
// model based on EN 1811 literature data.
// The relationship is non-linear due to passive oxide layer effects.
// Below ~8% Ni: oxide layer dominates, release << bulk content
// Above ~8% Ni: protective layer degrades, release scales more linearly
function estimateReleaseFromNickelPct(nickelPct, surfaceFinish) {
  if (nickelPct <= 0) return 0;

  let base;
  if (nickelPct < 2)  base = nickelPct * 0.008;
  else if (nickelPct < 8)  base = 0.016 + (nickelPct - 2) * 0.02;
  else if (nickelPct < 15) base = 0.136 + (nickelPct - 8) * 0.04;
  else base = 0.416 + (nickelPct - 15) * 0.06;

  // Surface finish multipliers
  const finishMult = {
    polished:    0.7,
    standard:    1.0,
    brushed:     1.4,
    rough:       2.2,
    scratched:   3.5,
  };

  return Math.round(base * (finishMult[surfaceFinish] || 1.0) * 100) / 100;
}
