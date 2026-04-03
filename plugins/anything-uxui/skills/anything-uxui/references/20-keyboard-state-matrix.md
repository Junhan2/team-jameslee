---
title: Keyboard Navigation & Component State Matrix
impact: CRITICAL
tags: keyboard, focus, state-matrix, roving-tabindex, aria, focus-visible
---

# Keyboard Navigation & Component State Matrix

## Focus Indicators

### `state-focus-visible`

Use `:focus-visible` (not `:focus`) for keyboard-only focus rings. 67% of sites incorrectly remove focus outlines — this is the single biggest accessibility problem on the web.

```css
/* ❌ Focus on every click — annoying for mouse users */
button:focus { outline: 2px solid blue; }

/* ❌ Removing focus entirely — breaks keyboard navigation */
button:focus { outline: none; }

/* ✅ Focus only for keyboard users */
button:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-offset);
}
```

**When to apply:** Every interactive element. No exceptions. This is the baseline for keyboard accessibility.

---

### `state-focus-indicator-wcag`

WCAG 2.2 Success Criterion 2.4.13 requires: focus indicator with area ≥ the 2px perimeter, ≥3:1 contrast ratio against both the focused component AND the unfocused state. Use `max(2px, 0.08em)` for font-scaling outline thickness.

```css
/* ❌ Thin, low-contrast focus — fails WCAG */
button:focus-visible { outline: 1px solid #ccc; }

/* ✅ WCAG-compliant focus indicator */
button:focus-visible {
  outline: max(2px, 0.08em) solid var(--color-focus);  /* scales with font */
  outline-offset: max(2px, 0.08em);
  border-radius: var(--radius-sm);
}

/* High-contrast theme override */
@media (forced-colors: active) {
  button:focus-visible { outline-color: Highlight; }
}
```

**When to apply:** Every focus style declaration. Test contrast with browser DevTools accessibility panel.

---

## Roving Tabindex

### `keyboard-roving-tabindex`

For composite widgets (toolbars, tab lists, menus, listboxes): only ONE element gets `tabindex="0"`, all siblings get `tabindex="-1"`. Arrow keys move focus and swap tabindex values. Tab enters/leaves the entire group as a single stop.

```tsx
// ❌ Every item is tabbable — Tab fatigue (10 tabs to pass a toolbar)
<ul>
  <li tabIndex={0}>Item 1</li>
  <li tabIndex={0}>Item 2</li>
  <li tabIndex={0}>Item 3</li>
</ul>

// ✅ Roving tabindex — arrows navigate within, Tab enters/leaves
<ul role="listbox" aria-label="Color selection">
  <li role="option" tabIndex={0} aria-selected="true">Red</li>
  <li role="option" tabIndex={-1}>Green</li>
  <li role="option" tabIndex={-1}>Blue</li>
</ul>
```

```ts
// Minimal roving tabindex handler
function handleKeyDown(e: KeyboardEvent, items: HTMLElement[], activeIndex: number) {
  let next = activeIndex;
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (activeIndex + 1) % items.length;
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (activeIndex - 1 + items.length) % items.length;
  if (e.key === 'Home') next = 0;
  if (e.key === 'End') next = items.length - 1;

  if (next !== activeIndex) {
    items[activeIndex].tabIndex = -1;
    items[next].tabIndex = 0;
    items[next].focus();
    e.preventDefault();
  }
}
```

**When to apply:** Any group of related interactive elements: tabs, menus, toolbars, listboxes, radio groups, tree views. If arrows should navigate it, use roving tabindex.

---

### `keyboard-arrow-directions`

Match arrow key directions to the widget's visual layout:

| Widget | Arrow Keys | Notes |
|--------|-----------|-------|
| Horizontal toolbar/tabs | ← → | Left/Right navigate |
| Vertical menu/listbox | ↑ ↓ | Up/Down navigate |
| Data grid | ← → ↑ ↓ | All four directions |
| Tree view | ↑ ↓ + ← → | Up/Down siblings, Right expand, Left collapse |

Home/End always jump to first/last item. For wrapping: last→first on ArrowDown, first→last on ArrowUp.

**When to apply:** Every composite widget implementation. Mismatched arrows feel broken even if technically functional.

---

### `keyboard-disabled-focusable`

In composite widgets, disabled elements remain focusable with `aria-disabled="true"` (not the `disabled` attribute). This lets screen readers discover and explain why an item is unavailable.

```tsx
// ❌ disabled attribute — item disappears from tab order, invisible to AT
<button disabled>Delete</button>

// ✅ aria-disabled — remains focusable, screen reader explains state
<button
  aria-disabled="true"
  onClick={(e) => { if (e.currentTarget.ariaDisabled === 'true') return; }}
  style={{ opacity: 0.5, cursor: 'not-allowed' }}
>
  Delete
</button>
```

```css
[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none; /* or handle in JS for tooltip support */
}
```

