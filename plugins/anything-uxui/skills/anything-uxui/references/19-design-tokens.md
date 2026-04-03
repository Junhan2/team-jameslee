---
title: Design Token Architecture
impact: HIGH
tags: design-tokens, css-variables, theming, design-system
---

# Design Token Architecture

## `token-css-variables-runtime`

CSS variables are DYNAMIC — they exist at runtime and can be overridden per context. Sass/Less variables compile away and disappear. Use CSS variables as your runtime design token layer.

```css
/* ❌ Sass variables — compile-time only, no runtime override */
$spacing-4: 16px;
.card { padding: $spacing-4; }
.compact .card { /* can't override $spacing-4 */ }

/* ✅ CSS variables — runtime, overridable per context */
:root { --space-4: 1rem; }
.card { padding: var(--space-4); }
.compact { --space-4: 0.75rem; } /* all children auto-adapt */
```

**When to apply:** Every project. CSS variables are the foundation of modern theming — Sass variables are for build-time computation only.

---

## `token-canonical-schema`

Define tokens for every design dimension. This is the minimum complete token set:

```css
:root {
  /* Duration */
  --duration-micro: 80ms;
  --duration-short: 150ms;
  --duration-medium: 250ms;
  --duration-long: 400ms;

  /* Easing */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

  /* Spring */
  --spring-default: 0.4s bounce(0.15);

  /* Spacing (4px base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.5rem;   /* 24px */
  --space-6: 2rem;     /* 32px */
  --space-7: 3rem;     /* 48px */
  --space-8: 4rem;     /* 64px */

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-color: 220 3% 15%;
  --shadow-1: 0 1px 2px hsl(var(--shadow-color) / 0.1);
  --shadow-2: 0 2px 4px hsl(var(--shadow-color) / 0.1),
              0 4px 8px hsl(var(--shadow-color) / 0.06);
  --shadow-3: 0 4px 8px hsl(var(--shadow-color) / 0.1),
              0 8px 16px hsl(var(--shadow-color) / 0.08),
              0 16px 32px hsl(var(--shadow-color) / 0.04);

  /* Z-index */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;

  /* Focus */
  --focus-ring: 2px solid var(--color-primary);
  --focus-offset: 2px;
}
```

**When to apply:** At project setup. Copy this schema, adjust values to your design. Missing a dimension = inconsistency creeping in later.

---

## `token-shadow-palette`

Define `--shadow-color` once. Derive all elevation shadows from it. Changing one variable adapts every shadow in the system.

```css
:root {
  --shadow-color: 220 3% 15%;

  /* Elevation scale — all reference --shadow-color */
  --shadow-xs: 0 1px 2px hsl(var(--shadow-color) / 0.06);
  --shadow-sm: 0 1px 3px hsl(var(--shadow-color) / 0.1),
               0 1px 2px hsl(var(--shadow-color) / 0.06);
  --shadow-md: 0 4px 6px hsl(var(--shadow-color) / 0.1),
               0 2px 4px hsl(var(--shadow-color) / 0.06);
  --shadow-lg: 0 10px 15px hsl(var(--shadow-color) / 0.1),
               0 4px 6px hsl(var(--shadow-color) / 0.05);
  --shadow-xl: 0 20px 25px hsl(var(--shadow-color) / 0.1),
               0 8px 10px hsl(var(--shadow-color) / 0.04);
}

/* Dark mode: one change, all shadows adapt */
[data-theme="dark"] { --shadow-color: 220 40% 2%; }

/* Colored context: tinted shadows */
.brand-hero { --shadow-color: 250 30% 20%; }
```

**When to apply:** Every project using elevation shadows. Multiple `box-shadow` layers create realistic depth — single-layer shadows look flat.

---

## `token-spacing-scale`

Use a consistent spacing scale based on 4px (0.25rem). Never use arbitrary pixel values — they fragment visual rhythm.

```css
/* ❌ Arbitrary values — no rhythm */
.header { padding: 13px 17px; margin-bottom: 22px; }
.card { padding: 18px; gap: 11px; }

/* ✅ Scale-based — consistent visual rhythm */
.header { padding: var(--space-3) var(--space-4); margin-bottom: var(--space-5); }
.card { padding: var(--space-4); gap: var(--space-3); }
```

The 4px scale (4, 8, 12, 16, 24, 32, 48, 64) covers virtually all spacing needs. If you find yourself needing an in-between value, you probably need to adjust the layout, not the scale.

**When to apply:** Every layout decision. If you're typing a raw px/rem value for spacing, it should reference a token.

---

## `token-js-css-bridge`

For React/framework apps: define tokens as JS constants for type safety, inject as CSS variables for runtime theming. One source of truth, two consumption modes.

```ts
// tokens.ts — single source of truth
export const tokens = {
  space4: '1rem',
  radiusMd: '0.5rem',
  colorPrimary: 'oklch(0.55 0.25 250)',
  durationShort: '150ms',
} as const;

// Inject at app init
function applyTokens(tokenMap: Record<string, string>) {
  const style = document.documentElement.style;
  for (const [key, value] of Object.entries(tokenMap)) {
    style.setProperty(`--${toKebab(key)}`, value);
  }
}

function toKebab(str: string) {
  return str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
}

// Usage in CSS: var(--space-4), var(--radius-md)
// Usage in JS: tokens.space4, tokens.radiusMd (typed, autocomplete)
```

**When to apply:** When tokens need to be consumed by both CSS and JS logic (animations, dynamic styling, runtime theme switching).

---

## `token-no-magic-numbers`

Every numeric value in CSS must reference a token. If you're typing a raw number, it should be a token. Magic numbers create maintenance nightmares — "why is this 13px?" is unanswerable six months later.

```css
/* ❌ Magic numbers — intent unclear, inconsistent */
.card {
  padding: 13px;
  margin-bottom: 17px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

/* ✅ Token-referenced — intent clear, consistent */
.card {
  padding: var(--space-3);
  margin-bottom: var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
```

Exceptions: `0`, `1`, `100%`, `50%` (centering), and single-use values in animations. Everything else gets a token.

**When to apply:** Every CSS property that accepts a numeric value. Enforce in code review — magic numbers are the most common design system violation.
