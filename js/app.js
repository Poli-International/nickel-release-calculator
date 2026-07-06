/*
  Nickel Release Calculator — UI Logic
  Poli International | 2026
*/

'use strict';

// ─── XSS protection ───────────────────────────────────────────────
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Tab switching ────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
      b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === 'panel-' + tab);
    });
  });
});

// ─── Lookup tab ───────────────────────────────────────────────────
const lookupInput   = document.getElementById('lookup-input');
const lookupBtn     = document.getElementById('lookup-btn');
const lookupResults = document.getElementById('lookup-results');

function runLookup() {
  const q = (lookupInput.value || '').trim();
  if (!q) { lookupResults.innerHTML = ''; return; }

  const mat = findNickelMaterial(q);
  if (mat) {
    lookupResults.innerHTML = buildMaterialCard(mat, true);
    const card = lookupResults.querySelector('.result-card');
    if (card) card.classList.add('expanded');
  } else {
    lookupResults.innerHTML = buildNotFoundCard(q);
  }
}

lookupBtn.addEventListener('click', runLookup);
lookupInput.addEventListener('keydown', e => { if (e.key === 'Enter') runLookup(); });

// ─── Calculator tab ───────────────────────────────────────────────
const calcNickelPct     = document.getElementById('calc-nickel-pct');
const calcSurface       = document.getElementById('calc-surface');
const calcArea          = document.getElementById('calc-area');
const calcBtn           = document.getElementById('calc-btn');
const calcResults       = document.getElementById('calc-results');

calcBtn.addEventListener('click', runCalculator);

function runCalculator() {
  const nickelPct    = parseFloat(calcNickelPct.value);
  const surfaceFinish = calcSurface.value;
  const area          = parseFloat(calcArea.value) || null;

  if (isNaN(nickelPct) || nickelPct < 0 || nickelPct > 100) {
    calcResults.innerHTML = `<div class="calc-error">Enter a valid nickel content between 0 and 100%.</div>`;
    return;
  }

  const release = estimateReleaseFromNickelPct(nickelPct, surfaceFinish);

  let weeklyTotal = null;
  if (area && area > 0) {
    weeklyTotal = Math.round(release * area * 100) / 100;
  }

  const piercingStatus = getComplianceStatus(release, NICKEL_LIMIT_PIERCING);
  const contactStatus  = getComplianceStatus(release, NICKEL_LIMIT_CONTACT);

  calcResults.innerHTML = buildCalcResult(nickelPct, surfaceFinish, release, weeklyTotal, area, piercingStatus, contactStatus);
}

function getComplianceStatus(release, limit) {
  if (release === 0)           return 'safe';
  if (release <= limit * 0.7)  return 'safe';
  if (release <= limit)        return 'borderline';
  return 'non_compliant';
}

