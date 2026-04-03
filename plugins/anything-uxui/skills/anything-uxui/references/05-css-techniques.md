---
title: CSS Animation & Pseudo-Element Techniques
impact: HIGH
tags: css, clip-path, pseudo-elements, view-transitions, transform
---

## CSS Transform Mastery

### css-translate-percent -- Percentage-based translateY moves relative to own size

Percentage values in `translate()` are relative to the element's own dimensions. `translateY(100%)` moves the element by its own height regardless of actual pixel size. Essential for drawers, toasts, and dropdowns with dynamic content.

```css
/* ❌ Hardcoded px — breaks when content changes */
.drawer-hidden {
  transform: translateY(400px);
}

/* ✅ Percentage — works regardless of height */
.drawer-hidden {
  transform: translateY(100%);
}
.toast-enter {
  transform: translateY(-100%);
}
```

**When to apply**: Whenever pushing an element offscreen or positioning relative to its own size. Always prefer over hardcoded px values.

---

### css-scale-affects-children -- scale() applies to children too

Unlike `width`/`height`, `scale()` scales the element's children as well. Scaling a button on press shrinks font size, icons, and content proportionally. This is a feature, not a bug.

```css
/* scale affects all children */
.button:active {
  transform: scale(0.97);
  /* Text, icons all shrink to 0.97 — intended behavior */
}
```

**When to apply**: Button press feedback, card shrink effects, etc. where scaling children is intentional. Apply inverse scale on children if they must not be scaled.

---

### css-3d-transform -- 3D transforms for depth

`rotateX()`, `rotateY()` combined with `transform-style: preserve-3d` create real 3D effects in CSS. Orbit animations, coin flips, depth effects — all possible without JavaScript.

```css
/* ❌ JS-based 3D effects */

/* ✅ Pure CSS 3D */
.wrapper {
  transform-style: preserve-3d;
}

@keyframes orbit {
  from {
    transform: translate(-50%, -50%) rotateY(0deg) translateZ(72px) rotateY(360deg);
  }
  to {
    transform: translate(-50%, -50%) rotateY(360deg) translateZ(72px) rotateY(0deg);
  }
}
```

**When to apply**: Orbit rotations, card flips, cylindrical carousels, and other 3D effects. Always set `transform-style: preserve-3d` on the parent.

---

### css-transform-origin -- Match transform-origin to trigger position

Every element has an anchor point where transforms execute from. Default is center. For origin-aware interactions, align it with the trigger position.

```css
/* ❌ Dropdown expands from center */
.dropdown {
  transform-origin: center;
  transform: scaleY(0);
}

/* ✅ Dropdown expands from trigger button position */
.dropdown {
  transform-origin: top;
  transform: scaleY(0);
}
.dropdown.open {
  transform: scaleY(1);
}
```

**When to apply**: Dropdowns (top), context menus (click position), modals (trigger button) — any UI with a clear expansion origin.

---

## clip-path Animations

`clip-path` is one of the most powerful animation tools in CSS.

### css-clip-path-inset -- Rectangular clipping with inset

`clip-path: inset(top right bottom left)` defines a rectangular clipping region. Each value "eats in" from that direction. Smoothly animatable with transitions.

```css
/* Fully hidden from right */
.hidden {
  clip-path: inset(0 100% 0 0);
}

/* Fully visible */
.visible {
  clip-path: inset(0 0 0 0);
}

/* Reveal from left to right */
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms ease-out;
}
.button:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;
}
```

**When to apply**: Directional reveal/hide animations. When a visually stronger transition than an opacity fade is needed.

---

### css-clip-path-tab-color -- Tab color transitions with clip-path

Duplicate the tab list. Style the clone as "active" (different background, different text color). Clip the clone to show only the active tab. Animate the clipping on tab change.

```css
/* ❌ Individual color transitions — timing mismatches */
.tab {
  color: var(--gray-11);
  background: transparent;
  transition: color 200ms, background 200ms;
}
.tab.active {
  color: white;
  background: var(--blue-9);
}

/* ✅ Simultaneous color switch via clip-path */
.tab-list-clone {
  /* Entire clone styled as active */
  position: absolute;
  inset: 0;
  clip-path: inset(0 70% 0 0); /* Only active tab area visible */
  transition: clip-path 300ms ease;
}
```

**When to apply**: Tabs or segmented controls where background and text color must change simultaneously. When individual transitions cause timing mismatches.

---

### css-clip-path-hold-to-delete -- Hold-to-delete pattern

Apply `clip-path: inset(0 100% 0 0)` on a color overlay. On `:active`, transition to `inset(0 0 0 0)` over 2s linear. On release, snap back with 200ms ease-out.

```css
.delete-button {
  position: relative;
}
.delete-button::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--red-9);
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms ease-out;
}
.delete-button:active::after {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;
}
.delete-button:active {
  transform: scale(0.97); /* Press feedback */
}
```

**When to apply**: Confirmation UX for destructive actions (delete, reset). Provides visual progress while holding.

