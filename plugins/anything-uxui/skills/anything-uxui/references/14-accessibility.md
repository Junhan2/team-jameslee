---
title: Accessibility Standards
impact: HIGH
tags: accessibility, reduced-motion, touch-devices, target-size
---

# Accessibility Standards

> By junhan of select.codes

Accessibility is a default, not an option. Standards for reduced motion, touch devices, target size, and hit area expansion.

---

## `a11y-reduced-motion` — prefers-reduced-motion: reduce, not remove

`prefers-reduced-motion: reduce` does not mean **zero** animation. **Keep** opacity and color transitions that aid understanding; **remove** only movement (translate) and positional animations.

```css
/* ❌ Remove all animation — information loss */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}

/* ✅ Remove movement, keep opacity/color — information preserved */
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: fade 0.2s ease;
    /* No transform-based motion */
  }
}
```

```jsx
// ✅ Conditional motion values — remove movement, snap to final position
const shouldReduceMotion = useReducedMotion();
const closedX = shouldReduceMotion ? 0 : '-100%';
```

**Principle**: **Movement** triggers motion sickness. Fade, color change, and size change are generally safe.

**When to apply**: All components that include animation.

---

## `a11y-touch-hover-gate` — Isolate hover states for touch devices

Touch devices trigger hover on tap, causing false positives. Gate hover effects behind `@media (hover: hover) and (pointer: fine)`.

```css
/* ❌ Unconditional hover — false positive on touch */
.element:hover {
  background: var(--gray-3);
  transform: scale(1.02);
}

/* ✅ Hover only on pointer devices */
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    background: var(--gray-3);
  }
}
```

**Media query breakdown:**
- `hover: hover` — primary input device supports hover
- `pointer: fine` — primary pointer is precise (mouse, trackpad)
- Combining both reliably excludes touch devices

**When to apply**: All interactive elements with hover states.

---

## `a11y-target-size-32` — Interactive targets minimum 32px

Fitts's Law: larger targets are easier to click. Interactive elements must be at least 32px. Especially important for finger tap accuracy on mobile.

```css
/* ❌ Small click target — causes missed clicks */
.icon-button {
  width: 16px;
  height: 16px;
  padding: 0;
}

/* ✅ Comfortable target — 32px minimum */
.icon-button {
  width: 32px;
  height: 32px;
  padding: 8px;
}
```

**When to apply**: All interactive elements (buttons, links, checkboxes, toggles, tabs).

---

## `a11y-hit-area-expansion` — Expand hit area with pseudo-elements

When the visual design must stay small but the clickable area needs to be large, expand the hit area with pseudo-elements or invisible padding.

```css
/* ❌ Visual size = hit area — hard to click */
.small-link {
  font-size: 12px;
  /* Clickable only within text bounds */
}

/* ✅ Invisible padding expands hit area */
.small-link {
  position: relative;
  font-size: 12px;
}
.small-link::before {
  content: "";
  position: absolute;
  inset: -8px -12px;
}
```

**Principle**: Visual boundary and click boundary are independent. Even visually small elements must have sufficient touch/click area.

**When to apply**: Inline links, small icon buttons, close buttons, and other visually small interactive elements.

---

## Font Sizing & Units

### a11y-rem-units — Use rem for font-size, not px

Users who increase their browser's default font size get NO benefit from `px`-based font-sizes. Use `rem` for font-size, media queries, and spacing that should scale with text. Use `px` only for borders, shadows, and things that should NOT scale.

```css
/* ❌ px — ignores user font preferences */
h1 { font-size: 32px; }
p { font-size: 16px; }

/* ✅ rem — respects user settings */
h1 { font-size: 2rem; }
p { font-size: 1rem; }
```

### a11y-rem-media-queries — Use rem for media query breakpoints

Rem-based media queries respect user font scaling — large text triggers mobile layout, which is often MORE readable.

```css
/* ❌ px breakpoint — ignores font scaling */
@media (min-width: 768px) { /* desktop */ }

/* ✅ rem breakpoint — adapts to user preferences */
@media (min-width: 48rem) { /* desktop */ }
```

## Animation Accessibility

### a11y-opt-in-animation — Opt-in animation model (safer default)

Start WITHOUT animation, ADD via `@media (prefers-reduced-motion: no-preference)`. New animations are automatically motion-safe by default.

```css
/* ❌ Disable-after model — easy to forget */
.element { transition: transform 300ms; }
@media (prefers-reduced-motion: reduce) {
  .element { transition: none; }
}

/* ✅ Opt-in model — safe by default */
.element { /* no transition */ }
@media (prefers-reduced-motion: no-preference) {
  .element { transition: transform 300ms var(--ease-out); }
}
```

## Touch Devices

### a11y-pointer-coarse-48 — Escalate touch targets to 48px

Beyond the 32px minimum, touch devices should escalate to 48px.

```css
.button { min-height: 2rem; }
@media (pointer: coarse) { .button { min-height: 3rem; } }
```
