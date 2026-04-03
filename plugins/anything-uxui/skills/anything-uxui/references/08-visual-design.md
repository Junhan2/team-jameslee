---
title: Visual Design Standards
impact: HIGH
tags: shadows, border-radius, spacing, buttons, visual-polish
---

## Border Radius

### visual-concentric-radius -- Concentric border radius for nested elements

When nesting rounded elements, inner radius = outer radius - gap. Using the same radius on both causes the inner corners to appear unevenly bulged.

```css
/* ❌ Same radius on both — uneven curves */
.outer { border-radius: 16px; padding: 8px; }
.inner { border-radius: 16px; }

/* ✅ Concentric radius */
.outer {
  --padding: 8px;
  --inner-radius: 8px;
  border-radius: calc(var(--inner-radius) + var(--padding));
  padding: var(--padding);
}
.inner {
  border-radius: var(--inner-radius);
}
```

**When to apply**: Cards within cards, button groups, nested rounded containers — any time rounded elements overlap. Use CSS variables to formalize the relationship for consistency.

---

## Shadows

### visual-layered-shadows -- Layered shadows for realistic depth

A single box-shadow looks flat. Layer multiple shadows (minimum 3) with increasing blur and decreasing opacity to mimic real-world lighting.

```css
/* ❌ Single flat shadow */
.card { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); }

/* ✅ Layered shadows */
.card {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 8px rgba(0, 0, 0, 0.04),
    0 12px 24px rgba(0, 0, 0, 0.03);
}
```

**When to apply**: Cards, modals, dropdowns, and any element that needs elevation. Minimum 3 layers, each with increasing blur and decreasing opacity.

---

### visual-shadow-direction -- Consistent shadow direction across the UI

All shadows should share the same offset direction, implying a single light source. Mixed directions look broken.

```css
/* ❌ Conflicting light sources */
.card { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
.modal { box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1); }
.tooltip { box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1); }

/* ✅ Consistent top-down light source */
.card { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
.modal { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
.tooltip { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
```

**When to apply**: Project-wide. Unify light source direction — typically top-down (only positive y-offset).

---

### visual-no-pure-black-shadow -- No pure black shadows

Pure black (`rgba(0, 0, 0, ...)`) shadows look harsh. Use deep neutrals or semi-transparent dark tones instead.

```css
/* ❌ Pure black */
.card { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); }

/* ✅ Neutral shadow */
.card { box-shadow: 0 4px 12px rgba(17, 24, 39, 0.08); }
```

**When to apply**: All shadows. Use the design system's gray tone or a low-opacity neutral instead of pure black (0,0,0).

---

### visual-shadow-matches-elevation -- Shadow size reflects elevation

Larger blur and offset imply higher elevation. Define a consistent shadow scale and use it throughout.

```css
:root {
  --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.05);    /* Base — cards */
  --shadow-2: 0 2px 8px rgba(0, 0, 0, 0.08);    /* Mid — dropdowns */
  --shadow-3: 0 8px 24px rgba(0, 0, 0, 0.12);   /* High — modals */
}

.card { box-shadow: var(--shadow-1); }
.dropdown { box-shadow: var(--shadow-2); }
.modal { box-shadow: var(--shadow-3); }
```

**When to apply**: Project-wide. Define the elevation scale as CSS variables and match each element to the appropriate level.

---

### visual-animate-shadow-pseudo -- Animate shadows via pseudo-element opacity

Transitioning `box-shadow` directly triggers expensive repaints. Instead, set the target shadow on a pseudo-element and animate only its opacity — GPU-accelerated and smooth.

```css
/* ❌ Direct box-shadow animation — repaint every frame */
.card {
  box-shadow: var(--shadow-1);
  transition: box-shadow 0.2s ease;
}
.card:hover { box-shadow: var(--shadow-3); }

/* ✅ Pseudo-element opacity animation — GPU-accelerated */
.card {
  position: relative;
  box-shadow: var(--shadow-1);
}
.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: var(--shadow-3);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: -1;
}
.card:hover::after { opacity: 1; }
```

**When to apply**: Interactive elements with shadow changes on hover/focus. Especially impactful in card lists where multiple elements may hover simultaneously.

---

## Spacing

### visual-consistent-spacing-scale -- Consistent spacing scale

Never use arbitrary pixel values. Define a scale and use it throughout.

```css
/* ❌ Arbitrary values — visual inconsistency */
.header { padding: 17px; }
.card { margin-bottom: 13px; }
.section { gap: 22px; }

/* ✅ Consistent scale */
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
}
.header { padding: var(--space-4); }
.card { margin-bottom: var(--space-3); }
.section { gap: var(--space-5); }
```

**When to apply**: All spacing (padding, margin, gap). Define the design system's spacing scale as CSS variables and use consistently.

---

## Borders

### visual-border-alpha-colors -- Semi-transparent borders

Semi-transparent borders adapt to any background color and create subtle, soft separation. Hardcoded colors break in dark mode.

```css
/* ❌ Hardcoded border color */
.card { border: 1px solid #e5e5e5; }

/* ✅ Alpha border */
.card { border: 1px solid var(--gray-a4); }
```

**When to apply**: Dividers, card borders, input field borders, etc. Alpha colors are essential when supporting light/dark modes.

---

## Buttons

### visual-button-shadow-anatomy -- 6-layer shadow anatomy for buttons

A polished button uses 6 layered techniques rather than a single box-shadow:

1. **Outer cut shadow** -- 0.5px dark box-shadow to "cut" into the surface
2. **Inner ambient highlight** -- 1px inset box-shadow reflecting ambient light
3. **Inner top highlight** -- 1px inset top highlight from the primary light source above
4. **Layered depth shadows** -- Minimum 3 outer shadows for natural lighting
5. **Text drop-shadow** -- drop-shadow on text/icons for improved contrast
6. **Subtle gradient background** -- If the gradient is visible, it is too strong

```css
/* ❌ Flat button */
.button {
  background: var(--gray-12);
  color: var(--gray-1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ✅ Full shadow anatomy */
.button {
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--gray-12) 100%, white 4%),
    var(--gray-12)
  );
  color: var(--gray-1);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.3),                /* 1. outer cut */
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),      /* 2. inner ambient */
    inset 0 1px 0 rgba(255, 255, 255, 0.07),         /* 3. inner top */
    0 1px 2px rgba(0, 0, 0, 0.1),                    /* 4. depth 1 */
    0 2px 4px rgba(0, 0, 0, 0.06),                   /* 5. depth 2 */
    0 4px 8px rgba(0, 0, 0, 0.03);                   /* 6. depth 3 */
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);        /* text shadow */
}
```

**When to apply**: Hero CTAs, primary action buttons, and other buttons that need visual presence. May be excessive for secondary buttons — scale down to 2-3 layers.

---

*Produced by junhan of select.codes*
