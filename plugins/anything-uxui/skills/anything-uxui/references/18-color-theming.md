---
title: Color Systems & Theming
impact: CRITICAL
tags: color, dark-mode, oklch, semantic-colors, theming, materials
---

# Color Systems & Theming

## `color-semantic-naming`

Name colors by PURPOSE, not appearance. Semantic names auto-adapt to themes without any component changes.

```css
/* ❌ Appearance-based — breaks when theme changes */
:root { --gray-900: #111; --white: #fff; }
.card { color: var(--gray-900); background: var(--white); }

/* ✅ Purpose-based — auto-adapts to any theme */
:root {
  --color-text-primary: oklch(0.15 0 0);
  --color-bg-surface: oklch(0.99 0 0);
}
[data-theme="dark"] {
  --color-text-primary: oklch(0.93 0 0);
  --color-bg-surface: oklch(0.15 0 0);
}
.card { color: var(--color-text-primary); background: var(--color-bg-surface); }
```

**When to apply:** Every project from day one. Renaming later is painful — start semantic.

---

## `color-three-tier-tokens`

Structure colors in 3 tiers:

1. **Primitive** — raw OKLCH values: `--p-blue-500: oklch(0.55 0.25 250)`
2. **Semantic** — purpose-based: `--color-text-primary`, `--color-bg-surface`, `--color-border-subtle`
3. **Component** — specific overrides: `--button-bg`, `--card-border`

Components reference semantic. Semantic references primitive. Never skip tiers.

```css
/* Tier 1: Primitive */
:root {
  --p-blue-500: oklch(0.55 0.25 250);
  --p-gray-100: oklch(0.96 0 0);
  --p-gray-900: oklch(0.15 0 0);
}

/* Tier 2: Semantic */
:root {
  --color-primary: var(--p-blue-500);
  --color-text-primary: var(--p-gray-900);
  --color-bg-surface: var(--p-gray-100);
}

/* Tier 3: Component */
.button { --button-bg: var(--color-primary); }
```

**When to apply:** Any project with more than a handful of colors. Small landing pages can skip Tier 3.

---

## `color-oklch-space`

Use OKLCH for perceptual uniformity. In HSL, same L value looks different across hues — blue appears darker than yellow at identical lightness. OKLCH guarantees equal lightness steps look equal visually.

```css
/* ❌ HSL — perceptually uneven */
--blue: hsl(220 90% 50%);   /* looks darker */
--yellow: hsl(50 90% 50%);  /* looks lighter */

/* ✅ OKLCH — perceptually uniform */
--blue: oklch(0.55 0.25 250);
--yellow: oklch(0.55 0.25 85);
/* Same L=0.55 → actually looks the same brightness */
```

**When to apply:** Whenever defining color palettes, especially multi-hue systems. OKLCH browser support is 95%+ (2025).

---

## `color-hover-derivation`

Derive hover states from base color using OKLCH relative color syntax. No separate hover token needed — one base color, infinite derived states.

```css
/* ❌ Separate token per state */
:root { --btn-bg: oklch(0.55 0.25 250); --btn-bg-hover: oklch(0.50 0.25 250); }

/* ✅ Derived from base — scales to any color */
.button {
  background: var(--color-primary);
}
.button:hover {
  background: oklch(from var(--color-primary) calc(l - 0.05) c h);
}
.button:active {
  background: oklch(from var(--color-primary) calc(l - 0.10) c h);
}
```

**When to apply:** Interactive elements with color state changes. Requires relative color syntax support (Chrome 119+, Safari 18+, Firefox 128+).

---

## `color-dark-mode-reduce-lightness`

For dark mode: reduce L (lightness), don't invert. Follow Apple's "dimming the lights" metaphor. Saturated colors should also reduce chroma slightly in dark mode to avoid glowing on dark backgrounds.

```css
/* ❌ Full inversion — loses brand identity, creates alien palette */
[data-theme="dark"] { filter: invert(1); }

/* ❌ Same chroma in dark mode — colors glow harshly */
[data-theme="dark"] { --color-primary: oklch(0.70 0.25 250); }

/* ✅ Reduce lightness AND chroma for dark mode */
:root         { --color-primary: oklch(0.55 0.25 250); }
[data-theme="dark"] { --color-primary: oklch(0.65 0.20 250); }
/* Slightly higher L for readability, lower C to prevent glowing */
```