---

### css-clip-path-comparison-slider -- Comparison slider with clip-path

Stack two images. Clip the top image with `clip-path: inset(0 50% 0 0)`. Adjust the right inset based on drag position. No extra DOM elements needed, fully hardware-accelerated.

```css
.comparison-top {
  position: absolute;
  inset: 0;
  clip-path: inset(0 50% 0 0); /* Dynamically adjusted via JS on drag */
}
```

**When to apply**: Before/after image comparisons. Hardware-accelerated with no extra DOM elements.

---

### css-clip-path-scroll-reveal -- Scroll-triggered image reveal

Start with `clip-path: inset(0 0 100% 0)` (hidden from bottom). Animate to `inset(0 0 0 0)` when the element enters the viewport.

```css
.reveal-image {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.reveal-image.in-view {
  clip-path: inset(0 0 0 0);
}
```

```ts
// Use IntersectionObserver or useInView({ once: true, margin: "-100px" })
```

**When to apply**: Scroll-based content reveals. Entrance animations for images, sections, etc.

---

## Pseudo-Element Fundamentals

### css-pseudo-content-required -- content property is required for ::before/::after

::before and ::after only render when the `content` property is set. Even an empty string must be specified.

```css
/* ❌ Missing content — will not render */
.button::before {
  position: absolute;
  background: var(--gray-3);
}

/* ✅ content set */
.button::before {
  content: "";
  position: absolute;
  background: var(--gray-3);
}
```

**When to apply**: Every ::before/::after usage. Decorations, backgrounds, hit area extensions, etc.

---

### css-pseudo-over-dom-node -- Prefer pseudo-elements for decorations

Use pseudo-elements instead of extra DOM nodes for decorative content. Reduces DOM size for better performance and readability.

```tsx
// ❌ Extra DOM node
<button className={styles.button}>
  <span className={styles.background} />
  Click me
</button>

// ✅ Pseudo-element
<button className={styles.button}>
  Click me
</button>
```

```css
.button::before {
  content: "";
  /* Decorative background */
}
```

**When to apply**: Background effects, decorative lines, hover overlays, and other non-semantic visual elements.

---

### css-pseudo-position-parent -- Parent needs position: relative

The parent of an absolutely positioned pseudo-element must have `position: relative`.

```css
/* ❌ No position on parent — unpredictable placement */
.button::before {
  content: "";
  position: absolute;
  inset: 0;
}

/* ✅ Parent positioned */
.button {
  position: relative;
}
.button::before {
  content: "";
  position: absolute;
  inset: 0;
}
```

**When to apply**: Always, when using `position: absolute` on a pseudo-element.

---

### css-pseudo-z-index-layering -- z-index layering for pseudo-elements

Use z-index to prevent pseudo-elements from covering content.

```css
/* ❌ Covers button text */
.button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--gray-3);
}

/* ✅ Placed behind */
.button {
  position: relative;
  z-index: 1;
}
.button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--gray-3);
  z-index: -1;
}
```

**When to apply**: Background effects, hover overlays, and other pseudo-elements that must sit behind content.

---

### css-pseudo-hit-target -- Expand hit area with pseudo-elements

Extend the clickable area using negative inset values without extra markup.

```css
/* ✅ Hit area expansion via pseudo-element */
.link {
  position: relative;
}
.link::before {
  content: "";
  position: absolute;
  inset: -8px -12px;
}
```

**When to apply**: Small links, icon buttons, mobile touch targets below 44px.

---

## View Transitions API

### css-view-transition-name-required -- view-transition-name is required

Elements participating in a view transition need a `view-transition-name`. Without a name, the element is excluded from the transition.

```ts
// ❌ No transition name
document.startViewTransition(() => {
  targetImg.src = newSrc;
});

// ✅ Transition name assigned
sourceImg.style.viewTransitionName = "card";
document.startViewTransition(() => {
  sourceImg.style.viewTransitionName = "";
  targetImg.style.viewTransitionName = "card";
});
```

**When to apply**: Page or view transitions that require element continuity (shared element transitions).

---

### css-view-transition-name-unique -- view-transition-name must be unique

Each `view-transition-name` must be unique on the page during a transition. Duplicates break the transition.

```css
/* ❌ Duplicate names — multiple cards share the same name */
.card { view-transition-name: card; }

/* ✅ Unique name per element */
```

```ts
element.style.viewTransitionName = `card-${id}`;
```

**When to apply**: List items and other repeated element types must always receive unique names.

---

### css-view-transition-cleanup -- Clean up names after transition

`view-transition-name` must be removed after the transition completes. Leftover names cause conflicts in subsequent transitions.

```ts
// ❌ Name left behind
sourceImg.style.viewTransitionName = "card";
document.startViewTransition(() => {
  targetImg.style.viewTransitionName = "card";
});

// ✅ Cleaned up
sourceImg.style.viewTransitionName = "card";
document.startViewTransition(() => {
  sourceImg.style.viewTransitionName = "";
  targetImg.style.viewTransitionName = "card";
});
```

