---
title: Recipe — Theme / Tokens (before → after)
tags: recipe, css, tokens, theme
---
# Recipe — Theme / Tokens

Encodes: `color-oklch-space`, `color-three-tier-tokens`, `color-contrast-minimum`, `color-light-dark`, `token-tailwind-theme-bridge`, `token-typography-scale`, `distinct-saturate-neutrals`, `distinct-no-slop-palette`.

## ❌ Before
```css
/* hex, hardcoded dark overrides, no contrast check, arbitrary Tailwind values, slop purple */
.card { background: #fff; color: #333; }
.dark .card { background: #1a1a1a; color: #eee; }
/* <div className="bg-[#6d28d9]"> */
```

## ✅ After (vanilla)
```css
:root {
  color-scheme: light dark;
  --brand:     oklch(0.62 0.16 30);                                 /* one brand hue, real chroma */
  --surface-1: light-dark(oklch(0.99 0.005 30), oklch(0.18 0.01 30)); /* neutrals biased warm, not flat gray */
  --text-1:    light-dark(oklch(0.25 0.01 30), oklch(0.92 0 0));     /* ≥ 4.5:1 on --surface-1 */
  --text-base: 1rem; --leading-normal: 1.5;
}
.card { background: var(--surface-1); color: var(--text-1); }
```

## ✅ After (Tailwind v4)
```css
:root { --background: oklch(0.99 0.005 30); --foreground: oklch(0.2 0.01 30); }
@theme inline {                              /* REQUIRED for var-referencing (semantic) tokens */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
/* now: <div className="bg-background text-foreground"> — never bg-[#hex] */
```
