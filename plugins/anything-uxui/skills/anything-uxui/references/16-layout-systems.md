---
title: Layout Systems & Responsive Design
impact: CRITICAL
tags: layout, grid, flexbox, container-queries, responsive, intrinsic-design
---

# Layout Systems & Responsive Design

by junhan of select.codes

---

## layout-algorithm-awareness: CSS properties behave differently per layout algorithm

CSS properties are not universal constants. `width: 2000px` is a hard constraint in Flow layout, but merely a suggestion in Flexbox (items shrink to fit). `z-index` does nothing in Flow but works in positioned/flex/grid contexts.

**The property doesn't change. The algorithm interpreting it does.**

```css
/* ❌ Assuming width behaves the same everywhere */
.item { width: 300px; }
/* In Flow: exactly 300px, overflows parent */
/* In Flexbox: shrinks below 300px if container is smaller */

/* ✅ Understand the algorithm you're working in */
.flex-item {
  flex-basis: 300px;   /* Starting point */
  flex-shrink: 0;      /* Now it's a hard constraint */
}
```

**When to apply**: Before debugging any layout issue, identify which layout algorithm governs the element. Learn Flow, Flexbox, and Grid as three distinct systems with different rules for the same properties.

---

## layout-full-bleed-grid: Content width with full-bleed breakout

The canonical pattern for content-width body with full-bleed sections. A single 3-column grid replaces wrapper divs with max-width hacks.

```css
/* ❌ Wrapper with max-width + margin auto, full-bleed needs negative margins */
.wrapper { max-width: 65ch; margin-inline: auto; padding-inline: 1rem; }
.full-bleed { margin-inline: calc(-50vw + 50%); /* fragile hack */ }

/* ✅ Grid-based content width with clean full-bleed */
.wrapper {
  display: grid;
  grid-template-columns: 1fr min(65ch, 100%) 1fr;
  padding-inline: 1rem;
}
.wrapper > * { grid-column: 2; }
.full-bleed { grid-column: 1 / -1; }
```

**When to apply**: Any long-form content layout (blog posts, documentation, marketing pages) where some sections need to break out of the content width.

---

## layout-intrinsic-flex: Intrinsic layout with Flexbox (no media queries)

Combine `flex-basis` + `flex-grow` + `flex-wrap` to create layouts that reflow naturally based on available space. Zero media queries.

```css
/* ❌ Media query for every breakpoint */
.row { display: flex; flex-direction: column; }
@media (min-width: 768px) { .row { flex-direction: row; } }
@media (min-width: 1024px) { .sidebar { width: 300px; } }

/* ✅ Intrinsic — adapts automatically */
.row { display: flex; flex-wrap: wrap; gap: 1rem; }
.sidebar { flex: 1 1 200px; }
.main { flex: 3 1 400px; }
```

The sidebar wraps below main when the container is too narrow for both. `flex-basis` sets the minimum comfortable width; `flex-grow` ratio controls space distribution.

**When to apply**: Sidebar + main layouts, dashboard panels, any two-column layout that should stack on narrow viewports.

---

## layout-fluid-grid: Auto-adapting grid column count

`auto-fill` + `minmax()` creates grids that automatically adjust column count based on available space. The `min()` function prevents overflow on small screens.

```css
/* ❌ Fixed column count with media queries */
.grid { grid-template-columns: repeat(1, 1fr); }
@media (min-width: 600px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 900px) { .grid { grid-template-columns: repeat(3, 1fr); } }

/* ✅ Fluid — auto-adapts column count */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
  gap: 1rem;
}
```

`auto-fill` creates as many tracks as fit. `min(200px, 100%)` ensures items never overflow on viewports narrower than 200px.

**When to apply**: Card grids, product listings, image galleries — any repeated layout where the number of columns should depend on available space.

---

## layout-container-queries: Components respond to their container, not viewport

Container queries let components adapt based on their parent's size, not the viewport. Essential for reusable design system components that appear in different contexts (sidebar, main content, modal).

```css
/* ❌ Viewport-coupled component — breaks in sidebar */
@media (min-width: 600px) { .card { flex-direction: row; } }

/* ✅ Container-aware component — works everywhere */
.card-wrapper { container-type: inline-size; }
@container (min-width: 400px) {
  .card { flex-direction: row; }
}
```

```css
/* Named containers for nested queries */
.sidebar { container-type: inline-size; container-name: sidebar; }
@container sidebar (min-width: 300px) {
  .nav-item { display: flex; gap: 0.5rem; }
}
```

**When to apply**: Any component that may be placed in containers of varying widths. Cards, navigation items, form layouts, data display components.

---

## layout-subgrid: Children participate in parent grid tracks