function buildCalcResult(nickelPct, surfaceFinish, release, weeklyTotal, area, piercingStatus, contactStatus) {
  const cfg = COMPLIANCE_CONFIG[piercingStatus];
  const piercingBar = buildGaugeBar(release, NICKEL_LIMIT_PIERCING);
  const contactBar  = buildGaugeBar(release, NICKEL_LIMIT_CONTACT);

  const totalRow = weeklyTotal !== null ? `
    <div class="calc-stat-row">
      <span class="calc-stat-label">Total weekly release (${escHtml(String(area))} cm²)</span>
      <span class="calc-stat-value">${escHtml(String(weeklyTotal))} µg/week</span>
    </div>` : '';

  const recommendation = buildRecommendation(piercingStatus, release);

  return `
    <div class="calc-result-card">
      <div class="calc-result-header">
        <span class="calc-result-icon">${cfg.icon}</span>
        <div class="calc-result-title">
          <div class="calc-result-main">${escHtml(String(release))} µg/cm²/week</div>
          <div class="calc-result-sub">Estimated release rate (${escHtml(surfaceFinish)} finish, ${escHtml(String(nickelPct))}% Ni)</div>
        </div>
        <span class="badge calc-badge badge--${piercingStatus === 'safe' ? 'safe' : piercingStatus === 'borderline' ? 'borderline' : 'unsafe'}">${escHtml(cfg.label)}</span>
      </div>

      <div class="calc-stats">
        <div class="calc-stat-row">
          <span class="calc-stat-label">Estimated release rate</span>
          <span class="calc-stat-value">${escHtml(String(release))} µg/cm²/week</span>
        </div>
        ${totalRow}
        <div class="calc-stat-row">
          <span class="calc-stat-label">Nickel content (input)</span>
          <span class="calc-stat-value">${escHtml(String(nickelPct))}%</span>
        </div>
        <div class="calc-stat-row">
          <span class="calc-stat-label">Surface finish</span>
          <span class="calc-stat-value">${escHtml(surfaceFinish)}</span>
        </div>
      </div>

      <div class="limit-section">
        <div class="limit-row">
          <div class="limit-header">
            <span class="limit-label">Piercing jewelry limit (EN 1811)</span>
            <span class="limit-value">${escHtml(String(NICKEL_LIMIT_PIERCING))} µg/cm²/week</span>
            <span class="badge badge--${piercingStatus === 'safe' ? 'safe' : piercingStatus === 'borderline' ? 'borderline' : 'unsafe'}">${piercingStatus === 'safe' ? 'Pass' : piercingStatus === 'borderline' ? 'Borderline' : 'Fail'}</span>
          </div>
          ${piercingBar}
        </div>
        <div class="limit-row">
          <div class="limit-header">
            <span class="limit-label">Skin contact jewelry limit (EN 1811)</span>
            <span class="limit-value">${escHtml(String(NICKEL_LIMIT_CONTACT))} µg/cm²/week</span>
            <span class="badge badge--${contactStatus === 'safe' ? 'safe' : contactStatus === 'borderline' ? 'borderline' : 'unsafe'}">${contactStatus === 'safe' ? 'Pass' : contactStatus === 'borderline' ? 'Borderline' : 'Fail'}</span>
          </div>
          ${contactBar}
        </div>
      </div>

      ${recommendation}

      <p class="calc-disclaimer">
        Estimate based on empirical EN 1811 literature data. Actual release depends on alloy processing,
        surface passivation, pH, and wear conditions. Obtain a certified EN 1811 test report for regulatory compliance.
      </p>
    </div>`;
}

function buildGaugeBar(release, limit) {
  const pct = Math.min((release / (limit * 2)) * 100, 100);
  const color = release <= limit * 0.7 ? 'var(--safe)' : release <= limit ? 'var(--borderline)' : 'var(--unsafe)';
  const limitPct = Math.min((limit / (limit * 2)) * 100, 100);

  return `
    <div class="gauge-wrap">
      <div class="gauge-track">
        <div class="gauge-fill" style="width: ${pct.toFixed(1)}%; background: ${color};"></div>
        <div class="gauge-limit" style="left: ${limitPct}%;"></div>
      </div>
      <div class="gauge-labels">
        <span>0</span>
        <span>${escHtml(String(limit))} (limit)</span>
        <span>${escHtml(String(limit * 2))}</span>
      </div>
    </div>`;
}

function buildRecommendation(status, release) {
  if (status === 'safe') {
    return `<div class="recommendation recommendation--safe">
      <strong>✅ Compliant:</strong> Estimated release is below the EN 1811 piercing jewelry limit.
      Obtain a certified test report to confirm compliance for product labelling and regulatory purposes.
    </div>`;
  }
  if (status === 'borderline') {
    return `<div class="recommendation recommendation--borderline">
      <strong>⚠️ Borderline:</strong> Estimated release is close to or at the EN 1811 limit.
      Surface condition, scratches, and acidic skin pH could push release above the 0.2 µg/cm²/week threshold.
      Consider switching to nickel-free alternatives — implant-grade titanium (ASTM F136) or
      <a href="https://poliinternational.com/bioflex/" target="_blank" rel="noopener noreferrer">BioFlex® polymer</a>
      for guaranteed compliance. Commission a certified EN 1811 test before selling.
    </div>`;
  }
  return `<div class="recommendation recommendation--unsafe">
    <strong>🚫 Non-Compliant:</strong> Estimated release exceeds the EN 1811 piercing limit (0.2 µg/cm²/week)
    and likely the contact jewelry limit (0.5 µg/cm²/week). This material should not be used
    for piercing jewelry sold in the EU. Switch to nickel-free materials:
    implant-grade titanium (ASTM F136), niobium, BioFlex® polymer, or palladium-based gold alloys.
  </div>`;
}