**When to apply:** Every dark mode implementation. Test saturated brand colors on dark backgrounds — they almost always need chroma reduction.

---

## `color-flash-free-dark-mode`

Use a blocking `<script>` BEFORE page content that reads the stored theme preference, then falls back to `prefers-color-scheme`. Prevents the white flash on SSR/SSG pages.

```html
<!-- ❌ Theme set in useEffect — white flash on every dark-mode load -->
<body>
  <div id="root"></div>
  <script src="app.js"></script>
</body>

<!-- ✅ Blocking script sets theme before paint -->
<body>
  <script>
    const theme = localStorage.getItem('theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  </script>
  <div id="root"></div>
</body>
```

**When to apply:** Every SSR/SSG site with dark mode. The script is <100 bytes — negligible cost for eliminating flash.

---

## `color-clip-path-theme-transition`

For dramatic theme switching: duplicate the page, apply the new theme to the clone, use `clip-path: circle()` expanding from the click point to reveal the new theme. Combine with the View Transitions API for smooth orchestration.

```js
// Capture click position and trigger View Transition
async function toggleTheme(event) {
  const { clientX: x, clientY: y } = event;
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  );

  const transition = document.startViewTransition(() => {
    document.documentElement.dataset.theme =
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  });

  await transition.ready;

  document.documentElement.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
    { duration: 500, easing: 'ease-out', pseudoElement: '::view-transition-new(root)' }
  );
}
```

**When to apply:** Portfolio sites, creative projects, product pages where theme switching is a feature moment. Overkill for dashboards or tools.

---

## `color-surface-hierarchy`

Define surface hierarchy through distinct background tones. Each elevation level gets progressively different lightness to establish visual depth without relying solely on shadows.

```css
:root {
  --surface-1: oklch(0.99 0 0);   /* page background */
  --surface-2: oklch(0.97 0 0);   /* card, section */
  --surface-3: oklch(0.94 0 0);   /* nested card, sidebar */
  --surface-raised: oklch(1 0 0); /* popover, dropdown */
}

[data-theme="dark"] {
  --surface-1: oklch(0.13 0 0);
  --surface-2: oklch(0.16 0 0);
  --surface-3: oklch(0.20 0 0);
  --surface-raised: oklch(0.22 0 0);
}
```

**When to apply:** Any multi-layer UI — dashboards, modals, nested cards. Especially important in dark mode where shadows are less visible.

---

## `color-consistent-shadow-adaptation`

Define `--shadow-color` as a single variable. All shadow elevation tokens reference it. Override per context — every shadow auto-adapts.

```css
:root {
  --shadow-color: 220 3% 15%;
  --shadow-sm: 0 1px 2px hsl(var(--shadow-color) / 0.08);
  --shadow-md: 0 4px 8px hsl(var(--shadow-color) / 0.12);
  --shadow-lg: 0 8px 24px hsl(var(--shadow-color) / 0.16);
}

/* Dark mode — darker, more opaque shadows */
[data-theme="dark"] { --shadow-color: 220 40% 2%; }

/* Colored section — tinted shadows */
.brand-section { --shadow-color: 250 30% 20%; }

/* All --shadow-* tokens adapt automatically */
```

**When to apply:** Every project using shadows. Define once, adapt everywhere.

---

## `color-alpha-over-fixed`

Use alpha-channel colors for borders, overlays, and dividers. They adapt to ANY background without per-context overrides.

```css
/* ❌ Fixed color — only works on white backgrounds */
.divider { border-color: #e5e5e5; }
.overlay { background: #00000080; }

/* ✅ Alpha — works on any background */
.divider { border-color: oklch(0 0 0 / 0.1); }
.overlay { background: oklch(0 0 0 / 0.5); }

/* Dark mode: same alpha values often just work */
[data-theme="dark"] .divider { border-color: oklch(1 1 0 / 0.1); }
```

**When to apply:** Borders, dividers, overlays, subtle backgrounds. Anywhere color meets variable backgrounds. Especially powerful with dark mode — halves the number of color tokens needed.