Subgrid lets child elements align to the parent grid's tracks. Essential for card grids where titles, descriptions, and CTAs must align across cards regardless of content length.

```css
/* ❌ Cards with misaligned content */
.card { display: flex; flex-direction: column; }
/* Each card's title/description takes different heights */

/* ✅ Subgrid — content aligns across cards */
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
  gap: 0.5rem;
}
```

**When to apply**: Card grids, pricing tables, feature comparison layouts — anywhere content in sibling elements must align horizontally.

---

## layout-stack: Vertical flow with consistent spacing

The most common layout primitive. Applies consistent vertical spacing between direct children. Replaces scattered margin declarations.

```css
/* ❌ Margin on every element */
.title { margin-bottom: 1rem; }
.text { margin-bottom: 1rem; }
.button { margin-top: 1.5rem; }

/* ✅ Stack — consistent flow spacing */
.stack { display: flex; flex-direction: column; gap: var(--space, 1rem); }

/* Or with the owl selector for non-flex contexts */
.stack > * + * { margin-block-start: var(--space, 1rem); }
```

**When to apply**: Any vertical content flow — form fields, card content, page sections. The foundational primitive for vertical rhythm.

---

## layout-center: Horizontally centered content

The simplest layout primitive. Centers content with a max-width constraint and optional padding for small screens.

```css
.center {
  max-width: var(--measure, 65ch);
  margin-inline: auto;
  padding-inline: var(--gutter, 1rem);
}
```

**When to apply**: Article content, form containers, any single-column centered layout.

---

## layout-cluster: Inline wrapping items

Groups of inline elements that wrap naturally with consistent spacing. Buttons, tags, badges, breadcrumbs.

```css
/* ❌ Inline-block with margin hacks */
.tag { display: inline-block; margin: 0 8px 8px 0; }

/* ✅ Cluster — clean wrapping with gap */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
```

**When to apply**: Tag lists, button groups, filter chips, breadcrumbs — any horizontal group that should wrap cleanly.

---

## layout-sidebar: Two-panel layout without breakpoints

A sidebar that maintains a minimum width and lets the main content fill the rest. Wraps to single column when space is insufficient.

```css
.with-sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.with-sidebar > .sidebar { flex: 1 1 200px; }
.with-sidebar > .main { flex: 999 1 0; min-width: 50%; }
```

The extreme `flex-grow: 999` on main ensures it dominates space distribution. `min-width: 50%` triggers the wrap point.

**When to apply**: Settings panels, documentation layouts, admin dashboards — any two-panel layout that should gracefully degrade.

---

## layout-switcher: Horizontal to vertical based on container width

Switches between horizontal and vertical layout at a threshold width using a single CSS rule. No media queries.

```css
.switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.switcher > * {
  flex-grow: 1;
  flex-basis: calc((var(--threshold, 30rem) - 100%) * 999);
}
```

When container width > threshold: items are horizontal. When container < threshold: `flex-basis` becomes a large positive number, forcing each item to its own row.

**When to apply**: Form layouts, feature sections, any row that should become a column below a certain container width.

---

## layout-optical-alignment: Mathematical centering is not visual centering

Geometric center and visual center differ. Shapes with uneven visual weight (play icons, text in buttons, triangles) need manual optical correction.

```css
/* ❌ Mathematically centered play icon — looks off */
.play-btn { display: grid; place-items: center; }

/* ✅ Optically corrected — shift right by 1-2px */
.play-btn svg { transform: translateX(2px); }
```

```css
/* ❌ Vertically centered text in button — looks too low */
.btn { padding: 12px 24px; }

/* ✅ Optical correction — slightly more top padding */
.btn { padding: 11px 24px 13px; }
```

**When to apply**: Play/forward icons, text in rounded buttons, asymmetric shapes, icons next to text. If it looks off despite being mathematically centered, apply 1-3px optical correction. **If it looks right, it IS right.**

---

## layout-isolation-isolate: Contain z-index with stacking contexts

`isolation: isolate` creates a new stacking context without side effects. Prevents components from leaking z-index values into the global scope.

```css
/* ❌ z-index arms race */
.dropdown { z-index: 100; }
.modal { z-index: 1000; }
.tooltip { z-index: 999999; }

/* ✅ Isolated stacking contexts */
#__next { isolation: isolate; } /* App root */

.component-wrapper { isolation: isolate; }
.dropdown { z-index: 2; }  /* Safe within component */
.tooltip { z-index: 3; }   /* Safe within component */
```

Apply `isolation: isolate` on:
1. App root (`#root`, `#__next`)
2. Component wrappers that use z-index internally
3. Any element that should contain its children's stacking

**When to apply**: Always. Set on app root as a baseline. Add to any component that uses z-index internally. Prevents the "z-index: 99999" escalation pattern.