// ─── Material card builder ────────────────────────────────────────
function buildMaterialCard(m, autoExpand) {
  const cfg = COMPLIANCE_CONFIG[m.compliance] || COMPLIANCE_CONFIG.variable;

  const releaseDisplay = m.release_rate === null
    ? 'Unknown — see note'
    : m.release_rate === 0
      ? '0 µg/cm²/week'
      : `~${m.release_rate} µg/cm²/week`;

  const piercingPass = m.release_rate !== null
    ? m.release_rate <= NICKEL_LIMIT_PIERCING
      ? '<span class="badge badge--safe">≤ 0.2 — Pass</span>'
      : '<span class="badge badge--unsafe">&gt; 0.2 — Fail</span>'
    : '<span class="badge badge--neutral">Unverified</span>';

  const alsoKnownAs = (m.also_known_as || []).length
    ? `<div class="detail-tags">${m.also_known_as.map(a => `<span class="detail-tag">${escHtml(a)}</span>`).join('')}</div>` : '';

  const poliBox = m.poli_highlight ? `
    <div class="poli-highlight">
      <span class="poli-highlight__logo">P</span>
      <span>Zero nickel content. The safe choice for patients with nickel sensitivity. Made by Poli International.</span>
    </div>` : '';

  const actionLinks = [];
  if (m.poli_url) {
    actionLinks.push(`<a href="${escHtml(m.poli_url)}" target="_blank" rel="noopener noreferrer">🔗 BioFlex® Product Page</a>`);
  }

  return `
    <div class="result-card result-card--${cfg.cls}">
      <div class="card-header" onclick="toggleCard(this)" tabindex="0" aria-expanded="false">
        <span class="card-status-icon">${cfg.icon}</span>
        <div class="card-title-block">
          <div class="card-name">${escHtml(m.name)}</div>
          <div class="card-name-sub">${escHtml(m.full_name)}</div>
        </div>
        <div class="card-badges">
          <span class="badge badge--${m.compliance === 'safe' ? 'safe' : m.compliance === 'non_compliant' ? 'unsafe' : m.compliance === 'borderline' ? 'borderline' : 'neutral'}">${escHtml(cfg.label)}</span>
          ${m.release_rate === 0 ? '<span class="badge badge--safe">0 µg/cm²/week</span>' :
            m.release_rate !== null ? `<span class="badge badge--neutral">~${m.release_rate} µg/cm²/week</span>` : ''}
        </div>
        <span class="card-chevron">▼</span>
      </div>
      <div class="card-body">
        ${poliBox}
        <p class="card-notes">${escHtml(m.release_note)}</p>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Nickel Content</span>
            <span class="detail-value">${m.nickel_pct === null ? 'Varies' : m.nickel_pct + '%'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Estimated Release</span>
            <span class="detail-value">${escHtml(releaseDisplay)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Piercing Limit (0.2)</span>
            <span class="detail-value">${piercingPass}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">EN 1811 Status</span>
            <span class="detail-value">${escHtml(cfg.label)}</span>
          </div>
          ${m.iso_reference ? `<div class="detail-item">
            <span class="detail-label">Standard</span>
            <span class="detail-value"><code>${escHtml(m.iso_reference)}</code></span>
          </div>` : ''}
          ${m.manufacturer ? `<div class="detail-item">
            <span class="detail-label">Manufacturer</span>
            <span class="detail-value">${escHtml(m.manufacturer)}</span>
          </div>` : ''}
        </div>
        ${alsoKnownAs ? `<div class="detail-section"><div class="detail-label">Also known as</div>${alsoKnownAs}</div>` : ''}
        ${actionLinks.length ? `<div class="card-action-row">${actionLinks.join('')}</div>` : ''}
      </div>
    </div>`;
}

function buildNotFoundCard(query) {
  return `
    <div class="not-found-card">
      <span class="nf-icon">🔍</span>
      <div class="nf-text">
        <div class="nf-name">&ldquo;${escHtml(query)}&rdquo; not found</div>
        <div class="nf-sub">
          Try the <strong>Calculator tab</strong> to estimate release from nickel content %.
          If the material is unknown, treat it as unverified and commission an EN 1811 test.
          Consider switching to <a href="https://poliinternational.com/bioflex/" target="_blank" rel="noopener noreferrer">BioFlex® polymer</a>
          — zero nickel, fully compliant.
        </div>
      </div>
    </div>`;
}

// ─── Accordion ────────────────────────────────────────────────────
function toggleCard(headerEl) {
  const card = headerEl.closest('.result-card');
  const expanded = card.classList.toggle('expanded');
  headerEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList.contains('card-header')) toggleCard(e.target);
});

// ─── Idle states ──────────────────────────────────────────────────
lookupResults.innerHTML = `
  <div class="idle-state">
    <div class="idle-state__icon">🔬</div>
    <div class="idle-state__text">
      Search a material — e.g. <em>titanium</em>, <em>white gold</em>, <em>surgical steel</em>, <em>nickel silver</em>
    </div>
  </div>`;
