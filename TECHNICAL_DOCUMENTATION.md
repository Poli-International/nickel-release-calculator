# Nickel Release Calculator, EN 1811 - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Schemas](#data-schemas)
3. [Calculation / Logic Algorithms](#calculation--logic-algorithms)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Customization](#customization)
7. [Performance](#performance)
8. [Browser Compatibility](#browser-compatibility)
9. [Security](#security)
10. [Version History](#version-history)
11. [Support / Contact](#support--contact)

## Architecture Overview

### Technology Stack

- **HTML5**, Semantic markup with ARIA roles for accessibility
- **CSS3**, Single stylesheet (`css/style.css`) with custom properties for theming
- **Vanilla JavaScript (ES6)**, No frameworks, libraries, or external dependencies
- **Static files**, No server-side processing, no build tools, no package managers

### File Structure

```
nickel-release-calculator/
├── index.html          # Main tool page (HTML + inline meta/OG tags)
├── css/
│   └── style.css       # All visual styling
└── js/
    ├── nickel-data.js  # Material database, constants, search index, estimation logic
    └── app.js          # UI logic: tab switching, event handlers, DOM rendering
```

### Component / Logic Breakdown

| Component | File | Responsibility |
|-----------|------|----------------|
| **Material Database** | `nickel-data.js` | Defines 15 materials with nickel content, release rates, compliance status |
| **Search Index** | `nickel-data.js` | Normalizes names and builds a flat index for O(n) lookups |
| **Release Estimator** | `nickel-data.js` | `estimateReleaseFromNickelPct()`, empirical model from nickel content % |
| **Tab System** | `app.js` | Switches between "Material Lookup" and "Custom Calculator" panels |
| **Lookup Handler** | `app.js` | `runLookup()`, queries the material database and renders results |
| **Calculator Handler** | `app.js` | `runCalculator()`, validates inputs, computes release, renders gauges |
| **Compliance Logic** | `app.js` | `getComplianceStatus()`, classifies release against 0.2 / 0.5 limits |
| **Gauge Builder** | `app.js` | `buildGaugeBar()`, renders visual bar with limit marker |
| **Accordion** | `app.js` | `toggleCard()`, expand/collapse material detail cards |
| **XSS Protection** | `app.js` | `escHtml()`, sanitizes all user-supplied strings before DOM insertion |

## Data Schemas

### Constants (defined in `nickel-data.js`)

```javascript
NICKEL_STANDARD = 'EN 1811:2011+A1:2015'
NICKEL_LIMIT_PIERCING = 0.2   // µg/cm²/week, piercing jewelry
NICKEL_LIMIT_CONTACT  = 0.5   // µg/cm²/week, other prolonged skin contact
```

### Material Object (`NICKEL_MATERIALS` array)

Each entry in the 15-element array follows this schema:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | yes | Unique identifier | `'bioflex'` |
| `name` | string | yes | Short display name | `'BioFlex® (PP-R)'` |
| `full_name` | string | yes | Full descriptive name | `'BioFlex® Medical-Grade Polypropylene Random Copolymer'` |
| `category` | string | yes | Material class | `'polymer'`, `'metal'` |
| `nickel_pct` | number or null | yes | Typical nickel content by mass | `0`, `13.5`, `null` |
| `release_rate` | number or null | yes | Estimated µg/cm²/week | `0`, `0.08`, `4.5`, `null` |
| `release_note` | string | yes | Context for release behavior | `'No metal content...'` |
| `compliance` | string | yes | Compliance classification | `'safe'`, `'borderline'`, `'non_compliant'`, `'variable'`, `'na'` |
| `poli_highlight` | boolean | yes | Show Poli International promo box | `true`, `false` |
| `manufacturer` | string or null | yes | Manufacturer name | `'Poli International'`, `null` |
| `iso_reference` | string or null | yes | Relevant standard | `'ASTM F136, ISO 5832-3'`, `null` |
| `also_known_as` | array of strings | yes | Alternative names | `['BioFlex retainer', 'PP-R bar']` |
| `poli_url` | string or null | yes | Product page link | `'https://poliinternational.com/bioflex/'`, `null` |

### Compliance Configuration (`COMPLIANCE_CONFIG`)

```javascript
{
  safe:          { label: 'Compliant',     cls: 'safe',          icon: '✅' },
  borderline:    { label: 'Borderline',    cls: 'borderline',    icon: '⚠️' },
  non_compliant: { label: 'Non-Compliant', cls: 'non_compliant', icon: '🚫' },
  variable:      { label: 'Unverified',    cls: 'variable',      icon: '🔍' },
  na:            { label: 'N/A',           cls: 'na',            icon: ', '  },
}
```

### Search Index Entry

```javascript
{ key: 'bioflexppr', entry: <material_object> }
```

## Calculation / Logic Algorithms

### `findNickelMaterial(query)`

**Location:** `nickel-data.js`

**Purpose:** Search the material database by name or alias.

**Algorithm:**
1. Normalize the query string: lowercase, remove `®`, `™`, spaces, hyphens, underscores, slashes, parentheses
2. Search for exact match in the pre-built `NICKEL_INDEX`
3. If no exact match and query length >= 3, search for partial match (index entry includes normalized query)
4. Return the first matching material object, or `null`

### `estimateReleaseFromNickelPct(nickelPct, surfaceFinish)`

**Location:** `nickel-data.js`

**Purpose:** Estimate nickel release rate from known nickel content percentage.

**Algorithm (empirical model calibrated against EN 1811 literature):**

1. If `nickelPct <= 0`, return `0`
2. Calculate base release rate using piecewise linear function:

| Nickel Content Range | Base Rate Formula |
|---------------------|-------------------|
| 0% < Ni < 2% | `base = nickelPct * 0.008` |
| 2% ≤ Ni < 8% | `base = 0.016 + (nickelPct - 2) * 0.02` |
| 8% ≤ Ni < 15% | `base = 0.136 + (nickelPct - 8) * 0.04` |
| Ni ≥ 15% | `base = 0.416 + (nickelPct - 15) * 0.06` |

3. Apply surface finish multiplier:

| Finish | Multiplier |
|--------|------------|
| `polished` | 0.7 |
| `standard` | 1.0 |
| `brushed` | 1.4 |
| `rough` | 2.2 |
| `scratched` | 3.5 |

4. Return `Math.round(base * multiplier * 100) / 100`

### `getComplianceStatus(release, limit)`

**Location:** `app.js`

**Purpose:** Classify a release rate against a given limit.

**Algorithm:**
- If `release === 0`: return `'safe'`
- If `release <= limit * 0.7`: return `'safe'`
- If `release <= limit`: return `'borderline'`
- Otherwise: return `'non_compliant'`

### `buildGaugeBar(release, limit)`

**Location:** `app.js`

**Purpose:** Render a visual gauge bar showing release relative to limit.

**Algorithm:**
1. Calculate fill percentage: `Math.min((release / (limit * 2)) * 100, 100)`
2. Calculate limit marker position: `Math.min((limit / (limit * 2)) * 100, 100)`
3. Determine color: green if `release <= limit * 0.7`, yellow if `release <= limit`, red otherwise
4. Return HTML string with track, fill bar, and limit marker

## API Reference

### Public Functions

#### `findNickelMaterial(query)`
- **Location:** `nickel-data.js`
- **Parameters:** `query` (string), material name or alias
- **Returns:** Material object or `null`
- **Behavior:** Searches the 15-material database by exact or partial match

#### `estimateReleaseFromNickelPct(nickelPct, surfaceFinish)`
- **Location:** `nickel-data.js`
- **Parameters:**
  - `nickelPct` (number, 0–100), nickel content percentage
  - `surfaceFinish` (string), one of `'polished'`, `'standard'`, `'brushed'`, `'rough'`, `'scratched'`
- **Returns:** Number (µg/cm²/week, rounded to 2 decimals)
- **Behavior:** Applies piecewise linear model with surface finish multiplier

#### `getComplianceStatus(release, limit)`
- **Location:** `app.js`
- **Parameters:**
  - `release` (number), estimated release rate
  - `limit` (number), regulatory limit (0.2 or 0.5)
- **Returns:** String, `'safe'`, `'borderline'`, or `'non_compliant'`

#### `escHtml(s)`
- **Location:** `app.js`
- **Parameters:** `s` (any), string to sanitize
- **Returns:** Sanitized string with `&`, `<`, `>`, `"` escaped
- **Behavior:** Used before inserting any user-supplied text into the DOM

### Event Handlers

#### `runLookup()`
- **Trigger:** Click on "Look Up" button or Enter key in lookup input
- **Behavior:** Reads `lookup-input` value, calls `findNickelMaterial()`, renders result card or "not found" message

#### `runCalculator()`
- **Trigger:** Click on "Calculate" button
- **Behavior:** Reads `calc-nickel-pct`, `calc-surface`, `calc-area` values, validates input (0–100%), calls `estimateReleaseFromNickelPct()`, renders result card with gauges and recommendations

#### `toggleCard(headerEl)`
- **Trigger:** Click or Enter key on material card header
- **Behavior:** Toggles `.expanded` class on parent `.result-card`, updates `aria-expanded` attribute

### Tab Switching

- **Trigger:** Click on `.tab-btn` elements
- **Behavior:** Toggles `.active` class on buttons and panels, updates `aria-selected` attributes

## Integration Guide

### Standalone Embedding

The tool is fully self-contained static HTML/CSS/JavaScript. To embed:

```html
<!-- Option 1: Direct link -->
<a href="https://poliinternational.com/tools/nickel-release-calculator/">
  Check EN 1811 Nickel Release
</a>

<!-- Option 2: Iframe embed -->
<iframe
  src="https://poliinternational.com/tools/nickel-release-calculator/"
  width="100%"
  height="800"
  frameborder="0"
  title="Nickel Release Calculator"
  loading="lazy"
></iframe>
```

### Iframe Communication

The tool detects if it is loaded in an iframe (`window.self !== window.top`) and listens for theme messages:

```javascript
// Parent page can send theme preference
iframe.contentWindow.postMessage({
  type: 'poli-theme',
  light: true   // or false for dark
}, '*');
```

### Dependencies

- **Zero external dependencies**, No jQuery, React, Bootstrap, or CDN resources
- All CSS and JavaScript is self-hosted on the Poli International server

## Customization

### Theming

The tool uses CSS custom properties (defined in `style.css`). When embedded in an iframe, the parent page can control light/dark theme via postMessage. The tool defaults to dark theme when iframed.

### Material Database

To add or modify materials, edit the `NICKEL_MATERIALS` array in `nickel-data.js`. Each entry must follow the schema documented above. After changes, rebuild the search index by refreshing the page (the `NICKEL_INDEX` is built at load time via an IIFE).

### Surface Finish Options

The surface finish multiplier map in `estimateReleaseFromNickelPct()` can be extended by adding entries to the `finishMult` object. Valid keys are any string; the UI dropdown in `index.html` must be updated to match.

## Performance

- **Bundle size:** ~15 KB total (HTML + CSS + JS)
- **No network requests:** All data is embedded in the JavaScript file
- **DOM operations:** Minimal, only re-renders the results container on user action
- **Search complexity:** O(n) where n = number of index entries (approximately 40)
- **No animations or transitions** that could cause layout thrashing

## Browser Compatibility

The tool uses standard ES6 features and CSS3:

| Feature | Minimum Version |
|---------|----------------|
| `const` / `let` | IE 11+ (not supported), Edge 12+, Chrome 49+, Firefox 44+, Safari 10+ |
| `Arrow functions` | Chrome 45+, Firefox 22+, Safari 10+, Edge 12+ |
| `Template literals` | Chrome 41+, Firefox 34+, Safari 9+, Edge 12+ |
| `CSS custom properties` | Chrome 49+, Firefox 31+, Safari 9.1+, Edge 15+ |
| `Array.find()` | Chrome 45+, Firefox 25+, Safari 7.1+, Edge 12+ |
| `Array.includes()` | Chrome 47+, Firefox 43+, Safari 9+, Edge 14+ |

**Note:** Internet Explorer is not supported due to lack of ES6 support.

## Security

### XSS Prevention

All user-supplied strings are sanitized through the `escHtml()` function before DOM insertion:

```javascript
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

This function is called on:
- Search query text in "not found" messages
- User input values displayed in calculator results (nickel percentage, surface area, surface finish)
- Material names and descriptions from the database

### Input Validation

- Calculator nickel content: validated as number between 0 and 100
- Surface area: validated as positive number (optional)
- Search query: no validation beyond trimming whitespace (safe due to XSS escaping)

### Content Security

- The tool includes `<meta name="robots" content="noindex, nofollow">` to prevent search engine indexing of the tool page itself
- All links to external resources use `rel="noopener noreferrer"` for security

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026 | Initial release |

## Support / Contact

For questions about the Nickel Release Calculator or EN 1811 compliance:

- **Email:** support@poliinternational.com
- **Website:** https://poliinternational.com
- **Product page:** https://poliinternational.com/bioflex/

---

**Documentation maintained by:** Poli International Technical Writing Team  
**Last updated:** 2026
