---
title: Typography Standards
impact: MEDIUM
tags: typography, opentype, font-rendering, text-layout
---

## Numeric Formatting

### type-tabular-nums -- Use tabular-nums for data

Use `tabular-nums` for numeric data that must align in columns. Proportional numerals have varying widths per digit, causing columns to misalign.

```css
/* ❌ Proportional numerals — misaligned */
.price { font-variant-numeric: proportional-nums; }

/* ✅ Tabular numerals — aligned */
.price { font-variant-numeric: tabular-nums; }
```

**When to apply**: Prices, data tables, counters, timers, dashboard figures — anywhere numbers must align vertically.

---

### type-oldstyle-nums -- Use oldstyle-nums for body text

Use `oldstyle-nums` in body text so numerals blend with lowercase letters. Use `lining-nums` for tables and headings.

```css
/* ✅ Body text — oldstyle */
.body-text { font-variant-numeric: oldstyle-nums; }

/* ✅ Data — lining + tabular */
.data-table { font-variant-numeric: lining-nums tabular-nums; }
```

**When to apply**: Editorial content, blog body text, and other prose. Use lining-nums for data-driven UI.

---

### type-slashed-zero -- Use slashed-zero for code UI

Enable `slashed-zero` in code-related UI to distinguish 0 from O.

```css
.code { font-variant-numeric: slashed-zero; }
```

**When to apply**: Code displays, serial numbers, ID fields — any UI where confusing 0 and O is critical.

---

### type-proper-fractions -- Typographic fractions

Use `diagonal-fractions` to render 1/2, 1/3 as proper typographic fractions.

```css
.recipe { font-variant-numeric: diagonal-fractions; }
```

**When to apply**: Recipes, measurements, mathematical expressions — any content containing fractions.

---

## OpenType Features

### type-opentype-contextual-alternates -- Keep contextual alternates enabled

Contextual alternates (calt) adjust punctuation and glyph shapes based on surrounding characters. Do not disable them.

```css
/* ❌ calt disabled — degraded glyph quality */
body { font-feature-settings: "calt" 0; }

/* ✅ calt kept active */
body { font-feature-settings: "calt" 1; }
```

**When to apply**: Keep enabled by default. Do not turn off without a specific reason. Especially important for high-quality fonts like Inter and SF Pro.

---

### type-disambiguation-stylistic-set -- Disambiguation set for UI

Enable ss02 (or the font's disambiguation stylistic set) in code-related UI to distinguish I, l, 1 and 0, O.

```css
.code-ui { font-feature-settings: "ss02"; }
```

**When to apply**: Code editors, terminals, ID displays — any UI where character confusion is dangerous. Verify the font in use supports the stylistic set.

---

## Font Rendering

### type-optical-sizing-auto -- Keep optical sizing on auto

Keep `font-optical-sizing` set to auto. The font adjusts glyph shapes based on size — thicker strokes at small sizes, finer detail at large sizes.

```css
/* ❌ Forced off — loses size-specific optimization */
body { font-optical-sizing: none; }

/* ✅ Auto adjustment */
body { font-optical-sizing: auto; }
```

**When to apply**: Keep auto by default. Especially important for variable fonts that support optical sizing (Inter, Source Serif, etc.).

---

### type-antialiased-on-retina -- Antialiased font smoothing on Retina

Set `-webkit-font-smoothing: antialiased` for Retina displays. The default subpixel rendering appears thicker and blurrier.

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**When to apply**: Web projects targeting macOS/iOS. Set globally on body. Produces thinner, crisper text rendering.

---

### type-no-font-synthesis -- Disable font-synthesis

Set `font-synthesis: none` to prevent browsers from generating fake bold/italic. Browser-synthesized faux styles look poor.

```css
/* ❌ Browser arbitrarily generates bold/italic */

/* ✅ Prevent faux styles */
.icon-font,
.display-font {
  font-synthesis: none;
}
```

**When to apply**: Icon fonts, display fonts, and font families missing specific weight/style files.

---

### type-font-display-swap -- Use font-display: swap

Set `font-display: swap` so text renders immediately with a fallback during custom font loading. Prevents FOIT (Flash of Invisible Text).

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2");
  font-display: swap;
}
```

**When to apply**: Every @font-face declaration. Text content should be visible before font loading completes (almost always).

---

### type-variable-weight-continuous -- Continuous weight with variable fonts

Variable fonts accept any integer between 100-900. No need to restrict to standard stops (400, 500, 600, etc.).

```css
/* ❌ Restricted to standard stops */
.text { font-weight: 500; }

