---
title: Component Interaction Patterns
impact: HIGH
tags: components, buttons, popover, tooltip, stagger
---

# Component Interaction Patterns

by junhan of select.codes

---

## component-active-scale: Button :active scale feedback

Add `transform: scale(0.97)` on `:active`. Provides instant feedback that makes the UI feel like it is truly listening to the user's input.

```css
/* ❌ Button with no feedback */
.button {
  /* hover only, no active feedback */
}

/* ✅ Instant press feedback */
.button {
  transition: transform 160ms ease-out;
}

.button:active {
  transform: scale(0.97);
}
```

### When to apply
- Apply to **all pressable elements** (buttons, cards, tags, etc.)
- Keep scale values subtle: **0.95 to 0.98** range
- Pair with `transition` to ensure smooth recovery

---

## component-no-scale-zero: Never enter from scale(0)

Nothing in the real world vanishes completely and reappears. Elements animating from `scale(0)` look like they materialized out of nowhere.

```css
/* ❌ Unrealistic entry */
.entering {
  transform: scale(0);
}

/* ✅ Natural entry */
.entering {
  transform: scale(0.95);
  opacity: 0;
}
```

### When to apply
- Start from `scale(0.9)` or higher, **combined with opacity**
- Even the smallest initial scale makes entry feel natural -- a deflated balloon still has a visible shape
- Apply to all entry animations

---

## component-popover-origin: Popover origin-aware transform

Popovers should **scale in from the trigger**, not from center. The default `transform-origin: center` is wrong for nearly every popover.

```css
/* ❌ Scaling from center */
.popover {
  transform-origin: center;
}

/* ✅ Scaling from trigger position (Radix UI) */
.popover {
  transform-origin: var(--radix-popover-content-transform-origin);
}

/* ✅ Scaling from trigger position (Base UI) */
.popover {
  transform-origin: var(--transform-origin);
}
```

**Origin by component type:**

| Component | transform-origin | Reason |
|-----------|-----------------|--------|
| Popover / Tooltip | Trigger position | Grows from what spawned it |
| Dropdown / Select | Top-left or top-center | Falls down from trigger |
| Context menu | Click coordinates | Appears where user right-clicked |
| Modal / Dialog | center | Not anchored to a specific trigger |
| Toast | Edge of screen | Slides from notification area |

### When to apply
- All floating UI with a trigger element: Dropdown, Popover, Context Menu, etc.
- Whether the user consciously notices each individual difference is irrelevant -- collectively, invisible details become visible. **They compound.**

---

## component-tooltip-skip-delay: Tooltip consecutive-hover delay skip

Tooltips should have a **delay before appearing** to prevent accidental activation. But once one tooltip is open, hovering over an adjacent tooltip should **open it immediately** -- without animation.

This feels faster without defeating the purpose of the initial delay.

```css
.tooltip {
  transition: transform 125ms ease-out, opacity 125ms ease-out;
  transform-origin: var(--transform-origin);
}

/* Entry/exit styles */
.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* ✅ Skip animation for consecutive tooltips */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

### When to apply
- Toolbars, icon groups, and other UI with multiple adjacent tooltips
- Use `data-instant` or equivalent attribute to detect consecutive hover state

---

## component-blur-masking: Blur masking technique

When a crossfade between two states feels awkward no matter how you adjust easing and duration, add a subtle `filter: blur()` during the transition.

### Why blur works
Without blur, during a crossfade you see **two separate objects** -- the previous state and the new state overlapping. This looks unnatural. Blur blends the two states together, bridging the visual gap and tricking the eye into perceiving **one smooth transformation** rather than two objects being swapped.

```css
/* ✅ Blur masking during crossfade */
.button-content {
  transition: filter 200ms ease, opacity 200ms ease;
}

.button-content.transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

### When to apply
- Use only when a state-transition crossfade feels awkward (not a universal fix)
- Keep blur **under 20px** -- heavy blur is expensive, especially on Safari
- Combining `filter: blur()` with `opacity` is effective

---

## component-starting-style: @starting-style CSS entry animation

The modern CSS method for animating element entry without JavaScript. Replaces the common React pattern of setting `mounted: true` after initial render via `useEffect`.

```css
/* ✅ Modern CSS entry animation */
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

```jsx
// ❌ Legacy pattern (use as polyfill only)
useEffect(() => {
  setMounted(true);
}, []);
// <div data-mounted={mounted}>
```

### When to apply
- Use `@starting-style` when browser support allows
- Fall back to the `data-mounted` attribute pattern when unsupported
- Suited for entry animations on elements newly added to the DOM

---

## component-stagger: Stagger animation

When multiple elements enter together, make them **appear sequentially.** Each element animates after the previous one with a small delay. Creates a natural cascading effect instead of everything appearing at once.

```css
/* ✅ Sequential entry */
.item {
  opacity: 0;
  transform: translateY(8px);
  animation: fadeIn 300ms ease-out forwards;
}

.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
.item:nth-child(4) { animation-delay: 150ms; }

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### When to apply

Stagger delay values follow the adaptive scale defined in `timing-stagger-adaptive` (see [02-animation-timing](02-animation-timing.md)):
- 1-5 items: ≤60ms per item
- 6+ items: ≤40ms per item
- 11+ items: ≤30ms per item
- Total stagger: ≤400ms

Never block user interaction during stagger playback.

- Apply wherever multiple elements appear together: lists, grids, navigation items

---

## component-transition-vs-keyframe: Choosing transition vs keyframe

CSS transitions can be interrupted and reset mid-animation. Keyframes restart from 0.

```css
/* ✅ Interruptible - suited for dynamic UI */
.toast {
  transition: transform 400ms ease;
}

/* ❌ Not interruptible - avoid for dynamic UI */
@keyframes slideIn {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### Selection criteria

| Scenario | Choice | Reason |
|---|---|---|
| Rapidly re-triggered (toast, toggle) | `transition` | Smooth reset on interrupt |
| One-shot, then done (entry decoration) | `keyframe` OK | No interruption needed |
| Stagger animation | `keyframe` + `animation-delay` | Easy sequential delay control |
| Hover/active state change | `transition` | Natural state recovery |

---

## Drawer Patterns

### component-drawer-snap-points — Multi-stage snap points

Drawers should support multiple snap points (iOS Maps style). Define viewport fractions (0.4, 0.8) or fixed px values as checkpoints. Fast flick skips intermediate points; slow drag snaps to nearest. Use velocity threshold to distinguish.

### component-drawer-scaled-background — Scale background on open

When a bottom drawer opens, scale the main content to `scale(0.95)` and add border-radius. Creates depth perception and context shift (native iOS Sheet pattern).

```css
.main-content.drawer-open {
  transform: scale(0.95);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform 500ms var(--ease-drawer);
}
```

### component-drawer-responsive — Drawer on mobile, Dialog on desktop

Use the same content component, switch container by viewport:
- Mobile (< 640px) → Bottom sheet drawer
- Desktop (≥ 640px) → Centered dialog modal

### component-observer-pattern — Observer pattern for global UI

For global UI components (toasts, notifications), use the Observer pattern instead of React Context. Benefits: no provider wrapper, callable from anywhere (including outside React tree), minimal bundle size.

### component-tab-visibility-pause — Pause timers when tab is hidden

Use `document.visibilitychange` to pause auto-dismiss timers (toasts, notifications) when the browser tab is hidden. Resume on tab reactivation. Applies to all time-based UI.