**When to apply**: Every view transition. Clear the source element's name by setting it to an empty string.

---

### css-view-transition-over-js -- Prefer View Transitions API over JS libraries

For page transitions, prefer the View Transitions API over JS animation libraries. Leverages native browser optimizations.

```tsx
// ❌ JS-based transition
import { motion } from "motion/react";
function ImageLightbox() {
  return <motion.img layoutId="hero" />;
}

// ✅ Native View Transition
function openLightbox(img: HTMLImageElement) {
  img.style.viewTransitionName = "hero";
  document.startViewTransition(() => {
    // Native browser transition
  });
}
```

**When to apply**: Page or view transitions requiring shared element continuity. Saves bundle size and delivers native performance over JS libraries.

---

### css-view-transition-pseudo-styling -- Style view transition pseudo-elements

Style view transition pseudo-elements for custom animations.

```css
/* ✅ Custom animation */
::view-transition-group(card) {
  animation-duration: 300ms;
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
}
```

**When to apply**: Customizing the duration, easing, or direction of default view transition animations.

---

## Native Pseudo-Elements

### css-native-backdrop -- ::backdrop for dialog overlays

Use `::backdrop` for dialog/popover backgrounds instead of extra overlay DOM nodes.

```css
/* ❌ Extra overlay DOM node */

/* ✅ Native ::backdrop */
dialog::backdrop {
  background: var(--black-a6);
  backdrop-filter: blur(4px);
}
```

**When to apply**: `<dialog>` and popover usage. Background dimming without extra DOM nodes.

---

### css-native-placeholder -- ::placeholder for input styling

Use `::placeholder` for input placeholder text instead of custom nodes.

```css
/* ✅ Native ::placeholder */
input::placeholder {
  color: var(--gray-9);
  opacity: 1;
}
```

**When to apply**: Styling placeholder text in inputs and textareas.

---

### css-native-selection -- ::selection for text selection styling

Customize text selection colors to match the brand.

```css
::selection {
  background: var(--blue-a5);
  color: var(--gray-12);
}
```

**When to apply**: Global or area-specific text selection styling. Brand consistency.

---

### css-native-marker -- ::marker for list bullet styling

Use `::marker` for custom list bullets instead of background-image hacks.

```css
/* ❌ background-image hack */
li {
  list-style: none;
  background: url("bullet.svg") no-repeat 0 4px;
  padding-left: 20px;
}

/* ✅ Native ::marker */
li::marker {
  color: var(--gray-8);
  font-size: 0.8em;
}
```

**When to apply**: Changing list item bullet or numbering styles.

---

### css-native-first-line -- ::first-line for typographic treatments

Use `::first-line` instead of JS or hardcoded spans for first-line styling.

```css
/* ✅ Native ::first-line */
.article p:first-of-type::first-line {
  font-variant-caps: small-caps;
  font-weight: var(--font-weight-medium);
}
```

**When to apply**: Editorial layouts where the first line needs distinct styling (small-caps, bold, etc.).

---

---

## Scroll-Driven Animations

### css-scroll-timeline — CSS-only scroll-linked animations

`animation-timeline: scroll()` and `view()` enable scroll-linked animations without JavaScript — off-main-thread, GPU-accelerated.

```css
/* ❌ JS-based scroll tracking */
window.addEventListener('scroll', () => {
  const progress = scrollY / maxScroll;
  element.style.transform = `scaleX(${progress})`;
});

/* ✅ CSS scroll timeline — no JS, GPU-accelerated */
.progress-bar {
  animation: grow-width linear;
  animation-timeline: scroll();
}
@keyframes grow-width {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

### css-view-timeline — Element reveal on scroll

`animation-timeline: view()` triggers animation as element enters/exits viewport. Replaces IntersectionObserver for pure visual effects.

```css
.reveal {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Stacking Context Management

### css-isolation-isolate — Contain z-index with isolation: isolate

Creates a stacking context with zero side effects — no z-index needed, works on static elements. Apply on app root and component wrappers to prevent z-index leakage.

```css
/* ❌ z-index arms race */
.tooltip { z-index: 999999; }
.modal { z-index: 9999999; }

/* ✅ Isolated stacking contexts */
#root { isolation: isolate; }
.component { isolation: isolate; }
.tooltip { z-index: 2; /* safe within component */ }
```

## Pseudo-Element Advanced Patterns

### css-pseudo-gap-fill — Fill hover gaps between stacked elements

When elements are stacked with gaps (toast stack, dropdown chain), hover breaks between gaps. Use `::after` pseudo-element to cover the gap area, maintaining hover continuity.

```css
.toast {
  position: relative;
}
.toast::after {
  content: "";
  position: absolute;
  bottom: -8px; /* covers the gap */
  left: 0;
  right: 0;
  height: 8px;
}
```

---

*Produced by junhan of select.codes*