**When to apply:** Composite widgets where disabled items should remain discoverable. Especially menus and toolbars where context matters ("why can't I click this?").

---

## Complete State Matrix

### `state-matrix-7-states`

Every interactive component must define 7 states: **default → hover → focus-visible → active → disabled → loading → error**. Design each state explicitly. Missing states cause "did my click register?" confusion.

| State | Visual Change | CSS/ARIA | User Signal |
|-------|--------------|----------|-------------|
| default | base styling | — | available |
| hover | subtle background shift | `:hover` | interactive |
| focus-visible | outline ring (2px, 3:1) | `:focus-visible` | keyboard-targeted |
| active | scale(0.97) or darken | `:active` | press acknowledged |
| disabled | opacity 0.5, no pointer | `aria-disabled="true"` | unavailable |
| loading | spinner, disable clicks | `aria-busy="true"` | processing |
| error | error border + icon | `aria-invalid="true"` | needs correction |

```css
.button {
  /* default */
  background: var(--color-primary);
  transition: background var(--duration-short) var(--ease-out);
}
.button:hover { background: oklch(from var(--color-primary) calc(l - 0.05) c h); }
.button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-offset); }
.button:active { transform: scale(0.97); }
.button[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; }
.button[aria-busy="true"] { pointer-events: none; }
.button[aria-invalid="true"] { box-shadow: 0 0 0 2px var(--color-error); }
```

**When to apply:** Every button, link, input, toggle, card, or any clickable element. Audit with the checklist: "What does this look like in each of the 7 states?"

---

### `state-aria-disabled-over-disabled`

Prefer `aria-disabled="true"` over the `disabled` HTML attribute. The `disabled` attribute removes the element from tab order and prevents tooltips — users can't discover WHY it's disabled.

```tsx
// ❌ disabled — invisible to keyboard, no tooltip possible
<button disabled title="Select an item first">Submit</button>

// ✅ aria-disabled — focusable, tooltip works, screen reader announces
<button
  aria-disabled="true"
  title="Select an item first"
  tabIndex={0}
>
  Submit
</button>
```

**When to apply:** Any disabled state where the user benefits from knowing WHY it's disabled. Exception: form `<input disabled>` in fieldsets where the entire group is unavailable.

---

### `state-loading-aria-busy`

Set `aria-busy="true"` on the container during loading. Update `aria-label` to reflect loading state. Wrap skeleton UI in `role="status"` with `aria-live="polite"` for screen reader announcements.

```tsx
// ❌ No loading announcement — screen reader sees empty container
<div>{isLoading ? <Skeleton /> : <Content />}</div>

// ✅ Proper loading semantics
<div aria-busy={isLoading} aria-label={isLoading ? 'Loading results' : 'Search results'}>
  {isLoading ? (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading results...</span>
      <Skeleton />
    </div>
  ) : (
    <Content />
  )}
</div>
```

**When to apply:** Every async data loading state — skeleton screens, spinners, progressive content. The visual loading state is not enough for AT users.

---

### `state-hover-focus-compound`

Design hover+focus and active+focus as explicit compound states, not independent layers that stack unpredictably. When hover and focus-visible overlap, the result should be intentionally designed.

```css
/* ❌ Independent layers — outline + background change stack awkwardly */
.card:hover { background: var(--surface-2); }
.card:focus-visible { outline: var(--focus-ring); }
/* hover+focus = both applied, potentially ugly */

/* ✅ Explicit compound state */
.card:hover { background: var(--surface-2); }
.card:focus-visible { outline: var(--focus-ring); }
.card:hover:focus-visible {
  background: var(--surface-2);
  outline: var(--focus-ring);
  outline-offset: -2px; /* inset for visual cohesion */
}
```

**When to apply:** Every component where hover and focus are both visually distinct. Test by hovering, then Tab-focusing the same element — if it looks broken, add compound state.

---

### `state-pointer-coarse-escalation`

Touch devices need larger tap targets. Escalate interactive element minimum dimensions from 32px (mouse) to 48px (touch). Use `pointer: coarse` media query.

```css
/* Base: mouse-friendly minimum */
.button { min-height: 2rem; min-width: 2rem; /* 32px */ }
.icon-button { min-height: 2rem; min-width: 2rem; padding: var(--space-1); }

/* Touch: escalate to 48px targets */
@media (pointer: coarse) {
  .button { min-height: 3rem; min-width: 3rem; /* 48px */ }
  .icon-button { min-height: 3rem; min-width: 3rem; padding: var(--space-2); }
}
```

```css
/* For dense UIs: invisible touch expansion */
.small-button {
  position: relative;
}
.small-button::after {
  content: '';
  position: absolute;
  inset: -8px; /* expand tap area by 8px in all directions */
}
```

**When to apply:** Every interactive element. 48px is Apple's HIG minimum and Google's Material spec minimum for touch targets. Non-negotiable on mobile.