/* ✅ Continuous weight */
.medium { font-weight: 450; }
.semibold { font-weight: 550; }
```

**When to apply**: When using variable fonts. Fine-tune to the exact weight that matches the design.

---

## Text Layout

### type-text-wrap-balance -- Use text-wrap: balance for headings

Apply `text-wrap: balance` to headings to produce lines of roughly equal length instead of one long line and one short line.

```css
h1, h2, h3 { text-wrap: balance; }
```

**When to apply**: Headings, hero text, short multiline text. Do not use on long body text (performance impact).

---

### type-text-wrap-pretty -- Use text-wrap: pretty for body text

Apply `text-wrap: pretty` to body text to reduce orphan words (a single word left alone on the last line).

```css
p { text-wrap: pretty; }
h1, h2, h3 { text-wrap: balance; }
```

**When to apply**: Body text. Lighter than balance and only prevents orphans. Use balance for headings, pretty for body.

---

### type-underline-offset -- Offset underlines below descenders

Use `text-underline-offset` to push the underline below descenders so it looks intentional.

```css
a {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-skip-ink: auto;
}
```

**When to apply**: Text links and emphasis underlines. Pair with `text-decoration-skip-ink: auto` to prevent descenders from colliding with the underline.

---

### type-justify-with-hyphens -- Always pair justify with hyphens

Justified text (`text-align: justify`) without hyphenation creates "rivers of whitespace" between words.

```css
/* ❌ Rivers of whitespace */
.article { text-align: justify; }

/* ✅ Hyphens prevent rivers */
.article {
  text-align: justify;
  hyphens: auto;
}
```

**When to apply**: Always when using justified text. `hyphens: auto` requires the `lang` attribute to be set on the element.

---

### type-letter-spacing-uppercase -- Add letter-spacing to uppercase text

Uppercase and small-caps text needs positive `letter-spacing` for an open feel and better readability.

```css
/* ❌ Cramped uppercase — hard to read */
.label { text-transform: uppercase; font-size: 12px; }

/* ✅ Open feel */
.label {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.05em;
}
```

**When to apply**: Always when using `text-transform: uppercase` or `font-variant-caps: small-caps`. Range: 0.04em-0.08em.

---

## Quick Reference Table

| Property | Use Case | Value |
|----------|----------|-------|
| `font-variant-numeric: tabular-nums` | Data tables, prices | Fixed-width numerals |
| `font-variant-numeric: oldstyle-nums` | Body text | Blends with lowercase |
| `font-variant-numeric: slashed-zero` | Code UI | Distinguishes 0 from O |
| `font-variant-numeric: diagonal-fractions` | Recipes, etc. | Typographic fractions |
| `font-feature-settings: "calt" 1` | Everywhere | Contextual alternates |
| `font-feature-settings: "ss02"` | Code UI | Distinguishes I/l/1 |
| `font-optical-sizing: auto` | Everywhere | Size-adaptive glyphs |
| `-webkit-font-smoothing: antialiased` | Retina displays | Thinner, crisper text |
| `font-synthesis: none` | Display/icon fonts | Prevents faux styles |
| `font-display: swap` | @font-face | Shows text during loading |
| `text-wrap: balance` | Headings | Even line lengths |
| `text-wrap: pretty` | Body text | Reduces orphan words |
| `text-underline-offset: 3px` | Links | Clears descenders |
| `letter-spacing: 0.05em` | Uppercase/small-caps | Open feel and readability |

---

*Produced by junhan of select.codes*
