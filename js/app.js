/**
 * EN 1811 Nickel Release Guide & Material Reference — UI Controller
 * Poli International | 2026
 */
(function() {
  'use strict';

  function t(key, params) {
    if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.t === 'function') {
      return window.i18n.t(key, params);
    }
    return key;
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var activeTab = 'materials';
  var selectedCategory = 'all';
  var searchQuery = '';
  var compareMatA = 'implant_ti_f136';
  var compareMatB = 'bioflex';

  function init() {
    setupLanguageSelector();
    setupTabs();
    loadStudioData();
    renderApp();
  }

  function setupLanguageSelector() {
    var sel = document.getElementById('lang-select');
    if (!sel) return;

    var supported = window.i18n.getSupportedLanguages();
    sel.innerHTML = '';
    var current = window.i18n.getLang();
    var nativeNames = {
      en: 'English',
      fr: 'Français',
      it: 'Italiano',
      de: 'Deutsch',
      es: 'Español',
      nl: 'Nederlands',
      pt: 'Português'
    };
    for (var i = 0; i < supported.length; i++) {
      var code = supported[i];
      var opt = document.createElement('option');
      opt.value = code;
      opt.textContent = nativeNames[code] || code.toUpperCase();
      if (code === current) {
        opt.selected = true;
      }
      sel.appendChild(opt);
    }

    sel.addEventListener('change', function(e) {
      window.i18n.setLang(e.target.value);
      renderApp();
    });
  }

  function setupTabs() {
    var buttons = document.querySelectorAll('.tab-btn');
    var drawerButtons = document.querySelectorAll('.mobile-drawer-btn');
    var toggleBtn = document.getElementById('mobile-nav-toggle');
    var drawer = document.getElementById('mobile-nav-drawer');
    var backdrop = document.getElementById('mobile-nav-backdrop');
    var closeBtn = document.getElementById('mobile-drawer-close');
    var currentLabel = document.getElementById('mobile-nav-current-label');

    function switchTab(target) {
      if (!target) return;
      activeTab = target;

      buttons.forEach(function(b) {
        var isCurrent = b.getAttribute('data-tab') === target;
        b.classList.toggle('active', isCurrent);
        b.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });

      drawerButtons.forEach(function(b) {
        var isCurrent = b.getAttribute('data-tab') === target;
        b.classList.toggle('active', isCurrent);
        b.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });

      document.querySelectorAll('.tab-panel').forEach(function(panel) {
        panel.classList.toggle('active', panel.id === 'panel-' + target);
      });

      if (currentLabel && window.i18n) {
        currentLabel.textContent = window.i18n.t('tab.' + target);
      }
    }

    function openDrawer() {
      if (!drawer || !backdrop) return;
      drawer.classList.add('open');
      backdrop.classList.add('open');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      if (closeBtn) {
        closeBtn.focus();
      }
    }

    function closeDrawer() {
      if (!drawer || !backdrop) return;
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.focus();
      }
      drawer.setAttribute('aria-hidden', 'true');
    }

    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = btn.getAttribute('data-tab');
        switchTab(target);
      });
    });

    drawerButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = btn.getAttribute('data-tab');
        switchTab(target);
        closeDrawer();
      });
    });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        if (drawer && drawer.classList.contains('open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  function renderApp() {
    var t = window.i18n.t;
    var lang = window.i18n.getLang();
    document.documentElement.lang = lang;

    // Document title and meta description
    document.title = t('meta.title');
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t('meta.description'));
    }

    // Static text translations using data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });

    // Inputs and element attributes using data-i18n-attr
    document.querySelectorAll('[data-i18n-attr]').forEach(function(el) {
      var spec = el.getAttribute('data-i18n-attr');
      var pairs = spec.split(';');
      for (var k = 0; k < pairs.length; k++) {
        var pair = pairs[k].trim().split(':');
        if (pair.length === 2) {
          el.setAttribute(pair[0].trim(), t(pair[1].trim()));
        }
      }
    });

    // Update mobile current nav label
    var currentLabel = document.getElementById('mobile-nav-current-label');
    if (currentLabel) {
      currentLabel.textContent = t('tab.' + activeTab);
    }

    renderMaterialSection();
    renderStandardSection();
    renderCompareSection();
    renderJurisdictionsSection();
    renderSymptomSection();
    renderAllergySection();
    renderStudioSection();
  }

  // ─────────────────────────────────────────────────────────────────
  // 1. MATERIAL REFERENCE & TILL RECEIPT (Sections 3 & C)
  // ─────────────────────────────────────────────────────────────────
  function renderMaterialSection() {
    var t = window.i18n.t;
    var container = document.getElementById('materials-list-container');
    var receiptContainer = document.getElementById('till-receipt-container');
    if (!container || !receiptContainer) return;

    // Render Till Receipt Terms Picker
    var receiptHtml = '';
    var terms = window.NickelData.TILL_RECEIPT_TERMS || [];
    receiptHtml += '<div class="receipt-picker-grid">';
    for (var i = 0; i < terms.length; i++) {
      var tm = terms[i];
      receiptHtml += '<div class="receipt-card">' +
        '<div class="receipt-card-header">' +
          '<span class="receipt-icon">🏷️</span>' +
          '<h3 class="receipt-term">' + esc(tm.term) + '</h3>' +
        '</div>' +
        '<div class="receipt-card-body">' +
          '<div class="receipt-row">' +
            '<span class="receipt-label">' + esc(t('receipt.tells')) + '</span>' +
            '<p class="receipt-text">' + esc(tm.tells_you) + '</p>' +
          '</div>' +
          '<div class="receipt-row receipt-row--alert">' +
            '<span class="receipt-label">' + esc(t('receipt.does_not_tell')) + '</span>' +
            '<p class="receipt-text">' + esc(tm.does_not_tell_you) + '</p>' +
          '</div>' +
          '<div class="receipt-row receipt-row--action">' +
            '<span class="receipt-label">' + esc(t('receipt.ask_for')) + '</span>' +
            '<p class="receipt-text"><strong>' + esc(tm.ask_for) + '</strong></p>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    receiptHtml += '</div>';
    receiptContainer.innerHTML = receiptHtml;

    // Filter Materials
    var allMaterials = window.NickelData.MATERIALS || [];
    var q = searchQuery.toLowerCase().trim();

    var filtered = allMaterials.filter(function(m) {
      if (selectedCategory === 'metals' && m.category !== 'metal') return false;
      if (selectedCategory === 'polymers' && m.category !== 'polymer') return false;
      if (q) {
        var matchName = m.name.toLowerCase().indexOf(q) !== -1;
        var matchStd = m.standard.toLowerCase().indexOf(q) !== -1;
        var matchComp = m.composition_fact.toLowerCase().indexOf(q) !== -1;
        return matchName || matchStd || matchComp;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state">' +
        '<p class="empty-state-text">' + esc(t('mat.empty_state')) + '</p>' +
      '</div>';
      return;
    }

    var html = '<div class="material-cards-grid">';
    for (var j = 0; j < filtered.length; j++) {
      var item = filtered[j];
      var compBadgeClass = item.nickel_in_composition === 'no' ? 'badge--safe' : 'badge--neutral';
      var compBadgeLabel = item.nickel_in_composition === 'no' ? t('mat.no') : t('mat.yes');

      var poliHighlightBox = '';
      if (item.is_bioflex) {
        poliHighlightBox = '<div class="bioflex-highlight-banner">' +
          '<div class="bioflex-badge-icon">P</div>' +
          '<div class="bioflex-badge-text">' +
            '<strong>' + esc(t('mat.bioflex_banner.title')) + '</strong> ' +
            esc(t('mat.bioflex_banner.desc')) + ' ' +
            esc(t('mat.bioflex_banner.creator')) + ' ' +
            '<a href="https://poliinternational.com/bioflex/" target="_top">' + esc(t('mat.bioflex_banner.link')) + '</a>' +
          '</div>' +
        '</div>';
      }

      html += '<div class="material-card' + (item.is_bioflex ? ' material-card--bioflex' : '') + '">' +
        '<div class="material-card-header" onclick="window.NickelApp.toggleMaterialCard(this)">' +
          '<div class="material-info-header">' +
            '<h3 class="material-name">' + esc(item.name) + '</h3>' +
            '<span class="material-standard"><code>' + esc(item.standard) + '</code></span>' +
          '</div>' +
          '<div class="material-badge-wrap">' +
            '<span class="badge ' + compBadgeClass + '">' + esc(compBadgeLabel) + '</span>' +
            '<span class="card-chevron">▼</span>' +
          '</div>' +
        '</div>' +
        '<div class="material-card-body">' +
          poliHighlightBox +
          '<div class="material-detail-row">' +
            '<span class="detail-label">' + esc(t('mat.col.composition')) + '</span>' +
            '<p class="detail-text">' + esc(item.composition_fact) + '</p>' +
          '</div>' +
          '<div class="material-detail-row">' +
            '<span class="detail-label">' + esc(t('mat.col.behavior')) + '</span>' +
            '<p class="detail-text">' + esc(item.behavior_explanation) + '</p>' +
          '</div>' +
          '<div class="material-detail-row material-detail-row--doc">' +
            '<span class="detail-label">' + esc(t('mat.col.document')) + '</span>' +
            '<p class="detail-text"><strong>' + esc(item.document_to_request) + '</strong></p>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  function toggleMaterialCard(headerEl) {
    var card = headerEl.closest('.material-card');
    if (!card) return;
    card.classList.toggle('expanded');
  }


  // ─────────────────────────────────────────────────────────────────
  // 2B. MATERIAL COMPARISON MATRIX (Feature 4)
  // ─────────────────────────────────────────────────────────────────
  function renderCompareSection() {
    var t = window.i18n.t;
    var selectA = document.getElementById('compare-select-a');
    var selectB = document.getElementById('compare-select-b');
    var container = document.getElementById('compare-matrix-container');
    if (!selectA || !selectB || !container) return;

    var materials = window.NickelData.MATERIALS || [];
    if (materials.length === 0) return;

    // Validate selections
    var hasA = materials.some(function(m) { return m.id === compareMatA; });
    var hasB = materials.some(function(m) { return m.id === compareMatB; });
    if (!hasA) compareMatA = materials[0].id;
    if (!hasB) compareMatB = materials.length > 1 ? materials[1].id : materials[0].id;

    // Populate dropdowns if not already populated with matching count
    if (!selectA.options || selectA.options.length !== materials.length) {
      selectA.innerHTML = '';
      selectB.innerHTML = '';
      materials.forEach(function(m) {
        var optA = document.createElement('option');
        optA.value = m.id;
        optA.textContent = m.name;
        selectA.appendChild(optA);

        var optB = document.createElement('option');
        optB.value = m.id;
        optB.textContent = m.name;
        selectB.appendChild(optB);
      });

      selectA.addEventListener('change', function(e) {
        compareMatA = e.target.value;
        renderCompareSection();
      });

      selectB.addEventListener('change', function(e) {
        compareMatB = e.target.value;
        renderCompareSection();
      });
    }

    // Refresh option texts for current language
    for (var i = 0; i < materials.length; i++) {
      if (selectA.options[i]) selectA.options[i].textContent = materials[i].name;
      if (selectB.options[i]) selectB.options[i].textContent = materials[i].name;
    }

    selectA.value = compareMatA;
    selectB.value = compareMatB;

    var matA = materials.find(function(m) { return m.id === compareMatA; }) || materials[0];
    var matB = materials.find(function(m) { return m.id === compareMatB; }) || materials[1];

    var props = [
      { key: 'compare.prop.category', valA: matA.category === 'metal' ? t('mat.filter.metals') : t('mat.filter.polymers'), valB: matB.category === 'metal' ? t('mat.filter.metals') : t('mat.filter.polymers') },
      { key: 'compare.prop.standard', valA: '<code>' + esc(matA.standard) + '</code>', valB: '<code>' + esc(matB.standard) + '</code>' },
      { key: 'compare.prop.nickel_presence', valA: matA.nickel_in_composition === 'no' ? '<span class="badge badge--safe">' + esc(t('mat.no')) + '</span>' : '<span class="badge badge--neutral">' + esc(t('mat.yes')) + '</span>', valB: matB.nickel_in_composition === 'no' ? '<span class="badge badge--safe">' + esc(t('mat.no')) + '</span>' : '<span class="badge badge--neutral">' + esc(t('mat.yes')) + '</span>' },
      { key: 'compare.prop.autoclave', valA: esc(matA.autoclave_compatibility), valB: esc(matB.autoclave_compatibility) },
      { key: 'compare.prop.initial', valA: esc(matA.initial_piercing_suitability), valB: esc(matB.initial_piercing_suitability) },
      { key: 'compare.prop.passivation', valA: esc(matA.passivation_barrier), valB: esc(matB.passivation_barrier) },
      { key: 'compare.prop.en1811', valA: esc(matA.en1811_migration_behavior), valB: esc(matB.en1811_migration_behavior) },
      { key: 'compare.prop.document', valA: '<strong>' + esc(matA.document_to_request) + '</strong>', valB: '<strong>' + esc(matB.document_to_request) + '</strong>' }
    ];

    var tableHtml = '<div class="compare-matrix-table-wrap">' +
      '<table class="compare-table">' +
        '<thead>' +
          '<tr>' +
            '<th class="compare-prop-label">' + esc(t('compare.feature')) + '</th>' +
            '<th class="compare-val-col">' + esc(matA.name) + '</th>' +
            '<th class="compare-val-col">' + esc(matB.name) + '</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>';

    props.forEach(function(p) {
      tableHtml += '<tr>' +
        '<td class="compare-prop-label">' + esc(t(p.key)) + '</td>' +
        '<td class="compare-val-col">' + p.valA + '</td>' +
        '<td class="compare-val-col">' + p.valB + '</td>' +
      '</tr>';
    });

    tableHtml += '</tbody></table></div>';
    container.innerHTML = tableHtml;
  }

  // ─────────────────────────────────────────────────────────────────
  // 2C. GLOBAL NICKEL REGULATIONS (Feature 5)
  // ─────────────────────────────────────────────────────────────────
  function renderJurisdictionsSection() {
    var t = window.i18n.t;
    var container = document.getElementById('jurisdictions-container');
    if (!container) return;

    var jurisdictions = window.NickelData.JURISDICTIONS || [];
    var html = '<div class="jurisdictions-grid">';

    jurisdictions.forEach(function(j) {
      html += '<div class="jur-card">' +
        '<div class="jur-card-header">' +
          '<h3 class="jur-card-title">' + esc(j.region) + '</h3>' +
          '<span class="jur-standard-code">' + esc(j.standard) + '</span>' +
        '</div>' +
        '<div class="jur-card-body">' +
          '<div class="jur-row">' +
            '<span class="jur-label">' + esc(t('jur.col.piercing')) + '</span>' +
            '<span class="jur-value jur-badge-limit">' + esc(j.piercing_limit) + '</span>' +
          '</div>' +
          '<div class="jur-row">' +
            '<span class="jur-label">' + esc(t('jur.col.contact')) + '</span>' +
            '<span class="jur-value jur-badge-limit">' + esc(j.contact_limit) + '</span>' +
          '</div>' +
          '<div class="jur-row">' +
            '<span class="jur-label">' + esc(t('jur.col.coated')) + '</span>' +
            '<span class="jur-value">' + esc(j.coated_rule) + '</span>' +
          '</div>' +
          '<div class="jur-row">' +
            '<span class="jur-label">' + esc(t('jur.col.method')) + '</span>' +
            '<span class="jur-value">' + esc(j.test_method) + '</span>' +
          '</div>' +
          '<div class="jur-row">' +
            '<span class="jur-label">' + esc(t('jur.col.philosophy')) + '</span>' +
            '<span class="jur-value">' + esc(j.philosophy) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. THE STANDARD & LIMITS (Sections 1, 2, 4, D, E)
  // ─────────────────────────────────────────────────────────────────
  var stdSearchQuery = '';

  function renderStandardsSearch() {
    var container = document.getElementById('standards-search-card');
    if (!container) return;

    var inputEl = document.getElementById('std-search-input');
    var clearBtn = document.getElementById('std-search-clear');
    var infoEl = document.getElementById('std-search-info');
    var quickLinksEl = document.getElementById('std-search-quick-links');
    if (!quickLinksEl) return;

    var sections = [
      { id: 'sec-legal-limits', labelKey: 'std.search.sec_limits' },
      { id: 'sec-worked-examples', labelKey: 'std.search.sec_examples' },
      { id: 'sec-how-it-operates', labelKey: 'std.search.sec_how' },
      { id: 'sec-regulatory-changelog', labelKey: 'std.search.sec_changelog' },
      { id: 'sec-outdated-reports', labelKey: 'std.search.sec_outdated' },
      { id: 'sec-dmg-test', labelKey: 'std.search.sec_dmg' },
      { id: 'sec-factors-release', labelKey: 'std.search.sec_factors' }
    ];

    if (inputEl && !inputEl._bound) {
      inputEl._bound = true;
      inputEl.addEventListener('input', function(e) {
        stdSearchQuery = (e.target.value || '').trim();
        updateStandardsSearch();
      });
    }

    if (clearBtn && !clearBtn._bound) {
      clearBtn._bound = true;
      clearBtn.addEventListener('click', function() {
        if (inputEl) {
          inputEl.value = '';
          stdSearchQuery = '';
          updateStandardsSearch();
          inputEl.focus();
        }
      });
    }

    var qlHtml = '';
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      qlHtml += '<button type="button" class="std-jump-btn" data-target="' + esc(s.id) + '">' +
        '<span class="std-jump-text">' + esc(t(s.labelKey)) + '</span>' +
        '<span class="std-jump-badge" id="std-badge-' + esc(s.id) + '" hidden>0</span>' +
        '</button>';
    }
    quickLinksEl.innerHTML = qlHtml;

    var jumpBtns = quickLinksEl.querySelectorAll('.std-jump-btn');
    jumpBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetId = btn.getAttribute('data-target');
        var targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetEl.classList.remove('section-flash-highlight');
          void targetEl.offsetWidth;
          targetEl.classList.add('section-flash-highlight');
          setTimeout(function() {
            targetEl.classList.remove('section-flash-highlight');
          }, 2000);
        }
      });
    });

    updateStandardsSearch();
  }

  function updateStandardsSearch() {
    var clearBtn = document.getElementById('std-search-clear');
    var infoEl = document.getElementById('std-search-info');
    if (!infoEl) return;

    var sections = [
      { id: 'sec-legal-limits', labelKey: 'std.search.sec_limits' },
      { id: 'sec-worked-examples', labelKey: 'std.search.sec_examples' },
      { id: 'sec-how-it-operates', labelKey: 'std.search.sec_how' },
      { id: 'sec-regulatory-changelog', labelKey: 'std.search.sec_changelog' },
      { id: 'sec-outdated-reports', labelKey: 'std.search.sec_outdated' },
      { id: 'sec-dmg-test', labelKey: 'std.search.sec_dmg' },
      { id: 'sec-factors-release', labelKey: 'std.search.sec_factors' }
    ];

    var q = stdSearchQuery.toLowerCase();

    if (!q) {
      if (clearBtn) clearBtn.setAttribute('hidden', '');
      infoEl.textContent = '';
      for (var i = 0; i < sections.length; i++) {
        var secEl = document.getElementById(sections[i].id);
        if (secEl) {
          secEl.style.opacity = '';
        }
        var badge = document.getElementById('std-badge-' + sections[i].id);
        if (badge) {
          badge.setAttribute('hidden', '');
          badge.textContent = '0';
        }
      }
      return;
    }

    if (clearBtn) clearBtn.removeAttribute('hidden');

    var totalMatches = 0;
    var matchingSections = 0;

    for (var j = 0; j < sections.length; j++) {
      var sId = sections[j].id;
      var el = document.getElementById(sId);
      var bEl = document.getElementById('std-badge-' + sId);
      if (!el) continue;

      var text = (el.textContent || '').toLowerCase();
      var count = 0;
      var pos = 0;
      while ((pos = text.indexOf(q, pos)) !== -1) {
        count++;
        pos += q.length;
      }

      if (count > 0) {
        totalMatches += count;
        matchingSections++;
        el.style.opacity = '1';
        if (bEl) {
          bEl.textContent = String(count);
          bEl.removeAttribute('hidden');
        }
      } else {
        el.style.opacity = '0.55';
        if (bEl) {
          bEl.setAttribute('hidden', '');
          bEl.textContent = '0';
        }
      }
    }

    if (totalMatches > 0) {
      infoEl.textContent = t('std.search.results', { count: totalMatches, secCount: matchingSections });
    } else {
      infoEl.textContent = t('std.search.no_results', { query: stdSearchQuery });
    }
  }

  function renderStandardSection() {
    renderStandardsSearch();

    var examplesContainer = document.getElementById('worked-examples-container');
    if (!examplesContainer) return;

    var examples = window.NickelData.WORKED_EXAMPLES || [];
    var html = '<div class="examples-grid">';
    for (var i = 0; i < examples.length; i++) {
      var ex = examples[i];
      html += '<div class="example-card">' +
        '<div class="example-card-header">' +
          '<span class="example-badge">' + esc(ex.limit) + '</span>' +
          '<h3 class="example-title">' + esc(ex.item) + '</h3>' +
        '</div>' +
        '<div class="example-card-body">' +
          '<div class="example-clause"><strong>' + esc(t('std.citation_label')) + '</strong> ' + esc(ex.clause) + '</div>' +
          '<blockquote class="example-quote">' + esc(ex.wording) + '</blockquote>' +
          '<p class="example-explanation">' + esc(ex.explanation) + '</p>' +
        '</div>' +
      '</div>';
    }
    html += '</div>';
    examplesContainer.innerHTML = html;
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. SYMPTOM ROUTE (Section B)
  // ─────────────────────────────────────────────────────────────────
  function renderSymptomSection() {
    var tableBody = document.getElementById('symptom-table-body');
    if (!tableBody) return;

    var data = window.NickelData.SYMPTOM_COMPARISON || [];
    var html = '';
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      html += '<tr>' +
        '<td class="sym-col-feature"><strong>' + esc(row.feature) + '</strong></td>' +
        '<td class="sym-col-healing" data-col-label="' + esc(t('sym.col.healing')) + '">' + esc(row.healing) + '</td>' +
        '<td class="sym-col-allergy" data-col-label="' + esc(t('sym.col.allergy')) + '">' + esc(row.allergy) + '</td>' +
        '<td class="sym-col-infection" data-col-label="' + esc(t('sym.col.infection')) + '">' + esc(row.infection) + '</td>' +
      '</tr>';
    }
    tableBody.innerHTML = html;
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. NICKEL ALLERGIES (Section 6)
  // ─────────────────────────────────────────────────────────────────
  function renderAllergySection() {
    // Allergy cards are rendered through data-i18n
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. STUDIO JEWELLERY FILE & SUPPLIER REQUEST (Sections 5, F, G)
  // ─────────────────────────────────────────────────────────────────
  var STORAGE_KEY_STUDIO_RECORD = 'studio_compliance_data';

  function saveStudioData() {
    try {
      var studioName = (document.getElementById('studio-input-name') && document.getElementById('studio-input-name').value) || '';
      var articleRef = (document.getElementById('studio-input-article') && document.getElementById('studio-input-article').value) || '';
      var supplier = (document.getElementById('studio-input-supplier') && document.getElementById('studio-input-supplier').value) || '';
      var material = (document.getElementById('studio-input-material') && document.getElementById('studio-input-material').value) || '';

      var chk1 = document.getElementById('chk-item-1');
      var chk2 = document.getElementById('chk-item-2');
      var chk3 = document.getElementById('chk-item-3');
      var chk4 = document.getElementById('chk-item-4');
      var chk5 = document.getElementById('chk-item-5');

      var data = {
        studioName: studioName,
        articleSku: articleRef,
        supplierName: supplier,
        materialSpecification: material,
        checklist: {
          item1: Boolean(chk1 && chk1.checked),
          item2: Boolean(chk2 && chk2.checked),
          item3: Boolean(chk3 && chk3.checked),
          item4: Boolean(chk4 && chk4.checked),
          item5: Boolean(chk5 && chk5.checked)
        }
      };

      localStorage.setItem(STORAGE_KEY_STUDIO_RECORD, JSON.stringify(data));
    } catch (e) {
      // LocalStorage might be disabled or full; silently fail without crashing
    }
  }

  function loadStudioData() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY_STUDIO_RECORD);
      if (!saved) return;
      var data = JSON.parse(saved);
      if (!data || typeof data !== 'object') return;

      var nameEl = document.getElementById('studio-input-name');
      var artEl = document.getElementById('studio-input-article');
      var suppEl = document.getElementById('studio-input-supplier');
      var matEl = document.getElementById('studio-input-material');

      if (nameEl && data.studioName !== undefined) nameEl.value = data.studioName;
      if (artEl && data.articleSku !== undefined) artEl.value = data.articleSku;
      if (suppEl && data.supplierName !== undefined) suppEl.value = data.supplierName;
      if (matEl && data.materialSpecification !== undefined) matEl.value = data.materialSpecification;

      if (data.checklist && typeof data.checklist === 'object') {
        var chk1 = document.getElementById('chk-item-1');
        var chk2 = document.getElementById('chk-item-2');
        var chk3 = document.getElementById('chk-item-3');
        var chk4 = document.getElementById('chk-item-4');
        var chk5 = document.getElementById('chk-item-5');

        if (chk1 && data.checklist.item1 !== undefined) chk1.checked = Boolean(data.checklist.item1);
        if (chk2 && data.checklist.item2 !== undefined) chk2.checked = Boolean(data.checklist.item2);
        if (chk3 && data.checklist.item3 !== undefined) chk3.checked = Boolean(data.checklist.item3);
        if (chk4 && data.checklist.item4 !== undefined) chk4.checked = Boolean(data.checklist.item4);
        if (chk5 && data.checklist.item5 !== undefined) chk5.checked = Boolean(data.checklist.item5);
      }
    } catch (e) {
      // Ignore parse errors from corrupted localStorage
    }
  }

  function renderStudioSection() {
    // Bind print button
    var printBtn = document.getElementById('studio-print-btn');
    if (printBtn && !printBtn._bound) {
      printBtn._bound = true;
      printBtn.addEventListener('click', handleStudioPrint);
    }

    // Bind export JSON button
    var exportJsonBtn = document.getElementById('studio-export-json-btn');
    if (exportJsonBtn && !exportJsonBtn._bound) {
      exportJsonBtn._bound = true;
      exportJsonBtn.addEventListener('click', handleStudioExportJson);
    }

    // Bind copy supplier request button
    var copyBtn = document.getElementById('supplier-copy-btn');
    if (copyBtn && !copyBtn._bound) {
      copyBtn._bound = true;
      copyBtn.addEventListener('click', handleSupplierCopy);
    }

    // Bind auto-save listeners on text inputs
    var inputIds = [
      'studio-input-name',
      'studio-input-article',
      'studio-input-supplier',
      'studio-input-material'
    ];
    for (var i = 0; i < inputIds.length; i++) {
      var inputEl = document.getElementById(inputIds[i]);
      if (inputEl && !inputEl._autoSaveBound) {
        inputEl._autoSaveBound = true;
        inputEl.addEventListener('input', saveStudioData);
      }
    }

    // Bind auto-save listeners on checkboxes
    var checkIds = [
      'chk-item-1',
      'chk-item-2',
      'chk-item-3',
      'chk-item-4',
      'chk-item-5'
    ];
    for (var j = 0; j < checkIds.length; j++) {
      var checkEl = document.getElementById(checkIds[j]);
      if (checkEl && !checkEl._autoSaveBound) {
        checkEl._autoSaveBound = true;
        checkEl.addEventListener('change', saveStudioData);
      }
    }
  }

  function handleStudioPrint() {
    var t = window.i18n.t;
    var studioName = (document.getElementById('studio-input-name').value || '').trim();
    var articleRef = (document.getElementById('studio-input-article').value || '').trim();
    var supplier = (document.getElementById('studio-input-supplier').value || '').trim();
    var material = (document.getElementById('studio-input-material').value || '').trim();

    var errEl = document.getElementById('studio-validation-error');
    if (!articleRef) {
      errEl.textContent = t('studio.validation.sku_required');
      errEl.removeAttribute('hidden');
      return;
    }
    errEl.setAttribute('hidden', '');

    // Update print preview text
    document.getElementById('print-val-studio').textContent = studioName || '—';
    document.getElementById('print-val-article').textContent = articleRef;
    document.getElementById('print-val-supplier').textContent = supplier || '—';
    document.getElementById('print-val-material').textContent = material || '—';

    // Update print checklist boxes and verification status tags
    for (var k = 1; k <= 5; k++) {
      var chk = document.getElementById('chk-item-' + k);
      var boxEl = document.getElementById('print-box-' + k);
      var statusEl = document.getElementById('print-status-' + k);
      var isChecked = Boolean(chk && chk.checked);

      if (boxEl) {
        boxEl.textContent = isChecked ? '✓' : '';
        boxEl.classList.toggle('verified', isChecked);
      }
      if (statusEl) {
        statusEl.textContent = isChecked ? t('studio.print.verified_status') : t('studio.print.pending_status');
        statusEl.classList.toggle('verified', isChecked);
      }
    }

    // Local calendar date (Never UTC to avoid date bug in Asia/Australia, Hard Ban 19)
    var today = new Date();
    var localDateStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
    document.getElementById('print-val-date').textContent = localDateStr;

    // Activate print-record-only class so only the isolated studio sheet prints
    document.body.classList.add('print-record-only');
    window.print();

    var cleanupPrint = function() {
      document.body.classList.remove('print-record-only');
      window.removeEventListener('afterprint', cleanupPrint);
    };
    window.addEventListener('afterprint', cleanupPrint);
    setTimeout(cleanupPrint, 1000);
  }

  function handleStudioExportJson() {
    var t = window.i18n.t;
    var studioName = (document.getElementById('studio-input-name').value || '').trim();
    var articleRef = (document.getElementById('studio-input-article').value || '').trim();
    var supplier = (document.getElementById('studio-input-supplier').value || '').trim();
    var material = (document.getElementById('studio-input-material').value || '').trim();

    var errEl = document.getElementById('studio-validation-error');
    var successEl = document.getElementById('studio-json-success-msg');
    if (successEl) successEl.setAttribute('hidden', '');

    if (!articleRef) {
      errEl.textContent = t('studio.validation.sku_required');
      errEl.removeAttribute('hidden');
      return;
    }
    errEl.setAttribute('hidden', '');

    // Local calendar date (Never UTC, Hard Ban 19)
    var today = new Date();
    var localDateStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');

    var chk1 = document.getElementById('chk-item-1');
    var chk2 = document.getElementById('chk-item-2');
    var chk3 = document.getElementById('chk-item-3');
    var chk4 = document.getElementById('chk-item-4');
    var chk5 = document.getElementById('chk-item-5');

    var exportData = {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "recordType": "StudioJewelryComplianceRecord",
      "standardReferences": [
        "Regulation (EC) No 1907/2006 (REACH) Annex XVII Entry 27",
        "EN 1811:2023",
        "EN 12472:2020"
      ],
      "exportDate": localDateStr,
      "studio": {
        "studioName": studioName || "",
        "articleSku": articleRef,
        "supplierName": supplier || "",
        "materialSpecification": material || ""
      },
      "auditChecklist": [
        {
          "id": "en1811_2023_accredited_lab",
          "requirement": "EN 1811:2023 test report issued by an accredited laboratory (ISO/IEC 17025 accredited)",
          "verified": Boolean(chk1 && chk1.checked)
        },
        {
          "id": "batch_sku_match",
          "requirement": "Exact article code / batch number on test report matches stock SKU",
          "verified": Boolean(chk2 && chk2.checked)
        },
        {
          "id": "numerical_threshold_pass",
          "requirement": "Stated numerical release rate is strictly below 0.2 µg/cm²/week for piercing jewelry (or below 0.5 µg/cm²/week for skin contact)",
          "verified": Boolean(chk3 && chk3.checked)
        },
        {
          "id": "en12472_wear_simulation",
          "requirement": "For coated articles: Report confirms EN 12472 wear simulation was conducted prior to EN 1811 testing",
          "verified": Boolean(chk4 && chk4.checked)
        },
        {
          "id": "mill_test_certificate",
          "requirement": "Raw material mill test certificate verifying alloy standard",
          "verified": Boolean(chk5 && chk5.checked)
        }
      ],
      "disclaimer": "Studio Jewelry Compliance Record — Export of user-entered studio compliance data. Not an official regulatory certificate."
    };

    var jsonStr = JSON.stringify(exportData, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var sanitizedSku = articleRef.replace(/[^a-zA-Z0-9_-]/g, '_');
    a.href = url;
    a.download = 'studio-compliance-' + sanitizedSku + '-' + localDateStr + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() {
      URL.revokeObjectURL(url);
    }, 1000);

    if (successEl) {
      successEl.removeAttribute('hidden');
      setTimeout(function() {
        successEl.setAttribute('hidden', '');
      }, 3500);
    }
  }

  function handleSupplierCopy() {
    var t = window.i18n.t;
    var supplierSelect = document.getElementById('supplier-select-type');
    var inquiryType = supplierSelect ? supplierSelect.value : 'initial_test';
    var supplierName = (document.getElementById('supplier-input-name').value || '').trim();
    var itemDesc = (document.getElementById('supplier-input-items').value || '').trim();
    var msgEl = document.getElementById('supplier-copy-msg');

    var defaultSupplier = t('supplier.letter.default_supplier');
    var defaultItems = t('supplier.letter.default_items');

    var p2Text = t('supplier.letter.p2');
    var itemsList = [];

    if (inquiryType === 'initial_test') {
      itemsList = [
        t('supplier.letter.item1'),
        t('supplier.letter.item2'),
        t('supplier.letter.item3')
      ];
    } else if (inquiryType === 'coated_wear') {
      itemsList = [
        t('supplier.letter.item1'),
        t('supplier.letter.item4'),
        t('supplier.letter.item3')
      ];
    } else if (inquiryType === 'mill_cert') {
      itemsList = [
        t('supplier.letter.item5'),
        t('supplier.letter.item2')
      ];
    } else if (inquiryType === 'biocompat') {
      itemsList = [
        t('supplier.letter.item1'),
        t('supplier.letter.item5')
      ];
    } else {
      itemsList = [
        t('supplier.letter.item1'),
        t('supplier.letter.item2'),
        t('supplier.letter.item3'),
        t('supplier.letter.item4'),
        t('supplier.letter.item5')
      ];
    }

    var text = t('supplier.letter.subject') + '\n\n' +
      t('supplier.letter.to') + ' ' + (supplierName || defaultSupplier) + '\n' +
      t('supplier.letter.regarding') + ' ' + (itemDesc || defaultItems) + '\n\n' +
      t('supplier.letter.salutation') + '\n\n' +
      t('supplier.letter.p1') + '\n\n' +
      p2Text + '\n\n' +
      itemsList.join('\n') + '\n\n' +
      t('supplier.letter.thanks') + '\n\n' +
      t('supplier.letter.closing') + '\n' +
      t('supplier.letter.signoff');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        msgEl.textContent = t('supplier.copied');
        msgEl.removeAttribute('hidden');
        setTimeout(function() { msgEl.setAttribute('hidden', ''); }, 4000);
      });
    } else {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      msgEl.textContent = t('supplier.copied');
      msgEl.removeAttribute('hidden');
      setTimeout(function() { msgEl.setAttribute('hidden', ''); }, 4000);
    }
  }

  // Bind Search & Filter
  document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('mat-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        searchQuery = e.target.value;
        renderMaterialSection();
      });
    }

    var filterBtns = document.querySelectorAll('.filter-chip');
    filterBtns.forEach(function(chip) {
      chip.addEventListener('click', function() {
        var cat = chip.getAttribute('data-cat');
        if (!cat) return;
        selectedCategory = cat;
        filterBtns.forEach(function(c) {
          c.classList.toggle('active', c.getAttribute('data-cat') === cat);
        });

        var receiptSec = document.getElementById('till-receipt-wrapper');
        var materialsSec = document.getElementById('materials-list-wrapper');
        if (receiptSec && materialsSec) {
          if (cat === 'receipt') {
            receiptSec.removeAttribute('hidden');
            materialsSec.setAttribute('hidden', '');
          } else {
            receiptSec.setAttribute('hidden', '');
            materialsSec.removeAttribute('hidden');
          }
        }

        renderMaterialSection();
      });
    });

    init();
  });

  window.NickelApp = {
    init: init,
    renderApp: renderApp,
    toggleMaterialCard: toggleMaterialCard
  };
})();
